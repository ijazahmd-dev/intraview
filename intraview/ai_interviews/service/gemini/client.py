# ai_interviews/services/gemini/client.py

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from google import genai

logger = logging.getLogger(__name__)


class GeminiConfigurationError(RuntimeError):
    pass


class GeminiTransientError(RuntimeError):
    """
    Retryable error: network issues, temporary provider failures, timeouts, etc.
    """
    pass


class GeminiPermanentError(RuntimeError):
    """
    Non-retryable error: malformed output, invalid configuration, invalid request shape.
    """
    pass


def get_genai_client() -> genai.Client:
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""
    if not api_key.strip():
        raise GeminiConfigurationError("GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=api_key)


def generate_json_content(
    *,
    model_name: str,
    prompt: str,
) -> str:
    """
    Thin wrapper over google-genai.

    We keep this centralized so SDK behavior, timeouts, and error mapping
    are isolated away from tasks.py.
    """
    try:
        client = get_genai_client()
        response: Any = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                "temperature": 0.2,
                "max_output_tokens": 2048,
            },
        )
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            raise GeminiPermanentError("Gemini returned empty text.")
        return text
    except GeminiPermanentError:
        raise
    except GeminiConfigurationError:
        raise
    except Exception as exc:
        logger.exception("Gemini generate_content failed for model=%s", model_name)
        raise GeminiTransientError(str(exc)) from exc