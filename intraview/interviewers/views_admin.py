from rest_framework.generics import ListAPIView, RetrieveAPIView
from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole
from .serializers import InterviewerVerificationDetailSerializer
from .models import InterviewerVerification,VerificationStatus
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response






class AdminInterviewerVerificationListView(ListAPIView):
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = InterviewerVerificationDetailSerializer

    def get_queryset(self):
        qs = InterviewerVerification.objects.select_related("user")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by("-submitted_at")
    



class AdminInterviewerVerificationDetailView(RetrieveAPIView):
    """
    GET /api/admin/interviewer-verifications/<id>/
    Used by admin to preview the uploaded document & see all metadata.
    """
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = InterviewerVerificationDetailSerializer
    queryset = InterviewerVerification.objects.select_related("user")
    lookup_field = "id"
    




class AdminReviewInterviewerVerificationView(APIView):
    """
    POST /api/admin/interviewer-verifications/<id>/review/
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, verification_id):
        action = request.data.get("action")
        rejection_reason = request.data.get("rejection_reason", "")

        try:
            verification = InterviewerVerification.objects.get(id=verification_id)
        except InterviewerVerification.DoesNotExist:
            return Response({"detail": "Verification not found."}, status=404)

        if verification.status != VerificationStatus.PENDING:
            return Response(
                {"detail": "This verification has already been reviewed."},
                status=400,
            )

        if action == "approve":
            verification.status = VerificationStatus.APPROVED

        elif action == "reject":
            if not rejection_reason:
                return Response(
                    {"detail": "Rejection reason is required."},
                    status=400,
                )
            verification.status = VerificationStatus.REJECTED
            verification.rejection_reason = rejection_reason

        else:
            return Response({"detail": "Invalid action."}, status=400)

        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        verification.save()

        return Response({"message": f"Verification {action}d successfully."})