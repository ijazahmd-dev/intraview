from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest

import runtime as runtime_module
from planner import InterviewConfig, QuestionPlanner
from questions import Question
from runtime import InterviewRuntime
from state import InterviewState
from turn_manager import TurnManager


class _Response:
    def __init__(self, status_code: int, text: str = ""):
        self.status_code = status_code
        self.text = text


class _TransientThenSuccessBackend:
    def __init__(self):
        self.calls = []

    async def post_turn(self, **payload):
        self.calls.append(payload)
        if len(self.calls) == 1:
            request = httpx.Request("POST", "https://backend.test/turns/")
            raise httpx.ConnectError("temporary outage", request=request)
        return _Response(201)


class _AlwaysUnavailableBackend:
    def __init__(self):
        self.calls = []

    async def post_turn(self, **payload):
        self.calls.append(payload)
        request = httpx.Request("POST", "https://backend.test/turns/")
        raise httpx.ConnectError("backend unavailable", request=request)


def _configured_runtime(backend):
    ctx = SimpleNamespace(room=SimpleNamespace(remote_participants={}))
    subject = InterviewRuntime(ctx)
    subject.cfg = InterviewConfig(
        session_id=7,
        role_slug="software-engineer",
        role_name="Software Engineer",
        round_type="CODING",
        difficulty="INTERMEDIATE",
        max_questions=2,
        questions=[
            Question("Explain database transactions.", "transactions"),
            Question("How do you test a service?", "testing"),
        ],
    )
    subject.planner = QuestionPlanner(subject.cfg)
    subject.tm = TurnManager(total_questions=2)
    subject.backend = backend
    subject.state_machine.value = InterviewState.PROCESSING
    subject._send_data = AsyncMock()
    subject._sync_runtime_state = AsyncMock()
    subject._safe_say = AsyncMock()
    subject._ask_current_prepared_question = AsyncMock()
    return subject


def test_short_answers_are_valid_but_noise_is_not():
    subject = _configured_runtime(backend=None)

    for text in ("Yes", "No", "Python", "Never", "I don't know"):
        assert subject._is_valid_user_answer(text)

    for text in ("", "   ", "um", "uh uh", "...", "[noise]"):
        assert not subject._is_valid_user_answer(text)


@pytest.mark.parametrize(
    "text",
    (
        "Could you repeat the question?",
        "Can you say that again?",
        "Could you clarify what you mean?",
        "Which programming language should I use?",
    ),
)
def test_clarification_requests_are_detected(text):
    subject = _configured_runtime(backend=None)
    assert subject._is_clarification_request(text)


@pytest.mark.parametrize(
    "text",
    (
        "I clarified the requirements with the product manager.",
        "I use Python for the service.",
        "Can you explain how you would handle retries?",
    ),
)
def test_technical_answers_are_not_misclassified_as_clarifications(text):
    subject = _configured_runtime(backend=None)
    assert not subject._is_clarification_request(text)


def test_two_second_pause_remains_inside_the_speech_end_grace_window(monkeypatch):
    subject = _configured_runtime(backend=None)
    subject._last_speech_end_at = 100.0
    subject._candidate_is_speaking = False
    monkeypatch.setattr(runtime_module.time, "monotonic", lambda: 102.0)

    assert subject._candidate_recently_stopped_speaking() is True


@pytest.mark.asyncio
async def test_transient_turn_submission_retries_same_payload_then_advances(monkeypatch):
    backend = _TransientThenSuccessBackend()
    subject = _configured_runtime(backend)
    subject.tm.mark_question_asked("Explain database transactions.")
    assert subject.tm.try_begin_turn_finalization()
    subject.tm.record_base_answer("I use transactions to keep related writes atomic.")
    subject.tm.state.waiting_for_answer = False

    async def no_sleep(_delay):
        return None

    monkeypatch.setattr(runtime_module.asyncio, "sleep", no_sleep)

    await subject._finalize_base_turn(total_q=2)

    assert len(backend.calls) == 2
    assert backend.calls[0] == backend.calls[1]
    assert subject.tm.current_turn_index_0based() == 1
    subject._ask_current_prepared_question.assert_awaited_once_with(2)


@pytest.mark.asyncio
async def test_exhausted_transient_submission_reopens_same_question_without_advancing(monkeypatch):
    backend = _AlwaysUnavailableBackend()
    subject = _configured_runtime(backend)
    subject.tm.mark_question_asked("Explain database transactions.")
    assert subject.tm.try_begin_turn_finalization()
    subject.tm.record_base_answer("I use transactions to keep related writes atomic.")
    subject.tm.state.waiting_for_answer = False

    async def no_sleep(_delay):
        return None

    monkeypatch.setattr(runtime_module.asyncio, "sleep", no_sleep)

    await subject._finalize_base_turn(total_q=2)

    assert len(backend.calls) == runtime_module.TURN_SUBMISSION_MAX_ATTEMPTS
    assert subject.tm.current_turn_index_0based() == 0
    assert subject.tm.state.waiting_for_answer is True
    assert subject.tm.state.is_finalizing_turn is False
    assert subject.state_machine.value is InterviewState.LISTENING
    subject._ask_current_prepared_question.assert_not_awaited()
