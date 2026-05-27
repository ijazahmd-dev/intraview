# admin_dashboard/serializers/booking_serializers.py
"""
Admin Session Management — Serializers

All serializers consume plain dicts returned by service classes.
We use base Serializer (not ModelSerializer) because services
return pre-built dicts, not model instances.
"""

from rest_framework import serializers


# ════════════════════════════════════════════════════════════════
# FEATURE 1 — Session KPI Overview
# ════════════════════════════════════════════════════════════════

class SessionKPISerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    pending_sessions = serializers.IntegerField()
    confirmed_sessions = serializers.IntegerField()
    live_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    cancelled_sessions = serializers.IntegerField()
    candidate_no_show_count = serializers.IntegerField()
    interviewer_no_show_count = serializers.IntegerField()
    rescheduled_sessions = serializers.IntegerField()
    today_sessions = serializers.IntegerField()
    weekly_sessions = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    cancellation_rate = serializers.FloatField()


# ════════════════════════════════════════════════════════════════
# FEATURE 2 — Session List (Table Row)
# ════════════════════════════════════════════════════════════════

class SessionListSerializer(serializers.Serializer):
    # Core
    booking_id = serializers.IntegerField()
    status = serializers.CharField()
    candidate_name = serializers.CharField()
    candidate_email = serializers.EmailField(allow_null=True)
    interviewer_name = serializers.CharField()
    interviewer_email = serializers.EmailField(allow_null=True)
    # Timing
    scheduled_start = serializers.CharField(allow_null=True)
    scheduled_end = serializers.CharField(allow_null=True)
    duration_minutes = serializers.IntegerField(allow_null=True)
    timezone = serializers.CharField(allow_null=True)
    # Payment
    token_cost = serializers.IntegerField()
    payment_status = serializers.CharField()
    # Reschedule
    reschedule_count = serializers.IntegerField()
    reschedule_status = serializers.CharField()
    has_pending_reschedule = serializers.BooleanField()
    # Flags
    is_cancelled = serializers.BooleanField()
    is_no_show = serializers.BooleanField()
    is_live = serializers.BooleanField()
    has_feedback = serializers.BooleanField()
    has_report = serializers.BooleanField()
    high_risk_session = serializers.BooleanField()
    # Timestamps
    created_at = serializers.CharField(allow_null=True)
    updated_at = serializers.CharField(allow_null=True)


class SessionListResponseSerializer(serializers.Serializer):
    """Wraps paginated results."""
    results = SessionListSerializer(many=True)
    count = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    page = serializers.IntegerField()
    page_size = serializers.IntegerField()


# ════════════════════════════════════════════════════════════════
# FEATURE 3 — Session Detail (nested sections)
# ════════════════════════════════════════════════════════════════

class SectionASerializer(serializers.Serializer):
    """Section A: Core session details."""
    booking_id = serializers.IntegerField()
    status = serializers.CharField()
    payment_status = serializers.CharField()
    token_cost = serializers.IntegerField()
    start_datetime = serializers.CharField(allow_null=True)
    end_datetime = serializers.CharField(allow_null=True)
    duration_minutes = serializers.IntegerField(allow_null=True)
    evaluation_deadline = serializers.CharField(allow_null=True)
    created_at = serializers.CharField(allow_null=True)
    updated_at = serializers.CharField(allow_null=True)


class SectionBSerializer(serializers.Serializer):
    """Section B: Candidate profile & stats."""
    candidate_id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    total_sessions = serializers.IntegerField()
    total_completed = serializers.IntegerField()
    total_cancellations = serializers.IntegerField()
    report_count = serializers.IntegerField()


class SectionCSerializer(serializers.Serializer):
    """Section C: Interviewer profile & analytics."""
    interviewer_id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    verification_status = serializers.CharField(allow_null=True)
    avg_rating = serializers.FloatField(allow_null=True)
    completed_interviews = serializers.IntegerField()
    cancellation_rate = serializers.FloatField()
    no_show_rate = serializers.FloatField()
    reports_count = serializers.IntegerField()


class ProposedSlotSerializer(serializers.Serializer):
    availability_id = serializers.IntegerField()
    date = serializers.CharField(allow_null=True)
    start_time = serializers.CharField(allow_null=True)
    end_time = serializers.CharField(allow_null=True)
    timezone = serializers.CharField()


