from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone


from .models import NotificationLog
from .serializers import NotificationSerializer
from authentication.authentication import MultiRoleJWTAuthentication


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Custom UI API for in-app notifications.

    - list: GET /api/notifications/
    - unread_count: GET /api/notifications/unread-count/
    - mark_read: POST /api/notifications/{id}/mark-read/
    - mark_all_read: POST /api/notifications/mark-all-read/
    """

    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [MultiRoleJWTAuthentication]
    serializer_class = NotificationSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = NotificationLog.objects.filter(
            recipient=user,
            status="SENT",  # show only notifications that were successfully sent
            is_read=False,
        ).order_by("-created_at")

        unread_only = self.request.query_params.get("unread_only")
        if unread_only in ("true", "1", "yes"):
            qs = qs.filter(is_read=False)

        return qs

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request, *args, **kwargs):
        user = request.user
        count = NotificationLog.objects.filter(
            recipient=user, is_read=False, status="SENT"
        ).count()
        return Response({"count": count})

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None, *args, **kwargs):
        notification = self.get_object()
        notification.mark_sent()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request, *args, **kwargs):
        user = request.user
        qs = NotificationLog.objects.filter(
            recipient=user, is_read=False, status="SENT"
        )
        qs.update(is_read=True, read_at=timezone.now())  # you can set read_at=timezone.now() if you want

        return Response({"status": "ok"})