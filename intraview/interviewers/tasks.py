from celery import shared_task
from django.core.mail import send_mail
import logging

from .emails import (
    application_submitted_email,
    application_approved_email,
    application_rejected_email,
)

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_submitted_email(self, user_email, username):
    try:
        subject, message = application_submitted_email(
            type("User", (), {"email": user_email, "username": username})
        )

        send_mail(
            subject=subject,
            message=message,
            from_email="intraview.website@gmail.com",
            recipient_list=[user_email],
        )
    except Exception as exc:
        logger.error(f"Failed to send submission email to {user_email}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_approved_email(self, user_email, username):
    try:
        subject, message = application_approved_email(
            type("User", (), {"email": user_email, "username": username})
        )

        send_mail(
            subject=subject,
            message=message,
            from_email="intraview.website@gmail.com",
            recipient_list=[user_email],
        )
    except Exception as exc:
        logger.error(f"Failed to send approval email to {user_email}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_rejected_email(self, user_email, username, reason=None):
    try:
        subject, message = application_rejected_email(
            type("User", (), {"email": user_email, "username": username}),
            reason=reason,
        )

        send_mail(
            subject=subject,
            message=message,
            from_email="intraview.website@gmail.com",
            recipient_list=[user_email],
        )
    except Exception as exc:
        logger.error(f"Failed to send rejection email to {user_email}: {exc}")
        raise self.retry(exc=exc)
