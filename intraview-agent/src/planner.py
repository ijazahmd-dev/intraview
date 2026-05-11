# # intraview_agent/planner.py

# import textwrap
# from dataclasses import dataclass
# from typing import List, Optional

# from .questions import Question, get_fixed_question_set


# @dataclass
# class InterviewConfig:
#     session_id: int
#     role_slug: str
#     round_type: str
#     difficulty: str
#     max_questions: int


# class QuestionPlanner:
#     """
#     Planner that controls interview coverage and ordering.

#     - Decides which base question (topic) to ask on each turn.
#     - LLM is only used to phrase that question, not to pick topics or control flow.
#     """

#     def __init__(self, cfg: InterviewConfig):
#         self.cfg = cfg
#         base_questions: List[Question] = get_fixed_question_set(
#             cfg.role_slug, cfg.round_type, cfg.difficulty
#         )
#         # Clamp to configured max_questions
#         self.questions: List[Question] = base_questions[: cfg.max_questions]

#     def total_questions(self) -> int:
#         return len(self.questions)

#     def base_question_for_turn(self, turn_index: int) -> Question:
#         """
#         turn_index: 0-based.
#         Raises IndexError if out of range.
#         """
#         if turn_index < 0 or turn_index >= self.total_questions():
#             raise IndexError("turn_index out of range for questions")
#         return self.questions[turn_index]

#     def build_llm_instruction(
#         self,
#         turn_index: int,
#         base_q: Question,
#         last_answer: Optional[str],
#     ) -> str:
#         """
#         Build a short instruction to Gemini for THIS specific question.

#         The LLM receives:
#         - role context
#         - round type
#         - difficulty
#         - base question text + topic
#         - optional snippet of previous answer
#         and must output a single spoken question.
#         """
#         num = turn_index + 1
#         total = self.total_questions()

#         last_answer_snippet = ""
#         if last_answer:
#             clipped = last_answer.strip()
#             if len(clipped) > 300:
#                 clipped = clipped[:300] + "..."
#             last_answer_snippet = (
#                 f"\nThe candidate's previous answer was:\n\"{clipped}\"\n"
#             )

#         return textwrap.dedent(
#             f"""\
#             You are conducting a practice interview for the role "{self.cfg.role_slug}".
#             Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

#             You are now about to ask interview question {num} of {total}.

#             Core question to cover:
#             "{base_q.text}"

#             Topic tag: {base_q.topic}.{last_answer_snippet}

#             Please output a single, natural-sounding spoken interview question that:
#             - Clearly asks the candidate about this topic.
#             - Uses a neutral, professional tone (not overly friendly or praising).
#             - Does NOT give hints, coaching, or feedback.
#             - Does NOT comment on whether previous answers were good or bad.
#             - Does NOT mention question numbers or the word "question".

#             Respond with the question as plain text only. No JSON, lists, or formatting.
#             """
#         )
























# # intraview_agent/planner.py

# import textwrap
# from dataclasses import dataclass
# from typing import List, Optional

# from .questions import Question, get_fixed_question_set


# @dataclass
# class InterviewConfig:
#     session_id: int
#     role_slug: str
#     round_type: str
#     difficulty: str
#     max_questions: int


# class QuestionPlanner:
#     """
#     Planner that controls interview coverage and ordering.

#     - Decides which base question (topic) to ask on each turn.
#     - LLM is only used to phrase that question, not to pick topics or control flow.
#     """

#     def __init__(self, cfg: InterviewConfig):
#         self.cfg = cfg
#         base_questions: List[Question] = get_fixed_question_set(
#             cfg.role_slug, cfg.round_type, cfg.difficulty
#         )
#         self.questions: List[Question] = base_questions[: cfg.max_questions]

#     def total_questions(self) -> int:
#         return len(self.questions)

#     def base_question_for_turn(self, turn_index: int) -> Question:
#         """
#         turn_index: 0-based.
#         Raises IndexError if out of range.
#         """
#         if turn_index < 0 or turn_index >= self.total_questions():
#             raise IndexError("turn_index out of range for questions")
#         return self.questions[turn_index]

