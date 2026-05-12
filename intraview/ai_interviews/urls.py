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

    path("session/<int:session_id>/runtime-state/",views.InterviewRuntimeStateView.as_view(),name="ai-interview-runtime-state",),
    path("session/<int:session_id>/runtime-ownership/acquire/",views.AcquireRuntimeOwnershipView.as_view(),name="ai-interview-runtime-acquire",),
    path("session/<int:session_id>/runtime-ownership/heartbeat/",views.RuntimeHeartbeatView.as_view(),name="ai-interview-runtime-heartbeat",),
    path("session/<int:session_id>/runtime-ownership/validate/",views.ValidateRuntimeOwnershipView.as_view(),name="ai-interview-runtime-validate",),
    path("session/<int:session_id>/runtime-ownership/release/",views.ReleaseRuntimeOwnershipView.as_view(),name="ai-interview-runtime-release",),
    
    path("session/<int:pk>/",views.AIInterviewSessionDetailAPIView.as_view(),name="ai-session-detail",),
    path("session/<int:pk>/report/",views.AIInterviewFinalReportAPIView.as_view(),name="ai-session-report",),
    path("turns/<int:turn_id>/evaluation/", views.AIInterviewTurnEvaluationDetailAPIView.as_view(), name="ai-turn-evaluation-detail"),
    path("session/<int:pk>/evaluations/", views.AIInterviewSessionEvaluationsAPIView.as_view(), name="ai-session-evaluations"),
]