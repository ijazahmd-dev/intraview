from __future__ import annotations

import turn_manager
from turn_manager import TurnManager


def test_silence_stages_are_ordered_and_reset_by_meaningful_speech(monkeypatch):
    now = 100.0
    monkeypatch.setattr(turn_manager.time, "monotonic", lambda: now)
    manager = TurnManager(total_questions=2)
    manager.mark_question_asked("Tell me about a project.")

    now = 114.9
    assert manager.next_silence_stage() is None

    now = 15.0 + 100.0
    assert manager.next_silence_stage() == 1
    manager.mark_silence_stage_handled(1)

    now = 129.9
    assert manager.next_silence_stage() is None
    now = 130.0
    assert manager.next_silence_stage() == 2
    manager.mark_silence_stage_handled(2)

    now = 145.0
    assert manager.next_silence_stage() == 3

    manager.mark_meaningful_speech()
    assert manager.state.silence_stage == 0
    assert manager.next_silence_stage() is None


def test_reopen_after_submission_failure_keeps_same_question_without_advancing(monkeypatch):
    monkeypatch.setattr(turn_manager.time, "monotonic", lambda: 100.0)
    manager = TurnManager(total_questions=2)
    manager.mark_question_asked("Explain transactions.")
    assert manager.try_begin_turn_finalization()
    manager.record_base_answer("I use database transactions for atomic writes.")

    manager.reopen_after_submission_failure()

    assert manager.current_turn_index_0based() == 0
    assert manager.state.last_question_text == "Explain transactions."
    assert manager.state.base_answer_text == ""
    assert manager.state.last_failed_submission_answer
    assert manager.state.waiting_for_answer is True
    assert manager.state.is_finalizing_turn is False
