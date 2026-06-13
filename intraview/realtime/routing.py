# realtime/routing.py

from django.urls import re_path
from .consumers import NotificationCountConsumer, TestConsumer

websocket_urlpatterns = [
    # Real-time notification unread count — user-specific, authenticated
    re_path(r"^ws/notifications/$", NotificationCountConsumer.as_asgi()),

    # Development echo consumer
    re_path(r"^ws/test/$", TestConsumer.as_asgi()),
]