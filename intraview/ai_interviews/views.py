# ai_interviews/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from django.utils import timezone
from datetime import timedelta

from .models import (
    AIInterviewSession,
    InterviewRuntimeState,
    AIInterviewFinalReport,
    AIInterviewTurn,
)
from ai_interviews.serializers import (
    RoleSerializer,
    RoleDetailSerializer,
    AIInterviewSessionStartSerializer,
    AIInterviewSessionJoinResponseSerializer,
    AIInterviewSessionSerializer,
    AIInterviewAvatarSessionSerializer,
    AgentTurnCreateSerializer,
    InterviewRuntimeStateSerializer,
    InterviewRuntimeStateUpdateSerializer,
    AIInterviewFinalReportSerializer,
    AIInterviewTurnEvaluationDetailSerializer,
    AIInterviewTurnWithEvaluationSerializer,
    CandidateAIInterviewHistorySerializer,
)

from ai_interviews.service.services import RoleService, AIInterviewSessionService, AIInterviewTurnService
from ai_interviews.service.tavus_avatar_service import TavusAvatarSessionService
from .tasks import evaluate_turn, generate_final_report

# Adjust this import to where your auth class lives:
# from core.authentication import MultiRoleJWTAuthentication
from authentication.authentication import CookieJWTAuthentication, MultiRoleJWTAuthentication, AgentTokenAuthentication


logger = logging.getLogger(__name__)

class FeaturedRoleListAPIView(APIView):
    """
    Returns up to N featured roles for the 15-card grid on the AI Interview page.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            limit = int(request.query_params.get("limit", 15))
            limit = min(max(limit, 1), 50)
        except (TypeError, ValueError):
            limit = 15

        roles = RoleService.get_featured_roles(limit=limit)
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RoleSearchAPIView(APIView):
    """
    Lightweight search endpoint for role autocomplete.
    Query params:
      - q: search string (required)
      - limit: max results (optional, default 10)
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        query = request.query_params.get("q", "") or ""
        try:
            limit = int(request.query_params.get("limit", 10))
        except (TypeError, ValueError):
            limit = 10

        roles = RoleService.search_roles(query=query, limit=limit)
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RoleDetailAPIView(APIView):
    """
    Returns full details for a selected role by slug.
    Useful for the next-step Interview Details page.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request, slug: str):
        role = RoleService.get_role_by_slug(slug)
        if not role:
            return Response(
                {"detail": "Role not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RoleDetailSerializer(role)
        return Response(serializer.data, status=status.HTTP_200_OK)
    









class AIInterviewSessionStartAPIView(APIView):
    """
    POST /api/ai-interview/session/start/

    Called after the user has:
      - selected role, round, difficulty, duration,
      - passed local device checks on the frontend.

    This ONLY creates a DB session and marks it READY.
    LiveKit token is NOT generated here.
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AIInterviewSessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            session = AIInterviewSessionService.create_session(
                user=request.user,
                role_slug=data["role_slug"],
                round_type=data["round_type"],
                difficulty=data["difficulty"],
                duration_minutes=data["duration_minutes"],
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output = AIInterviewSessionSerializer(session)
        # We intentionally do NOT include livekit_token here.
        return Response(output.data, status=status.HTTP_201_CREATED)


class AIInterviewSessionJoinAPIView(APIView):
    """
    GET /api/ai-interview/session/<id>/join/

    Called from the live interview page when the user is about to join.
    This is where we will:
      - ensure the user owns the session,
      - ensure status allows joining,
      - ensure a LiveKit room name exists,
      - generate a LiveKit token (later),
      - mark session LIVE.
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            payload = AIInterviewSessionService.build_join_payload(
                session=session,
                user=request.user,
            )
        except PermissionError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = AIInterviewSessionJoinResponseSerializer(payload)
        return Response(response_serializer.data, status=status.HTTP_200_OK)



class AIInterviewSessionEndAPIView(APIView):
    """
    POST /api/ai-interview/session/<id>/end/

    Body: { "reason": "COMPLETED" | "CANCELLED" }

    - COMPLETED: user finished the live interview
    - CANCELLED: user explicitly cancels before starting (unused in UI for now)
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        reason = request.data.get("reason", "COMPLETED").upper()
        as_cancel = reason == "CANCELLED"

        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            session = AIInterviewSessionService.end_session(
                session=session,
                user=request.user,
                as_cancel=as_cancel,
            )
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            AIInterviewSessionSerializer(session).data,
            status=status.HTTP_200_OK,
        )


