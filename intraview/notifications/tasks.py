# notifications/tasks.py
from __future__ import annotations

from datetime import timedelta

from celery import shared_task
from django.utils import timezone
from django.db.models import Q

from bookings.models import InterviewBooking
from notifications.constants import EventType
from notifications.models import NotificationLog



REMINDER_WINDOW_MINUTES = 30
REMINDER_TOLERANCE_MINUTES = 2  # +/- 2 minutes window


@shared_task
def send_interview_start_reminders() -> None:
    """
    Periodic task: run every 5 minutes.
    For each upcoming CONFIRMED interview that starts in ~30 minutes
    and hasn't already received a 30m reminder, emit an INTERVIEW_REMINDER_30M event.
    """
    from notifications.events import emit_event
    now = timezone.now()

    target_time = now + timedelta(minutes=REMINDER_WINDOW_MINUTES)
    window_start = target_time - timedelta(minutes=REMINDER_TOLERANCE_MINUTES)
    window_end = target_time + timedelta(minutes=REMINDER_TOLERANCE_MINUTES)

    # Adapt this filter to your actual field names
    # Assuming InterviewBooking has: start_datetime, status, candidate, interviewer
    upcoming_bookings = InterviewBooking.objects.filter(
        status__in=[InterviewBooking.Status.CONFIRMED],  # adjust enum/choices if different
        start_datetime__gte=window_start,
        start_datetime__lte=window_end,
    )

    for booking in upcoming_bookings:
        correlation_id = f"booking:{booking.id}:reminder:30m"

        # Idempotency: skip if we already have a log for this event+booking
        already_notified = NotificationLog.objects.filter(
            event_type=EventType.INTERVIEW_REMINDER_30M.value,
            correlation_id=correlation_id,
        ).exists()

        if already_notified:
            continue

        emit_event(
            EventType.INTERVIEW_REMINDER_30M,
            actor_id=None,
            payload={
                "booking_id": booking.id,
                "candidate_id": booking.candidate_id,
                "interviewer_id": booking.interviewer_id,
                "start_time": booking.start_datetime.isoformat()
            },
            correlation_id=correlation_id,
        )





@shared_task
def send_feedback_reminders() -> None:
    from notifications.events import emit_event
    """
    Example pattern (you can refine window/conditions):
    - Interviews COMPLETED
    - No feedback yet
    - Ended between 2 and 24 hours ago
    - No FEEDBACK_PENDING notification already logged
    """
    from notifications.events import emit_event
    now = timezone.now()
    min_age = now - timedelta(hours=24)
    max_age = now - timedelta(hours=2)

    qs = InterviewBooking.objects.filter(
        status=InterviewBooking.Status.COMPLETED,
        end_datetime__gte=min_age,
        end_datetime__lte=max_age,
    ).filter(
        Q(candidate_evaluation__isnull=True) | Q(interviewer_review__isnull=True)
    )

    for booking in qs:
        correlation_id = f"booking:{booking.id}:feedback"

        already_notified = NotificationLog.objects.filter(
            event_type=EventType.FEEDBACK_PENDING.value,
            correlation_id=correlation_id,
        ).exists()

        if already_notified:
            continue

        emit_event(
            EventType.FEEDBACK_PENDING,
            actor_id=None,
            payload={
                "booking_id": booking.id,
                "candidate_id": booking.candidate_id,
                "interviewer_id": booking.interviewer_id,
            },
            correlation_id=correlation_id,
        )







@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_notification_via_novu(self, log_id: int) -> None:
    from notifications.service import NotificationService
    """
    Background job: take a NotificationLog and send it to Novu.

    - Reads the log + recipient
    - Builds payload
    - Looks up workflow id
    - Calls Novu
    - Updates log.status accordingly
    """
    try:
        log = (
            NotificationLog.objects
            .select_related("recipient")
            .get(id=log_id)
        )
    except NotificationLog.DoesNotExist:
        # Nothing to do
        return

    # If it's already sent, skip (idempotency for retried jobs)
    from notifications.constants import NotificationStatus

    if log.status == NotificationStatus.SENT.value:
        return

    workflow_id = NotificationService._get_workflow_id_for_event(log.event_type)
    if not workflow_id:
        # We don't have a Novu workflow for this event type → just keep the log
        return

    user = log.recipient
    subscriber_email = getattr(user, "email", None)
    subscriber_first_name = (
        getattr(user, "first_name", None) or getattr(user, "username", None)
    )

    novu_client = NotificationService._get_novu_client()

    novu_payload = {
        "event_type": log.event_type,
        "correlation_id": log.correlation_id,
        **(log.payload or {}),
    }

    try:
        novu_client.trigger_workflow(
            workflow_id=workflow_id,
            subscriber_id=log.recipient_id,
            payload=novu_payload,
            subscriber_email=subscriber_email,
            subscriber_first_name=subscriber_first_name,
        )
        log.mark_sent(provider="novu", provider_ref="")
    except Exception as exc:
        # mark as failed for now, but let Celery retry
        log.mark_failed(error_message=str(exc)[:500])
        raise self.retry(exc=exc)