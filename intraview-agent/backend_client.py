# intraview_agent/backend_client.py

from dataclasses import dataclass
from typing import Mapping, Any

import httpx

from .config import get_backend_config


@dataclass
class BackendClient:
    """
    Thin wrapper around httpx.AsyncClient for talking to your Django backend.
    """

    base_url: str
    shared_secret: str
    _client: httpx.AsyncClient

    @classmethod
    async def create(cls) -> "BackendClient":
        cfg = get_backend_config()
        client = httpx.AsyncClient(http2=True, timeout=10.0)
        return cls(base_url=cfg.base_url, shared_secret=cfg.shared_secret, _client=client)

    async def close(self):
        await self._client.aclose()

    async def post_turn(
        self,
        session_id: int,
        turn_index_1based: int,
        question_text: str,
        answer_text: str,
        metadata: Mapping[str, Any],
    ):
        url = f"{self.base_url}/api/ai-interview/session/{session_id}/turns/"
        payload = {
            "turn_index": turn_index_1based,
            "question_text": question_text,
            "answer_text": answer_text,
            "metadata": dict(metadata),
        }
        headers = {
            "Content-Type": "application/json",
            "X-Agent-Token": self.shared_secret,
        }
        resp = await self._client.post(url, json=payload, headers=headers)
        return resp