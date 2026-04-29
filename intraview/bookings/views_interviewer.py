from django.utils import timezone
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import timedelta, datetime

from .models import InterviewBooking, RescheduleStatus
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

from django.db.models import Case, When, IntegerField



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








# class InterviewerUpcomingSessionsAPIView(APIView):
#     authentication_classes = [InterviewerCookieJWTAuthentication]
#     permission_classes = [IsAuthenticated, IsActiveInterviewer]

#     def get(self, request):
#         qs = (
#             InterviewBooking.objects
#             .filter(
#                 interviewer=request.user,
#                 status=InterviewBooking.Status.CONFIRMED,
#             )
#             .select_related("candidate", "availability")
#             .order_by("start_datetime")
#         )

#         serializer = InterviewerUpcomingSerializer(qs, many=True)
#         return Response(serializer.data)
    






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




























class InterviewerUpcomingSessionsAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes     = [IsAuthenticated, IsActiveInterviewer]
 
    def get(self, request):
        qs = (
            InterviewBooking.objects
            .filter(
                interviewer=request.user,
                status=InterviewBooking.Status.CONFIRMED,
            )
            .select_related(
                "candidate",
                "availability",
                "proposed_availability",
            )
            # Pending reschedule requests float to the top, then by start time
            .order_by(
                # PENDING = "PENDING" sorts before "NONE" alphabetically,
                # but we want PENDING first regardless. Use a Case expression.
                # Simplest portable approach: annotate a priority integer.
            )
        )
 
        # Python-side sort: PENDING first, then chronological
        bookings = qs.annotate(
            priority=Case(
                When(reschedule_status="PENDING", then=0),
                default=1,
                output_field=IntegerField()
            )
        ).order_by("priority", "start_datetime")
 
        serializer = InterviewerUpcomingSerializer(bookings, many=True)
        return Response(serializer.data)
 
 
# ─── POST /api/bookings/<booking_id>/reschedule/accept/ ──────────────────────
 
