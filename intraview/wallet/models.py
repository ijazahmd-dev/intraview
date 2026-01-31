from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import uuid
from django.db.models import Q
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

    PAYOUT_LOCK = "PAYOUT_LOCK", "Payout Token Lock"
    PAYOUT_DEBIT = "PAYOUT_DEBIT", "Payout Debit"
    PAYOUT_UNLOCK = "PAYOUT_UNLOCK", "Payout Token Unlock"





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








class PayoutRequestStatus(models.TextChoices):
    REQUESTED = "REQUESTED", "Pending Review"
    APPROVED = "APPROVED", "Ready to Pay"
    PAID = "PAID", "Completed"
    REJECTED = "REJECTED", "Rejected"


class PayoutRequest(models.Model):
    """
    Single, lean model for payout requests.
    Interviewer requests payout → Admin approves/rejects/marks paid.
    
    CRITICAL: All money fields are snapshots (immutable after creation).
    """
    
    # Core relationships
    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payout_requests"
    )
    
    # Reference number (SAFE - UUID-based, no race conditions)
    reference_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        editable=False,
        default=None  # Set in save()
    )
    
    # Amount snapshot (locked at request time - IMMUTABLE)
    tokens_requested = models.PositiveIntegerField(
        help_text="Number of tokens to payout (min 50)"
    )
    amount_inr = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False,
        help_text="Total amount in INR (calculated at request time)"
    )
    token_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        editable=False,
        help_text="Rate per token at time of request (LOCKED)"
    )
    
    # Bank details (immutable after creation)
    bank_account_number = models.CharField(
        max_length=50,
        validators=[
            RegexValidator(
                regex=r'^\d{9,18}$',
                message='Account must be 9-18 digits'
            )
        ],
        help_text="Bank account number (immutable)"
    )
    ifsc_code = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{4}0[A-Z0-9]{6}$',
                message='Invalid IFSC format (e.g., SBIN0001234)'
            )
        ]
    )
    account_holder_name = models.CharField(
        max_length=100,
        help_text="Name as per bank account"
    )
    mobile_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^[6-9]\d{9}$',
                message='Invalid 10-digit mobile number'
            )
        ]
    )
    
    # ✅ NEW: Verification snapshot (audit trail)
    verification_id_snapshot = models.CharField(
        max_length=100,
        blank=True,
        help_text="Verification ID at time of request"
    )
    verification_status_snapshot = models.CharField(
        max_length=50,
        blank=True,
        help_text="Verification status at time of request"
    )
    
    # ✅ NEW: Token locking (prevents overspending)
    tokens_locked = models.BooleanField(
        default=False,
        help_text="Whether tokens are locked in wallet"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=PayoutRequestStatus.choices,
        default=PayoutRequestStatus.REQUESTED,
        db_index=True
    )
    
    # Admin tracking
    admin_notes = models.TextField(
        blank=True,
        help_text="Admin comments during approval/rejection"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason for rejection"
    )
    
    # ✅ NEW: Admin actor tracking
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_payouts",
        help_text="Admin who processed this payout"
    )
    
    # Timestamps
    requested_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        editable=False
    )
    
    class Meta:
        ordering = ["-requested_at"]
        indexes = [
            models.Index(fields=["interviewer", "status"]),
            models.Index(fields=["status", "-requested_at"]),
            models.Index(fields=["reference_number"]),
            models.Index(fields=["processed_by"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(tokens_requested__gte=50),
                name='min_50_tokens'
            ),
            models.CheckConstraint(
                check=models.Q(amount_inr__gt=0),
                name='amount_positive'
            ),
            models.UniqueConstraint(
            fields=['interviewer'],
            condition=Q(status__in=[PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED]),
            name='unique_active_payout_per_interviewer'
        ),
        ]
    
    def save(self, *args, **kwargs):
        """
        Generate reference number if not set.
        Prevent updates to immutable fields.
        """
        
        # Generate reference number on first save only
        if not self.reference_number:
            from django.utils import timezone
            prefix = getattr(settings, 'PAYOUT_REFERENCE_PREFIX', 'PAY')
            year = timezone.now().year
            
            # UUID-based (safe for concurrency)
            unique_id = uuid.uuid4().hex[:8].upper()
            self.reference_number = f"{prefix}-{year}-{unique_id}"
        
        # Prevent updates to immutable fields
        if self.pk:
            original = PayoutRequest.objects.get(pk=self.pk)
            
            immutable_fields = [
                'bank_account_number',
                'ifsc_code',
                'account_holder_name',
                'mobile_number',
                'amount_inr',
                'token_rate_snapshot',
                'tokens_requested',
            ]
            
            for field in immutable_fields:
                if getattr(self, field) != getattr(original, field):
                    raise ValidationError(
                        f"Field '{field}' cannot be modified after creation"
                    )
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference_number} - {self.interviewer.username} - {self.status}"
    
    @property
    def masked_account(self):
        """Show only last 4 digits for security"""
        return f"****{self.bank_account_number[-4:]}"
    
    @property
    def is_pending(self):
        """Check if payout is still pending"""
        return self.status in [
            PayoutRequestStatus.REQUESTED,
            PayoutRequestStatus.APPROVED
        ]
    
    @property
    def can_be_rejected(self):
        """Only REQUESTED and APPROVED can be rejected"""
        return self.status in [
            PayoutRequestStatus.REQUESTED,
            PayoutRequestStatus.APPROVED
        ]

