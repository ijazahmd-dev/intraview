"""
realtime/consumers.py

WebSocket consumers for the Intraview realtime app.

Consumers
─────────
NotificationCountConsumer  — ws/notifications/
    User-specific channel that pushes live unread notification counts.
    Only the authenticated user receives their own count.

TestConsumer               — ws/test/
    Simple echo consumer kept for development/debugging.
"""

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from notifications.models import NotificationLog

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# NotificationCountConsumer
# ─────────────────────────────────────────────────────────────────────────────

class NotificationCountConsumer(AsyncWebsocketConsumer):
    """
    WebSocket endpoint: ws/notifications/

    Authentication
    ──────────────
    The `JWTAuthMiddleware` populates `scope["user"]` from the
    ?token= query parameter before this consumer is reached.
    Anonymous users are rejected with close code 4003.

    Channel group
    ─────────────
    Each authenticated user has a private group:
        notifications_user_<user_id>

    Only the backend (via NotificationCountPublisher) sends messages
    to this group — the client never sends data here.

    Message flow
    ────────────
    Backend calls NotificationCountPublisher.push_count(user_id)
        → channel_layer.group_send(group, {"type": "notification.unread.count", "count": N})
        → channels dispatches to notification_unread_count() method below
        → we forward {"type": "notification_unread_count", "count": N} to the WebSocket
        → frontend Redux dispatches setUnreadCount(N)
    """

    async def connect(self):
        user = self.scope.get("user")

        # Reject anonymous / unauthenticated connections
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            logger.warning("NotificationCountConsumer: rejected anonymous connection")
            await self.close(code=4003)
            return

        self.user_id = user.id
        self.group_name = f"notifications_user_{self.user_id}"

        # Join the user-specific channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        logger.info(
            "NotificationCountConsumer: user %s connected (group=%s)",
            self.user_id,
            self.group_name,
        )

        # Immediately push the current unread count so the frontend
        # has fresh data without waiting for the next change event.
        count = await self._get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "notification_unread_count",
            "count": count,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(
                "NotificationCountConsumer: user %s disconnected (code=%s)",
                getattr(self, "user_id", "?"),
                close_code,
            )

    async def receive(self, text_data=None, bytes_data=None):
        """
        Clients do not send data to this endpoint.
        Any received data is silently ignored.
        """
        pass

    # ── Channel layer message handler ─────────────────────────────────────────

    async def notification_unread_count(self, event):
        """
        Called by the channel layer when NotificationCountPublisher calls
        group_send(..., {"type": "notification.unread.count", "count": N}).

        Channels converts dots → underscores in the type to find this method.
        """
        await self.send(text_data=json.dumps({
            "type": "notification_unread_count",
            "count": event["count"],
        }))

    # ── DB helper ──────────────────────────────────────────────────────────────

    @database_sync_to_async
    def _get_unread_count(self) -> int:
        return NotificationLog.objects.filter(
            recipient_id=self.user_id,
            is_read=False,
            status="SENT",
        ).count()


# ─────────────────────────────────────────────────────────────────────────────
# TestConsumer (kept for development)
# ─────────────────────────────────────────────────────────────────────────────

class TestConsumer(AsyncWebsocketConsumer):
    """Simple echo consumer for WebSocket connectivity testing."""

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            await self.send(text_data=text_data)