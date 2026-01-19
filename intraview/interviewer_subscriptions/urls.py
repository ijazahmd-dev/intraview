from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_admin


router = DefaultRouter()
router.register(
    r"interviewer-subscription-plans",
    views_admin.AdminInterviewerSubscriptionPlanViewSet,
    basename="admin-interviewer-subscription-plans",
)
router.register(
    r"interviewer-subscriptions",
    views_admin.AdminInterviewerSubscriptionViewSet,
    basename="admin-interviewer-subscriptions",
)



urlpatterns = [


    # admin urls
    path("", include(router.urls)),







    path(
        "plans/",
        views.InterviewerSubscriptionPlanListAPIView.as_view(),
        name="interviewer-subscription-plans",
    ),

    # ✅ Current subscription
    path(
        "me/",
        views.InterviewerCurrentSubscriptionAPIView.as_view(),
        name="interviewer-current-subscription",
    ),
    path('invoice/<str:internal_order_id>/', views.InterviewerSubscriptionInvoiceDownloadAPIView.as_view(), name='interviewer-invoice-download'),

]