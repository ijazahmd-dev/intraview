from __future__ import annotations

from rest_framework import serializers

from .models import SessionIssue


class AdminIssueListSerializer(serializers.ModelSerializer):
    issue_type_display = serializers.CharField(
        source="get_issue_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )

    raised_by_email = serializers.EmailField(
        source="raised_by.email", read_only=True
    )
    against_user_email = serializers.EmailField(
        source="against_user.email", read_only=True
    )

    class Meta:
        model = SessionIssue
        fields = [
            "id",
            "booking_id",
            "issue_type",
            "issue_type_display",
            "status",
            "status_display",
            "priority",
            "priority_display",
            "raised_by_id",
            "raised_by_email",
            "against_user_id",
            "against_user_email",
            "created_at",
        ]


class AdminIssueDetailSerializer(serializers.ModelSerializer):
    issue_type_display = serializers.CharField(
        source="get_issue_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )

    raised_by_email = serializers.EmailField(
        source="raised_by.email", read_only=True
    )
    against_user_email = serializers.EmailField(
        source="against_user.email", read_only=True
    )
    resolved_by_email = serializers.EmailField(
        source="resolved_by.email", read_only=True
    )

    raised_by_role = serializers.CharField(source="raised_by.role", read_only=True)
    against_user_role = serializers.CharField(source="against_user.role", read_only=True)

    class Meta:
        model = SessionIssue
        fields = [
            "id",
            "booking_id",
            "issue_type",
            "issue_type_display",
            "description",
            "status",
            "status_display",
            "priority",
            "priority_display",
            "resolution",
            "admin_notes",
            "raised_by_role",   
            "raised_by_id",
            "raised_by_email",
            "against_user_id",
            "against_user_email",
            "resolved_by_id",
            "resolved_by_email",
            "against_user_role",
            "candidate_presence_minutes",
            "interviewer_presence_minutes",
            "issue_deadline",
            "created_at",
            "updated_at",
            "resolved_at",
        ]


class AdminIssueStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=SessionIssue.Status.choices)
    admin_notes = serializers.CharField(
        allow_blank=True,
        required=False,
        max_length=5000,
    )


class AdminIssueResolveSerializer(serializers.Serializer):
    resolution = serializers.CharField(max_length=5000)
    action_taken = serializers.CharField(
        allow_blank=True,
        required=False,
        max_length=5000,
    )


class AdminIssueActionSerializer(serializers.Serializer):
    """
    Payload for apply_admin_action.
    We only log the action for now; later you can wire it to payments etc.
    """

    action_type = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
    )
    percent = serializers.IntegerField(
        min_value=1,
        max_value=100,
        required=False,
    )
    target_user_id = serializers.IntegerField(required=False)