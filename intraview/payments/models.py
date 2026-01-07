from django.db import models
from django.conf import settings

# Create your models here.

class TokenPack(models.Model):
    """
    Defines purchasable token bundles.
    Example: ₹400 → 50 tokens
    """

    name = models.CharField(max_length=100)
    price_inr = models.PositiveIntegerField(help_text="Price in INR")
    tokens = models.PositiveIntegerField(help_text="Tokens credited")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price_inr"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price_inr__gt=0),
                name="price_positive"
            ),
            models.CheckConstraint(
                check=models.Q(tokens__gt=0),
                name="tokens_positive"
            ),
        ]

    def __str__(self):
        return f"{self.name}: ₹{self.price_inr} = {self.tokens} tokens"


class PaymentStatus(models.TextChoices):
    CREATED = "CREATED", "Created"
    PENDING = "PENDING", "Pending"
    SUCCEEDED = "SUCCEEDED", "Succeeded"
    FAILED = "FAILED", "Failed"
    CANCELLED = "CANCELLED", "Cancelled"
    EXPIRED = "EXPIRED", "Expired"


class PaymentOrder(models.Model):
    """
    Tracks a single real-money payment attempt for token purchase.
    This is the financial source of truth.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_orders"
    )

    token_pack = models.ForeignKey(
        TokenPack,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    amount_inr = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="INR")

    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.CREATED
    )

    # Stripe identifiers
    stripe_checkout_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )

    # Frontend-safe identifier
    internal_order_id = models.CharField(
        max_length=50,
        blank=True,
        unique=True,
        help_text="Stable internal ID for frontend tracking"
    )

    # Optional extensibility
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["stripe_checkout_session_id"]),
            models.Index(fields=["internal_order_id"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(amount_inr__gt=0),
                name="amount_positive"
            ),
        ]

    def __str__(self):
        return (
            f"#{self.pk} | {self.status} | "
            f"{self.user.email[:20]}... | ₹{self.amount_inr}"
        )

    def can_process_webhook(self) -> bool:
        """
        Webhook should only process orders that have not
        already been finalized.
        """
        return self.status in {
            PaymentStatus.CREATED,
            PaymentStatus.PENDING,
        }




