from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from subscriptions.models import SubscriptionTokenGrant, UserSubscription

from wallet.services import TokenService
from wallet.models import TokenTransactionType




class SubscriptionTokenGrantService:
    """
    Grants monthly free tokens for active subscriptions.
    Idempotent and billing-cycle aware.
    """

    @staticmethod
    @transaction.atomic
    def grant_monthly_tokens(*, subscription: UserSubscription):
        plan = subscription.plan
        tokens = plan.monthly_free_tokens

        if tokens <= 0:
            return

        now = timezone.now()

        # 🔑 Calculate CURRENT billing cycle correctly
        cycle_start = max(
            subscription.start_date,
            subscription.renewal_date - timedelta(days=plan.billing_cycle_days)
        )
        cycle_end = cycle_start + timedelta(days=plan.billing_cycle_days)

        # 🛑 Idempotency check
        if SubscriptionTokenGrant.objects.filter(
            subscription=subscription,
            billing_period_start=cycle_start,
        ).exists():
            return

        # 💳 Credit wallet
        wallet = TokenService.get_or_create_wallet(subscription.user)
        TokenService.credit_tokens(
            wallet=wallet,
            amount=tokens,
            transaction_type=TokenTransactionType.SUBSCRIPTION_GRANT,
            reference_id=f"subscription_{subscription.id}_{cycle_start.date()}",
            note=f"{plan.name} monthly token grant",
        )

        # 🧾 Record grant
        SubscriptionTokenGrant.objects.create(
            subscription=subscription,
            billing_period_start=cycle_start,
            billing_period_end=cycle_end,
            tokens_granted=tokens,
        )