class InterviewerAcceptRescheduleView(APIView):
    """
    POST /api/bookings/<booking_id>/reschedule/accept/
 
    Interviewer accepts the candidate's reschedule request.
 
    Behaviour:
        Case A — candidate proposed a specific slot:
            • Re-validate slot capacity under lock.
            • Update booking.availability, start_datetime, end_datetime.
            • Increment reschedule_count.
            • Reset reschedule_status → NONE.
 
        Case B — candidate sent an open-preference request (no slot):
            • The interviewer cannot accept without a slot.
            • They must open a new availability slot first, then the candidate
              will see it and can raise a new request.
            • Return 400 with a clear message.
 
    On success the booking is fully updated and the candidate should be notified.
    """
 
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes     = [IsAuthenticated, IsActiveInterviewer]
 
    def post(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            interviewer=request.user,
        )
 
        # ── Guard: must be a PENDING request ─────────────────────────────────
        if booking.reschedule_status != RescheduleStatus.PENDING:
            return Response(
                {"detail": "No pending reschedule request for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Guard: no-slot request — cannot accept without a slot ────────────
        if booking.proposed_availability is None:
            return Response(
                {
                    "detail": (
                        "The candidate did not propose a specific slot. "
                        "Please open a new availability slot and ask the candidate "
                        "to raise a new reschedule request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if booking.status not in [
            InterviewBooking.Status.PENDING,
            InterviewBooking.Status.CONFIRMED,
        ]:
            return Response(
                {"detail": "Cannot reschedule this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        with transaction.atomic():
            # Lock both rows
            booking = (
                InterviewBooking.objects
                .select_for_update()
                .get(id=booking.id)
            )
 
            if booking.reschedule_status != RescheduleStatus.PENDING:
                return Response(
                    {"detail": "Reschedule request is no longer pending."},
                    status=status.HTTP_409_CONFLICT,
                )
 
            new_slot = (
                InterviewerAvailability.objects
                .select_for_update()
                .get(id=booking.proposed_availability_id)
            )
 
            # Re-validate slot under lock
            if not new_slot.is_active:
                return Response(
                    {"detail": "The proposed slot is no longer active."},
                    status=status.HTTP_409_CONFLICT,
                )
 
            if new_slot.remaining_capacity() <= 0:
                return Response(
                    {"detail": "The proposed slot is now fully booked."},
                    status=status.HTTP_409_CONFLICT,
                )
 
            now = timezone.now()
 
            new_start = timezone.make_aware(
                datetime.combine(new_slot.date, new_slot.start_time)
            )
            new_end = timezone.make_aware(
                datetime.combine(new_slot.date, new_slot.end_time)
            )
 
            # Apply the reschedule
            booking.availability     = new_slot
            booking.start_datetime   = new_start
            booking.end_datetime     = new_end
            booking.reschedule_count += 1
            booking.reschedule_requested_at   = now
            booking.rescheduled_by   = "CANDIDATE"   # candidate initiated
 
            # Clear the request
            booking.reschedule_status       = RescheduleStatus.NONE
            booking.proposed_availability   = None
            booking.reschedule_reason       = ""
 
            booking.save(update_fields=[
                "availability",
                "start_datetime",
                "end_datetime",
                "reschedule_count",
                "reschedule_requested_at",
                "rescheduled_by",
                "reschedule_status",
                "proposed_availability",
                "reschedule_reason",
                "updated_at",
            ])
 
        logger.info(
            "Reschedule ACCEPTED: booking=%s interviewer=%s new_slot=%s",
            booking.id,
            request.user.id,
            new_slot.id,
        )
 
        # TODO: notify_reschedule_accepted.delay(booking.id)
 
        return Response(
            {
                "message": "Reschedule accepted. Booking updated.",
                "booking_id": booking.id,
                "new_slot": {
                    "availability_id": new_slot.id,
                    "date":            str(new_slot.date),
                    "start_time":      str(new_slot.start_time),
                    "end_time":        str(new_slot.end_time),
                    "start_datetime":  new_start.isoformat(),
                    "end_datetime":    new_end.isoformat(),
                },
                "reschedule_count": booking.reschedule_count,
            },
            status=status.HTTP_200_OK,
        )
 
 
# ─── POST /api/bookings/<booking_id>/reschedule/reject/ ──────────────────────
 
class InterviewerRejectRescheduleView(APIView):
    """
    POST /api/bookings/<booking_id>/reschedule/reject/
 
    Interviewer rejects the candidate's reschedule request.
 
    Body (optional):
        { "reason": "I am not available at the proposed time." }
 
    Behaviour:
        • reschedule_status  → NONE  (request cleared)
        • proposed_availability → null
        • The booking times remain completely unchanged.
        • reschedule_count is NOT incremented.
        • The rejection reason is stored in reschedule_reason so the
          candidate can read why it was declined.
    """
 
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes     = [IsAuthenticated, IsActiveInterviewer]
 
    def post(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            interviewer=request.user,
        )
 
        if booking.reschedule_status != RescheduleStatus.PENDING:
            return Response(
                {"detail": "No pending reschedule request for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        rejection_reason = (request.data.get("reason", "") or "").strip()[:500]
 
        with transaction.atomic():
            booking = (
                InterviewBooking.objects
                .select_for_update()
                .get(id=booking.id)
            )
 
            if booking.reschedule_status != RescheduleStatus.PENDING:
                return Response(
                    {"detail": "Reschedule request is no longer pending."},
                    status=status.HTTP_409_CONFLICT,
                )
 
            booking.reschedule_status     = RescheduleStatus.NONE
            booking.proposed_availability = None
            # Store the interviewer's reason so the candidate can see it
            booking.reschedule_reason     = (
                f"[Rejected] {rejection_reason}" if rejection_reason
                else "[Rejected] Interviewer declined the reschedule request."
            )
            booking.updated_at = timezone.now()
 
            booking.save(update_fields=[
                "reschedule_status",
                "proposed_availability",
                "reschedule_reason",
                "updated_at",
            ])
 
        logger.info(
            "Reschedule REJECTED: booking=%s interviewer=%s",
            booking.id,
            request.user.id,
        )
 
        # TODO: notify_reschedule_rejected.delay(booking.id)
 
        return Response(
            {
                "message":  "Reschedule request rejected. Booking time unchanged.",
                "booking_id": booking.id,
                "reason":   rejection_reason or None,
            },
            status=status.HTTP_200_OK,
        )
 