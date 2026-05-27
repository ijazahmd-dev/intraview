# admin_dashboard/serializers.py
"""
Read-only serializers for Admin Dashboard API responses.
These serialize plain dicts returned by the service layer.
No ModelSerializers — all data is aggregated, not CRUD.
"""

from rest_framework import serializers


# ════════════════════════════════════════════════════════════════
# 1. KPI OVERVIEW
# ════════════════════════════════════════════════════════════════

class OverviewSerializer(serializers.Serializer):
    """Top-level KPI cards for the admin dashboard homepage."""

    # User KPIs
    total_users = serializers.IntegerField()
    total_candidates = serializers.IntegerField()
    total_interviewers = serializers.IntegerField()
    active_interviewers = serializers.IntegerField()
    pending_verifications = serializers.IntegerField()
    suspended_users = serializers.IntegerField()

    # Interview KPIs
    total_peer_interviews = serializers.IntegerField()
    completed_peer_interviews = serializers.IntegerField()
    cancelled_interviews = serializers.IntegerField()
    candidate_no_show_count = serializers.IntegerField()
    interviewer_no_show_count = serializers.IntegerField()
    total_ai_interviews_completed = serializers.IntegerField()
    interview_completion_rate = serializers.FloatField()

    # Support KPIs
    pending_reports = serializers.IntegerField()
    unresolved_tickets = serializers.IntegerField()
    failed_notifications = serializers.IntegerField()

    # Business KPIs
    today_revenue = serializers.IntegerField()
    weekly_revenue = serializers.IntegerField()
    monthly_revenue = serializers.IntegerField()
    total_revenue = serializers.IntegerField()
    total_platform_commission = serializers.FloatField()
    pending_refunds = serializers.IntegerField()
    pending_payouts = serializers.IntegerField()


# ════════════════════════════════════════════════════════════════
# 2. REVENUE ANALYTICS
# ════════════════════════════════════════════════════════════════

class RevenueSummarySerializer(serializers.Serializer):
    gross_revenue = serializers.FloatField()
    net_revenue = serializers.FloatField()
    platform_commission = serializers.FloatField()
    total_refunds = serializers.FloatField()
    pending_payout_amount = serializers.FloatField()


class RevenueTrendPointSerializer(serializers.Serializer):
    period = serializers.CharField()
    token_revenue = serializers.IntegerField()
    subscription_revenue = serializers.IntegerField()
    total_revenue = serializers.IntegerField()


class RevenueBreakdownSerializer(serializers.Serializer):
    peer_interview_revenue = serializers.FloatField()
    ai_interview_revenue = serializers.FloatField()
    subscription_revenue = serializers.FloatField()


class RevenueSerializer(serializers.Serializer):
    summary = RevenueSummarySerializer()
    trends = RevenueTrendPointSerializer(many=True)
    breakdown = RevenueBreakdownSerializer()


# ════════════════════════════════════════════════════════════════
# 3. INTERVIEW ANALYTICS
# ════════════════════════════════════════════════════════════════

class InterviewCountsSerializer(serializers.Serializer):
    booked = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    live = serializers.IntegerField()
    completed = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class InterviewFunnelSerializer(serializers.Serializer):
    booked = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    completed = serializers.IntegerField()
    feedback_submitted = serializers.IntegerField()


class InterviewRatesSerializer(serializers.Serializer):
    completion_rate = serializers.FloatField()
    cancellation_rate = serializers.FloatField()
    no_show_rate = serializers.FloatField()


class InterviewPerformanceSerializer(serializers.Serializer):
    avg_candidate_rating = serializers.FloatField()
    avg_interviewer_rating = serializers.FloatField()


class TopInterviewerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    name = serializers.CharField()
    session_count = serializers.IntegerField()


class RiskyInterviewerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    name = serializers.CharField()
    risk_signals = serializers.ListField(child=serializers.CharField())
    total_bookings = serializers.IntegerField()
    avg_rating = serializers.FloatField()
    complaint_count = serializers.IntegerField()


class InterviewAnalyticsSerializer(serializers.Serializer):
    counts = InterviewCountsSerializer()
    funnel = InterviewFunnelSerializer()
    rates = InterviewRatesSerializer()
    performance = InterviewPerformanceSerializer()
    top_interviewers_by_sessions = TopInterviewerSerializer(many=True)
    risky_interviewers = RiskyInterviewerSerializer(many=True)


