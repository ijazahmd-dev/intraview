# progress/urls.py
"""
URL routing for Candidate Progress Dashboard.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(
    r"dashboard",
    views.CandidateProgressDashboardViewSet,
    basename="candidate-progress",
)

urlpatterns = [
    path("", include(router.urls)),
]
