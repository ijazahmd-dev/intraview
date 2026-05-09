# ai_interviews/services/gemini/reporting.py

from __future__ import annotations

import json
from typing import Any, Dict

from django.conf import settings

from .client import generate_json_content
from .parsing import extract_json_object, normalize_final_report_result


def build_final_report_prompt(payload: Dict[str, Any]) -> str:
    return f"""
You are an expert interview coach writing a final mock interview report.

Return ONLY valid JSON.
Do not include markdown fences.
Do not include any explanation outside JSON.

Return:
- overall_score: number from 0 to 10
- summary: a short summary paragraph
- strengths: array of short strings
- areas_for_improvement: array of short strings
- recommendations: array of short actionable strings

Guidance:
- Base your report on the full interview.
- Use per-turn evaluations when available.
- If some turns have missing evaluations, still generate the best report possible.
- Be realistic, constructive, and concise.

Return JSON in exactly this shape:
{{
  "overall_score": 0,
  "summary": "",
  "strengths": [],
  "areas_for_improvement": [],
  "recommendations": []
}}

Interview payload:
{json.dumps(payload, ensure_ascii=False)}
""".strip()


def generate_final_report_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    model_name = getattr(settings, "GEMINI_FINAL_REPORT_MODEL", "gemini-2.5-pro")
    prompt = build_final_report_prompt(payload)
    raw_text = generate_json_content(model_name=model_name, prompt=prompt)
    parsed = extract_json_object(raw_text)
    return normalize_final_report_result(parsed, raw_text)