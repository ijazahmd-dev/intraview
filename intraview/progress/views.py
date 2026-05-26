# progress/views.py
"""
Candidate Progress Dashboard — Views

Thin ViewSet that delegates all logic to CandidateProgressService.
Each endpoint is a custom @action returning serialized analytics data.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from authentication.authentication import CookieJWTAuthentication
from authentication.permissions import IsCandidateRole

from .services import CandidateProgressService
from .serializers import (
    OverviewStatsSerializer,
    GrowthDataPointSerializer,
    SkillBreakdownSerializer,
    StrengthsWeaknessesSerializer,
    InterviewHistoryItemSerializer,
)


class InterviewHistoryPagination(PageNumberPagination):
    """Pagination for interview history endpoint."""
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class CandidateProgressDashboardViewSet(viewsets.ViewSet):
    """
    Candidate Progress Dashboard API.

    All endpoints return analytics computed from the authenticated
    candidate's peer and AI interview data.

    Endpoints:
        GET /api/progress/dashboard/overview/
        GET /api/progress/dashboard/growth/?source=all|peer|ai
        GET /api/progress/dashboard/skills/
        GET /api/progress/dashboard/strengths-weaknesses/
        GET /api/progress/dashboard/history/?source=all|peer|ai
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    # ────────────────────────────────────────────────────────
    # 1. Overview Statistics
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        """
        GET /api/progress/dashboard/overview/

        Returns high-level dashboard stats: total sessions,
        average score, practice hours, readiness score & level.
        """
        data = CandidateProgressService.get_overview_stats(request.user)
        serializer = OverviewStatsSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 2. Growth Analytics
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="growth")
    def growth(self, request):
        """
        GET /api/progress/dashboard/growth/?source=all|peer|ai

        Returns monthly trend data for skill scores.
        Supports filtering by source (peer, ai, or all).
        """
        source = request.query_params.get("source", "all")
        if source not in ("all", "peer", "ai"):
            return Response(
                {"detail": "Invalid source. Use 'all', 'peer', or 'ai'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = CandidateProgressService.get_growth_analytics(
            request.user, source=source
        )
        serializer = GrowthDataPointSerializer( instance=data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 3. Skill Breakdown
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="skills")
    def skills(self, request):
        """
        GET /api/progress/dashboard/skills/

        Returns average per-skill scores from peer evaluations.
        Designed to power a frontend radar chart.
        """
        data = CandidateProgressService.get_skill_breakdown(request.user)
        serializer = SkillBreakdownSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 4. Strengths & Weaknesses
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="strengths-weaknesses")
    def strengths_weaknesses(self, request):
        """
        GET /api/progress/dashboard/strengths-weaknesses/

        Classifies skills as strengths or weaknesses based on
        configurable score thresholds.
        """
        # Allow custom thresholds via query params (optional)
        try:
            strength_th = float(
                request.query_params.get("strength_threshold", 4.0)
            )
            weakness_th = float(
                request.query_params.get("weakness_threshold", 3.0)
            )
        except (ValueError, TypeError):
            strength_th, weakness_th = 4.0, 3.0

        data = CandidateProgressService.get_strengths_weaknesses(
            request.user,
            strength_threshold=strength_th,
            weakness_threshold=weakness_th,
        )
        serializer = StrengthsWeaknessesSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 5. Interview History (paginated)
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        """
        GET /api/progress/dashboard/history/?source=all|peer|ai&page=1

        Returns paginated interview history with scores,
        interviewer names, and feedback summaries.
        """
        source = request.query_params.get("source", "all")
        if source not in ("all", "peer", "ai"):
            return Response(
                {"detail": "Invalid source. Use 'all', 'peer', or 'ai'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the full history list from the service
        history_list = CandidateProgressService.get_interview_history_qs(
            request.user, source=source
        )

        # Manual pagination over the list
        paginator = InterviewHistoryPagination()
        page = paginator.paginate_queryset(history_list, request)

        if page is not None:
            serializer = InterviewHistoryItemSerializer( instance=page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = InterviewHistoryItemSerializer( instance=history_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
