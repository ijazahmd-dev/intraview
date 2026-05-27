# admin_dashboard/urls.py
"""
URL routing for Admin Dashboard API.

All endpoints are registered under two routers:
  1. analytics_router  → existing AdminDashboardViewSet (overview, revenue, etc.)
  2. sessions_router   → new AdminSessionViewSet (session management)

Both are prefixed with /api/admin-dashboard/ by the root URL config.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from .views.booking_views import AdminSessionViewSet

# ── Router 1: Existing analytics dashboard ─────────────────────
analytics_router = DefaultRouter()
analytics_router.register(
    r"",
    views.AdminDashboardViewSet,
    basename="admin-dashboard",
)

# ── Router 2: Session management / booking intelligence ─────────
sessions_router = DefaultRouter()
sessions_router.register(
    r"sessions",
    AdminSessionViewSet,
    basename="admin-sessions",
)

urlpatterns = [
    path("", include(analytics_router.urls)),
    path("", include(sessions_router.urls)),
]
