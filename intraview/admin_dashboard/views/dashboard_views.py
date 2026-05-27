# admin_dashboard/views.py
"""
Admin Dashboard — Views

Thin ViewSet that delegates all logic to service classes.
Each endpoint is a custom @action returning serialized analytics data.
Only authenticated admins can access these endpoints.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from admin_dashboard.permissions import AdminCookieJWTAuthentication, IsAdminRole
from admin_dashboard.constants import VALID_PERIODS, DEFAULT_PERIOD

from admin_dashboard.services import (
    OverviewService,
    RevenueService,
    InterviewAnalyticsService,
    InterviewerHealthService,
    ModerationService,
    FinanceService,
    SubscriptionService,
    GrowthService,
)

from admin_dashboard.serializers import (
    OverviewSerializer,
    RevenueSerializer,
    InterviewAnalyticsSerializer,
    InterviewerHealthSerializer,
    ModerationSerializer,
    FinanceSerializer,
    SubscriptionSerializer,
    GrowthSerializer,
)


class AdminDashboardViewSet(viewsets.ViewSet):
    """
    Admin Dashboard API.

    All endpoints return read-only analytics computed from
    the platform's existing data. Only authenticated admins
    (role='admin') can access these endpoints.

    Endpoints:
        GET /api/admin-dashboard/overview/
        GET /api/admin-dashboard/revenue/?period=monthly
        GET /api/admin-dashboard/interviews/
        GET /api/admin-dashboard/interviewers/
        GET /api/admin-dashboard/moderation/
        GET /api/admin-dashboard/finance/
        GET /api/admin-dashboard/subscriptions/
        GET /api/admin-dashboard/growth/?period=monthly
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    # ────────────────────────────────────────────────────────
    # 1. KPI Overview
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        """
        GET /api/admin-dashboard/overview/

        Returns high-level KPI cards: user stats, interview stats,
        support metrics, and business/revenue KPIs.
        """
        data = OverviewService.get_overview()
        serializer = OverviewSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 2. Revenue Analytics
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="revenue")
    def revenue(self, request):
        """
        GET /api/admin-dashboard/revenue/?period=daily|weekly|monthly|yearly

        Returns revenue summary, time-series trends, and
        breakdown by source (peer/AI/subscriptions).
        """
        period = request.query_params.get("period", DEFAULT_PERIOD)
        if period not in VALID_PERIODS:
            return Response(
                {
                    "detail": f"Invalid period. Use one of: {', '.join(sorted(VALID_PERIODS))}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = RevenueService.get_revenue(period=period)
        serializer = RevenueSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 3. Interview Analytics
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="interviews")
    def interviews(self, request):
        """
        GET /api/admin-dashboard/interviews/

        Returns interview counts, completion funnel, rates,
        performance averages, top interviewers, and risky interviewers.
        """
        data = InterviewAnalyticsService.get_analytics()
        serializer = InterviewAnalyticsSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 4. Interviewer Health
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="interviewers")
    def interviewers(self, request):
        """
        GET /api/admin-dashboard/interviewers/

        Returns interviewer ecosystem health: status distribution,
        top performers, risky interviewers, and verification queue.
        """
        data = InterviewerHealthService.get_health()
        serializer = InterviewerHealthSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 5. Moderation / Reports
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="moderation")
    def moderation(self, request):
        """
        GET /api/admin-dashboard/moderation/

        Returns issue/report status breakdown, most reported
        interviewers, and complaint category trends.
        """
        data = ModerationService.get_moderation()
        serializer = ModerationSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 6. Finance (Payouts & Refunds)
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="finance")
    def finance(self, request):
        """
        GET /api/admin-dashboard/finance/

        Returns payout status breakdown with amounts,
        and refund totals.
        """
        data = FinanceService.get_finance()
        serializer = FinanceSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 7. Subscription Analytics
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="subscriptions")
    def subscriptions(self, request):
        """
        GET /api/admin-dashboard/subscriptions/

        Returns subscription health: active/expired counts,
        renewal rate, and subscription revenue.
        """
        data = SubscriptionService.get_subscriptions()
        serializer = SubscriptionSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ────────────────────────────────────────────────────────
    # 8. Platform Growth
    # ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="growth")
    def growth(self, request):
        """
        GET /api/admin-dashboard/growth/?period=daily|weekly|monthly|yearly

        Returns time-series growth charts for users,
        interviews, and revenue.
        """
        period = request.query_params.get("period", DEFAULT_PERIOD)
        if period not in VALID_PERIODS:
            return Response(
                {
                    "detail": f"Invalid period. Use one of: {', '.join(sorted(VALID_PERIODS))}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = GrowthService.get_growth(period=period)
        serializer = GrowthSerializer(instance=data)
        return Response(serializer.data, status=status.HTTP_200_OK)
