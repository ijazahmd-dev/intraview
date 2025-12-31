from django.urls import path
from . import views
from . import views_admin



urlpatterns = [
    # User
    path("interviewer/apply/", views.InterviewerApplicationCreateView.as_view(), name="interviewer-apply"),
    path("interviewer/status/", views.InterviewerApplicationStatusView.as_view(), name="interviewer-status"),
    path("interviewer/eligibility/", views.InterviewerApplicationEligibilityView.as_view(), name="interviewer-eligibility"),


    # Admin_interviewer application
    path("admin/interviewer-applications/",views.AdminInterviewerApplicationListView.as_view(),name="admin-interviewer-application-list",),
    path("admin/interviewer-applications/<int:application_id>/",views.AdminInterviewerApplicationDetailView.as_view(),name="admin-interviewer-application-detail",),
    path("admin/interviewer-applications/<int:application_id>/review/",views.AdminReviewInterviewerApplicationView.as_view(),name="admin-interviewer-application-review",),


    # user onboarding api
    path("interviewer/profile/", views.InterviewerProfileView.as_view()),
    path("interviewer/availability/",views.InterviewerAvailabilityListView.as_view(),),
    path("interviewer/availability/create/",views.InterviewerAvailabilityCreateView.as_view(),),
    path("interviewer/availability/<int:slot_id>/delete/",views.InterviewerAvailabilityDeleteView.as_view(),),
    path("interviewer/verification/",views.SubmitInterviewerVerificationView.as_view(),name="interviewer-verification",),
    path("interviewer/verification/status/",views.InterviewerVerificationStatusView.as_view(),name="interviewer-verification-status",),
    path("interviewer/onboarding/complete/",views.CompleteInterviewerOnboardingView.as_view(),name="interviewer-onboarding-complete",),
    path("interviewer/onboarding/status/",views.InterviewerOnboardingStatusView.as_view(),name="interviewer-onboarding-status",),



    # admin onboarding api
    path("admin/interviewer-verifications/",views_admin.AdminInterviewerVerificationListView.as_view(),name="admin-interviewer-verification-list",),
    path("admin/interviewer-verifications/<int:verification_id>/review/",views_admin.AdminReviewInterviewerVerificationView.as_view(),name="admin-interviewer-verification-review",),



    # Dashboard APIs
    path("interviewer/dashboard/",views.InterviewerDashboardSummaryView.as_view(),name="interviewer-dashboard-summary",),
    path("interviewer/me/profile/",views.InterviewerDashboardProfileView.as_view(),name="interviewer-dashboard-profile",),
    path("interviewer/me/profile-picture/",views.InterviewerProfilePictureView.as_view(),name="interviewer-profile-picture"),






]
