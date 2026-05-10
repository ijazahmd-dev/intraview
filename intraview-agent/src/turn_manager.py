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
























# intraview_agent/turn_manager.py

import time
from dataclasses import dataclass

from constants import NO_ANSWER_TIMEOUT_SECONDS, NO_ANSWER_MAX_MULTIPLIER


@dataclass
class TurnState:
    turn_index: int = 0         # 0-based
    waiting_for_answer: bool = False
    last_question_text: str | None = None
    last_question_time: float = 0.0
    no_answer_retry_used: bool = False
    done: bool = False


class TurnManager:
    """
    Local in-memory turn tracking for the agent process.

    Backend still enforces true idempotency (via UNIQUE(session, turn_index)),
    but this manager helps avoid obvious duplicates and drives timeout behavior.
    """

    def __init__(self, total_questions: int):
        self.total_questions = total_questions
        self.state = TurnState()

    def can_ask_new_question(self) -> bool:
        return not self.state.done and self.state.turn_index < self.total_questions

    def mark_question_asked(self, question_text: str):
        self.state.last_question_text = question_text
        self.state.waiting_for_answer = True
        self.state.last_question_time = time.monotonic()
        self.state.no_answer_retry_used = False

    def mark_answer_received(self):
        self.state.turn_index += 1
        self.state.waiting_for_answer = False
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