# notifications/novu_client.py
from __future__ import annotations

from typing import Any, Dict, Optional

import novu_py
from django.conf import settings
from novu_py import Novu


class NovuClient:
    """
    Thin wrapper around novu-py SDK.
    Used by NotificationService provider layer.
    """

    def __init__(self, secret_key: Optional[str] = None) -> None:
        self.secret_key = secret_key or settings.NOVU_SECRET_KEY
        if not self.secret_key:
            raise RuntimeError("NOVU_SECRET_KEY is not set in settings.")

    def trigger_workflow(
        self,
        *,
        workflow_id: str,
        subscriber_id: str | int,
        payload: Dict[str, Any],
        subscriber_email: Optional[str] = None,
        subscriber_first_name: Optional[str] = None,
    ) -> Any:
        """
        Trigger a Novu workflow for a single subscriber.

        - workflow_id: Novu workflow trigger identifier (string)
        - subscriber_id: your user id (will be stringified)
        - payload: dict passed as `payload` to Novu (used in templates)
        - subscriber_email / subscriber_first_name: used so Novu can send email
        """
        with Novu(secret_key=self.secret_key) as novu:
            subscriber_payload = novu_py.SubscriberPayloadDto(
                subscriber_id=str(subscriber_id),
                email=subscriber_email,
                first_name=subscriber_first_name,
            )

            req = novu_py.TriggerEventRequestDto(
                workflow_id=workflow_id,
                payload=payload,
                to=subscriber_payload,
            )
            res = novu.trigger(trigger_event_request_dto=req)
            return res