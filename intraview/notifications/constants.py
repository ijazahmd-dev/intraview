# notifications/constants.py
from enum import Enum


class EventType(str, Enum):
    INTERVIEW_BOOKED = "INTERVIEW_BOOKED"
    INTERVIEW_RESCHEDULED = "INTERVIEW_RESCHEDULED"
    INTERVIEW_CANCELLED = "INTERVIEW_CANCELLED"
    INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED"

    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    PAYOUT_FAILED = "PAYOUT_FAILED"

    FEEDBACK_PENDING = "FEEDBACK_PENDING"
    FEEDBACK_SUBMITTED = "FEEDBACK_SUBMITTED"

    INTERVIEW_REMINDER_30M = "INTERVIEW_REMINDER_30M"

    RESCHEDULE_SLOT_REQUESTED = "RESCHEDULE_SLOT_REQUESTED"


class NotificationChannel(str, Enum):
    IN_APP = "IN_APP"      # purely internal, later can map to Novu in-app
    EMAIL = "EMAIL"
    PUSH = "PUSH"
    SMS = "SMS"


class NotificationStatus(str, Enum):
    PENDING = "PENDING"      # created but not yet sent to provider
    SENT = "SENT"            # provider accepted
    FAILED = "FAILED"        # provider rejected / error
    SKIPPED = "SKIPPED"      # intentionally not sent (e.g., user opted out)