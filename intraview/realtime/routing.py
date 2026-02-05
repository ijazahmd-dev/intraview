from django.urls import path
from .consumers import InterviewConsumer

websocket_urlpatterns = [
    path("ws/interview/<int:booking_id>/", InterviewConsumer.as_asgi()),
]