from django.urls import path
from . import views



urlpatterns = [

    path(
        "interviewer-subscriptions/plans/",
        views.InterviewerSubscriptionPlanListAPIView.as_view(),
        name="interviewer-subscription-plans",
    ),

    # ✅ Current subscription
    path(
        "interviewer-subscriptions/me/",
        views.InterviewerCurrentSubscriptionAPIView.as_view(),
        name="interviewer-current-subscription",
    ),

]