from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from ..models import SubscriptionPlan, SubscriptionStatus, UserSubscription



class SubscriptionService:
    """
    Handles creation and updates of user subscriptions.
    Stripe-independent business logic.
    """

    @staticmethod
    @transaction.atomic
    def activate_subscription(
        *,
        user_id: int,
        plan_id: int,
        stripe_subscription_id: str,
    ) -> UserSubscription:
        # Lock existing subscriptions for user
        active_sub = (
            UserSubscription.objects
            .select_for_update()
            .filter(user_id=user_id, status=SubscriptionStatus.ACTIVE)
            .first()
        )

        # Cancel existing active subscription (if any)
        if active_sub:
            active_sub.status = SubscriptionStatus.CANCELLED
            active_sub.save(update_fields=["status", "updated_at"])

        plan = SubscriptionPlan.objects.get(id=plan_id)

        now = timezone.now()
        end_date = now + timedelta(days=plan.billing_cycle_days)

        subscription, created = UserSubscription.objects.update_or_create(
            stripe_subscription_id=stripe_subscription_id,
            defaults={
                "user_id": user_id,
                "plan": plan,
                "status": SubscriptionStatus.ACTIVE,
                "start_date": now,
                "end_date": end_date,
                "renewal_date": end_date,
            },
        )

        return subscription

