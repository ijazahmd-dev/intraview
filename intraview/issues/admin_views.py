from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SessionIssue
from .services import IssueService
from .admin_serializers import (
    AdminIssueListSerializer,
    AdminIssueDetailSerializer,
    AdminIssueStatusUpdateSerializer,
    AdminIssueResolveSerializer,
    AdminIssueActionSerializer,
)
from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole
from rest_framework.permissions import IsAuthenticated

User = get_user_model()



class AdminIssueListAPIView(generics.ListAPIView):
    """
    GET /api/issues/admin/

    Query params:
      - status
      - priority
      - issue_type
      - search (booking id, email)
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminIssueListSerializer

    def get_queryset(self):
        qs = SessionIssue.objects.select_related(
            "booking", "raised_by", "against_user"
        )

        status_param = self.request.query_params.get("status")
        priority_param = self.request.query_params.get("priority")
        issue_type_param = self.request.query_params.get("issue_type")
        search = self.request.query_params.get("search")

        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if issue_type_param:
            qs = qs.filter(issue_type=issue_type_param)

        if search:
            search = search.strip()
            qs = qs.filter(
                Q(booking_id__iexact=search)
                | Q(raised_by__email__icontains=search)
                | Q(against_user__email__icontains=search)
            )

        return qs


class AdminIssueDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/issues/admin/<issue_id>/
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminIssueDetailSerializer
    lookup_url_kwarg = "issue_id"

    def get_queryset(self):
        return SessionIssue.objects.select_related(
            "booking", "raised_by", "against_user", "resolved_by"
        )


class AdminIssueStatusUpdateAPIView(APIView):
    """
    PATCH /api/issues/admin/<issue_id>/status/

    Body: { "status": "...", "admin_notes": "..." }
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, issue_id: int):
        issue = generics.get_object_or_404(SessionIssue, id=issue_id)
        serializer = AdminIssueStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        admin_notes = serializer.validated_data.get("admin_notes", "")

        updated_issue = IssueService.update_status(
            issue=issue,
            new_status=new_status,
            admin_user=request.user,
            admin_notes=admin_notes,
        )

        return Response(
            AdminIssueDetailSerializer(updated_issue).data,
            status=status.HTTP_200_OK,
        )


class AdminIssueResolveAPIView(APIView):
    """
    POST /api/issues/admin/<issue_id>/resolve/

    Body: { "resolution": "...", "action_taken": "..." }
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, issue_id: int):
        issue = generics.get_object_or_404(SessionIssue, id=issue_id)
        serializer = AdminIssueResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resolution = serializer.validated_data["resolution"]
        action_taken = serializer.validated_data.get("action_taken", "")

        updated_issue = IssueService.resolve_issue(
            issue=issue,
            admin_user=request.user,
            resolution=resolution,
            action_taken=action_taken,
        )

        return Response(
            AdminIssueDetailSerializer(updated_issue).data,
            status=status.HTTP_200_OK,
        )


class AdminIssueActionAPIView(APIView):
    """
    POST /api/issues/admin/<issue_id>/action/

    Body: { "action_type": "...", "amount": ?, "percent": ?, "target_user_id": ? }
    Currently logs the action into admin_notes and sets status=ACTION_TAKEN.
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, issue_id: int):
        issue = generics.get_object_or_404(SessionIssue, id=issue_id)
        serializer = AdminIssueActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        action_type = data["action_type"]
        amount = data.get("amount")
        percent = data.get("percent")
        target_user_id = data.get("target_user_id")

        target_user = None
        if target_user_id is not None:
            target_user = generics.get_object_or_404(User, id=target_user_id)

        updated_issue, summary = IssueService.apply_admin_action(
            issue=issue,
            action_type=action_type,
            admin_user=request.user,
            amount=amount,
            percent=percent,
            target_user=target_user,
        )

        return Response(
            AdminIssueDetailSerializer(updated_issue).data,
            status=status.HTTP_200_OK,
        )