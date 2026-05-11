# # intraview_agent/turn_manager.py

# import time
# from dataclasses import dataclass


# @dataclass
# class TurnState:
#     turn_index: int = 0         # 0-based
#     waiting_for_answer: bool = False
#     last_question_text: str | None = None
#     last_question_time: float = 0.0
#     no_answer_retry_used: bool = False
#     done: bool = False


# class TurnManager:
#     """
#     Local in-memory turn tracking for the agent process.

#     Backend still enforces true idempotency (via UniqueConstraint on
#     (session, turn_index)), but this manager helps avoid obvious duplicates
#     and drives timeout behavior.
#     """

#     NO_ANSWER_TIMEOUT_SECONDS = 40.0
#     MAX_NO_ANSWER_MULTIPLIER = 2  # total wait ~ 80s if we retry once

#     def __init__(self, total_questions: int):
#         self.total_questions = total_questions
#         self.state = TurnState()

#     def can_ask_new_question(self) -> bool:
#         return not self.state.done and self.state.turn_index < self.total_questions

#     def mark_question_asked(self, question_text: str):
#         self.state.last_question_text = question_text
#         self.state.waiting_for_answer = True
#         self.state.last_question_time = time.monotonic()
#         self.state.no_answer_retry_used = False

#     def mark_answer_received(self):
#         self.state.turn_index += 1
#         self.state.waiting_for_answer = False
#         self.state.last_question_time = 0.0
#         self.state.no_answer_retry_used = False

#         if self.state.turn_index >= self.total_questions:
#             self.state.done = True

#     def current_turn_index_0based(self) -> int:
#         return self.state.turn_index

#     def current_turn_index_1based(self) -> int:
#         return self.state.turn_index + 1

#     def has_pending_question(self) -> bool:
#         return self.state.waiting_for_answer and self.state.last_question_text is not None

#     def should_retry_for_no_answer(self) -> bool:
#         if not self.state.waiting_for_answer or self.state.no_answer_retry_used:
#             return False
#         if self.state.last_question_time <= 0:
#             return False
#         elapsed = time.monotonic() - self.state.last_question_time
#         return elapsed > self.NO_ANSWER_TIMEOUT_SECONDS

#     def mark_retry_used(self):
#         self.state.no_answer_retry_used = True

#     def should_timeout_and_skip(self) -> bool:
#         if not self.state.waiting_for_answer or self.state.last_question_time <= 0:
#             return False
#         elapsed = time.monotonic() - self.state.last_question_time
#         threshold = self.NO_ANSWER_TIMEOUT_SECONDS * (
#             self.MAX_NO_ANSWER_MULTIPLIER if self.state.no_answer_retry_used else 1
#         )
#         return elapsed > threshold
























# # intraview_agent/turn_manager.py

# import time
# from dataclasses import dataclass

# from constants import NO_ANSWER_TIMEOUT_SECONDS, NO_ANSWER_MAX_MULTIPLIER


# @dataclass
# class TurnState:
#     turn_index: int = 0         # 0-based
#     waiting_for_answer: bool = False
#     last_question_text: str | None = None
#     last_question_time: float = 0.0
#     no_answer_retry_used: bool = False
#     done: bool = False


# class TurnManager:
#     """
#     Local in-memory turn tracking for the agent process.

#     Backend still enforces true idempotency (via UNIQUE(session, turn_index)),
#     but this manager helps avoid obvious duplicates and drives timeout behavior.
#     """

#     def __init__(self, total_questions: int):
#         self.total_questions = total_questions
#         self.state = TurnState()

#     def can_ask_new_question(self) -> bool:
#         return not self.state.done and self.state.turn_index < self.total_questions

#     def mark_question_asked(self, question_text: str):
#         self.state.last_question_text = question_text
#         self.state.waiting_for_answer = True
#         self.state.last_question_time = time.monotonic()
#         self.state.no_answer_retry_used = False

#     def mark_answer_received(self):
#         self.state.turn_index += 1
#         self.state.waiting_for_answer = False
#         self.state.last_question_time = 0.0
#         self.state.no_answer_retry_used = False

#         if self.state.turn_index >= self.total_questions:
#             self.state.done = True

#     def current_turn_index_0based(self) -> int:
#         return self.state.turn_index

#     def current_turn_index_1based(self) -> int:
#         return self.state.turn_index + 1

#     def has_pending_question(self) -> bool:
#         return self.state.waiting_for_answer and self.state.last_question_text is not None

