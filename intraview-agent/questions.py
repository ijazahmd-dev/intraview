# from dataclasses import dataclass
# from typing import List


# @dataclass
# class Question:
#     text: str
#     topic: str
#     followup: bool = False


# def get_fixed_question_set(role_slug: str, round_type: str, difficulty: str) -> List[Question]:
#     """
#     Deterministic question list for Batch A.
#     Later, Batch C will replace this with a hybrid LLM + template planner.
#     """
#     # Simple example – you can specialize per role/round/difficulty.
#     if round_type.lower() == "behavioral":
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

#     if round_type.lower() == "coding":
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



















# # intraview_agent/questions.py

# from dataclasses import dataclass
# from typing import List


# @dataclass
# class Question:
#     text: str
#     topic: str
#     followup: bool = False


# def get_fixed_question_set(role_slug: str, round_type: str, difficulty: str) -> List[Question]:
#     """
#     Deterministic question list for planner.

#     Later you can specialize by role_slug and difficulty, but for now
#     we branch mainly on round_type.
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

























# intraview_agent/questions.py

from dataclasses import dataclass
from typing import List


@dataclass
class Question:
    text: str
    topic: str
    followup: bool = False


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
    ]