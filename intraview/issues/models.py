from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from bookings.models import InterviewBooking
from .constants import HIGH_PRIORITY_ISSUE_TYPES, ISSUE_RAISE_WINDOW_HOURS


class SessionIssue(models.Model):
    """
    Moderation case for a single interview booking.

    Created by either candidate or interviewer, against the other party.
    """

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        WAITING_FOR_RESPONSE = "WAITING_FOR_RESPONSE", "Waiting For Response"
        ACTION_TAKEN = "ACTION_TAKEN", "Action Taken"
        RESOLVED = "RESOLVED", "Resolved"
        REJECTED = "REJECTED", "Rejected"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    class IssueType(models.TextChoices):
        INTERVIEWER_NO_SHOW = (
            "INTERVIEWER_NO_SHOW",
            "Interviewer never joined",
        )
        CANDIDATE_NO_SHOW = (
            "CANDIDATE_NO_SHOW",
            "Candidate never joined",
        )
        ENDED_TOO_EARLY = (
            "ENDED_TOO_EARLY",
            "Interview ended too early",
        )
        UNPROFESSIONAL = (
            "UNPROFESSIONAL",
            "Unprofessional behavior",
        )
        LOW_QUALITY = (
            "LOW_QUALITY",
            "Poor interview quality",
        )
        POOR_FEEDBACK = (
            "POOR_FEEDBACK",
            "Poor feedback quality",
        )
        ABUSE = (
            "ABUSE",
            "Abusive behavior",
        )
        TECHNICAL = (
            "TECHNICAL",
            "Technical issue",
        )
        PAYMENT = (
            "PAYMENT",
            "Payment concern",
        )
        OTHER = (
            "OTHER",
            "Other",
        )

    booking = models.ForeignKey(
        InterviewBooking,
        on_delete=models.CASCADE,
        related_name="issues",
    )

    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="raised_issues",
    )

    against_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="issues_against",
    )

    issue_type = models.CharField(
        max_length=100,
        choices=IssueType.choices,
    )

    description = models.TextField()

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.OPEN,
    )

    resolution = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)

    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resolved_issues",
    )

    resolved_at = models.DateTimeField(null=True, blank=True)

    # Deadline until which user is allowed to raise an issue
    issue_deadline = models.DateTimeField(null=True, blank=True)

    # Optional presence evidence (in minutes) from your session tracking
    candidate_presence_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    interviewer_presence_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # One active issue per (booking, raised_by) while status is in active set
            models.UniqueConstraint(
                fields=["booking", "raised_by"],
                condition=models.Q(
                    status__in=[
                        "OPEN",
                        "UNDER_REVIEW",
                        "WAITING_FOR_RESPONSE",
                        "ACTION_TAKEN",
                    ]
                ),
                name="unique_active_issue_per_user_per_booking",
            )
        ]

    def __str__(self) -> str:
        return f"Issue #{self.id} · Booking {self.booking_id} · {self.issue_type}"

    @property
    def is_active(self) -> bool:
        return self.status in {
            self.Status.OPEN,
            self.Status.UNDER_REVIEW,
            self.Status.WAITING_FOR_RESPONSE,
            self.Status.ACTION_TAKEN,
        }

    def mark_resolved(self, by_user, resolution_text: str = "") -> None:
        self.status = self.Status.RESOLVED
        self.resolution = resolution_text
        self.resolved_by = by_user
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "resolution", "resolved_by", "resolved_at", "updated_at"])

    def mark_rejected(self, by_user, notes: str = "") -> None:
        self.status = self.Status.REJECTED
        if notes:
            self.admin_notes = (self.admin_notes + "\n" if self.admin_notes else "") + notes
        self.resolved_by = by_user
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "admin_notes", "resolved_by", "resolved_at", "updated_at"])

    def save(self, *args, **kwargs):
        # Auto-assign priority for high-severity types on create
        if not self.pk:
            if self.issue_type in HIGH_PRIORITY_ISSUE_TYPES:
                # ABUSE / NO_SHOW, etc.
                self.priority = self.Priority.HIGH

            # Default issue_deadline if not provided
            if not self.issue_deadline and getattr(self.booking, "end_datetime", None):
                self.issue_deadline = self.booking.end_datetime + timedelta(
                    hours=ISSUE_RAISE_WINDOW_HOURS
                )

        super().save(*args, **kwargs)