from django.db import models
from django.conf import settings
# Create your models here.





class TokenTransactionType(models.TextChoices):
    TOKEN_PURCHASE = "TOKEN_PURCHASE", "Token Purchase"
    BOOKING_LOCK = "BOOKING_LOCK", "Booking Token Lock"
    BOOKING_RELEASE = "BOOKING_RELEASE", "Booking Token Release"
    SESSION_SPEND = "SESSION_SPEND", "Session Spent Tokens"
    SESSION_EARN = "SESSION_EARN", "Session Earned Tokens"
    REFUND = "REFUND", "Token Refund"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT", "Admin Adjustment"
    SUBSCRIPTION_GRANT = "SUBSCRIPTION_GRANT", "Subscription Grant"
    BOOKING_CANCEL_INTERVIEWER = "BOOKING_CANCEL_INTERVIEWER", "Booking Cancel Interviewer"





class TokenWallet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="token_wallet"
    )

    balance = models.PositiveIntegerField(default=0)
    locked_balance = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:

        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0),
                name='balance_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(locked_balance__gte=0),
                name='locked_balance_non_negative'
            ),
        ]

        verbose_name = "Token Wallet"
        verbose_name_plural = "Token Wallets"

    def __str__(self):
        return f"Wallet(user={self.user_id}, balance={self.balance}, locked={self.locked_balance})"






class TokenTransaction(models.Model):
    wallet = models.ForeignKey(
        TokenWallet,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    transaction_type = models.CharField(
        max_length=50,
        choices=TokenTransactionType.choices
    )

    amount = models.IntegerField(
        help_text="Positive or negative token amount depending on transaction"
    )

    balance_after = models.PositiveIntegerField(
        help_text="Wallet balance AFTER this transaction"
    )

    locked_balance_after = models.PositiveIntegerField(
        help_text="Locked balance AFTER this transaction"
    )

    reference_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="External reference (booking_id, payment_id, etc.)"
    )

    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["wallet", "created_at"]),
            models.Index(fields=["transaction_type", "created_at"]),
            models.Index(fields=["reference_id"]),
        ]

    def __str__(self):
        return (
            f"Transaction(wallet={self.wallet_id}, "
            f"type={self.transaction_type}, amount={self.amount})"
        )





