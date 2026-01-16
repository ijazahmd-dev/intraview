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






####################################################ADMIN API SERIALIZERS ####################################



class AdminSubscriptionPlanSerializer(serializers.ModelSerializer):
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
            "created_at",
            "updated_at",
        ]

    def validate_price_inr(self, value):
        if value < 0:
            raise serializers.ValidationError("price_inr must be >= 0")
        return value

    def validate_billing_cycle_days(self, value):
        if value <= 0:
            raise serializers.ValidationError("billing_cycle_days must be > 0")
        return value