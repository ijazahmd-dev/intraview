# bookings/models.py




from django.db import models
from django.conf import settings
from django.utils import timezone

from interviewers.models import InterviewerAvailability

# Create your models here.


User = settings.AUTH_USER_MODEL



class RescheduleStatus(models.TextChoices):
    """
    Lifecycle of a reschedule request raised by either party.
 
    NONE     → no active request
    PENDING  → request submitted, interviewer must accept or reject
    ACCEPTED → interviewer accepted (booking times updated, status resets to NONE)
    REJECTED → interviewer rejected (booking unchanged, status resets to NONE)
    """
    NONE     = "NONE",     "None"
    PENDING  = "PENDING",  "Pending Interviewer Action"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"





class InterviewBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"                # Created but not confirmed
        CONFIRMED = "CONFIRMED", "Confirmed"          # Accepted and scheduled
        LIVE = "LIVE", "Live"                        # Session started
        COMPLETED = "COMPLETED", "Completed"         # Session ended normally
        CANCELLED = "CANCELLED", "Cancelled"         # Cancelled before start
        CANCELLED_BY_CANDIDATE = "CANCELLED_BY_CANDIDATE", "Cancelled by Candidate"
        CANCELLED_BY_INTERVIEWER = "CANCELLED_BY_INTERVIEWER", "Cancelled by Interviewer"
        CANDIDATE_NO_SHOW = "CANDIDATE_NO_SHOW", "Candidate No Show"
        INTERVIEWER_NO_SHOW = "INTERVIEWER_NO_SHOW", "Interviewer No Show"


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

    payment_status = models.CharField(
    max_length=100,
    choices=[
        ("PENDING", "Pending"),
        ("PAID_TO_INTERVIEWER", "Paid to Interviewer"),
        ("REFUNDED_TO_CANDIDATE", "Refunded to Candidate"),
        ("AWAITING_EVALUATION", "Awaiting Evaluation"),
    ],
    default="PENDING"
)
    evaluation_deadline = models.DateTimeField(
    null=True,
    blank=True,
    help_text="Last datetime when evaluations/reviews can be submitted.",
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

    reschedule_status = models.CharField(
        max_length=20,
        choices=RescheduleStatus.choices,
        default=RescheduleStatus.NONE,
        db_index=True,
        help_text=(
            "NONE = no active request. "
            "PENDING = waiting for interviewer action. "
            "ACCEPTED/REJECTED = terminal states (reset to NONE after handled)."
        ),
    )
 
    # proposed_availability: the slot the candidate wants to move to.
    # Null = candidate has no specific slot in mind (no-slot request).
    proposed_availability = models.ForeignKey(
        InterviewerAvailability,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="proposed_bookings",
        help_text="Slot proposed by the candidate. Null = open preference.",
    )

    reschedule_requested_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["candidate", "status"]),
            models.Index(fields=["interviewer", "status"]),
            models.Index(fields=["availability", "status"]),
            models.Index(fields=["status", "start_datetime"]),
            models.Index(fields=["interviewer", "reschedule_status"]),
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
    
    @property
    def has_pending_reschedule(self):
        return self.reschedule_status == RescheduleStatus.PENDING

