from rest_framework.permissions import BasePermission
from .models import InterviewerStatus


class IsAdminRole(BasePermission):
    """
    Allows access only to authenticated users with role='admin'.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )
    


class IsActiveInterviewer(BasePermission):
    """
    Only ACTIVE interviewers can access dashboard / sessions / earnings
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "interviewer"
            and request.user.interviewer_status == InterviewerStatus.ACTIVE
        )


class IsOnboardingInterviewer(BasePermission):
    """
    APPROVED but not onboarded interviewers can access onboarding APIs
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "interviewer"
            and request.user.interviewer_status in [
                InterviewerStatus.APPROVED_NOT_ONBOARDED,
                InterviewerStatus.ACTIVE,
            ]
        )