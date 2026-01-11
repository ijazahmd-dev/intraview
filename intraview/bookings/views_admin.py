from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response


from authentication.authentication import AdminCookieJWTAuthentication
from authentication.permissions import IsAdminRole

from .models import InterviewBooking
from .serializers import AdminInterviewBookingSerializer, AdminBookingDetailSerializer
from .filters import AdminInterviewBookingFilter

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter


class AdminInterviewBookingListAPIView(generics.ListAPIView):
    """
    Admin-only: Read-only booking list with filters.
    """

    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    serializer_class = AdminInterviewBookingSerializer
    queryset = (
        InterviewBooking.objects
        .select_related("candidate", "interviewer", "availability")
        .order_by("-created_at")
    )

    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter,
    ]
    filterset_class = AdminInterviewBookingFilter

    ordering_fields = [
        "created_at",
        "status",
        "token_cost",
    ]





class AdminBookingDetailAPIView(APIView):
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking.objects.select_related(
                "candidate", "interviewer", "availability", "interviewer__verification"),
                 id=booking_id
            )
        
        serializer = AdminBookingDetailAPIView(booking)
        return Response(serializer.data)