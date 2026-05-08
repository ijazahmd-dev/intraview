# import os
# from dataclasses import dataclass


# @dataclass
# class BackendConfig:
#     base_url: str
#     turn_path_template: str
#     shared_secret: str


# @dataclass
# class InterviewDefaults:
#     max_questions: int
#     intro_tts: bool


# def get_backend_config() -> BackendConfig:
#     return BackendConfig(
#         base_url=os.getenv("BACKEND_BASE_URL", "").rstrip("/"),
#         turn_path_template=os.getenv(
#             "BACKEND_AGENT_TURN_PATH",
#             "/api/ai-interview/session/{session_id}/turns/",
#         ),
#         shared_secret=os.getenv("BACKEND_AGENT_SHARED_SECRET", ""),
#     )


# def get_interview_defaults() -> InterviewDefaults:
#     max_q = int(os.getenv("INTERVIEW_MAX_QUESTIONS", "5"))
#     intro_tts = os.getenv("INTERVIEW_INTRO_TTS", "true").lower() == "true"
#     return InterviewDefaults(max_questions=max_q, intro_tts=intro_tts)



















# intraview_agent/config.py

import os
from dataclasses import dataclass


@dataclass
class BackendConfig:
    base_url: str
    shared_secret: str


@dataclass
class InterviewDefaults:
    max_questions: int


def get_backend_config() -> BackendConfig:
    """
    Read backend configuration from environment.

    Required:
      BACKEND_BASE_URL          e.g. http://localhost:8000
      BACKEND_AGENT_SHARED_SECRET  shared secret for X-Agent-Token
    """
    base_url = os.getenv("BACKEND_BASE_URL", "").rstrip("/")
    if not base_url:
        raise RuntimeError("BACKEND_BASE_URL is not set in .env.local")

    shared_secret = os.getenv("BACKEND_AGENT_SHARED_SECRET", "")
    if not shared_secret:
        raise RuntimeError("BACKEND_AGENT_SHARED_SECRET is not set in .env.local")

    return BackendConfig(base_url=base_url, shared_secret=shared_secret)


def get_interview_defaults() -> InterviewDefaults:
    """
    Load generic interview defaults.

    INTERVIEW_MAX_QUESTIONS controls the default number of questions
    when dispatch metadata does not override it.
    """
    raw = os.getenv("INTERVIEW_MAX_QUESTIONS", "5")
    try:
        max_q = int(raw)
    except ValueError:
        max_q = 5

    return InterviewDefaults(max_questions=max_q)