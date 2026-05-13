# ai_interviews/services/gemini/parsing.py

from __future__ import annotations

import json
from typing import Any, Dict, List

from .client import GeminiPermanentError


def extract_json_object(text: str) -> Dict[str, Any]:
    """
    Best-effort JSON extraction from Gemini text output.

    This is still a pragmatic parser for current testing.
    Later, you can replace it with strict schema / structured output mode.
    """
    if not text or not text.strip():
        raise GeminiPermanentError("Gemini returned empty text.")

    cleaned = text.strip()

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]

        cleaned = "\n".join(lines).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise GeminiPermanentError(
            f"Could not find JSON object in Gemini response: {cleaned}"
        )

    json_text = cleaned[start : end + 1]

    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise GeminiPermanentError(
            f"Gemini returned invalid JSON: {json_text}"
        ) from exc

    if not isinstance(parsed, dict):
        raise GeminiPermanentError("Gemini JSON response is not an object.")

    return parsed


def _ensure_string_list(value: Any) -> List[str]:
    if value is None:
        return []

    if isinstance(value, list):
        return [str(x).strip() for x in value if str(x).strip()]

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        if "\n" in stripped:
            return [line.strip("- ").strip() for line in stripped.splitlines() if line.strip()]
        return [stripped]

    return [str(value).strip()]


def normalize_evaluation_result(parsed: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    score = parsed.get("score")
    try:
        score = float(score) if score is not None else None
    except (TypeError, ValueError):
        score = None

    if score is not None:
        score = max(0.0, min(10.0, score))

    confidence = str(parsed.get("confidence") or "medium").strip().lower()
    if confidence not in {"low", "medium", "high"}:
        confidence = "medium"

    return {
        "score": score,
        "strengths": _ensure_string_list(parsed.get("strengths")),
        "weaknesses": _ensure_string_list(parsed.get("weaknesses")),
        "suggestions": _ensure_string_list(parsed.get("suggestions")),
        "confidence": confidence,
        "raw": {
            "parsed": parsed,
            "text": raw_text,
        },
    }


def normalize_final_report_result(parsed: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    overall_score = parsed.get("overall_score")
    try:
        overall_score = float(overall_score) if overall_score is not None else None
    except (TypeError, ValueError):
        overall_score = None

    if overall_score is not None:
        overall_score = max(0.0, min(10.0, overall_score))

    return {
        "overall_score": overall_score,
        "summary": str(parsed.get("summary") or "").strip(),
        "strengths": _ensure_string_list(parsed.get("strengths")),
        "areas_for_improvement": _ensure_string_list(parsed.get("areas_for_improvement")),
        "recommendations": _ensure_string_list(parsed.get("recommendations")),
        "raw": {
            "parsed": parsed,
            "text": raw_text,
        },
    }