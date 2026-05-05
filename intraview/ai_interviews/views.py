# ai_interviews/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions

from .models import AIInterviewSession
from ai_interviews.serializers import RoleSerializer, RoleDetailSerializer, AIInterviewSessionStartSerializer, AIInterviewSessionJoinResponseSerializer, AIInterviewSessionSerializer, AgentTurnCreateSerializer
from ai_interviews.service.services import RoleService, AIInterviewSessionService, AIInterviewTurnService
from .tasks import evaluate_turn

# Adjust this import to where your auth class lives:
# from core.authentication import MultiRoleJWTAuthentication
from authentication.authentication import CookieJWTAuthentication, MultiRoleJWTAuthentication


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

    permission_classes = [IsAgentWithSharedSecret]

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