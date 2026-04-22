# notifications/models.py
from django.conf import settings
from django.db import models
from django.utils import timezone

from .constants import NotificationChannel, NotificationStatus, EventType


class NotificationLog(models.Model):
    """
    One row per logical notification attempt (per user, per event).
    This is YOUR source of truth, independent of Novu or any provider.
    """

    event_type = models.CharField(
        max_length=64,
        choices=[(e.value, e.value) for e in EventType],
        db_index=True,
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_logs",
    )

    channel = models.CharField(
        max_length=16,
        choices=[(c.value, c.value) for c in NotificationChannel],
        default=NotificationChannel.IN_APP.value,
    )

    status = models.CharField(
        max_length=16,
        choices=[(s.value, s.value) for s in NotificationStatus],
        default=NotificationStatus.PENDING.value,
        db_index=True,
    )

    # For Novu or any other provider we add later
    provider = models.CharField(
        max_length=32,
        blank=True,
        default="",  # e.g., "novu"
        db_index=True,
    )
    provider_reference = models.CharField(
        max_length=128,
        blank=True,
        default="",  # e.g., Novu transactionId or eventId
    )

    # Debug / audit info
    payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default="")

    correlation_id = models.CharField(
        max_length=128,
        blank=True,
        default="",
        help_text="Optional id for tying multiple notifications to one business operation (e.g. booking id).",
        db_index=True,
    )

    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event_type", "status"]),
            models.Index(fields=["recipient", "status"]),
            models.Index(fields=["recipient", "is_read"]),
            models.Index(fields=["correlation_id"]),
        ]

    def mark_sent(self, provider: str = "", provider_ref: str = ""):
        from .constants import NotificationStatus

        self.status = NotificationStatus.SENT.value
        self.provider = provider or self.provider
        self.provider_reference = provider_ref or self.provider_reference
        self.sent_at = timezone.now()
        self.save(update_fields=["status", "provider", "provider_reference", "sent_at"])

    def mark_failed(self, error_message: str):
        from .constants import NotificationStatus

        self.status = NotificationStatus.FAILED.value
        self.error_message = error_message
        self.save(update_fields=["status", "error_message"])

    def __str__(self) -> str:
        return f"{self.event_type} → {self.recipient} ({self.status})"