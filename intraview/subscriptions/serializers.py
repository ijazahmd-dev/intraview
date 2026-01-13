from rest_framework import serializers
from .models import SubscriptionPlan



class UserSubscriptionSerializer(serializers.Serializer):
    # Core
    has_subscription = serializers.BooleanField()
    plan_name = serializers.CharField()
    price_inr = serializers.IntegerField()
    status = serializers.CharField()

    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    renewal_date = serializers.DateTimeField(allow_null=True)

    # Derived flags
    is_expired = serializers.BooleanField()
    days_remaining = serializers.IntegerField()

    # Entitlements
    monthly_free_tokens = serializers.IntegerField()
    ai_interviews_per_month = serializers.IntegerField()
    has_priority_booking = serializers.BooleanField()
    has_advanced_ai_feedback = serializers.BooleanField()






class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "description",
            "price_inr",
            "billing_cycle_days",
            "monthly_free_tokens",
            "ai_interviews_per_month",
            "has_priority_booking",
            "has_advanced_ai_feedback",
            "is_active",
        ]
        read_only_fields = fields
