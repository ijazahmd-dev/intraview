#  /subscriptions/tasks/user_expiry.py


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
    - Resets AI interview quota on the associated CandidateProfile.
    """
    from ai_interviews.service.quota_service import AIInterviewSubscriptionSync

    now = timezone.now()

    expired_qs = UserSubscription.objects.filter(
        status=SubscriptionStatus.ACTIVE,
        end_date__lt=now,
    ).select_related("user")

    count = 0

    for subscription in expired_qs:
        with transaction.atomic():
            subscription.status = SubscriptionStatus.EXPIRED
            subscription.save(update_fields=["status", "updated_at"])

            # Reset AI quota on the candidate profile
            AIInterviewSubscriptionSync.on_subscription_expired(user=subscription.user)

        count += 1

    if count == 0:
        logger.info("User subscription expiry task: nothing to expire")
    else:
        logger.info("User subscription expiry task: expired %s subscriptions", count)

    return count