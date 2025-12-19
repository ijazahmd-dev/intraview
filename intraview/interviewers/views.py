from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import InterviewerApplication
from .serializers import (
    InterviewerApplicationCreateSerializer,
    InterviewerApplicationAdminSerializer,
)
from authentication.permissions import IsAdminRole  # adjust import


class InterviewerApplicationCreateView(APIView):
    """
    POST /api/interviewer/apply/
    Authenticated normal user submits an application.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InterviewerApplicationCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "Interviewer application submitted successfully."},
                status=status.HTTP_201_CREATED,
            )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterviewerApplicationStatusView(APIView):
    """
    GET /api/interviewer/status/
    Returns current user's interviewer-application status.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            app = request.user.interviewer_application
        except InterviewerApplication.DoesNotExist:
            return Response(
                {"status": "NOT_APPLIED"},
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": app.status,
                "rejection_reason": app.rejection_reason,
                "submitted_at": app.created_at,
            },
            status=status.HTTP_200_OK,
        )


# ---------- Admin-facing APIs ----------


class AdminInterviewerApplicationListView(ListAPIView):
    """
    GET /api/admin/interviewer-applications/
    List all applications for review.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = InterviewerApplicationAdminSerializer
    queryset = InterviewerApplication.objects.all()
    # you can later add filtering by ?status=PENDING


class AdminInterviewerApplicationDetailView(RetrieveAPIView):
    """
    GET /api/admin/interviewer-applications/<id>/
    Detailed view of a single application.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = InterviewerApplicationAdminSerializer
    queryset = InterviewerApplication.objects.all()
    lookup_url_kwarg = "application_id"


class AdminReviewInterviewerApplicationView(APIView):
    """
    POST /api/admin/interviewer-applications/<id>/review/

    Body:
    {
        "action": "approve" | "reject",
        "rejection_reason": "optional when reject"
    }
    """

    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, application_id):
        action = request.data.get("action")
        rejection_reason = request.data.get("rejection_reason", "")

        try:
            app = InterviewerApplication.objects.get(id=application_id)
        except InterviewerApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=404)

        if app.status != InterviewerApplication.STATUS_PENDING:
            return Response(
                {"detail": "This application has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == "approve":
            app.status = InterviewerApplication.STATUS_APPROVED

            # Promote user to interviewer role (depends on your user model)
            app.user.role = "interviewer"
            app.user.save()

        elif action == "reject":
            if not rejection_reason:
                return Response(
                    {"detail": "Rejection reason is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            app.status = InterviewerApplication.STATUS_REJECTED
            app.rejection_reason = rejection_reason

        else:
            return Response({"detail": "Invalid action."}, status=400)

        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()

        return Response({"message": f"Application {action}d successfully."})
    



class InterviewerApplicationEligibilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            app = request.user.interviewer_application
        except InterviewerApplication.DoesNotExist:
            return Response({"can_apply": True})

        if app.status == "REJECTED":
            return Response({
                "can_apply": True,
                "previous_rejection_reason": app.rejection_reason
            })

        return Response({
            "can_apply": False,
            "status": app.status
        })

