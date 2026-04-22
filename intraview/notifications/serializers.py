from rest_framework import serializers

from .models import NotificationLog


class NotificationSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    body = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = [
            "id",
            "event_type",
            "channel",
            "status",
            "payload",
            "title",
            "body",
            "is_read",
            "created_at",
            "read_at",
            "correlation_id",
        ]

    def get_title(self, obj: NotificationLog) -> str:
        # We stored title/body inside payload in NotificationService
        return (obj.payload or {}).get("title") or ""

    def get_body(self, obj: NotificationLog) -> str:
        return (obj.payload or {}).get("body") or ""