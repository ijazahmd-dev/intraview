from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_otp_task(self, email, otp):
  subject = "Your Intraview verification code"

  message = (
      "Hi,\n\n"
      "Thank you for using Intraview.\n\n"
      f"Your One-Time Password (OTP) for verification is:\n\n"
      f"    {otp}\n\n"
      "This code is valid for the next 10 minutes. "
      "Please do not share this code with anyone.\n\n"
      "If you did not request this code, you can safely ignore this email.\n\n"
      "Best regards,\n"
      "The Intraview Team"
  )

  try:
      send_mail(
          subject=subject,
          message=message,
          from_email="intraview.website@gmail.com",
          recipient_list=[email],
          fail_silently=False,
      )
  except Exception as exc:
      logger.error(f"Failed to send OTP email to {email}: {exc}")
      raise self.retry(exc=exc)
