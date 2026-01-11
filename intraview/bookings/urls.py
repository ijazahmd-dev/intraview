from django.urls import path
from . import views
from. import views_admin
from. import views_interviewer




urlpatterns = [
    path("candidates/interviewers/",views.CandidateInterviewerListAPIView.as_view(),),
    path("candidates/interviewers/<int:interviewer_id>/availability/",views.CandidateInterviewerAvailabilityAPIView.as_view(),),
    path("bookings/<int:booking_id>/cancel/",views.CancelInterviewBookingAPIView.as_view(),),
    path("bookings/<int:booking_id>/complete/",views.CompleteInterviewBookingAPIView.as_view(),),
    path("bookings/<int:booking_id>/cancel-by-interviewer/",views.InterviewerCancelBookingAPIView.as_view(),name="interviewer-cancel-booking",),
    path("dashboard/candidate/upcoming/", views.CandidateUpcomingInterviewsAPIView.as_view()),
    path("dashboard/candidate/history/", views.CandidatePastInterviewsAPIView.as_view()),
    path("dashboard/candidate/token-summary/", views.CandidateTokenSummaryAPIView.as_view()),


    

    ########################## Interviewer Urls ############################
    path("bookings/<int:booking_id>/cancel-by-interviewer/",views_interviewer.InterviewerCancelBookingAPIView.as_view(),name="interviewer-cancel-booking",),
    path("dashboard/interviewer/upcoming/", views_interviewer.InterviewerUpcomingSessionsAPIView.as_view()),
    path("dashboard/interviewer/history/", views_interviewer.InterviewerHistoryAPIView.as_view()),




    #Admin urls################################
    path("admin/bookings/",views_admin.AdminInterviewBookingListAPIView.as_view(),name="admin-bookings-list",),
    path("admin/bookings/<int:booking_id>/",views_admin.AdminBookingDetailAPIView.as_view(),name="admin-booking-detail",),
]