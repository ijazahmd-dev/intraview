from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone


from .models import NotificationLog
from .serializers import NotificationSerializer
from .realtime import NotificationCountPublisher
from authentication.authentication import MultiRoleJWTAuthentication


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Custom UI API for in-app notifications.

    - list:            GET  /api/notifications/
    - unread_count:    GET  /api/notifications/unread-count/
    - ws_token:        GET  /api/notifications/ws-token/
    - mark_read:       POST /api/notifications/{id}/mark-read/
    - mark_all_read:   POST /api/notifications/mark-all-read/
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

    @action(detail=False, methods=["get"], url_path="ws-token")
    def ws_token(self, request, *args, **kwargs):
        """
        Returns the raw JWT access token for WebSocket authentication.

        The server reads the appropriate HttpOnly cookie and returns its value
        so the frontend can pass it as a ?token= query parameter when opening
        a WebSocket connection.  This is safe because this endpoint itself
        requires authentication to reach.

        The frontend should:
          1. Call GET /api/notifications/ws-token/
          2. Use the returned token as ?token=<value> in the WS URL
          3. NOT store the token in localStorage — use it immediately
        """
        # Determine which cookie holds the user's access token.
        # Try cookies in priority order (candidate → interviewer → admin).
        token_value = None
        for cookie_name in ("access_token", "interviewer_access_token", "admin_access_token"):
            val = request.COOKIES.get(cookie_name)
            if val:
                token_value = val
                break

        if not token_value:
            # User is authenticated (Django DRF confirmed it) but no cookie found —
            # this can happen if they authenticated via Authorization header (rare).
            return Response(
                {"detail": "No cookie-based token available for WebSocket auth."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"token": token_value})

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None, *args, **kwargs):
        notification = self.get_object()
        was_unread = not notification.is_read

        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])

        # Push updated count via WebSocket only if state actually changed
        if was_unread:
            NotificationCountPublisher.push_count(request.user.id)

        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request, *args, **kwargs):
        user = request.user
        updated_count = NotificationLog.objects.filter(
            recipient=user, is_read=False, status="SENT"
        ).update(is_read=True, read_at=timezone.now())

        # Push updated count (always 0 after marking all) only if there was
        # something to mark, to avoid redundant WebSocket events.
        if updated_count > 0:
            NotificationCountPublisher.push_count(user.id)

        return Response({"status": "ok"})