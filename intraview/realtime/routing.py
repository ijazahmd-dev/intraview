from django.urls import path, re_path
from .consumers import InterviewConsumer, TestConsumer

websocket_urlpatterns = [
    # path("ws/interview/<int:booking_id>/", InterviewConsumer.as_asgi()),
    re_path(r'ws/test/$', TestConsumer.as_asgi()),

]