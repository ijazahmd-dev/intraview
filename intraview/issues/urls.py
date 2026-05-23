from __future__ import annotations

from django.urls import path

from . import candidate_views, interviewer_views, admin_views

app_name = "issues"

urlpatterns = [
    # Candidate endpoints
    path(
        "candidate/bookings/<int:booking_id>/raise/",
        candidate_views.CandidateRaiseIssueAPIView.as_view(),
        name="candidate-raise-issue",
    ),
    path(
        "candidate/my/",
        candidate_views.CandidateIssueListAPIView.as_view(),
        name="candidate-issue-list",
    ),
    path(
        "candidate/<int:issue_id>/",
        candidate_views.CandidateIssueDetailAPIView.as_view(),
        name="candidate-issue-detail",
    ),

    # Interviewer endpoints
    path(
        "interviewer/bookings/<int:booking_id>/raise/",
        interviewer_views.InterviewerRaiseIssueAPIView.as_view(),
        name="interviewer-raise-issue",
    ),
    path(
        "interviewer/my/",
        interviewer_views.InterviewerIssueListAPIView.as_view(),
        name="interviewer-issue-list",
    ),
    path(
        "interviewer/<int:issue_id>/",
        interviewer_views.InterviewerIssueDetailAPIView.as_view(),
        name="interviewer-issue-detail",
    ),

    path(
        "admin/",
        admin_views.AdminIssueListAPIView.as_view(),
        name="admin-issue-list",
    ),
    path(
        "admin/<int:issue_id>/",
        admin_views.AdminIssueDetailAPIView.as_view(),
        name="admin-issue-detail",
    ),
    path(
        "admin/<int:issue_id>/status/",
        admin_views.AdminIssueStatusUpdateAPIView.as_view(),
        name="admin-issue-status-update",
    ),
    path(
        "admin/<int:issue_id>/resolve/",
        admin_views.AdminIssueResolveAPIView.as_view(),
        name="admin-issue-resolve",
    ),
    path(
        "admin/<int:issue_id>/action/",
        admin_views.AdminIssueActionAPIView.as_view(),
        name="admin-issue-action",
    ),
]