# ════════════════════════════════════════════════════════════════
# 4. INTERVIEWER HEALTH
# ════════════════════════════════════════════════════════════════

class RatedInterviewerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    name = serializers.CharField()
    avg_rating = serializers.FloatField()
    review_count = serializers.IntegerField()


class CompletionInterviewerSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    name = serializers.CharField()
    completed_count = serializers.IntegerField()


class TopPerformersSerializer(serializers.Serializer):
    highest_rated = RatedInterviewerSerializer(many=True)
    most_completed = CompletionInterviewerSerializer(many=True)


class InterviewerHealthSerializer(serializers.Serializer):
    total_interviewers = serializers.IntegerField()
    approved = serializers.IntegerField()
    active = serializers.IntegerField()
    suspended = serializers.IntegerField()
    pending_verification = serializers.IntegerField()
    top_performers = TopPerformersSerializer()
    risky_interviewers = RiskyInterviewerSerializer(many=True)
    pending_verification_queue = serializers.IntegerField()


# ════════════════════════════════════════════════════════════════
# 5. MODERATION
# ════════════════════════════════════════════════════════════════

class ReportedUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    name = serializers.CharField()
    report_count = serializers.IntegerField()


class ComplaintCategorySerializer(serializers.Serializer):
    issue_type = serializers.CharField()
    count = serializers.IntegerField()


class ModerationSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    resolved_reports = serializers.IntegerField()
    escalated_reports = serializers.IntegerField()
    critical_reports = serializers.IntegerField()
    most_reported_interviewers = ReportedUserSerializer(many=True)
    complaint_categories = ComplaintCategorySerializer(many=True)


# ════════════════════════════════════════════════════════════════
# 6. FINANCE (PAYOUTS & REFUNDS)
# ════════════════════════════════════════════════════════════════

class PayoutSectionSerializer(serializers.Serializer):
    pending_payouts = serializers.IntegerField()
    failed_payouts = serializers.IntegerField()
    completed_payouts = serializers.IntegerField()
    pending_payout_amount = serializers.FloatField()
    completed_payout_amount = serializers.FloatField()
    total_payout_amount = serializers.FloatField()


class RefundSectionSerializer(serializers.Serializer):
    total_refunds = serializers.IntegerField()
    total_refund_amount = serializers.FloatField()


class FinanceSerializer(serializers.Serializer):
    payouts = PayoutSectionSerializer()
    refunds = RefundSectionSerializer()


# ════════════════════════════════════════════════════════════════
# 7. SUBSCRIPTION ANALYTICS
# ════════════════════════════════════════════════════════════════

class SubBreakdownSerializer(serializers.Serializer):
    active = serializers.IntegerField()
    expired = serializers.IntegerField()


class SubscriptionSerializer(serializers.Serializer):
    active_subscriptions = serializers.IntegerField()
    expired_subscriptions = serializers.IntegerField()
    renewal_rate = serializers.FloatField()
    subscription_revenue = serializers.FloatField()
    candidate_subscriptions = SubBreakdownSerializer()
    interviewer_subscriptions = SubBreakdownSerializer()


# ════════════════════════════════════════════════════════════════
# 8. PLATFORM GROWTH
# ════════════════════════════════════════════════════════════════

class UserGrowthPointSerializer(serializers.Serializer):
    period = serializers.CharField()
    new_users = serializers.IntegerField()
    new_candidates = serializers.IntegerField()
    new_interviewers = serializers.IntegerField()


class InterviewGrowthPointSerializer(serializers.Serializer):
    period = serializers.CharField()
    total_bookings = serializers.IntegerField()
    completed = serializers.IntegerField()


class RevenueGrowthPointSerializer(serializers.Serializer):
    period = serializers.CharField()
    revenue = serializers.IntegerField()


class GrowthSerializer(serializers.Serializer):
    user_growth = UserGrowthPointSerializer(many=True)
    interview_growth = InterviewGrowthPointSerializer(many=True)
    revenue_growth = RevenueGrowthPointSerializer(many=True)