class SectionDSerializer(serializers.Serializer):
    """Section D: Reschedule audit trail."""
    reschedule_count = serializers.IntegerField()
    requested_by = serializers.CharField(allow_null=True)
    requested_at = serializers.CharField(allow_null=True)
    reschedule_reason = serializers.CharField(allow_null=True)
    reschedule_status = serializers.CharField()
    proposed_slot = ProposedSlotSerializer(allow_null=True)


class SectionESerializer(serializers.Serializer):
    """Section E: Cancellation info (nullable — only present if cancelled)."""
    cancelled_at = serializers.CharField(allow_null=True)
    cancelled_by = serializers.CharField(allow_null=True)
    cancellation_reason = serializers.CharField(allow_null=True)


class CandidateEvaluationDetailSerializer(serializers.Serializer):
    technical_score = serializers.IntegerField()
    communication_score = serializers.IntegerField()
    problem_solving_score = serializers.IntegerField()
    confidence_score = serializers.IntegerField()
    overall_score = serializers.FloatField()
    hire_recommendation = serializers.CharField()
    strengths = serializers.CharField()
    areas_for_improvement = serializers.CharField()
    actionable_suggestions = serializers.CharField()
    submitted_at = serializers.CharField()


class InterviewerReviewDetailSerializer(serializers.Serializer):
    overall_rating = serializers.IntegerField()
    was_professional = serializers.BooleanField()
    was_prepared = serializers.BooleanField()
    would_recommend = serializers.BooleanField()
    comment = serializers.CharField(allow_null=True)
    reported_issues = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    submitted_at = serializers.CharField()


class SectionFSerializer(serializers.Serializer):
    """Section F: Feedback from both parties."""
    candidate_evaluation = CandidateEvaluationDetailSerializer(allow_null=True)
    interviewer_review = InterviewerReviewDetailSerializer(allow_null=True)


class SectionGSerializer(serializers.Serializer):
    """Section G: Financial details."""
    token_cost = serializers.IntegerField()
    payment_status = serializers.CharField()
    refund_issued = serializers.BooleanField()
    refund_tokens = serializers.IntegerField()
    payout_status = serializers.CharField(allow_null=True)
    payout_reference = serializers.CharField(allow_null=True)
    payout_amount_inr = serializers.FloatField(allow_null=True)


class ReportItemSerializer(serializers.Serializer):
    issue_id = serializers.IntegerField()
    issue_type = serializers.CharField()
    status = serializers.CharField()
    priority = serializers.CharField()
    description = serializers.CharField()
    raised_by = serializers.IntegerField()
    resolution = serializers.CharField(allow_null=True)
    admin_notes = serializers.CharField(allow_null=True)
    created_at = serializers.CharField()
    resolved_at = serializers.CharField(allow_null=True)


class SectionHSerializer(serializers.Serializer):
    """Section H: Reports & tickets for this booking."""
    report_count = serializers.IntegerField()
    reports = ReportItemSerializer(many=True)


class TimelineEventSerializer(serializers.Serializer):
    event = serializers.CharField()
    timestamp = serializers.CharField(allow_null=True)


class SessionDetailSerializer(serializers.Serializer):
    """
    Full session inspection response — all 9 sections.
    """
    high_risk_session = serializers.BooleanField()
    session_details = SectionASerializer()
    candidate_details = SectionBSerializer()
    interviewer_details = SectionCSerializer()
    reschedule_details = SectionDSerializer()
    cancellation_details = SectionESerializer(allow_null=True)
    feedback_details = SectionFSerializer()
    financial_details = SectionGSerializer()
    report_details = SectionHSerializer()
    timeline = TimelineEventSerializer(many=True)


# ════════════════════════════════════════════════════════════════
# FEATURE 4 — Admin Action
# ════════════════════════════════════════════════════════════════

class SessionActionInputSerializer(serializers.Serializer):
    """Validates incoming action POST body."""
    action = serializers.CharField(max_length=50)
    note = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        default="",
    )


class SessionActionResponseSerializer(serializers.Serializer):
    """Serializes the result dict returned by SessionActionService."""
    success = serializers.BooleanField()
    message = serializers.CharField()
    detail = serializers.DictField()
