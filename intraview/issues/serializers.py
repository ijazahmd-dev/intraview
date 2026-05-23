from __future__ import annotations

from rest_framework import serializers

from .models import SessionIssue
from .services import IssueService


class IssueCreateSerializer(serializers.Serializer):
    """
    Used by candidate/interviewer to create a new issue for a booking.
    Booking + user come from context, not from the request body.
    """

    issue_type = serializers.ChoiceField(
        choices=SessionIssue.IssueType.choices
    )
    description = serializers.CharField(
        max_length=5000,
        allow_blank=False,
    )

    def create(self, validated_data):
        request = self.context["request"]
        booking = self.context["booking"]

        issue_type = validated_data["issue_type"]
        description = validated_data["description"]

        # Presence metrics can be passed in context later if you have them
        candidate_presence_minutes = self.context.get(
            "candidate_presence_minutes"
        )
        interviewer_presence_minutes = self.context.get(
            "interviewer_presence_minutes"
        )

        return IssueService.create_issue(
            booking=booking,
            raised_by=request.user,
            issue_type=issue_type,
            description=description,
            candidate_presence_minutes=candidate_presence_minutes,
            interviewer_presence_minutes=interviewer_presence_minutes,
        )


class IssueListSerializer(serializers.ModelSerializer):
    """
    Compact representation for list views (candidate & interviewer).
    """

    issue_type_display = serializers.CharField(
        source="get_issue_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
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
            "created_at",
        ]


class IssueDetailSerializer(serializers.ModelSerializer):
    """
    Detailed view for the user who raised the issue.
    Does NOT expose admin_notes to keep internal moderation private.
    """

    issue_type_display = serializers.CharField(
        source="get_issue_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )

    raised_by_name = serializers.CharField(
        source="raised_by.get_full_name", read_only=True
    )
    against_user_name = serializers.CharField(
        source="against_user.get_full_name", read_only=True
    )

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
            "raised_by_id",
            "raised_by_name",
            "against_user_id",
            "against_user_name",
            "candidate_presence_minutes",
            "interviewer_presence_minutes",
            "issue_deadline",
            "created_at",
            "updated_at",
            "resolved_at",
        ]
        read_only_fields = fields


# Admin serializers can be added later when we do admin_views