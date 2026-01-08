from django.utils import timezone
from interviewer_subscriptions.models import (
    InterviewerSubscription,
    InterviewerSubscriptionStatus,
)


class InterviewerEntitlementService:
    """
    Centralized entitlement checks for interviewers.
    """

    @staticmethod
    def get_active_subscription(interviewer):
        return (
            InterviewerSubscription.objects
            .filter(
                interviewer=interviewer,
                status=InterviewerSubscriptionStatus.ACTIVE,
                end_date__gt=timezone.now(),
            )
            .first()
        )

    @staticmethod
    def has_active_subscription(interviewer) -> bool:
        return bool(
            InterviewerEntitlementService.get_active_subscription(interviewer)
        )

