from django.db import models
from django.conf import settings
from django.utils import timezone

from interviewers.models import InterviewerAvailability

# Create your models here.


User = settings.AUTH_USER_MODEL


class InterviewBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        CANCELLED_BY_CANDIDATE = "CANCELLED_BY_CANDIDATE"
        CANCELLED_BY_INTERVIEWER = "CANCELLED_BY_INTERVIEWER"

    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_bookings",
    )
    interviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interviewer_bookings",
    )

    # Link to availability (but booking survives if availability is disabled)
    availability = models.ForeignKey(
        InterviewerAvailability,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    # 🔒 Snapshot fields (NEVER change after creation)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    token_cost = models.PositiveIntegerField()

    status = models.CharField(
        max_length=200,
        choices=Status.choices,
        default=Status.PENDING,
    )

    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    rescheduled_by = models.CharField(
    max_length=20,
    choices=[
        ("CANDIDATE", "Candidate"),
        ("INTERVIEWER", "Interviewer"),
    ],
    null=True, 
    blank=True
)
    rescheduled_at = models.DateTimeField(null=True, blank=True)
    reschedule_reason = models.TextField(blank=True, max_length=500)
    reschedule_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["candidate", "status"]),
            models.Index(fields=["interviewer", "status"]),
            models.Index(fields=["availability", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(token_cost__gt=0),
                name="booking_token_cost_positive",
            )
        ]

    def __str__(self):
        return (
            f"Booking #{self.id} | "
            f"{self.candidate} → {self.interviewer} | "
            f"{self.status}"
        )

    def can_be_cancelled(self):
        """
        Used later for cancellation rules.
        """
        return self.status in {
            self.Status.PENDING,
            self.Status.CONFIRMED,
        }