class AIInterviewAvatarSessionCreateAPIView(APIView):
    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            avatar_session = TavusAvatarSessionService.ensure_avatar_session(session)
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serializer = AIInterviewAvatarSessionSerializer(avatar_session)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AIInterviewAvatarSessionStopAPIView(APIView):
    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        avatar_session = TavusAvatarSessionService.stop_avatar_session(session)
        if avatar_session is None:
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = AIInterviewAvatarSessionSerializer(avatar_session)
        return Response(serializer.data, status=status.HTTP_200_OK)



class PingAPIView(APIView):
    """
    Simple health check for frontend network tests.
    GET /api/ai-interview/ping/
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "ok"},
            status=status.HTTP_200_OK,
        )




































logger = logging.getLogger(__name__)


class IsAgentWithSharedSecret(permissions.BasePermission):
    """
    Very simple auth: require X-Agent-Token header matching shared secret.

    In production you may want mTLS or signed JWTs instead.
    """

    def has_permission(self, request, view) -> bool:
        header_token = request.headers.get("X-Agent-Token")
        expected = getattr(settings, "AI_AGENT_SHARED_SECRET", None)
        if not expected:
            logger.error("AI_AGENT_SHARED_SECRET not configured.")
            return False
        return header_token == expected


class RecordTurnFromAgentView(APIView):
    """
    POST /api/ai-interview/session/<id>/turns/

    Called by the LiveKit agent when a question+answer turn is completed.
    """
    authentication_classes = [AgentTokenAuthentication] 
    permission_classes = []

    def post(self, request, session_id: int):
        session = get_object_or_404(AIInterviewSession, pk=session_id)

        if session.status != AIInterviewSession.Status.LIVE:
            logger.warning(
                "RecordTurnFromAgentView: session not live",
                extra={"session_id": session.id, "status": session.status},
            )
            return Response(
                {"detail": "Session is not active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AgentTurnCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        proposed_index = data.get("turn_index")
        question_text = data["question_text"]
        answer_text = data["answer_text"]
        metadata = data.get("metadata") or {}

        logger.info(
            "RecordTurnFromAgentView received turn",
            extra={
                "session_id": session.id,
                "turn_index": proposed_index,
            },
        )
        try:
            turn = AIInterviewTurnService.create_turn(
                session=session,
                question_text=question_text,
                answer_text=answer_text,
                metadata=metadata,
                proposed_index=proposed_index,
            )
        except ValueError as e:
            logger.warning(
                "RecordTurnFromAgentView: invalid turn for session %s: %s",
                session.id,
                e,
            )
            return Response(
                {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        # Enqueue evaluation asynchronously.
        evaluate_turn.delay(turn.id)

        return Response(
            {
                "id": turn.id,
                "session_id": session.id,
                "turn_index": turn.turn_index,
                "status": "accepted",
            },
            status=status.HTTP_201_CREATED,
        )
    





class AgentNotifyCompletedView(APIView):
    """
    POST /api/ai-interview/session/<session_id>/agent-completed/

    Called by the LiveKit agent when all interview questions are done.
    Marks session as COMPLETED and triggers final report generation.
    """
    authentication_classes = [AgentTokenAuthentication]
    permission_classes = []

    def post(self, request, session_id: int):
        session = get_object_or_404(AIInterviewSession, pk=session_id)

        if session.status == AIInterviewSession.Status.COMPLETED:
            # Already completed — idempotent
            return Response({"status": "already_completed"}, status=status.HTTP_200_OK)

        if session.status not in (
            AIInterviewSession.Status.LIVE,
            AIInterviewSession.Status.READY,
        ):
            logger.warning(
                "AgentNotifyCompletedView: unexpected session status",
                extra={"session_id": session_id, "status": session.status},
            )
            return Response(
                {"detail": f"Cannot complete session from status: {session.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.mark_completed()

        generate_final_report.delay(session.id)

        logger.info(
            "AgentNotifyCompletedView: session %s marked COMPLETED, report queued",
            session_id,
        )

        return Response({"status": "completed"}, status=status.HTTP_200_OK)







RUNTIME_LEASE_SECONDS = 20







class RuntimeOwnershipMixin:
    """
    Shared helpers for runtime ownership / lease management.
    """

    def _runtime_id(self, request) -> str:
        return request.headers.get("X-Runtime-Id", "").strip()

    def _lease_expired(self, state: InterviewRuntimeState) -> bool:
        if not state.runtime_lease_expires_at:
            return True

        return timezone.now() >= state.runtime_lease_expires_at

    def _extend_lease(self, state: InterviewRuntimeState):
        now = timezone.now()

        state.last_runtime_heartbeat_at = now
        state.runtime_lease_expires_at = (
            now + timedelta(seconds=RUNTIME_LEASE_SECONDS)
        )

    def _validate_runtime_ownership(
        self,
        request,
        state: InterviewRuntimeState,
    ) -> tuple[bool, str]:

        runtime_id = self._runtime_id(request)

        if not runtime_id:
            return False, "Missing X-Runtime-Id header."

        if not state.active_runtime_id:
            return False, "No active runtime owner."

        if state.active_runtime_id != runtime_id:
            return False, "Runtime ownership mismatch."

        if self._lease_expired(state):
            return False, "Runtime lease expired."

        return True, ""
    





class InterviewRuntimeStateView(RuntimeOwnershipMixin, APIView):
    """
    GET/PATCH /api/ai-interview/session/<session_id>/runtime-state/

    Used only by the LiveKit agent (and optionally admin tools).

    - GET: agent loads durable runtime state (for reconnect/resume).
    - PATCH: agent updates current_turn_index / current_state / remaining_seconds, etc.

    Auth: X-Agent-Token header checked via IsAgentWithSharedSecret.
    """

    authentication_classes = [AgentTokenAuthentication] 
    permission_classes = []

    def _get_session_and_state(
        self, session_id: int
    ) -> tuple[AIInterviewSession, InterviewRuntimeState]:
        session = get_object_or_404(AIInterviewSession, pk=session_id)
        state, _created = InterviewRuntimeState.objects.get_or_create(
            session=session,
            defaults={
                "current_turn_index": 0,
                "waiting_for_answer": False,
                "current_state": "INITIALIZING",
            },
        )
        return session, state

    def get(self, request, session_id: int, *args, **kwargs):
        _session, state = self._get_session_and_state(session_id)
        serializer = InterviewRuntimeStateSerializer(state)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, session_id: int, *args, **kwargs):
        session, state = self._get_session_and_state(session_id)

        is_valid_owner, reason = self._validate_runtime_ownership(
            request,
            state,
        )

        if not is_valid_owner:
            return Response(
                {
                    "detail": reason,
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = InterviewRuntimeStateUpdateSerializer(
            data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Apply updates from agent
        if "current_turn_index" in data:
            state.current_turn_index = data["current_turn_index"]
        if "waiting_for_answer" in data:
            state.waiting_for_answer = data["waiting_for_answer"]
        if "current_state" in data:
            state.current_state = data["current_state"]
        if "current_question_id" in data:
            state.current_question_id = data["current_question_id"]
        if "remaining_seconds" in data:
            state.remaining_seconds = data["remaining_seconds"]
        if "reconnect_grace_until" in data:
            state.reconnect_grace_until = data["reconnect_grace_until"]
        if "disconnect_count" in data:
            state.disconnect_count = data["disconnect_count"]
        if "agent_session_id" in data:
            state.agent_session_id = data["agent_session_id"]

        state.save()

        # Optionally sync AIInterviewSession.status when we see terminal states
        if (
            state.current_state == "COMPLETED"
            and session.status == AIInterviewSession.Status.LIVE
        ):
            session.mark_completed()
        elif (
            state.current_state == "FAILED"
            and session.status in AIInterviewSession.ACTIVE_STATUSES
        ):
            session.mark_failed()

        return Response(
            InterviewRuntimeStateSerializer(state).data,
            status=status.HTTP_200_OK,
        )
    





class AcquireRuntimeOwnershipView(
    RuntimeOwnershipMixin,
    APIView,
):
    """
    Acquire runtime ownership for an interview session.
    """

    authentication_classes = [AgentTokenAuthentication]
    permission_classes = []

    def post(self, request, session_id: int, *args, **kwargs):

        session = get_object_or_404(
            AIInterviewSession,
            pk=session_id,
        )

        state, _ = InterviewRuntimeState.objects.get_or_create(
            session=session,
            defaults={
                "current_turn_index": 0,
                "waiting_for_answer": False,
                "current_state": "INITIALIZING",
            },
        )

        runtime_id = self._runtime_id(request)

        if not runtime_id:
            return Response(
                {"detail": "Missing X-Runtime-Id header."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ownership_granted = False

        if not state.active_runtime_id:
            ownership_granted = True

        elif state.active_runtime_id == runtime_id:
            ownership_granted = True

        elif self._lease_expired(state):
            logger.warning(
                "Stealing stale runtime ownership: "
                "session_id=%s old_runtime=%s new_runtime=%s",
                session_id,
                state.active_runtime_id,
                runtime_id,
            )
            ownership_granted = True

        if ownership_granted:

            if state.active_runtime_id != runtime_id:
                state.runtime_generation += 1

            state.active_runtime_id = runtime_id

            self._extend_lease(state)

            state.save()

            return Response(
                {
                    "is_owner": True,
                    "runtime_generation": state.runtime_generation,
                    "lease_expires_at": state.runtime_lease_expires_at,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "is_owner": False,
                "active_runtime_id": state.active_runtime_id,
                "runtime_generation": state.runtime_generation,
            },
            status=status.HTTP_409_CONFLICT,
        )






class RuntimeHeartbeatView(
    RuntimeOwnershipMixin,
    APIView,
):
    """
    Runtime heartbeat endpoint.
    """

    authentication_classes = [AgentTokenAuthentication]
    permission_classes = []

    def post(self, request, session_id: int, *args, **kwargs):

        session = get_object_or_404(
            AIInterviewSession,
            pk=session_id,
        )

        state = get_object_or_404(
            InterviewRuntimeState,
            session=session,
        )

        is_valid_owner, reason = self._validate_runtime_ownership(
            request,
            state,
        )

        if not is_valid_owner:
            return Response(
                {"detail": reason},
                status=status.HTTP_409_CONFLICT,
            )

        self._extend_lease(state)

        state.save()

        return Response(
            {
                "ok": True,
                "lease_expires_at": state.runtime_lease_expires_at,
            },
            status=status.HTTP_200_OK,
        )





class ValidateRuntimeOwnershipView(
    RuntimeOwnershipMixin,
    APIView,
):
    """
    Validate whether THIS runtime still owns the interview session.
    """

    authentication_classes = [AgentTokenAuthentication]
    permission_classes = []

    def get(self, request, session_id: int, *args, **kwargs):

        session = get_object_or_404(
            AIInterviewSession,
            pk=session_id,
        )

        state = get_object_or_404(
            InterviewRuntimeState,
            session=session,
        )

        is_valid_owner, _reason = self._validate_runtime_ownership(
            request,
            state,
        )

        return Response(
            {
                "is_owner": is_valid_owner,
                "runtime_generation": state.runtime_generation,
            },
            status=status.HTTP_200_OK,
        )
    





class ReleaseRuntimeOwnershipView(
    RuntimeOwnershipMixin,
    APIView,
):
    """
    Release runtime ownership gracefully.
    """

    authentication_classes = [AgentTokenAuthentication]
    permission_classes = []

    def post(self, request, session_id: int, *args, **kwargs):

        session = get_object_or_404(
            AIInterviewSession,
            pk=session_id,
        )

        state = get_object_or_404(
            InterviewRuntimeState,
            session=session,
        )

        runtime_id = self._runtime_id(request)

        if state.active_runtime_id == runtime_id:

            state.active_runtime_id = ""
            state.runtime_lease_expires_at = None
            state.last_runtime_heartbeat_at = None

            state.save()

        return Response(
            {"released": True},
            status=status.HTTP_200_OK,
        )
    











class AIInterviewSessionDetailAPIView(APIView):
    """
    GET /api/ai-interview/session/<id>/

    Returns the current state of an AIInterviewSession for the owner.
    Useful for polling status after the room is closed or on page refresh.
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AIInterviewSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)
    








