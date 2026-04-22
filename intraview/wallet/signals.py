# wallet/signals.py







from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import TokenWallet
from feedbacks.signals import evaluation_created
from wallet.services import TokenService
from wallet.models import TokenTransactionType, TokenTransaction


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_token_wallet(sender, instance, created, **kwargs):
    if created:
        TokenWallet.objects.get_or_create(user=instance)



@receiver(evaluation_created)
def handle_evaluation_created(sender, booking, evaluation, **kwargs):
    """
    Pay the interviewer as soon as they submit their CandidateEvaluation,
    provided the booking is in AWAITING_EVALUATION state and the deadline
    has not expired.
 
    This is Step 2a of the payment flow:
      - Session ends → settle_session_payment() sets AWAITING_EVALUATION
      - Interviewer submits evaluation → this signal fires
      - settle_after_evaluation() transfers locked tokens to the interviewer
 
    If the evaluation is submitted after the deadline (race condition),
    settle_after_evaluation() will refund the candidate instead.
 
    If the booking is in any other payment_status (e.g. already refunded
    because the interviewer didn't meet minimum presence), the call is a
    no-op — settle_after_evaluation() guards against that internally.
    """
    from realtime.services.session_payment_service import SessionPaymentService
 
    try:
        SessionPaymentService.settle_after_evaluation(booking=booking)
    except Exception as e:
        # Log but do not crash the evaluation submission flow.
        # The Celery cleanup job will catch this booking on the next run
        # via refund_expired_deadlines() if it stays in AWAITING_EVALUATION.
        import logging
        logger = logging.getLogger(__name__)
        logger.error(
            f"settle_after_evaluation failed for booking {booking.id}: {e}",
            exc_info=True,
        )