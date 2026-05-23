# progress/serializers.py
"""
Read-only serializers for Candidate Progress Dashboard responses.
These serialize plain dicts returned by CandidateProgressService.
"""

from rest_framework import serializers


# ─── 1. Overview Stats ──────────────────────────────────────

class OverviewStatsSerializer(serializers.Serializer):
    """Serializes the dashboard overview statistics."""

    total_sessions_attended = serializers.IntegerField()
    peer_sessions_count = serializers.IntegerField()
    ai_sessions_count = serializers.IntegerField()
    average_overall_score = serializers.FloatField()
    total_practice_hours = serializers.FloatField()
    readiness_score = serializers.IntegerField()
    readiness_level = serializers.CharField()


# ─── 2. Growth Analytics ────────────────────────────────────

class GrowthDataPointSerializer(serializers.Serializer):
    """Single data point in the growth trend (one month)."""

    month = serializers.CharField()
    source = serializers.CharField()  # "peer" or "ai"
    technical_score = serializers.FloatField(allow_null=True)
    communication_score = serializers.FloatField(allow_null=True)
    problem_solving_score = serializers.FloatField(allow_null=True)
    confidence_score = serializers.FloatField(allow_null=True)
    overall_score = serializers.FloatField()
    session_count = serializers.IntegerField()


# ─── 3. Skill Breakdown ─────────────────────────────────────

class SkillBreakdownSerializer(serializers.Serializer):
    """Average per-skill scores for radar chart."""

    technical = serializers.FloatField()
    communication = serializers.FloatField()
    problem_solving = serializers.FloatField()
    confidence = serializers.FloatField()
    overall = serializers.FloatField()
    total_evaluations = serializers.IntegerField()


# ─── 4. Strengths & Weaknesses ──────────────────────────────

class SkillItemSerializer(serializers.Serializer):
    """A single skill classification (strength or weakness)."""

    skill = serializers.CharField()
    score = serializers.FloatField()


class ThresholdsSerializer(serializers.Serializer):
    strength = serializers.FloatField()
    weakness = serializers.FloatField()


class StrengthsWeaknessesSerializer(serializers.Serializer):
    """Strengths and weaknesses classification."""

    strengths = SkillItemSerializer(many=True)
    weaknesses = SkillItemSerializer(many=True)
    thresholds = ThresholdsSerializer()


# ─── 5. Interview History ───────────────────────────────────

class InterviewHistoryItemSerializer(serializers.Serializer):
    """Single interview in the candidate's history."""

    interview_type = serializers.CharField()  # "peer" or "ai"
    booking_id = serializers.IntegerField()
    completed_date = serializers.DateTimeField(allow_null=True)
    interviewer_name = serializers.CharField(allow_null=True)
    overall_score = serializers.FloatField(allow_null=True)
    hire_recommendation = serializers.CharField(allow_null=True)
    feedback_summary = serializers.CharField(allow_null=True)
