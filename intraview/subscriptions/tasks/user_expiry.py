import logging
from celery import shared_task
from django.utils import timezone
from django.db import transaction

from subscriptions.models import (
    UserSubscription,
    SubscriptionStatus,
)

logger = logging.getLogger(__name__)



@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={"max_retries": 3, "countdown": 30})
def expire_user_subscriptions(self):
    """
    Expire user subscriptions whose end_date has passed.

    Side effects:
    - NONE (feature access is gated dynamically)
    """

    now = timezone.now()

    expired_qs = UserSubscription.objects.filter(
        status=SubscriptionStatus.ACTIVE,
        end_date__lt=now,
    )

    count = expired_qs.count()

    if count == 0:
        logger.info("User subscription expiry task: nothing to expire")
        return 0

    with transaction.atomic():
        expired_qs.update(status=SubscriptionStatus.EXPIRED)

    logger.info("User subscription expiry task: expired %s subscriptions", count)

    return count