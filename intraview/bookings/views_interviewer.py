from django.utils import timezone
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import timedelta, datetime

from .models import InterviewBooking
from .serializers import InterviewerCancelBookingSerializer, InterviewerUpcomingSerializer, InterviewerBookingDetailSerializer, InterviewerCompletedSessionSerializer, InterviewerRescheduleSerializer
from authentication.authentication import InterviewerCookieJWTAuthentication
from wallet.models import TokenTransactionType,TokenTransaction
from django.db import models
from wallet.services import TokenService
from wallet.models import TokenTransactionType, TokenWallet
from interviewers.models import InterviewerAvailability

from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer

from django.db import transaction
from rest_framework import status



logger = logging.getLogger(__name__)

RESCHEDULE_LIMIT_HOURS = 3
TOKEN_COST = 10
MAX_RESCHEDULES = 3




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
                    InterviewBooking.Status.COMPLETED,
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
    



from rest_framework_simplejwt.authentication import JWTAuthentication


class InterviewerRescheduleBookingView(APIView):

    print("the reschedule view is starting now")

    
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    authentication_classes = [InterviewerCookieJWTAuthentication]

    def post(self, request, booking_id):
        print("booking_id:", booking_id)
        logger.info(f"🔑 User: {request.user}, Auth: {getattr(request.user, 'id', 'Anonymous')}")
        print(f"🔑 USER: {request.user}")
        print(f"🔑 USER ID: {getattr(request.user, 'id', 'None')}")
        print(f"🔑 IS AUTH: {request.user.is_authenticated}")
        print(f"🔑 HEADERS: {request.headers}")  # DEBUG
        print(f"🔑 COOKIES: {request.COOKIES}")   # DEBUG
        print(f"🔑 USER: {request.user}")   
        with transaction.atomic():

            # 🔒 Lock booking (FIXED ownership filter)
            try:
                booking = (
                    InterviewBooking.objects
                    .select_for_update()
                    .select_related("availability", "candidate", "interviewer")
                    .get(
                        id=booking_id,
                        interviewer=request.user, 
                        status=InterviewBooking.Status.CONFIRMED,
                    )
                )
            except InterviewBooking.DoesNotExist:
                return Response(
                    {"detail": "Booking not found or access denied."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            #  Reschedule spam protection
            if booking.reschedule_count >= MAX_RESCHEDULES:
                return Response(
                    {"detail": f"Maximum {MAX_RESCHEDULES} reschedules allowed per booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            now = timezone.now()

            #  Session checks
            if booking.start_datetime <= now:
                return Response(
                    {"detail": "Cannot reschedule past or ongoing sessions."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if booking.start_datetime - now < timedelta(hours=RESCHEDULE_LIMIT_HOURS):
                return Response(
                    {"detail": f"Cannot reschedule within {RESCHEDULE_LIMIT_HOURS} hours of session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            #  Save OLD availability for logging (FIX #3)
            old_availability = booking.availability

            #  Serializer validation
            serializer = InterviewerRescheduleSerializer(
                data=request.data,
                context={"booking": booking}
            )
            serializer.is_valid(raise_exception=True)

            new_availability = serializer.validated_data["new_availability"]
            reason = serializer.validated_data.get("reason", "").strip()[:500]

            #  Lock new availability
            new_avail_locked = InterviewerAvailability.objects.select_for_update().get(
                id=new_availability.id
            )

            #  Commit-time safety checks (FIX #4)
            if not new_avail_locked.is_active:
                return Response({"detail": "Selected slot deactivated."}, status=status.HTTP_409_CONFLICT)

            # Extra ownership check (safety)
            if new_avail_locked.interviewer_id != booking.interviewer_id:
                return Response({"detail": "Invalid slot selection."}, status=status.HTTP_400_BAD_REQUEST)

            if new_avail_locked.remaining_capacity() <= 0:
                return Response({"detail": "No capacity left in selected slot."}, status=status.HTTP_409_CONFLICT)

            # Aware snapshot datetimes
            start_dt_aware = timezone.make_aware(
                datetime.combine(new_avail_locked.date, new_avail_locked.start_time)
            )
            end_dt_aware = timezone.make_aware(
                datetime.combine(new_avail_locked.date, new_avail_locked.end_time)
            )

            #  Update (FIX #2: Correct update_fields)
            booking.availability = new_avail_locked
            booking.start_datetime = start_dt_aware
            booking.end_datetime = end_dt_aware
            booking.rescheduled_at = now
            booking.reschedule_reason = reason
            booking.rescheduled_by = "INTERVIEWER"  
            booking.reschedule_count += 1

            booking.save(update_fields=[
                "availability",  
                "start_datetime",
                "end_datetime",
                "rescheduled_at",
                "reschedule_reason",
                "rescheduled_by", 
                "reschedule_count",
                "updated_at",
            ])

           
            logger.info(
                "Interviewer %s rescheduled booking %s from availability=%s (%s) to availability=%s (%s)",
                request.user.id,
                booking.id,
                old_availability.id,
                old_availability.date,
                new_avail_locked.id,
                new_avail_locked.date,
            )

        return Response({
            "message": "Session rescheduled successfully!",
            "booking_id": booking.id,
            "status": booking.status,
            "new_slot": {
                "availability_id": new_avail_locked.id,
                "date": new_avail_locked.date,
                "start_time": new_avail_locked.start_time,
                "end_time": new_avail_locked.end_time,
                "timezone": new_avail_locked.timezone,
                "start_datetime": start_dt_aware.isoformat(),
                "end_datetime": end_dt_aware.isoformat(),
            },
            "reschedule_count": booking.reschedule_count,
            "tokens_locked": TOKEN_COST,
            "max_reschedules": MAX_RESCHEDULES
        }, status=status.HTTP_200_OK)
