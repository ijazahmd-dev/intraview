from typing import Optional
from django.utils import timezone

from subscriptions.models import (
    UserSubscription,
    SubscriptionStatus
)


class SubscriptionEntitlementService:
    """
    Single source of truth for subscription-based feature gating.
    """

    # -------------------------
    # Core subscription access
    # -------------------------

    @staticmethod
    def get_active_subscription(user) -> Optional[UserSubscription]:
        """
        Returns the user's active subscription, or None.
        """
        return (
            UserSubscription.objects
            .filter(
                user=user,
                status=SubscriptionStatus.ACTIVE,
                end_date__gt=timezone.now(),
            )
            .select_related("plan")
            .first()
        )

    # -------------------------
    # Plan-level helpers
    # -------------------------

    @staticmethod
    def has_subscription(user) -> bool:
        return bool(
            SubscriptionEntitlementService.get_active_subscription(user)
        )

    @staticmethod
    def plan_name(user) -> str:
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        return sub.plan.name if sub else "Free"

    @staticmethod
    def is_pro(user) -> bool:
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        return bool(sub and sub.plan.slug == "pro")

    @staticmethod
    def is_starter(user) -> bool:
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        return bool(sub and sub.plan.slug == "starter")

    # -------------------------
    # Feature gating
    # -------------------------

    @staticmethod
    def has_priority_booking(user) -> bool:
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        return bool(sub and getattr(sub.plan, "has_priority_booking", False))

    @staticmethod
    def has_advanced_ai_feedback(user) -> bool:
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        return bool(sub and getattr(sub.plan, "has_advanced_ai_feedback", False))

    # -------------------------
    # AI interview limits
    # -------------------------

    @staticmethod
    def ai_interviews_limit(user) -> int:
        """
        Returns:
        - 0  → Not allowed
        - -1 → Unlimited
        - N  → N per month
        """
        sub = SubscriptionEntitlementService.get_active_subscription(user)
        if not sub:
            return 0
        return sub.plan.ai_interviews_per_month or 0

    @staticmethod
    def can_use_ai_interview(user, used_this_month: int) -> bool:
        limit = SubscriptionEntitlementService.ai_interviews_limit(user)
        return limit == -1 or used_this_month < limit