#     def build_llm_instruction(
#         self,
#         turn_index: int,
#         base_q: Question,
#         last_answer: Optional[str],
#     ) -> str:
#         """
#         Build a short instruction to Gemini for THIS specific question.
#         """
#         num = turn_index + 1
#         total = self.total_questions()

#         last_answer_snippet = ""
#         if last_answer:
#             clipped = last_answer.strip()
#             if len(clipped) > 300:
#                 clipped = clipped[:300] + "..."
#             last_answer_snippet = (
#                 f"\nThe candidate's previous answer was:\n\"{clipped}\"\n"
#             )

#         return textwrap.dedent(
#             f"""\
#             You are conducting a practice interview for the role "{self.cfg.role_slug}".
#             Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

#             You are now about to ask interview question {num} of {total}.

#             Core question to cover:
#             "{base_q.text}"

#             Topic tag: {base_q.topic}.{last_answer_snippet}

#             Please output a single, natural-sounding spoken interview question that:
#             - Clearly asks the candidate about this topic.
#             - Uses a neutral, professional tone (no praise like "great answer").
#             - Does NOT give hints, coaching, or feedback.
#             - Does NOT comment on whether previous answers were good or bad.
#             - Does NOT mention question numbers or the word "question".

#             Respond with the question as plain text only. No JSON, lists, or formatting.
#             """
#         )



























# # intraview_agent/planner.py

# import textwrap
# from dataclasses import dataclass
# from typing import List, Optional

# from questions import Question, get_fixed_question_set


# @dataclass
# class InterviewConfig:
#     session_id: int
#     role_slug: str
#     round_type: str
#     difficulty: str
#     max_questions: int
#     # Optional total duration in seconds (authoritative value comes from backend)
#     duration_seconds: Optional[int] = None


# class QuestionPlanner:
#     """
#     Planner that controls interview coverage and ordering.

#     - Decides which base question (topic) to ask on each turn.
#     - LLM is only used to phrase that question, not to pick topics or control flow.
#     """

#     def __init__(self, cfg: InterviewConfig):
#         self.cfg = cfg
#         base_questions: List[Question] = get_fixed_question_set(
#             cfg.role_slug, cfg.round_type, cfg.difficulty
#         )
#         self.questions: List[Question] = base_questions[: cfg.max_questions]

#     def total_questions(self) -> int:
#         return len(self.questions)

#     def base_question_for_turn(self, turn_index: int) -> Question:
#         """
#         turn_index: 0-based.
#         Raises IndexError if out of range.
#         """
#         if turn_index < 0 or turn_index >= self.total_questions():
#             raise IndexError("turn_index out of range for questions")
#         return self.questions[turn_index]

#     def build_llm_instruction(
#         self,
#         turn_index: int,
#         base_q: Question,
#         last_answer: Optional[str],
#     ) -> str:
#         """
#         Build a short instruction to Gemini for THIS specific question.
#         """
#         num = turn_index + 1
#         total = self.total_questions()

#         last_answer_snippet = ""
#         if last_answer:
#             clipped = last_answer.strip()
#             if len(clipped) > 300:
#                 clipped = clipped[:300] + "..."
#             last_answer_snippet = (
#                 f"\nThe candidate's previous answer was:\n\"{clipped}\"\n"
#             )

#         return textwrap.dedent(
#             f"""\
#             You are conducting a practice interview for the role "{self.cfg.role_slug}".
#             Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

#             You are now about to ask interview question {num} of {total}.

#             Core question to cover:
#             "{base_q.text}"

#             Topic tag: {base_q.topic}.{last_answer_snippet}

#             Please output a single, natural-sounding spoken interview question that:
#             - Clearly asks the candidate about this topic.
#             - Uses a neutral, professional tone (no praise like "great answer").
#             - Does NOT give hints, coaching, or feedback.
#             - Does NOT comment on whether previous answers were good or bad.
#             - Does NOT mention question numbers or the word "question".

#             Respond with the question as plain text only. No JSON, lists, or formatting.
#             """
#         )































# intraview_agent/planner.py

import textwrap
from dataclasses import dataclass
from typing import List, Optional, Literal

from questions import Question, get_fixed_question_set


