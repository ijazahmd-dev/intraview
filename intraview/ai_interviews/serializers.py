# ai_interviews/serializers.py

from rest_framework import serializers

from .models import (
    Role,
    AIInterviewSession,
    AIInterviewAvatarSession,
    AIInterviewTurn,
    AIInterviewEvaluation,
    AIInterviewFinalReport,
    InterviewRuntimeState,
)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "slug",
            "category",
        ]


class RoleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "description",
            "skills",
            "aliases",
        ]












class AIInterviewSessionStartSerializer(serializers.Serializer):
    """
    Input for POST /api/ai-interview/session/start/
    """

    role_slug = serializers.SlugField()
    round_type = serializers.ChoiceField(
        choices=AIInterviewSession.RoundType.choices,
    )
    difficulty = serializers.ChoiceField(
        choices=AIInterviewSession.Difficulty.choices,
    )
    duration_minutes = serializers.IntegerField(min_value=5, max_value=120)

    def validate_duration_minutes(self, value):
        # You can enforce tighter rules later (e.g., only 5/15/30)
        if value not in (5, 10, 15, 20, 25, 30):
            raise serializers.ValidationError(
                "Unsupported duration. Allowed values: 5, 10, 15, 20, 25, 30 minutes."
            )
        return value


class AIInterviewSessionSerializer(serializers.ModelSerializer):
    """
    Output representation of an AIInterviewSession.
    Used both for /start and /join responses.
    """

    role = serializers.SerializerMethodField()

    class Meta:
        model = AIInterviewSession
        fields = [
            "id",
            "role",
            "round_type",
            "difficulty",
            "duration_minutes",
            "status",
            "livekit_room_name",
            # livekit_token will be attached manually in the join view.
            "created_at",
            "started_at",
            "ended_at",
        ]

    def get_role(self, obj):
        return {
            "id": obj.role.id,
            "name": obj.role.name,
            "slug": obj.role.slug,
            "category": obj.role.category,
        }


class AIInterviewSessionJoinResponseSerializer(serializers.Serializer):
    """
    Response schema for GET /session/<id>/join/
    """

    session_id = serializers.IntegerField()
    role = serializers.DictField()
    round_type = serializers.CharField()
    difficulty = serializers.CharField()
    duration_minutes = serializers.IntegerField()
    status = serializers.CharField()
    started_at = serializers.DateTimeField(allow_null=True)
    ended_at = serializers.DateTimeField(allow_null=True)
    remaining_seconds = serializers.IntegerField()
    livekit_room_name = serializers.CharField()
    livekit_token = serializers.CharField()
    livekit_server_url = serializers.CharField()
    avatar_session = serializers.DictField(
        required=False,
        allow_null=True,
    )


class AIInterviewAvatarSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewAvatarSession
        fields = [
            "id",
            "provider",
            "enabled",
            "status",
            "avatar_participant_identity",
            "avatar_participant_name",
            "last_error",
            "activated_at",
            "ended_at",
            "created_at",
            "updated_at",
        ]



























class AIInterviewTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewTurn
        fields = [
            "id",
            "session",
            "turn_index",
            "question_text",
            "answer_text",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "session", "created_at"]


class AIInterviewEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewEvaluation
        fields = [
            "id",
            "turn",
            "score",
            "strengths",
            "weaknesses",
            "suggestions",
            "confidence",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "turn", "status", "created_at"]


class AIInterviewFinalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewFinalReport
        fields = [
            "id",
            "session",
            "overall_score",
            "summary",
            "strengths",
            "areas_for_improvement",
            "recommendations",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "session", "status", "created_at"]



















