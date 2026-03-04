

# Create your models here.

from django.db import models
from django.conf import settings
from django.utils import timezone
from bookings.models import InterviewBooking


class SessionStatus(models.TextChoices):
    CREATED = "CREATED", "Created"
    LIVE = "LIVE", "Live"
    ENDED = "ENDED", "Ended"
    ABORTED = "ABORTED", "Aborted"
    NO_SHOW = "NO_SHOW", "No Show"


class InterviewSession(models.Model):
    """
    Persistent record of a real-time interview session.
    One booking → One session.
    """

    booking = models.OneToOneField(
        InterviewBooking,
        on_delete=models.CASCADE,
        related_name="session"
    )

    status = models.CharField(
        max_length=20,
        choices=SessionStatus.choices,
        default=SessionStatus.CREATED,
        db_index=True
    )

    # Connection tracking
    candidate_connected_at = models.DateTimeField(null=True, blank=True)
    interviewer_connected_at = models.DateTimeField(null=True, blank=True)

    candidate_disconnected_at = models.DateTimeField(null=True, blank=True)
    interviewer_disconnected_at = models.DateTimeField(null=True, blank=True)

    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    reconnect_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["booking"]),
        ]

    def __str__(self):
        return f"Session({self.booking_id}, {self.status})"

    @property
    def duration_seconds(self):
        if self.started_at and self.ended_at:
            return int((self.ended_at - self.started_at).total_seconds())
        return 0









class InterviewerNote(models.Model):
    """
    Per-booking notes written by the interviewer only.
    One note per interview booking.
    """

    booking = models.OneToOneField(
        InterviewBooking,
        on_delete=models.CASCADE,
        related_name="interviewer_note",
    )
    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviewer_notes",
    )
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "realtime_interviewer_note"
        verbose_name = "Interviewer Note"
        verbose_name_plural = "Interviewer Notes"

    def __str__(self):
        return f"Note for booking {self.booking_id} by user {self.interviewer_id}"