#     def should_retry_for_no_answer(self) -> bool:
#         if not self.state.waiting_for_answer or self.state.no_answer_retry_used:
#             return False
#         if self.state.last_question_time <= 0:
#             return False
#         elapsed = time.monotonic() - self.state.last_question_time
#         return elapsed > NO_ANSWER_TIMEOUT_SECONDS

#     def mark_retry_used(self):
#         self.state.no_answer_retry_used = True

#     def should_timeout_and_skip(self) -> bool:
#         if not self.state.waiting_for_answer or self.state.last_question_time <= 0:
#             return False
#         elapsed = time.monotonic() - self.state.last_question_time
#         threshold = NO_ANSWER_TIMEOUT_SECONDS * (
#             NO_ANSWER_MAX_MULTIPLIER if self.state.no_answer_retry_used else 1
#         )
#         return elapsed > threshold























# intraview_agent/turn_manager.py

import time
from dataclasses import dataclass, field
from typing import List, Optional

from constants import NO_ANSWER_TIMEOUT_SECONDS, NO_ANSWER_MAX_MULTIPLIER


@dataclass
class TurnState:
    turn_index: int = 0             # 0-based; only increments on base question completion
    waiting_for_answer: bool = False
    last_question_text: str | None = None
    last_question_time: float = 0.0
    no_answer_retry_used: bool = False
    done: bool = False

    # --- Follow-up sub-state (scoped to current base question) ---
    # Stores the original base question text for backend metadata.
    base_question_text: str | None = None

    # Stores the first (base) answer for backend metadata.
    base_answer_text: str = ""

    # How many follow-up questions have been asked for the current base question.
    followup_count: int = 0

    # True while the agent is waiting for an answer to a follow-up question.
    # False when waiting for the base question answer.
    is_followup_active: bool = False

    # True once the runtime has completed the allowed follow-up phase
    # for the current base question.
    # Prevents re-entering follow-up generation loops.
    followup_phase_completed: bool = False

    # Ordered list of follow-up exchanges for backend metadata.
    # Each entry: {"question": str, "answer": str}
    followup_exchanges: List[dict] = field(default_factory=list)