class AgentTurnCreateSerializer(serializers.Serializer):
    """
    Payload the agent sends when a turn is completed.

    - turn_index: optional; if provided, we use it for idempotency.
    - metadata: arbitrary JSON from the agent (e.g. topic, difficulty tag).
    """

    turn_index = serializers.IntegerField(required=False, min_value=1)
    question_text = serializers.CharField()
    answer_text = serializers.CharField()
    metadata = serializers.JSONField(required=False)

    def validate_answer_text(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Answer cannot be empty.")
        return value

























class InterviewRuntimeStateSerializer(serializers.ModelSerializer):
    """
    Full representation of runtime state for debugging or admin tools.
    Also used for GET /runtime-state/ by the agent.
    """

    class Meta:
        model = InterviewRuntimeState
        fields = [
            "session",
            "current_turn_index",
            "waiting_for_answer",
            "current_state",
            "current_question_id",
            "remaining_seconds",
            "last_event_at",
            "reconnect_grace_until",
            "disconnect_count",
            "agent_session_id",
            "active_runtime_id",
            "runtime_generation",
            "last_runtime_heartbeat_at",
            "runtime_lease_expires_at",
        ]


class InterviewRuntimeStateUpdateSerializer(serializers.Serializer):
    """
    Minimal schema that the agent uses to PATCH runtime state.

    This matches what your LiveKit agent sends in
    BackendClient.update_runtime_state().
    """

    current_turn_index = serializers.IntegerField(required=False, min_value=0)
    waiting_for_answer = serializers.BooleanField(required=False)
    current_state = serializers.CharField(required=False, max_length=32)
    current_question_id = serializers.CharField(
        required=False, allow_blank=True, max_length=128
    )
    remaining_seconds = serializers.IntegerField(required=False, min_value=0)
    reconnect_grace_until = serializers.DateTimeField(required=False, allow_null=True)
    disconnect_count = serializers.IntegerField(required=False, min_value=0)
    agent_session_id = serializers.CharField(
        required=False, allow_blank=True, max_length=64
    )
    active_runtime_id = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=128,
    )

    runtime_generation = serializers.IntegerField(
        required=False,
        min_value=0,
    )

    runtime_lease_expires_at = serializers.DateTimeField(
        required=False,
        allow_null=True,
    )








class AIInterviewEvaluationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewEvaluation
        fields = [
            "id",
            "score",
            "strengths",
            "weaknesses",
            "suggestions",
            "confidence",
            "status",
            "created_at",
        ]


class AIInterviewTurnWithEvaluationSerializer(serializers.ModelSerializer):
    evaluation = serializers.SerializerMethodField()

    class Meta:
        model = AIInterviewTurn
        fields = [
            "id",
            "turn_index",
            "question_text",
            "answer_text",
            "metadata",
            "created_at",
            "evaluation",
        ]

    def get_evaluation(self, obj):
        evaluation = getattr(obj, "evaluation", None)
        if not evaluation:
            return None
        return AIInterviewEvaluationNestedSerializer(evaluation).data


class AIInterviewTurnEvaluationDetailSerializer(serializers.ModelSerializer):
    turn = AIInterviewTurnSerializer()

    class Meta:
        model = AIInterviewEvaluation
        fields = [
            "id",
            "turn",
            "score",
            "strengths",
            "weaknesses",
            "suggestions",
            "confidence",
            "status",
            "created_at",
        ]


class CandidateAIInterviewHistorySerializer(serializers.ModelSerializer):
    """
    Lean serializer for the candidate's AI interview history list.
    GET /api/ai-interview/sessions/history/
    """

    role_name = serializers.CharField(source="role.name", read_only=True)
    overall_score = serializers.SerializerMethodField()

    class Meta:
        model = AIInterviewSession
        fields = [
            "id",
            "role_name",
            "round_type",
            "difficulty",
            "duration_minutes",
            "status",
            "created_at",
            "ended_at",
            "overall_score",
        ]

    def get_overall_score(self, obj):
        """Return overall_score from final report only if it exists and is SUCCESS."""
        try:
            report = obj.final_report
        except AIInterviewFinalReport.DoesNotExist:
            return None
        if report.status == AIInterviewFinalReport.Status.SUCCESS:
            return report.overall_score
        return None
