from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    InterviewerSubscriptionPlan,
    InterviewerSubscription,
    InterviewerSubscriptionStatus,
)

from .serializers import (
    AdminInterviewerSubscriptionPlanSerializer,
    AdminInterviewerSubscriptionSerializer,
)
from authentication.permissions import IsAdminRole
from authentication.authentication import AdminCookieJWTAuthentication






class AdminInterviewerSubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for Interviewer Subscription Plans.
    Soft delete is done by setting is_active=False.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    authentication_classes = [AdminCookieJWTAuthentication]
    serializer_class = AdminInterviewerSubscriptionPlanSerializer
    queryset = InterviewerSubscriptionPlan.objects.all().order_by("price_inr")

    def destroy(self, request, *args, **kwargs):
        """
        Block hard delete. Use deactivate instead.
        """
        return Response(
            {"detail": "Hard delete not allowed. Use /deactivate/ instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        plan = self.get_object()
        plan.is_active = True
        plan.save(update_fields=["is_active", "updated_at"])
        return Response(
            {"message": "Plan activated successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        plan = self.get_object()
        plan.is_active = False
        plan.save(update_fields=["is_active", "updated_at"])
        return Response(
            {"message": "Plan deactivated successfully."},
            status=status.HTTP_200_OK,
        )









class AdminInterviewerSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Admin management for InterviewerSubscription records.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    authentication_classes = [AdminCookieJWTAuthentication]
    serializer_class = AdminInterviewerSubscriptionSerializer

    queryset = (
        InterviewerSubscription.objects
        .select_related("interviewer", "plan")
        .all()
        .order_by("-created_at")
    )

    def destroy(self, request, *args, **kwargs):
        """
        We block deleting subscription history.
        """
        return Response(
            {"detail": "Hard delete not allowed for subscriptions."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    def mark_expired(self, request, pk=None):
        """
        Admin force-expire subscription immediately.
        """
        sub = self.get_object()

        if sub.status != InterviewerSubscriptionStatus.ACTIVE:
            return Response(
                {"detail": "Only ACTIVE subscriptions can be expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sub.status = InterviewerSubscriptionStatus.EXPIRED
        sub.end_date = timezone.now()
        sub.save(update_fields=["status", "end_date", "updated_at"])

        return Response(
            {"message": "Subscription marked as expired."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def mark_cancelled(self, request, pk=None):
        """
        Admin cancel subscription.
        """
        sub = self.get_object()

        if sub.status != InterviewerSubscriptionStatus.ACTIVE:
            return Response(
                {"detail": "Only ACTIVE subscriptions can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sub.status = InterviewerSubscriptionStatus.CANCELLED
        sub.end_date = timezone.now()
        sub.save(update_fields=["status", "end_date", "updated_at"])

        return Response(
            {"message": "Subscription cancelled successfully."},
            status=status.HTTP_200_OK,
        )