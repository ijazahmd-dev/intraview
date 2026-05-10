# intraview_agent/state.py

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, Set


class InterviewState(Enum):
    INITIALIZING = auto()
    INTRO = auto()
    ASKING = auto()
    LISTENING = auto()
    PROCESSING = auto()
    RETRYING = auto()
    SKIPPING = auto()
    ENDING = auto()
    COMPLETED = auto()
    FAILED = auto()


# Allowed transitions between high-level states.
_ALLOWED_TRANSITIONS: Dict[InterviewState, Set[InterviewState]] = {
    InterviewState.INITIALIZING: {InterviewState.INTRO, InterviewState.FAILED},
    InterviewState.INTRO: {InterviewState.ASKING, InterviewState.FAILED},
    InterviewState.ASKING: {
        InterviewState.LISTENING,
        InterviewState.RETRYING,
        InterviewState.ENDING,
        InterviewState.FAILED,
    },
    InterviewState.LISTENING: {
        InterviewState.PROCESSING,
        InterviewState.RETRYING,
        InterviewState.SKIPPING,
        InterviewState.FAILED,
    },
    InterviewState.PROCESSING: {
        InterviewState.ASKING,
        InterviewState.ENDING,
        InterviewState.FAILED,
    },
    InterviewState.RETRYING: {InterviewState.LISTENING, InterviewState.SKIPPING, InterviewState.FAILED},
    InterviewState.SKIPPING: {InterviewState.ASKING, InterviewState.ENDING, InterviewState.FAILED},
    InterviewState.ENDING: {InterviewState.COMPLETED, InterviewState.FAILED},
    InterviewState.COMPLETED: set(),
    InterviewState.FAILED: set(),
}


@dataclass
class StateMachine:
    """
    Simple explicit interview state machine.

    This is not persisted yet, but it is designed to be serializable so
    backend persistence (InterviewRuntimeState) can store current_state as a string.
    """

    value: InterviewState = InterviewState.INITIALIZING

    def can_transition(self, new_state: InterviewState) -> bool:
        allowed = _ALLOWED_TRANSITIONS.get(self.value, set())
        return new_state in allowed

    def transition(self, new_state: InterviewState) -> None:
        if not self.can_transition(new_state):
            raise ValueError(f"Illegal interview state transition: {self.value.name} -> {new_state.name}")
        self.value = new_state