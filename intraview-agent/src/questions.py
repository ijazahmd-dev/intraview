


# intraview_agent/questions.py

from dataclasses import dataclass
import re
from typing import Any, List


@dataclass
class Question:
    text: str
    topic: str
    followup_allowed: bool = False

    @property
    def followup(self) -> bool:
        return self.followup_allowed


def normalize_stored_questions(raw_questions: Any) -> List[Question]:
    """
    Convert backend-stored JSON questions into the runtime Question shape.

    Returns an empty list when payload is absent or unusable so the planner
    can safely fall back to the fixed local question bank.
    """

    if not isinstance(raw_questions, list):
        return []

    normalized: List[Question] = []

    for index, item in enumerate(raw_questions, start=1):
        if not isinstance(item, dict):
            continue

        text = str(item.get("text") or "").strip()
        if not text:
            continue

        topic = str(item.get("topic") or "").strip().lower()
        topic = re.sub(r"[^a-z0-9]+", "_", topic).strip("_") or f"question_{index}"

        normalized.append(
            Question(
                text=text,
                topic=topic,
                followup_allowed=bool(item.get("followup_allowed", True)),
            )
        )

    return normalized






# def get_fixed_question_set(role_slug: str, round_type: str, difficulty: str) -> List[Question]:
#     """
#     Deterministic question list.

#     Later you can specialize per role_slug and difficulty; Batch 3 keeps it simple.
#     """
#     rt = (round_type or "").lower()

#     if rt == "behavioral":
#         return [
#             Question(
#                 text="Tell me about a time you faced a difficult challenge at work.",
#                 topic="behavioral_challenge",
#             ),
#             Question(
#                 text="Describe a situation where you had to work with a difficult teammate.",
#                 topic="teamwork_conflict",
#             ),
#             Question(
#                 text="Tell me about a time you learned from a mistake.",
#                 topic="learning_from_failure",
#             ),
#         ]

#     if rt == "coding":
#         return [
#             Question(
#                 text="Explain a recent coding problem you solved and how you approached it.",
#                 topic="problem_solving",
#             ),
#             Question(
#                 text="How do you usually structure your code for readability and maintainability?",
#                 topic="code_quality",
#             ),
#             Question(
#                 text="Tell me about a performance issue you identified and fixed.",
#                 topic="performance_debugging",
#             ),
#         ]

#     # Fallback generic set
#     return [
#         Question(
#             text="Tell me about yourself and your experience for this role.",
#             topic="intro",
#         ),
#         Question(
#             text="What is one project you are most proud of, and why?",
#             topic="project_pride",
#         ),
#         Question(
#             text="What kind of challenges are you looking for in your next role?",
#             topic="future_goals",
#         ),
#     ]










def get_fixed_question_set(role_slug: str, round_type: str, difficulty: str) -> List[Question]:
    """
    Deterministic question list.

    Later you can specialize per role_slug and difficulty; Batch 3 keeps it simple.
    """
    rt = (round_type or "").lower()

    if rt == "behavioral":
        return [
            Question(
                text="Tell me about a time you faced a difficult challenge at work.",
                topic="behavioral_challenge",
            ),
            Question(
                text="Describe a situation where you had to work with a difficult teammate.",
                topic="teamwork_conflict",
            ),
            Question(
                text="Tell me about a time you learned from a mistake.",
                topic="learning_from_failure",
            ),
            Question(
                text="Tell me about a time you had to handle pressure or a tight deadline.",
                topic="pressure_handling",
            ),
            Question(
                text="Describe a time when you had to take initiative without being asked.",
                topic="initiative",
            ),
            Question(
                text="Tell me about a time you had to adapt to an unexpected change.",
                topic="adaptability",
            ),
        ]

    if rt == "coding":
        return [
            Question(
                text="Explain a recent coding problem you solved and how you approached it.",
                topic="problem_solving",
            ),
            Question(
                text="How do you usually structure your code for readability and maintainability?",
                topic="code_quality",
            ),
            Question(
                text="Tell me about a performance issue you identified and fixed.",
                topic="performance_debugging",
            ),
            Question(
                text="How do you debug a bug that is difficult to reproduce?",
                topic="debugging_strategy",
            ),
            Question(
                text="Describe how you would design a simple and scalable feature.",
                topic="system_design_basics",
            ),
            Question(
                text="What steps do you take when reviewing or improving existing code?",
                topic="code_review",
            ),
        ]

    # Fallback generic set
    return [
        Question(
            text="Tell me about yourself and your experience for this role.",
            topic="intro",
        ),
        Question(
            text="What is one project you are most proud of, and why?",
            topic="project_pride",
        ),
        Question(
            text="What kind of challenges are you looking for in your next role?",
            topic="future_goals",
        ),
        Question(
            text="How do you usually approach learning something new?",
            topic="learning_style",
        ),
        Question(
            text="Tell me about a time you had to solve a problem under pressure.",
            topic="pressure_solving",
        ),
        Question(
            text="What kind of work environment helps you do your best work?",
            topic="work_environment",
        ),
    ]
