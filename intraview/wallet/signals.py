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
    Unlock interviewer tokens when evaluation submitted.

    Uses ledger check to prevent duplicate payments.
    """

    interviewer = booking.interviewer
    wallet = interviewer.token_wallet

    # ✅ Prevent duplicate payout
    already_paid = TokenTransaction.objects.filter(
        wallet=wallet,
        reference_id=str(booking.id),
        transaction_type=TokenTransactionType.SESSION_EARN
    ).exists()

    if already_paid:
        return

    # ✅ Credit interviewer using your TokenService
    TokenService.credit_tokens(
        wallet=wallet,
        amount=booking.token_cost,   # correct field
        transaction_type=TokenTransactionType.SESSION_EARN,
        reference_id=str(booking.id),
        note="Tokens earned after interview evaluation submission"
    )
