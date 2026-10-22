from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase

from ai_interviews.models import AIInterviewSession, AIInterviewTurn, Role
from ai_interviews.service.gemini.question_generation import (
    estimate_interview_question_count,
)
from ai_interviews.service.services import (
    AIInterviewTurnService,
    TurnIdempotencyConflict,
)


class QuestionCountTests(SimpleTestCase):
    def test_base_question_counts_are_monotonic_and_match_duration_targets(self):
        durations = (5, 10, 15, 20, 25, 30)
        counts = [
            estimate_interview_question_count(
                round_type="BEHAVIORAL", duration_minutes=duration
            )
            for duration in durations
        ]

        assert counts == [2, 3, 5, 6, 8, 9]
        assert counts == sorted(counts)

    def test_round_pacing_stays_within_base_question_bounds(self):
        for duration in (5, 10, 15, 20, 25, 30):
            for round_type in ("WARMUP", "BEHAVIORAL", "ROLE_RELATED", "CODING"):
                count = estimate_interview_question_count(
                    round_type=round_type,
                    duration_minutes=duration,
                )
                assert 2 <= count <= 10


class TurnIdempotencyTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(
            username="turn-candidate",
            email="turn-candidate@example.com",
            password="testpass123",
        )
        role = Role.objects.create(name="Turn Test Role", slug="turn-test-role")
        self.session = AIInterviewSession.objects.create(
            user=user,
            role=role,
            round_type=AIInterviewSession.RoundType.CODING,
            difficulty=AIInterviewSession.Difficulty.INTERMEDIATE,
            duration_minutes=5,
            status=AIInterviewSession.Status.LIVE,
        )

    def test_replaying_the_same_turn_returns_the_original_record(self):
        payload = {
            "question_text": "How do you test a service?",
            "answer_text": "I use focused unit tests and integration tests.",
            "metadata": {"question_topic": "testing"},
            "proposed_index": 1,
        }

        first, first_created = AIInterviewTurnService.create_turn(
            session=self.session, **payload
        )
        replay, replay_created = AIInterviewTurnService.create_turn(
            session=self.session, **payload
        )

        self.assertTrue(first_created)
        self.assertFalse(replay_created)
        self.assertEqual(first.id, replay.id)
        self.assertEqual(AIInterviewTurn.objects.filter(session=self.session).count(), 1)

    def test_conflicting_payload_for_a_turn_index_is_rejected(self):
        AIInterviewTurnService.create_turn(
            session=self.session,
            question_text="How do you test a service?",
            answer_text="I use focused unit tests and integration tests.",
            metadata={"question_topic": "testing"},
            proposed_index=1,
        )

        with self.assertRaises(TurnIdempotencyConflict):
            AIInterviewTurnService.create_turn(
                session=self.session,
                question_text="A different question",
                answer_text="A different answer",
                metadata={"question_topic": "different"},
                proposed_index=1,
            )
