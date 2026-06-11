# notifications/realtime.py
"""
NotificationCountPublisher
──────────────────────────
Centralized helper that:

  1. Queries the current unread count for a user from the DB.
  2. Pushes it to the user-specific Django Channels group so all
     open WebSocket connections for that user receive the update.

Designed to be called from **synchronous** Django code (views, Celery
tasks, service layer).  It uses `async_to_sync` internally so the
caller never has to worry about async/await.

Usage:
    from notifications.realtime import NotificationCountPublisher
    NotificationCountPublisher.push_count(user_id=42)

Channel group name convention:
    notifications_user_<user_id>

Message payload sent to the channel layer (consumed by
NotificationCountConsumer → forwarded to WebSocket):
    {
        "type": "notification.unread.count",   # dots = channels dispatch
        "count": <int>,
    }
"""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import NotificationLog

logger = logging.getLogger(__name__)


def _group_name(user_id: int) -> str:
    """Return the channel group name for a specific user."""
    return f"notifications_user_{user_id}"


class NotificationCountPublisher:
    """
    Push the current unread notification count to a user's WebSocket group.
    """

    @staticmethod
    def push_count(user_id: int) -> None:
        """
        Compute the unread count for *user_id* and broadcast it to the
        corresponding channel group.

        Safe to call from any synchronous context — Celery tasks,
        Django views, service layer, signals.

        If Redis / the channel layer is unavailable, logs a warning and
        returns silently so the application never crashes just because
        the push failed.
        """
        try:
            count = NotificationLog.objects.filter(
                recipient_id=user_id,
                is_read=False,
                status="SENT",
            ).count()

            channel_layer = get_channel_layer()
            if channel_layer is None:
                logger.warning(
                    "NotificationCountPublisher: no channel layer configured; "
                    "skipping WS push for user %s",
                    user_id,
                )
                return

            group = _group_name(user_id)

            async_to_sync(channel_layer.group_send)(
                group,
                {
                    # Django Channels dispatches by converting dots → underscores
                    # in the consumer method name: notification_unread_count()
                    "type": "notification.unread.count",
                    "count": count,
                },
            )

            logger.debug(
                "NotificationCountPublisher: pushed count=%s to group %s",
                count,
                group,
            )

        except Exception:
            # Never let a WebSocket push failure bubble up and break the
            # primary REST/DB operation.
            logger.exception(
                "NotificationCountPublisher: failed to push count for user %s",
                user_id,
            )
