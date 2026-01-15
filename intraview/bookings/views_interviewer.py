from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import InterviewBooking
from .serializers import InterviewerCancelBookingSerializer, InterviewerUpcomingSerializer, InterviewerBookingDetailSerializer, InterviewerCompletedSessionSerializer
from authentication.authentication import InterviewerCookieJWTAuthentication
from wallet.models import TokenTransactionType,TokenTransaction
from django.db import models
from wallet.services import TokenService
from wallet.models import TokenTransactionType, TokenWallet

from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer

from django.db import transaction
from rest_framework import status






class InterviewerCancelBookingAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def post(self, request, booking_id):
        serializer = InterviewerCancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]

        try:
            with transaction.atomic():
                # 🔒 Lock booking
                booking = (
                    InterviewBooking.objects
                    .select_for_update()
                    .select_related("candidate", "interviewer", "availability")
                    .get(id=booking_id)
                )

                # 🔐 Ownership check
                if booking.interviewer != request.user:
                    return Response(
                        {"detail": "You are not allowed to cancel this booking."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                # 🔁 Idempotency
                if booking.status != InterviewBooking.Status.CONFIRMED:
                    return Response(
                        {"detail": "Only confirmed bookings can be cancelled."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # ⏱ Time gate
                if booking.start_datetime <= timezone.now():
                    return Response(
                        {"detail": "Cannot cancel a started or completed session."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # 🔒 Lock candidate wallet
                candidate_wallet = TokenService.get_or_create_wallet(
                    booking.candidate
                )
                candidate_wallet = TokenWallet.objects.select_for_update().get(
                    id=candidate_wallet.id
                )

                # 🔓 Unlock tokens back to candidate
                TokenService.unlock_tokens(
                    wallet=candidate_wallet,
                    amount=booking.token_cost,
                    transaction_type= TokenTransactionType.BOOKING_CANCEL_INTERVIEWER ,
                    reference_id=f"booking_{booking.id}",
                    note="Booking cancelled by interviewer",
                )

                # 📝 Update booking
                booking.status = InterviewBooking.Status.CANCELLED_BY_INTERVIEWER
                booking.cancellation_reason = reason
                booking.cancelled_at = timezone.now()
                booking.save(
                    update_fields=[
                        "status",
                        "cancellation_reason",
                        "cancelled_at",
                    ]
                )

        except InterviewBooking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": "Booking cancelled successfully.",
                "tokens_refunded": booking.token_cost,
            },
            status=status.HTTP_200_OK,
        )








class InterviewerUpcomingSessionsAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        qs = (
            InterviewBooking.objects
            .filter(
                interviewer=request.user,
                status=InterviewBooking.Status.CONFIRMED,
            )
            .select_related("candidate", "availability")
            .order_by("start_datetime")
        )

        serializer = InterviewerUpcomingSerializer(qs, many=True)
        return Response(serializer.data)
    






class InterviewerHistoryAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        qs = (
            InterviewBooking.objects
            .filter(
                interviewer=request.user,
                status__in=[
                    InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                    InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                    InterviewBooking.Status.CANCELLED
                ]
            )
            .select_related("candidate", "availability")
            .order_by("-end_datetime")
        )

        earned = (
            TokenTransaction.objects
            .filter(
                wallet=request.user.token_wallet,
                transaction_type=TokenTransactionType.SESSION_EARN,
            )
            .aggregate(total=models.Sum("amount"))["total"] or 0
        )

        serializer = InterviewerCompletedSessionSerializer(qs, many=True)

        return Response({
            "completed_sessions": serializer.data,
            "completed_sessions_count": qs.count(),
            "tokens_earned": earned,
        })














class InterviewerBookingDetailAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking.objects.select_related("candidate", "availability"),
            id=booking_id,
            interviewer=request.user,   # ✅ interviewer ownership protection
        )

        serializer = InterviewerBookingDetailSerializer(booking)
        return Response(serializer.data)