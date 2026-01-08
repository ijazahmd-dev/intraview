import logging
from celery import shared_task
from django.utils import timezone
from django.db import transaction

from interviewer_subscriptions.models import (
    InterviewerSubscription,
    InterviewerSubscriptionStatus,
)
from interviewers.models import InterviewerProfile
logger = logging.getLogger(__name__)








def expire_interviewer_subscriptions(self):
    """
    Expire interviewer subscriptions whose end_date has passed
    and enforce platform side effects.

    Side effects:
    - Disable accepting bookings
    - Make profile non-public
    """

    now = timezone.now()

    expired_qs = InterviewerSubscription.objects.select_related(
        "interviewer"
    ).filter(
        status=InterviewerSubscriptionStatus.ACTIVE,
        end_date__lt=now,
    )

    count = expired_qs.count()

    if count == 0:
        logger.info("Interviewer expiry task: nothing to expire")
        return 0

    with transaction.atomic():
        for subscription in expired_qs:
            interviewer = subscription.interviewer

            # 1️⃣ Expire subscription
            subscription.status = InterviewerSubscriptionStatus.EXPIRED
            subscription.save(update_fields=["status"])

            # 2️⃣ Enforce profile side effects (if profile exists)
            try:
                profile = InterviewerProfile.objects.select_for_update().get(
                    user=interviewer
                )
                profile.is_accepting_bookings = False
                profile.is_profile_public = False
                profile.save(
                    update_fields=[
                        "is_accepting_bookings",
                        "is_profile_public",
                    ]
                )
            except InterviewerProfile.DoesNotExist:
                # Profile might not exist yet — safe to skip
                logger.warning(
                    "Interviewer profile not found during expiry | interviewer_id=%s",
                    interviewer.id,
                )

    logger.info(
        "Interviewer expiry task: expired %s subscriptions and enforced side effects",
        count,
    )

    return count