class TurnManager:
    """
    Local in-memory turn tracking for the agent process.

    Backend still enforces true idempotency (via UNIQUE(session, turn_index)),
    but this manager helps avoid obvious duplicates and drives timeout behavior.

    Follow-up behavior:
    - Follow-up questions do NOT increment turn_index.
    - Follow-up state is scoped to the current base question.
    - When the base question is finalized, follow-up state is reset.
    """

    def __init__(self, total_questions: int):
        self.total_questions = total_questions
        self.state = TurnState()

    # ------------------------------------------------------------------ #
    #  Existing methods — unchanged                                        #
    # ------------------------------------------------------------------ #

    def can_ask_new_question(self) -> bool:
        return not self.state.done and self.state.turn_index < self.total_questions

    def mark_question_asked(self, question_text: str):
        """
        Called when a base (counted) question has been spoken.
        Resets follow-up state for the new base question.
        """
        self.state.base_question_text = question_text
        self.state.base_answer_text = ""
        self.state.followup_count = 0
        self.state.is_followup_active = False
        self.state.followup_phase_completed = False
        self.state.followup_exchanges = []

        self.state.last_question_text = question_text
        self.state.waiting_for_answer = True
        self.state.last_question_time = time.monotonic()
        self.state.no_answer_retry_used = False

    def mark_answer_received(self):
        """
        Finalizes the current base question and advances turn_index.
        Resets all follow-up state for the next base question.
        """
        self._reset_followup_state()

        self.state.turn_index += 1
        self.state.waiting_for_answer = False
        self.state.last_question_text = None
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False

        if self.state.turn_index >= self.total_questions:
            self.state.done = True

    def current_turn_index_0based(self) -> int:
        return self.state.turn_index

    def current_turn_index_1based(self) -> int:
        return self.state.turn_index + 1

    def has_pending_question(self) -> bool:
        return self.state.waiting_for_answer and self.state.last_question_text is not None
    
    def current_prompt_kind(self) -> str:
        """
        Returns the currently active prompt type.

        Used by runtime to correctly classify retries and lifecycle flow.
        """
        return "followup" if self.state.is_followup_active else "base"

    def should_retry_for_no_answer(self) -> bool:
        if not self.state.waiting_for_answer or self.state.no_answer_retry_used:
            return False
        if self.state.last_question_time <= 0:
            return False
        elapsed = time.monotonic() - self.state.last_question_time
        return elapsed > NO_ANSWER_TIMEOUT_SECONDS

    def mark_retry_used(self):
        self.state.no_answer_retry_used = True

    def should_timeout_and_skip(self) -> bool:
        if not self.state.waiting_for_answer or self.state.last_question_time <= 0:
            return False
        elapsed = time.monotonic() - self.state.last_question_time
        threshold = NO_ANSWER_TIMEOUT_SECONDS * (
            NO_ANSWER_MAX_MULTIPLIER if self.state.no_answer_retry_used else 1
        )
        return elapsed > threshold

    # ------------------------------------------------------------------ #
    #  New follow-up methods                                               #
    # ------------------------------------------------------------------ #

    def can_ask_followup(self, max_followups: int) -> bool:
        """
        True if a follow-up question is allowed for the current base question.

        Conditions:
        - There is an active base question (base_question_text is set).
        - Follow-up budget has not been exhausted.
        - Interview is not done.
        """
        return (
            not self.state.done
            and self.state.base_question_text is not None
            and not self.state.followup_phase_completed
            and self.state.followup_count < max_followups
        )
    
    def followup_budget_exhausted(self, max_followups: int) -> bool:
        """
        True if the follow-up budget has already been exhausted
        for the current base question.
        """
        return self.state.followup_count >= max_followups
    
    def followup_phase_is_closed(self) -> bool:
        """
        True once runtime has decided the follow-up phase
        for this base question is permanently finished.
        """
        return self.state.followup_phase_completed

    def mark_followup_asked(self, question_text: str):
        """
        Called when a follow-up question has been spoken.

        - Does NOT increment turn_index.
        - Increments followup_count.
        - Sets is_followup_active = True.
        - Resets the waiting/timer state for the new follow-up prompt.
        """
        if self.state.followup_phase_completed:
            raise RuntimeError(
                "Cannot ask follow-up: follow-up phase already completed."
            )
        if self.state.base_question_text is None:
            raise RuntimeError(
                "Cannot ask follow-up without an active base question."
            )
        if self.state.waiting_for_answer:
            raise RuntimeError(
                "Cannot ask follow-up while another prompt is still pending."
            )
        self.state.followup_count += 1
        self.state.is_followup_active = True

        self.state.last_question_text = question_text
        self.state.waiting_for_answer = True
        self.state.last_question_time = time.monotonic()
        self.state.no_answer_retry_used = False

    def mark_followup_answer_received(self, answer_text: str):
        """
        Called when the candidate answers a follow-up question.

        - Does NOT increment turn_index.
        - Appends the exchange to followup_exchanges for metadata.
        - Clears waiting state.
        - is_followup_active stays True until base question is finalized
          (so runtime knows a follow-up phase just completed).
        """
        if not self.state.is_followup_active:
            raise RuntimeError(
                "Cannot record follow-up answer without active follow-up."
            )
        self.state.followup_exchanges.append(
            {
                "question": self.state.last_question_text or "",
                "answer": answer_text,
            }
        )
        self.state.waiting_for_answer = False
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False
        # Follow-up answer has now completed.
        # Runtime may finalize or continue, but we are no longer
        # actively waiting on a follow-up response.
        self.state.is_followup_active = False


    def mark_followup_phase_completed(self):
        """
        Marks the current base question's follow-up phase as completed.

        After this:
        - runtime should not ask additional follow-ups
        - follow-up generation is considered closed
        """
        self.state.followup_phase_completed = True
        self.state.is_followup_active = False    

    def record_base_answer(self, answer_text: str):
        """
        Called when the candidate answers the base (counted) question,
        before any follow-up decision is made.

        Stores the answer for backend metadata and clears waiting state.
        Does NOT call mark_answer_received() — runtime decides that later.
        """
        if self.state.followup_phase_completed:
            raise RuntimeError(
                "Cannot record new base answer after follow-up phase is closed."
            )
        self.state.base_answer_text = answer_text
        self.state.waiting_for_answer = False
        self.state.last_question_time = 0.0
        self.state.no_answer_retry_used = False

    def get_turn_metadata_extras(self) -> dict:
        """
        Returns follow-up metadata to merge into the turn's metadata dict
        when posting to the backend.
        """
        return {
            "base_question_text": self.state.base_question_text or "",
            "base_answer_text": self.state.base_answer_text,
            "followup_count": self.state.followup_count,
            "followup_phase_completed": self.state.followup_phase_completed,
            "followup_exchanges": list(self.state.followup_exchanges),
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    def _reset_followup_state(self):
        """
        Resets all follow-up sub-state. Called inside mark_answer_received().
        """
        self.state.base_question_text = None
        self.state.base_answer_text = ""
        self.state.followup_count = 0
        self.state.is_followup_active = False
        self.state.followup_phase_completed = False
        self.state.followup_exchanges = []