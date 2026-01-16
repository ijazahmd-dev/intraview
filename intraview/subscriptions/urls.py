from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_admin

router = DefaultRouter()
router.register(r"plans", views_admin.AdminSubscriptionPlanViewSet, basename="admin-subscription-plans")

urlpatterns = [

    #admin urls
    path("", include(router.urls)),







    #USER urls
    path("subscriptions/me/",views.UserCurrentSubscriptionAPIView.as_view(),name="user-current-subscription",),
    path(
        "subscriptions/plans/",
        views.SubscriptionPlanListAPIView.as_view(),
        name="subscription-plan-list",
    ),
]