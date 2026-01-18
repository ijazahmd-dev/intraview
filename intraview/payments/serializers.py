from rest_framework import serializers
import django_filters

from .models import TokenPack,PaymentOrder, PaymentStatus
from subscriptions.models import SubscriptionPlan
from interviewer_subscriptions.models import InterviewerSubscriptionPlan



class TokenPackListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenPack
        fields = [
            "id",
            "name",
            "price_inr",
            "tokens",
            "is_active",
        ]




class PaymentOrderSerializer(serializers.ModelSerializer):
    token_pack = TokenPackListSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = PaymentOrder
        fields = [
            'id', 'internal_order_id', 'amount_inr', 'currency', 'status',
            'created_at', 'updated_at', 'token_pack', 'user_email'
        ]



class CreatePaymentSerializer(serializers.Serializer):
    token_pack_id = serializers.IntegerField(min_value=1)

    def validate_token_pack_id(self, value):
        try:
            token_pack = TokenPack.objects.get(id=value, is_active=True)
        except TokenPack.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive token pack.")

        if token_pack.price_inr <= 0:
            raise serializers.ValidationError("Invalid token pack pricing.")

        return token_pack
    





class SubscriptionCheckoutSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)

    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(
                id=value,
                is_active=True,
            )
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid or inactive subscription plan."
            )

        if plan.price_inr <= 0:
            raise serializers.ValidationError(
                "Free plans do not require checkout."
            )

        return plan

    



class InterviewerSubscriptionCheckoutSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)

    def validate_plan_id(self, value):
        try:
            plan = InterviewerSubscriptionPlan.objects.get(
                id=value,
                is_active=True,
            )
        except InterviewerSubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid or inactive interviewer subscription plan."
            )

        return plan







#########################################################  Admin Serializers  ################################################
    


class AdminTokenPackSerializer(serializers.ModelSerializer):
    """
    Admin serializer for managing token packs.
    Create + Update only (no delete).
    """

    class Meta:
        model = TokenPack
        fields = [
            "id",
            "name",
            "price_inr",
            "tokens",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_price_inr(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than ₹0.")
        if value > 100000:
            raise serializers.ValidationError("Price too high.")
        return value

    def validate_tokens(self, value):
        if value <= 0:
            raise serializers.ValidationError("Tokens must be greater than 0.")
        if value > 10000:
            raise serializers.ValidationError("Too many tokens per pack.")
        return value


class TokenPackFilter(django_filters.FilterSet):
    """
    Admin filters for token packs.
    """

    min_price = django_filters.NumberFilter(
        field_name="price_inr", lookup_expr="gte"
    )
    max_price = django_filters.NumberFilter(
        field_name="price_inr", lookup_expr="lte"
    )

    class Meta:
        model = TokenPack
        fields = ["is_active", "min_price", "max_price"]
            





class AdminPaymentOrderSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for admin payment order inspection.
    """

    user_email = serializers.EmailField(source="user.email", read_only=True)
    token_pack_name = serializers.CharField(source="token_pack.name", read_only=True)
    token_pack_tokens = serializers.IntegerField(
        source="token_pack.tokens", read_only=True
    )

    revenue_inr = serializers.SerializerMethodField()

    class Meta:
        model = PaymentOrder
        fields = [
            "id",
            "internal_order_id",
            "user_email",
            "token_pack_name",
            "token_pack_tokens",
            "amount_inr",
            "revenue_inr",
            "currency",
            "status",
            "stripe_checkout_session_id",
            "stripe_payment_intent_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_revenue_inr(self, obj):
        """
        Revenue is counted only for successful payments.
        """
        if obj.status == PaymentStatus.SUCCEEDED:
            return obj.amount_inr
        return 0
    




class PaymentOrderFilter(django_filters.FilterSet):
    date_from = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    date_to = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    user_email = django_filters.CharFilter(
        field_name="user__email", lookup_expr="icontains"
    )

    class Meta:
        model = PaymentOrder
        fields = [
            "status",
            "currency",
            "token_pack",
            "user_email",
            "date_from",
            "date_to",
        ]
