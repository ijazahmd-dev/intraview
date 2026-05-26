# admin_dashboard/urls.py
"""
URL routing for Admin Dashboard API.

All endpoints are registered under the ViewSet and will be
prefixed with /api/admin-dashboard/ by the root URL config.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(
    r"",
    views.AdminDashboardViewSet,
    basename="admin-dashboard",
)

urlpatterns = [
    path("", include(router.urls)),
]
