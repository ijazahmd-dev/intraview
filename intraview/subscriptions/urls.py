from django.urls import path
from . import views

urlpatterns = [
    path("subscriptions/me/",views.UserCurrentSubscriptionAPIView.as_view(),name="user-current-subscription",),
    path(
        "subscriptions/plans/",
        views.SubscriptionPlanListAPIView.as_view(),
        name="subscription-plan-list",
    ),
]