class AIInterviewFinalReportAPIView(APIView):
    """
    GET /api/ai-interview/session/<id>/report/

    Returns the final report for a completed session, if available.
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            report = session.final_report
        except AIInterviewFinalReport.DoesNotExist:
            return Response(
                {"detail": "Report not ready yet."},
                status=status.HTTP_202_ACCEPTED,
            )

        serializer = AIInterviewFinalReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
    









class AIInterviewSessionEvaluationsAPIView(APIView):
    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        session = AIInterviewSessionService.get_session_for_user(pk, request.user)
        if not session:
            return Response(
                {"detail": "Session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        turns = (
            AIInterviewTurn.objects.filter(session=session)
            .select_related("evaluation")
            .order_by("turn_index")
        )

        serializer = AIInterviewTurnWithEvaluationSerializer(turns, many=True)
        return Response(
            {
                "session_id": session.id,
                "status": session.status,
                "turns": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class AIInterviewTurnEvaluationDetailAPIView(APIView):
    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, turn_id: int, *args, **kwargs):
        turn = get_object_or_404(
            AIInterviewTurn.objects.select_related("session", "evaluation"),
            pk=turn_id,
        )

        if turn.session.user_id != request.user.id:
            return Response(
                {"detail": "You do not have permission to access this turn."},
                status=status.HTTP_403_FORBIDDEN,
            )

        evaluation = getattr(turn, "evaluation", None)
        if not evaluation:
            return Response(
                {"detail": "Evaluation not found for this turn."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AIInterviewTurnEvaluationDetailSerializer(evaluation)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# AI Interview Eligibility
# ---------------------------------------------------------------------------


class AIInterviewEligibilityAPIView(APIView):
    """
    GET /api/ai-interview/eligibility/?duration=<minutes>

    Returns whether the authenticated candidate can start an AI interview
    for the given duration, and how the payment will be handled.

    Call this BEFORE /session/start/ so the frontend can show pricing info.

    Response examples:
      { "can_start": true,  "payment_type": "UNLIMITED" }
      { "can_start": true,  "payment_type": "SUBSCRIPTION", "remaining_subscription": 8, "cost": 0 }
      { "can_start": true,  "payment_type": "FREE_QUOTA", "remaining_free": 2, "cost": 0 }
      { "can_start": true,  "payment_type": "TOKENS", "cost": 20, "remaining_tokens": 50 }
      { "can_start": false, "message": "Insufficient tokens." }
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from ai_interviews.service.quota_service import AIInterviewQuotaService, VALID_DURATIONS

        raw_duration = request.query_params.get("duration")
        if not raw_duration:
            return Response(
                {"detail": "Query param 'duration' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            duration_minutes = int(raw_duration)
        except (TypeError, ValueError):
            return Response(
                {"detail": f"'duration' must be an integer. Valid values: {sorted(VALID_DURATIONS)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = AIInterviewQuotaService.check_eligibility(
            user=request.user,
            duration_minutes=duration_minutes,
        )

        return Response(result.to_response_dict(), status=status.HTTP_200_OK)


class AIInterviewQuotaStatusAPIView(APIView):
    """
    GET /api/ai-interview/quota/

    Returns the current quota state for the authenticated candidate.
    Useful for the frontend dashboard / pre-interview screen.

    Response:
    {
      "free_ai_interviews_remaining": 2,
      "subscription_ai_interviews_remaining": 8,
      "has_unlimited_ai": false,
      "ai_subscription_expires_at": "2026-06-30T00:00:00Z",
      "pricing": { "5": 5, "15": 10, "30": 20 },
      "token_balance": 45
    }
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from ai_interviews.service.quota_service import AI_INTERVIEW_PRICING
        from wallet.services import TokenService
        from candidates.models import CandidateProfile

        try:
            profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"detail": "Candidate profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        wallet = TokenService.get_or_create_wallet(request.user)

        return Response(
            {
                "free_ai_interviews_remaining": profile.free_ai_interviews_remaining,
                "subscription_ai_interviews_remaining": profile.subscription_ai_interviews_remaining,
                "has_unlimited_ai": profile.has_unlimited_ai,
                "ai_subscription_expires_at": profile.ai_subscription_expires_at,
                "pricing": {str(k): v for k, v in AI_INTERVIEW_PRICING.items()},
                "token_balance": wallet.balance,
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Candidate AI Interview History
# ---------------------------------------------------------------------------

from rest_framework.pagination import PageNumberPagination


class AIInterviewHistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class CandidateAIInterviewHistoryAPIView(APIView):
    """
    GET /api/ai-interview/sessions/history/

    Returns a paginated list of the authenticated candidate's AI interview
    sessions, newest first.

    Query params (all optional):
      - status        filter by session status (COMPLETED, CANCELLED, etc.)
      - round_type    filter by round type (BEHAVIORAL, CODING, etc.)
      - page          page number (default 1)
      - page_size     results per page (default 10, max 50)
    """

    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        qs = (
            AIInterviewSession.objects.filter(user=request.user)
            .select_related("role", "final_report")
            .order_by("-created_at")
        )

        # Optional filters
        status_filter = request.query_params.get("status")
        round_type_filter = request.query_params.get("round_type")

        if status_filter:
            qs = qs.filter(status=status_filter.upper())

        if round_type_filter:
            qs = qs.filter(round_type=round_type_filter.upper())

        paginator = AIInterviewHistoryPagination()
        page = paginator.paginate_queryset(qs, request)

        serializer = CandidateAIInterviewHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
