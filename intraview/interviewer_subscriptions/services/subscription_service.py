from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from interviewer_subscriptions.models import (
    InterviewerSubscription,
    InterviewerSubscriptionPlan,
    InterviewerSubscriptionStatus,
)
from django.contrib.auth import get_user_model




User = get_user_model()


class InterviewerSubscriptionService:
    @staticmethod
    @transaction.atomic
    def activate_subscription(
        *,
        interviewer_id: int,
        plan_id: int,
        stripe_subscription_id: str,
    ) -> InterviewerSubscription:
        interviewer = User.objects.select_for_update().get(id=interviewer_id)
        plan = InterviewerSubscriptionPlan.objects.get(id=plan_id)

        # Idempotency: already activated
        existing = InterviewerSubscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        if existing:
            return existing

        # Expire any active subscription (safety)
        InterviewerSubscription.objects.filter(
            interviewer=interviewer,
            status=InterviewerSubscriptionStatus.ACTIVE,
        ).update(
            status=InterviewerSubscriptionStatus.EXPIRED,
            end_date=timezone.now(),
        )

        start_date = timezone.now()
        end_date = start_date + timedelta(days=plan.billing_cycle_days)

        subscription = InterviewerSubscription.objects.create(
            interviewer=interviewer,
            plan=plan,
            status=InterviewerSubscriptionStatus.ACTIVE,
            start_date=start_date,
            end_date=end_date,
            stripe_subscription_id=stripe_subscription_id,
        )

        return subscription
    

