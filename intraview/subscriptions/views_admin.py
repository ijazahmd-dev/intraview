from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import SubscriptionPlan
from .serializers import AdminSubscriptionPlanSerializer
from authentication.permissions import IsAdminRole
from authentication.authentication import AdminCookieJWTAuthentication




class AdminSubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for SubscriptionPlan
    + Soft delete using is_active flag
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminSubscriptionPlanSerializer

    queryset = SubscriptionPlan.objects.all().order_by("price_inr")

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """
        Soft delete (disable) a plan
        """
        plan = self.get_object()
        plan.is_active = False
        plan.save(update_fields=["is_active", "updated_at"])

        return Response(
            {"message": "Plan deactivated (soft deleted).", "id": plan.id},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """
        Re-enable a plan
        """
        plan = self.get_object()
        plan.is_active = True
        plan.save(update_fields=["is_active", "updated_at"])

        return Response(
            {"message": "Plan activated.", "id": plan.id},
            status=status.HTTP_200_OK,
        )