@dataclass
class InterviewConfig:
    session_id: int
    role_slug: str
    round_type: str
    difficulty: str
    max_questions: int
    # Optional total duration in seconds (authoritative value comes from backend)
    duration_seconds: Optional[int] = None


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
            - Uses a neutral, professional tone (no praise like "great answer").
            - Does NOT give hints, coaching, or feedback.
            - Does NOT comment on whether previous answers were good or bad.
            - Does NOT mention question numbers or the word "question".
            - Ask ONLY the requested interview question.
            - Do NOT ask additional probing or clarifying questions.
            - Do NOT continue the conversation after asking the question.
            - Wait for runtime instructions before speaking again.
            - Never autonomously continue the interview.

            Respond with the question as plain text only. No JSON, lists, or formatting.
            """
        )

    def build_followup_instruction(
        self,
        turn_index: int,
        base_q: Question,
        base_question_text: str,
        last_answer: str,
        followup_num: int,
        max_followups: int,
    ) -> str:
        """
        Build a tightly constrained follow-up instruction for Gemini.

        Rules enforced via prompt:
        - Must stay on the same topic as the base question.
        - Must NOT introduce a new main topic.
        - Must NOT give hints, coaching, or feedback.
        - Must NOT mention it is a follow-up.
        - Must NOT mention question numbers.

        The runtime (not Gemini) enforces the hard cap on follow-up count.
        """
        clipped_answer = (last_answer or "").strip()
        if len(clipped_answer) > 400:
            clipped_answer = clipped_answer[:400] + "..."

        return textwrap.dedent(
            f"""\
            You are conducting a practice interview for the role "{self.cfg.role_slug}".
            Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

            The candidate is still on the same interview topic: "{base_q.topic}".

            The original question being discussed:
            "{base_question_text}"

            The candidate's answer so far:
            "{clipped_answer}"

            The candidate's answer may require ONE brief clarification.

            Ask ONLY ONE short clarifying question if absolutely necessary.
            Do NOT ask multiple questions.
            Do NOT stack follow-up questions together.

            Rules:
            - Stay strictly on the SAME topic as the original question.
            - Ask ONLY ONE concise clarification question.
            - Do NOT ask compound or multi-part questions.
            - Do NOT introduce any new topic.
            - Do NOT continue asking repeated probing questions.
            - Do NOT give hints, coaching, or feedback.
            - Do NOT comment on whether the answer was good or bad.
            - Do NOT say "follow-up" or mention question numbers.
            - Keep it concise, natural, and conversational.
            - Prefer clarification over interrogation.
            - This is the ONLY follow-up question you should ask right now.
            - After asking this clarification, stop speaking.
            - Do NOT continue probing unless explicitly instructed again.
            - Do NOT ask another follow-up automatically after the candidate answers.

            Runtime controls interview flow.
            You are only generating the single clarification question requested.

            Respond with the clarifying question as plain text only. No JSON, lists, or formatting.
            """
        )
    


    def build_no_followup_instruction(
        self,
        turn_index: int,
        base_q: Question,
    ) -> str:
        """
        Build a STRICT instruction that prevents Gemini from asking
        any additional follow-up questions.

        This is used when:
        - follow-up budget is exhausted
        - runtime has decided to move on
        - assistant must ask the NEXT main question only
        """

        num = turn_index + 1
        total = self.total_questions()

        return textwrap.dedent(
            f"""\
            You are conducting a practice interview for the role "{self.cfg.role_slug}".
            Round type: {self.cfg.round_type}. Difficulty: {self.cfg.difficulty}.

            You are now moving to interview question {num} of {total}.

            Core question to ask:
            "{base_q.text}"

            Topic tag: {base_q.topic}

            IMPORTANT RULES:
            - You are NOT allowed to ask any follow-up questions.
            - You must ask ONLY the next main interview question.
            - Do NOT continue the previous topic.
            - Do NOT reference previous answers.
            - Do NOT give hints, coaching, or feedback.
            - Do NOT praise or criticize the candidate.
            - Do NOT mention question numbers.
            - Keep the question concise and natural.
            - Do NOT continue discussing the previous answer.
            - Do NOT ask clarification questions.
            - Do NOT ask probing questions.
            - Ask the next main question only, then stop speaking.

            Respond with ONLY the interview question as plain text.
            No JSON, markdown, lists, or formatting.
            """
        )