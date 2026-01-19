from django.db import models
from django.conf import settings
from django.utils import timezone
from payments.models import PaymentStatus

# Create your models here.


class InterviewerSubscriptionStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    EXPIRED = "EXPIRED", "Expired"
    CANCELLED = "CANCELLED", "Cancelled"




class InterviewerSubscriptionPlan(models.Model):
    """
    Subscription plan required for interviewers
    to go public and accept bookings.
    """

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    price_inr = models.PositiveIntegerField(
        help_text="Monthly price in INR"
    )

    billing_cycle_days = models.PositiveIntegerField(
        default=30,
        help_text="Billing cycle length in days"
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price_inr"]

    def __str__(self):
        return f"{self.name} ({self.slug}) – ₹{self.price_inr}/month"
    





class InterviewerSubscription(models.Model):
    """
    Represents an interviewer's active subscription.
    Required to go public and accept bookings.
    """

    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviewer_subscriptions",
    )

    plan = models.ForeignKey(
        InterviewerSubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )

    status = models.CharField(
        max_length=20,
        choices=InterviewerSubscriptionStatus.choices,
        default=InterviewerSubscriptionStatus.ACTIVE,
    )

    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()

    renewal_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Next renewal date (Stripe-driven)"
    )

    # Stripe reference (future use)
    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["interviewer", "status"]),
            models.Index(fields=["end_date"]),
            models.Index(fields=["stripe_subscription_id"]),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["interviewer"],
                condition=models.Q(status=InterviewerSubscriptionStatus.ACTIVE),
                name="one_active_interviewer_subscription",
            )
        ]

    def __str__(self):
        return (
            f"InterviewerSubscription("
            f"{self.interviewer_id}, {self.status})"
        )

    def is_active(self) -> bool:
        return (
            self.status == InterviewerSubscriptionStatus.ACTIVE
            and self.end_date > timezone.now()
        )





class InterviewerPaymentOrder(models.Model):
    """
    Tracks interviewer subscription payments (one-time + renewals).
    SEPARATE from user subscriptions for clean architecture.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviewer_payments"  # Different from user payments
    )
    subscription = models.ForeignKey(
        'InterviewerSubscription',  # Your interviewer subscription model
        on_delete=models.PROTECT,
        related_name="payment_orders",
        null=True,
        blank=True,
    )
    plan = models.ForeignKey(
        'InterviewerSubscriptionPlan',  # ✅ Correct plan type!
        on_delete=models.PROTECT,
    )
    
    amount_inr = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="INR")
    
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.CREATED
    )
    
    # Stripe identifiers
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_invoice_id = models.CharField(max_length=255, blank=True, null=True)
    
    internal_order_id = models.CharField(max_length=50, blank=True, unique=True)
    
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status", "-created_at"]),
            models.Index(fields=["internal_order_id"]),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(amount_inr__gt=0), name="interviewer_amount_positive"),
        ]
