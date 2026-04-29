from django.urls import path
from . import views
from. import views_admin
from. import views_interviewer




urlpatterns = [
    path("candidates/interviewers/",views.CandidateInterviewerListAPIView.as_view(),),
    path("candidates/interviewers/<int:interviewer_id>/calendar/", views.CandidateInterviewerAvailabilityAPIView.as_view(), name='candidate-calendar-slots'),
    path("create-booking/", views.CreateInterviewBookingAPIView.as_view()),
    path("bookings/<int:booking_id>/cancel/",views.CancelInterviewBookingAPIView.as_view(),),
    path('bookings/<int:booking_id>/reschedule/', views.CandidateRescheduleBookingView.as_view(), name='candidate-reschedule-booking'),
    path("bookings/<int:booking_id>/complete/",views.CompleteInterviewBookingAPIView.as_view(),),
    path("dashboard/candidate/upcoming/", views.CandidateUpcomingInterviewsAPIView.as_view()),
    path("dashboard/candidate/history/", views.CandidatePastInterviewsAPIView.as_view()),
    path("dashboard/candidate/token-summary/", views.CandidateTokenSummaryAPIView.as_view()),
    path("candidates/interviewers/<int:interviewer_id>/",views.CandidateInterviewerDetailAPIView.as_view(),name="candidate-interviewer-detail",),
    path("candidate/token-balance/", views.CandidateTokenBalanceAPIView.as_view(), name="candidate-token-balance"),
    path("bookings-detail/<int:booking_id>/", views.BookingDetailAPIView.as_view()),

    path(
        "<int:booking_id>/reschedule/options/",
        views.CandidateRescheduleOptionsView.as_view(),
        name="candidate-reschedule-options",
    ),
    path(
        "<int:booking_id>/reschedule/request/",
        views.CandidateRescheduleRequestView.as_view(),
        name="candidate-reschedule-request",
    ),
    path(
        "<int:booking_id>/reschedule/notify-interviewer/",
        views.CandidateNotifyInterviewerForNewSlotView.as_view(),
        name="candidate-notify-interviewer-new-slot",
    ),


    

    ########################## Interviewer Urls ############################
    path("bookings/<int:booking_id>/cancel-by-interviewer/",views_interviewer.InterviewerCancelBookingAPIView.as_view(),name="interviewer-cancel-booking",),
    path('bookings/<int:booking_id>/reschedule/', views_interviewer.InterviewerRescheduleBookingView.as_view(), name='interviewer-reschedule-booking'),
    path("dashboard/interviewer/upcoming/", views_interviewer.InterviewerUpcomingSessionsAPIView.as_view()),
    path("dashboard/interviewer/history/", views_interviewer.InterviewerHistoryAPIView.as_view()),
    path("dashboard/interviewer/bookings/<int:booking_id>/",views_interviewer.InterviewerBookingDetailAPIView.as_view(),name="interviewer-booking-detail",),

    # ── Interviewer: NEW accept/reject reschedule ────────────── # NEW ───────
    path(
        "<int:booking_id>/reschedule/accept/",
        views_interviewer.InterviewerAcceptRescheduleView.as_view(),
        name="interviewer-accept-reschedule",
    ),
    path(
        "<int:booking_id>/reschedule/reject/",
        views_interviewer.InterviewerRejectRescheduleView.as_view(),
        name="interviewer-reject-reschedule",
    ),
    





    #Admin urls################################
    path("admin/bookings/",views_admin.AdminInterviewBookingListAPIView.as_view(),name="admin-bookings-list",),
    path("admin/bookings/<int:booking_id>/",views_admin.AdminBookingDetailAPIView.as_view(),name="admin-booking-detail",),






    #Video call Authentication Booking
    path('bookings/<int:booking_id>/', views.BookingDetailsView.as_view(), name='booking-details'),

]