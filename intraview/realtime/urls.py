from django.urls import path
from realtime import views

urlpatterns = [

    path(
        "zego/token/<int:booking_id>/",
        views.ZegoTokenAPIView.as_view()
    ),
    path(
        "zego/disconnect/<int:booking_id>/",
        views.ZegoDisconnectAPIView.as_view(),
        name="zego-disconnect",
    ),
    path(
        "interviewer-notes/<int:booking_id>/",
        views.InterviewerNoteAPIView.as_view(),
        name="interviewer-notes",
    ),
    path(
        "interview/finish/<int:booking_id>/",
        views.FinishInterviewAPIView.as_view(),
        name="finish-interview",
    ),

    



]