from django.urls import path
from . import views
from. import views_admin




urlpatterns = [
    path(
        "candidates/interviewers/",
        views.CandidateInterviewerListAPIView.as_view(),
    ),
    path(
        "candidates/interviewers/<int:interviewer_id>/availability/",
        views.CandidateInterviewerAvailabilityAPIView.as_view(),
    ),
    path(
        "bookings/<int:booking_id>/cancel/",
        views.CancelInterviewBookingAPIView.as_view(),
    ),
    path(
        "bookings/<int:booking_id>/complete/",
        views.CompleteInterviewBookingAPIView.as_view(),
    ),
    path(
        "bookings/<int:booking_id>/cancel-by-interviewer/",
        views.InterviewerCancelBookingAPIView.as_view(),
        name="interviewer-cancel-booking",
    ),






    #Admin urls################################
    path(
        "admin/bookings/",
        views_admin.AdminInterviewBookingListAPIView.as_view(),
        name="admin-bookings-list",
    ),
    path(
        "admin/bookings/<int:booking_id>/",
        views_admin.AdminBookingDetailAPIView.as_view(),
        name="admin-booking-detail",
    ),
]