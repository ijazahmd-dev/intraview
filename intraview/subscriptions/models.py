from django.db import models
from django.conf import settings
from django.utils import timezone


# Create your models here.

class SubscriptionStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    EXPIRED = "EXPIRED", "Expired"
    CANCELLED = "CANCELLED", "Cancelled"


class SubscriptionPlan(models.Model):
    """
    Defines a subscription plan and its entitlements.
    Example: Free, Starter, Pro
    """

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    # Billing
    price_inr = models.PositiveIntegerField(
        help_text="Monthly price in INR. 0 = Free plan"
    )
    billing_cycle_days = models.PositiveIntegerField(
        default=30,
        help_text="Billing cycle length in days"
    )

    # Token entitlements
    monthly_free_tokens = models.PositiveIntegerField(
        default=0,
        help_text="Free tokens credited per billing cycle"
    )

    # AI + feature flags
    ai_interviews_per_month = models.IntegerField(
        default=0,
        help_text="0 = blocked, -1 = unlimited, N = N per month"
    )
    has_priority_booking = models.BooleanField(default=False)
    has_advanced_ai_feedback = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price_inr"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price_inr__gte=0),
                name="subscription_price_non_negative"
            ),
        ]

    def __str__(self):
        return f"{self.name} (₹{self.price_inr}/month)"




# class UserSubscriptionManager(models.manager):
#     def active(self):
#         return self.filter(status=SubscriptionStatus.ACTIVE, 
#         end_date__gt=timezone.now()
#         )



class UserSubscriptionManager(models.Manager):
    """Custom manager for UserSubscription queries."""
    
    def active_for_user(self, user):
        """Get active subscription for specific user."""
        return self.filter(
            user=user,
            status=SubscriptionStatus.ACTIVE,
            end_date__gt=timezone.now(),
        ).select_related("plan").first()
    
    def active_count_for_user(self, user):
        """Count active subscriptions for user (should be 0 or 1)."""
        return self.filter(
            user=user,
            status=SubscriptionStatus.ACTIVE,
        ).count()




class UserSubscription(models.Model):
    """
    Tracks a user's subscription.
    At most ONE active subscription per user.
    """
    objects = UserSubscriptionManager()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="user_subscriptions"
    )

    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE
    )

    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(
        help_text="When this subscription expires"
    )

    renewal_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Next auto-renewal date (Stripe-driven)"
    )

    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )
    monthly_ai_used = models.PositiveIntegerField(
        default=0,
        help_text="AI interviews used in current billing cycle"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    

    class Meta:
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["end_date"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(status=SubscriptionStatus.ACTIVE),
                name="one_active_subscription_per_user"
            )
        ]

    def is_active(self) -> bool:
        return (
            self.status == SubscriptionStatus.ACTIVE
            and self.end_date > timezone.now()
        )

    def __str__(self):
        return f"{self.user.email} → {self.plan.name} ({self.status})"
    




class SubscriptionTokenGrant(models.Model):
    """
    Tracks monthly token grants per subscription billing cycle.
    Ensures idempotency and auditability.
    """

    objects = models.Manager()  # Explicit manager (recommended)

    subscription = models.ForeignKey(
        "UserSubscription",
        on_delete=models.CASCADE,
        related_name="token_grants",
    )

    billing_period_start = models.DateTimeField()
    billing_period_end = models.DateTimeField()

    tokens_granted = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["subscription", "billing_period_start"],
                name="unique_token_grant_per_billing_cycle",
            )
        ]

    def __str__(self):
        return (
            f"SubscriptionGrant(sub={self.subscription_id}, "
            f"tokens={self.tokens_granted})"
        )