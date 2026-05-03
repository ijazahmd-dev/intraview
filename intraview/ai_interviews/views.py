# ai_interviews/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from ai_interviews.serializers import RoleSerializer, RoleDetailSerializer, AIInterviewSessionStartSerializer, AIInterviewSessionJoinResponseSerializer, AIInterviewSessionSerializer
from ai_interviews.service.services import RoleService, AIInterviewSessionService

# Adjust this import to where your auth class lives:
# from core.authentication import MultiRoleJWTAuthentication
from authentication.authentication import CookieJWTAuthentication, MultiRoleJWTAuthentication


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
