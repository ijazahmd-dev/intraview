# ai_interviews/services/gemini/evaluation.py

from __future__ import annotations

import json
from typing import Any, Dict

from django.conf import settings

from .client import generate_json_content
from .parsing import extract_json_object, normalize_evaluation_result


def build_evaluation_prompt(payload: Dict[str, Any]) -> str:
    return f"""
You are an expert interview evaluator.

Evaluate one candidate answer from a mock interview.

Return ONLY valid JSON.
Do not include markdown fences.
Do not include any explanation outside JSON.

Scoring rules:
- score: number from 0 to 10
- strengths: array of short strings
- weaknesses: array of short strings
- suggestions: array of short actionable strings
- confidence: one of "low", "medium", "high"

Evaluation guidance:
- Judge relevance to the question, clarity, completeness, technical depth, and communication.
- Be constructive and realistic.
- Keep feedback concise.
- Do not hallucinate facts not supported by the answer.

Return JSON in exactly this shape:
{{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "confidence": "medium"
}}

Interview payload:
{json.dumps(payload, ensure_ascii=False)}
""".strip()


def evaluate_turn_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    model_name = getattr(settings, "GEMINI_EVALUATION_MODEL", "gemini-2.5-flash")
    prompt = build_evaluation_prompt(payload)
    raw_text = generate_json_content(model_name=model_name, prompt=prompt)
    parsed = extract_json_object(raw_text)
    return normalize_evaluation_result(parsed, raw_text)