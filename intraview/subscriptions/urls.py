from django.urls import path
from . import views

urlpatterns = [
    path(
        "subscriptons/me/",views.UserCurrentSubscriptionAPIView.as_view(),name="user-current-subscription",),
]