from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_otp_task(self, email, otp):
    try:
        send_mail(
            subject="Your Intraview Verification OTP",
            message=f"Your OTP is: {otp}",
            from_email="intraview.website@gmail.com",
            recipient_list=[email],
        )
    except Exception as exc:
        logger.error(f"Failed to send OTP email to {email}: {exc}")
        raise self.retry(exc=exc)