from __future__ import annotations

import json
import logging
from typing import Any, Dict

from django.conf import settings

from .client import generate_json_content
from .parsing import extract_json_object, normalize_question_generation_result

logger = logging.getLogger(__name__)


def estimate_interview_question_count(
    *,
    round_type: str,
    duration_minutes: int,
) -> int:
    """
    Estimate a production-friendly question count from duration and round type.

    We combine:
    - baseline duration windows supplied by product requirements
    - different pacing expectations per round type
    - a small buffer for greeting/closing and natural pauses
    """

    duration = max(int(duration_minutes or 0), 5)
    round_key = str(round_type or "").upper().strip()

    if duration <= 5:
        lower, upper = 4, 5
    elif duration <= 10:
        lower, upper = 8, 9
    elif duration <= 15:
        lower, upper = 13, 14
    elif duration <= 20:
        lower, upper = 18, 19
    elif duration <= 25:
        lower, upper = 23, 24
    else:
        lower, upper = 12, 15

    available_minutes = max(duration - 1.0, 2.5)
    minutes_per_question = {
        "WARMUP": 1.05,
        "ROLE_RELATED": 1.30,
        "BEHAVIORAL": 1.55,
        "CODING": 1.75,
    }.get(round_key, 1.40)

    estimated = round(available_minutes / minutes_per_question)

    if round_key == "WARMUP":
        estimated += 1
    elif round_key == "CODING":
        estimated -= 1

    return max(lower, min(estimated, upper))


def build_question_generation_prompt(payload: Dict[str, Any]) -> str:
    return f"""
You are an expert interview designer creating a structured mock interview.

Return ONLY valid JSON.
Do not include markdown fences.
Do not include explanations, notes, or prose outside JSON.

Design requirements:
- Questions must be realistic, professional, and role-specific.
- Questions must match the selected round type, difficulty, and interview duration.
- Avoid repetitive wording or duplicated themes.
- Progress naturally from easier to harder prompts when appropriate.
- For behavioral rounds, prefer STAR-friendly questions.
- For coding rounds, focus on problem solving, debugging, architecture, tradeoffs, and reasoning.
- For role-related rounds, make the questions meaningfully tied to the role.
- For warmup rounds, keep questions confidence-building and introductory but still useful.
- Each question must be a single interview question, not a multi-part checklist.
- Keep question wording concise enough for spoken delivery.

Schema:
{{
  "questions": [
    {{
      "text": "Question text",
      "topic": "short_topic_slug",
      "followup_allowed": true
    }}
  ]
}}

Question count target:
- Desired number of questions: {payload["desired_question_count"]}

Interview payload:
{json.dumps(payload, ensure_ascii=False)}
""".strip()


def generate_interview_questions(payload: Dict[str, Any]) -> Dict[str, Any]:
    model_name = getattr(
        settings,
        "GEMINI_QUESTION_GENERATION_MODEL",
        "gemini-2.5-flash",
    )
    prompt = build_question_generation_prompt(payload)
    raw_text = generate_json_content(
        model_name=model_name,
        prompt=prompt,
    )
    parsed = extract_json_object(raw_text)
    return normalize_question_generation_result(
        parsed,
        raw_text,
        desired_count=int(payload["desired_question_count"]),
    )
