
from django.urls import path

from feedbacks import candidate_views,interviewer_views


urlpatterns = [

    path("candidate/reviews/bookings/<int:booking_id>/submit/",candidate_views.SubmitInterviewerReviewAPIView.as_view(),name="submit-interviewer-review",),
    path("candidate/evaluations/",candidate_views.CandidateEvaluationListAPIView.as_view(),name="candidate-evaluation-list",),
    path("candidate/evaluations/<int:evaluation_id>/",candidate_views.CandidateEvaluationDetailAPIView.as_view(),name="candidate-evaluation-detail",),
    path("candidate/reviews/<int:review_id>/",candidate_views.CandidateReviewDetailAPIView.as_view(),name="candidate-review-detail",),

    #Interviewer urls
    path("interviewer/evaluations/bookings/<int:booking_id>/submit/",interviewer_views.SubmitCandidateEvaluationAPIView.as_view(),name="submit-evaluation"),
    path("interviewer/evaluations/",interviewer_views.InterviewerEvaluationListAPIView.as_view(),name="evaluation-list"),
    path("interviewer/evaluations/<int:evaluation_id>/",interviewer_views.InterviewerEvaluationDetailAPIView.as_view(),name="evaluation-detail"),

]

