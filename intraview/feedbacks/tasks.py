
from datetime import timedelta

from celery import shared_task
from django.utils import timezone
from django.db.models import Q

from bookings.models import InterviewBooking
from notifications.constants import EventType
from notifications.models import NotificationLog






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

        # Determine who hasn't submitted yet
        candidate_pending = not hasattr(booking, 'interviewer_review') or booking.interviewer_review is None
        interviewer_pending = not hasattr(booking, 'candidate_evaluation') or booking.candidate_evaluation is None

        emit_event(
            EventType.FEEDBACK_PENDING,
            actor_id=None,
            payload={
                "booking_id": booking.id,
                "candidate_id": booking.candidate_id,
                "interviewer_id": booking.interviewer_id,
                "candidate_pending": candidate_pending,
                "interviewer_pending": interviewer_pending,
            },
            correlation_id=correlation_id,
        )




