from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime
from authentication.models import InterviewerStatus


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







User = get_user_model()


@shared_task
def lift_user_suspension(user_id: int) -> None:
    """
    Clear temporary suspension if the scheduled time has passed.
    Safe to run multiple times – it only unsuspends when the
    stored suspended_until <= now.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    now = timezone.now()

    if not user.is_suspended:
        return

    if user.suspended_until and user.suspended_until <= now:
        user.is_suspended = False
        user.suspended_until = None

        # For interviewers, restore ACTIVE if they were suspended
        if user.role == "interviewer" and user.interviewer_status == InterviewerStatus.SUSPENDED:
            user.interviewer_status = InterviewerStatus.ACTIVE

        user.save(update_fields=["is_suspended", "suspended_until", "interviewer_status"])