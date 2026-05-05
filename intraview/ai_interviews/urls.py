# ai_interviews/urls.py

from django.urls import path

from . import views


app_name = "ai_interviews"

urlpatterns = [
    path("roles/featured/", views.FeaturedRoleListAPIView.as_view(), name="roles-featured"),
    path("roles/search/", views.RoleSearchAPIView.as_view(), name="roles-search"),
    path("roles/<slug:slug>/", views.RoleDetailAPIView.as_view(), name="roles-detail"),
    path("session/start/",views.AIInterviewSessionStartAPIView.as_view(),name="ai-session-start",),
    path("session/<int:pk>/join/",views.AIInterviewSessionJoinAPIView.as_view(),name="ai-session-join",),
    path("session/<int:pk>/end/",views.AIInterviewSessionEndAPIView.as_view(),name="ai-session-end",),
    path("ping/",views.PingAPIView.as_view(),name="ai-ping",),
    path("session/<int:session_id>/turns/",views.RecordTurnFromAgentView.as_view(),name="ai-interview-record-turn",),
]