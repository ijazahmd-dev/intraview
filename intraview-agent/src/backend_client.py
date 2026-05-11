# # intraview_agent/backend_client.py

# from dataclasses import dataclass
# from typing import Mapping, Any

# import httpx

# from .config import get_backend_config


# @dataclass
# class BackendClient:
#     """
#     Thin wrapper around httpx.AsyncClient for talking to your Django backend.
#     """

#     base_url: str
#     shared_secret: str
#     _client: httpx.AsyncClient

#     @classmethod
#     async def create(cls) -> "BackendClient":
#         cfg = get_backend_config()
#         client = httpx.AsyncClient(http2=True, timeout=10.0)
#         return cls(base_url=cfg.base_url, shared_secret=cfg.shared_secret, _client=client)

#     async def close(self):
#         await self._client.aclose()

#     async def post_turn(
#         self,
#         session_id: int,
#         turn_index_1based: int,
#         question_text: str,
#         answer_text: str,
#         metadata: Mapping[str, Any],
#     ):
#         url = f"{self.base_url}/api/ai-interview/session/{session_id}/turns/"
#         payload = {
#             "turn_index": turn_index_1based,
#             "question_text": question_text,
#             "answer_text": answer_text,
#             "metadata": dict(metadata),
#         }
#         headers = {
#             "Content-Type": "application/json",
#             "X-Agent-Token": self.shared_secret,
#         }
#         resp = await self._client.post(url, json=payload, headers=headers)
#         return resp



























# intraview_agent/backend_client.py

from dataclasses import dataclass
from typing import Any, Mapping, Optional

import httpx

from config import get_backend_config
import logging




logger = logging.getLogger(__name__)


@dataclass
class BackendClient:
    """
    Thin wrapper around httpx.AsyncClient for talking to Django backend.
    """

    base_url: str
    shared_secret: str
    client: httpx.AsyncClient

    @classmethod
    async def create(cls) -> "BackendClient":
        cfg = get_backend_config()
        client = httpx.AsyncClient(http2=True, timeout=10.0)
        return cls(base_url=cfg.base_url, shared_secret=cfg.shared_secret, client=client)

    async def close(self):
        await self.client.aclose()

    def _auth_headers(self) -> dict:
        return {
            # "Content-Type": "application/json",
            "X-Agent-Token": self.shared_secret,
        }

    async def post_turn(
        self,
        session_id: int,
        turn_index_1based: int,
        question_text: str,
        answer_text: str,
        metadata: Mapping[str, Any],
    ) -> httpx.Response:
        """
        Post a completed turn.

        Uses an idempotency key so retries cannot create duplicates
        even under race conditions.
        """
        url = f"{self.base_url}/api/ai-interview/session/{session_id}/turns/"
        idempotency_key = f"{session_id}:{turn_index_1based}:turn"
        headers = self._auth_headers()
        headers["Idempotency-Key"] = idempotency_key

        payload = {
            "turn_index": turn_index_1based,
            "question_text": question_text,
            "answer_text": answer_text,
            "metadata": dict(metadata),
        }
        return await self.client.post(url, json=payload, headers=headers)

    async def load_runtime_state(self, session_id: int) -> Optional[dict]:
        """
        Optional: fetch durable runtime state from backend.

        Expected endpoint (you can implement later in Django):
          GET /api/ai-interview/session/<id>/runtime-state/

        If the endpoint does not exist (404), we treat this as "no state yet"
        and continue with in-memory defaults.
        """
        url = f"{self.base_url}/api/ai-interview/session/{session_id}/runtime-state/"
        resp = await self.client.get(url, headers=self._auth_headers())
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    async def update_runtime_state(self, session_id: int, payload: Mapping[str, Any]) -> None:
        """
        Optional: PATCH runtime state to backend.

        Expected endpoint:
          PATCH /api/ai-interview/session/<id>/runtime-state/

        Backend can store:
          - current_turn_index
          - waiting_for_answer
          - current_state
          - last_event_at
          - reconnect_grace_until
          - etc.
        """
        url = f"{self.base_url}/api/ai-interview/session/{session_id}/runtime-state/"
        # We don't crash on 404 – allows backend to adopt this gradually.
        resp = await self.client.patch(url, json=dict(payload), headers=self._auth_headers())
        if resp.status_code == 404:
            logger.warning("update_runtime_state: endpoint not found for session %s", session_id)
            return
        if resp.status_code >= 400:
            resp.raise_for_status()