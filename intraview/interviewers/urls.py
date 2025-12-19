from django.urls import path
from . import views

urlpatterns = [
    # User
    path("interviewer/apply/", views.InterviewerApplicationCreateView.as_view(), name="interviewer-apply"),
    path("interviewer/status/", views.InterviewerApplicationStatusView.as_view(), name="interviewer-status"),
    path("interviewer/eligibility/", views.InterviewerApplicationEligibilityView.as_view(), name="interviewer-eligibility"),


    # Admin
    path("admin/interviewer-applications/",views.AdminInterviewerApplicationListView.as_view(),name="admin-interviewer-application-list",),
    path("admin/interviewer-applications/<int:application_id>/",views.AdminInterviewerApplicationDetailView.as_view(),name="admin-interviewer-application-detail",),
    path("admin/interviewer-applications/<int:application_id>/review/",views.AdminReviewInterviewerApplicationView.as_view(),name="admin-interviewer-application-review",),
]
