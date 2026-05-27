# admin_dashboard/views/booking_views.py
"""
Admin Session Management — Views

Thin ViewSet. All business logic lives in booking_service.py.
Only authenticated admins (via AdminCookieJWTAuthentication + IsAdminRole) can access these.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_dashboard.permissions import AdminCookieJWTAuthentication, IsAdminRole
from admin_dashboard.services.booking_service import (
    SessionOverviewService,
    SessionListService,
    SessionDetailService,
    SessionActionService,
)
from admin_dashboard.serializers.booking_serializers import (
    SessionKPISerializer,
    SessionListResponseSerializer,
    SessionDetailSerializer,
    SessionActionInputSerializer,
    SessionActionResponseSerializer,
)
from bookings.models import InterviewBooking


class AdminSessionViewSet(viewsets.ViewSet):
    """
    Admin Session Management ViewSet.

    Endpoints:
        GET  /api/admin-dashboard/sessions/overview/         → KPI cards
        GET  /api/admin-dashboard/sessions/                  → Paginated table
        GET  /api/admin-dashboard/sessions/<pk>/             → Full inspection
        POST /api/admin-dashboard/sessions/<pk>/action/      → Safe admin actions
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    # ────────────────────────────────────────────────────────────
    # FEATURE 1 — KPI Overview
    # ────────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        """
        GET /api/admin-dashboard/sessions/overview/

        Returns KPI cards for the session overview panel.
        """
        data = SessionOverviewService.get_kpis()
        serializer = SessionKPISerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────────
    # FEATURE 2 — Session List (Table)
    # ────────────────────────────────────────────────────────────

    def list(self, request):
        """
        GET /api/admin-dashboard/sessions/

        Query parameters:
            status          → filter by booking status
            payment_status  → filter by payment status
            reschedule_status → filter by reschedule status
            start_date      → filter by start_datetime date (YYYY-MM-DD)
            end_date        → filter by start_datetime date (YYYY-MM-DD)
            search          → full-text search (id, names, emails)
            ordering        → sort field (prefix with - for DESC)
            page            → page number (default 1)
            page_size       → page size (default 20, max 100)
        """
        data = SessionListService.get_sessions(request.query_params)
        serializer = SessionListResponseSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────────
    # FEATURE 3 — Session Detail
    # ────────────────────────────────────────────────────────────

    def retrieve(self, request, pk=None):
        """
        GET /api/admin-dashboard/sessions/<pk>/

        Returns the full session inspection object with all 9 sections.
        """
        try:
            data = SessionDetailService.get_session_detail(booking_id=pk)
        except InterviewBooking.DoesNotExist:
            return Response(
                {"detail": f"Booking #{pk} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SessionDetailSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────────
    # FEATURE 4 — Quick Admin Actions
    # ────────────────────────────────────────────────────────────

    @action(detail=True, methods=["post"], url_path="action")
    def session_action(self, request, pk=None):
        """
        POST /api/admin-dashboard/sessions/<pk>/action/

        Body (JSON):
            {
                "action": "mark_for_review" | "escalate_session"
                          | "add_internal_note" | "flag_risky_session",
                "note": "Optional context"   (required for add_internal_note)
            }

        Safe actions only — no booking status mutation.
        """
        input_serializer = SessionActionInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(
                input_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated = input_serializer.validated_data
        action_name = validated["action"]
        payload = {"note": validated.get("note", "")}

        try:
            result = SessionActionService.apply_action(
                booking_id=pk,
                action=action_name,
                payload=payload,
                admin_user=request.user,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SessionActionResponseSerializer(instance=result)
        return Response(serializer.data, status=status.HTTP_200_OK)
