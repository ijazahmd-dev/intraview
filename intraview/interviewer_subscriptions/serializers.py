
from django.utils import timezone

from rest_framework import serializers
from .models import InterviewerSubscription, InterviewerSubscriptionPlan, InterviewerSubscriptionStatus


class InterviewerSubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerSubscriptionPlan
        fields = [
            "id",
            "name",
            "slug",
            "price_inr",
            "billing_cycle_days",
            "is_active",
        ]





class InterviewerCurrentSubscriptionSerializer(serializers.Serializer):
    # Core
    has_subscription = serializers.BooleanField()
    status = serializers.CharField(allow_null=True)

    # Plan info
    plan = InterviewerSubscriptionPlanSerializer(allow_null=True)

    # Dates
    start_date = serializers.DateTimeField(allow_null=True)
    end_date = serializers.DateTimeField(allow_null=True)
    renewal_date = serializers.DateTimeField(allow_null=True)

    # Derived
    is_expired = serializers.BooleanField()
    days_remaining = serializers.IntegerField()

    @staticmethod
    def build(subscription: InterviewerSubscription | None):
        """
        Helper to return consistent JSON for frontend.
        """
        if not subscription:
            return {
                "has_subscription": False,
                "status": None,
                "plan": None,
                "start_date": None,
                "end_date": None,
                "renewal_date": None,
                "is_expired": True,
                "days_remaining": 0,
            }

        now = timezone.now()

        end_date = subscription.end_date
        days_remaining = max(0, (end_date.date() - now.date()).days)

        is_expired = (
            subscription.status != InterviewerSubscriptionStatus.ACTIVE
            or end_date <= now
        )

        return {
            "has_subscription": True,
            "status": subscription.status,
            "plan": InterviewerSubscriptionPlanSerializer(subscription.plan).data,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "renewal_date": subscription.renewal_date,
            "is_expired": is_expired,
            "days_remaining": days_remaining,
        }
    







################################################ADMIN API SERIALIZERS ####################################





class AdminInterviewerSubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerSubscriptionPlan
        fields = [
            "id",
            "name",
            "slug",
            "price_inr",
            "billing_cycle_days",
            "is_active",
            "created_at",
            "updated_at",
        ]





class AdminInterviewerSubscriptionSerializer(serializers.ModelSerializer):
    interviewer_email = serializers.EmailField(source="interviewer.email", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    plan_slug = serializers.CharField(source="plan.slug", read_only=True)

    class Meta:
        model = InterviewerSubscription
        fields = [
            "id",
            "interviewer",
            "interviewer_email",
            "plan",
            "plan_name",
            "plan_slug",
            "status",
            "start_date",
            "end_date",
            "renewal_date",
            "stripe_subscription_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "stripe_subscription_id",
            "created_at",
            "updated_at",
        ]
