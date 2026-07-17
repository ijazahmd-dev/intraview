from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from ai_interviews.models import (
    AIInterviewEvaluation,
    AIInterviewSession,
    AIInterviewTurn,
    Role,
)
from ai_interviews.tasks import (
    SKIPPED_NO_ANSWER_TEXT,
    _build_combined_turn_answer,
    evaluate_turn,
)


class SkippedAnswerHandlingTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="candidate",
            email="candidate@example.com",
            password="testpass123",
        )
        self.role = Role.objects.create(
            name="Software Engineer",
            slug="software-engineer",
        )
        self.session = AIInterviewSession.objects.create(
            user=self.user,
            role=self.role,
            round_type=AIInterviewSession.RoundType.BEHAVIORAL,
            difficulty=AIInterviewSession.Difficulty.INTERMEDIATE,
            duration_minutes=5,
            status=AIInterviewSession.Status.LIVE,
        )

    def test_build_combined_turn_answer_uses_human_readable_skipped_text(self):
        turn = AIInterviewTurn.objects.create(
            session=self.session,
            turn_index=1,
            question_text="Tell me about yourself.",
            answer_text="No answer provided.",
            metadata={
                "skipped_no_answer": True,
                "skip_reason": "no_answer_timeout",
            },
        )

        combined = _build_combined_turn_answer(turn, max_length=2000)

        self.assertEqual(combined, SKIPPED_NO_ANSWER_TEXT)

    def test_evaluate_turn_marks_skipped_answers_with_zero_score(self):
        turn = AIInterviewTurn.objects.create(
            session=self.session,
            turn_index=1,
            question_text="Tell me about yourself.",
            answer_text="No answer provided.",
            metadata={
                "skipped_no_answer": True,
                "skip_reason": "no_answer_timeout",
            },
        )
        evaluation = AIInterviewEvaluation.objects.create(
            turn=turn,
            status=AIInterviewEvaluation.Status.PENDING,
        )

        with patch("ai_interviews.tasks.generate_final_report.delay") as mock_report:
            evaluate_turn(turn.id)

        evaluation.refresh_from_db()

        self.assertEqual(
            evaluation.status,
            AIInterviewEvaluation.Status.SUCCESS,
        )
        self.assertEqual(evaluation.score, 0.0)
        self.assertEqual(evaluation.strengths, [])
        self.assertIn(
            "No answer was provided for this question.",
            evaluation.weaknesses,
        )
        self.assertEqual(
            evaluation.raw_response["reason"],
            "NO_ANSWER_SKIPPED",
        )
        mock_report.assert_not_called()
