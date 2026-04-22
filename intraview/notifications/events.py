# notifications/events.py
from typing import Any, Dict, Optional

from .constants import EventType
from .service import NotificationService


def emit_event(
    event_type: EventType | str,
    *,
    actor_id: Optional[int] = None,
    payload: Optional[Dict[str, Any]] = None,
    correlation_id: Optional[str] = None,
) -> None:
    """
    Primary entry point from your domain code.

    Example:
        emit_event(
            EventType.INTERVIEW_BOOKED,
            actor_id=user.id,
            payload={"booking_id": booking.id, "candidate_id": ..., ...},
            correlation_id=f"booking:{booking.id}",
        )
    """
    if isinstance(event_type, EventType):
        event_type_value = event_type.value
    else:
        event_type_value = str(event_type)

    NotificationService.handle_event(
        event_type=event_type_value,
        actor_id=actor_id,
        payload=payload or {},
        correlation_id=correlation_id or "",
    )