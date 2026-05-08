# intraview_agent/planner.py

import textwrap
from dataclasses import dataclass
from typing import List, Optional

from .questions import Question, get_fixed_question_set


@dataclass
class InterviewConfig:
    session_id: int
    role_slug: str
    round_type: str
    difficulty: str
    max_questions: int


class QuestionPlanner:
    """
    Planner that controls interview coverage and ordering.

    - Decides which base question (topic) to ask on each turn.
    - LLM is only used to phrase that question, not to pick topics or control flow.
    """

    def __init__(self, cfg: InterviewConfig):
        self.cfg = cfg
        base_questions: List[Question] = get_fixed_question_set(
            cfg.role_slug, cfg.round_type, cfg.difficulty
        )
        # Clamp to configured max_questions
        self.questions: List[Question] = base_questions[: cfg.max_questions]

    def total_questions(self) -> int:
        return len(self.questions)

    def base_question_for_turn(self, turn_index: int) -> Question:
        """
        turn_index: 0-based.
        Raises IndexError if out of range.
        """
        if turn_index < 0 or turn_index >= self.total_questions():
            raise IndexError("turn_index out of range for questions")
        return self.questions[turn_index]

    def build_llm_instruction(
        self,
        turn_index: int,
        base_q: Question,
        last_answer: Optional[str],
    ) -> str:
        """
        Build a short instruction to Gemini for THIS specific question.

        The LLM receives:
        - role context
        - round type
        - difficulty
        - base question text + topic
        - optional snippet of previous answer
        and must output a single spoken question.
        """
        num = turn_index + 1
        total = self.total_questions()

        last_answer_snippet = ""
        if last_answer:
            clipped = last_answer.strip()
            if len(clipped) > 300:
                clipped = clipped[:300] + "..."
            last_answer_snippet = (
                f"\nThe candidate's previous answer was:\n\"{clipped}\"\n"
            )

        return textwrap.dedent(
            f"""\
            You are conducting a practice interview for the role "{self.cfg.role_slug}".
            Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

            You are now about to ask interview question {num} of {total}.

            Core question to cover:
            "{base_q.text}"

            Topic tag: {base_q.topic}.{last_answer_snippet}

            Please output a single, natural-sounding spoken interview question that:
            - Clearly asks the candidate about this topic.
            - Uses a neutral, professional tone (not overly friendly or praising).
            - Does NOT give hints, coaching, or feedback.
            - Does NOT comment on whether previous answers were good or bad.
            - Does NOT mention question numbers or the word "question".

            Respond with the question as plain text only. No JSON, lists, or formatting.
            """
        )