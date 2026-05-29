from django.shortcuts import render
import logging
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
import pytz


from authentication.models import CustomUser, InterviewerStatus
from interviewers.models import InterviewerAvailability
from authentication.authentication import InterviewerCookieJWTAuthentication,CookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer
from .models import InterviewBooking, RescheduleStatus
from wallet.services import TokenService
from wallet.models import TokenTransactionType, TokenWallet, TokenTransaction
from subscriptions.services.entitlement_service import SubscriptionEntitlementService
from interviewers.models import InterviewerAvailability,InterviewerProfile, VerificationStatus
from interviewer_subscriptions.services.entitlement_service import InterviewerEntitlementService


from subscriptions.services.entitlement_service import (
    SubscriptionEntitlementService,
)
from interviewer_subscriptions.services.entitlement_service import InterviewerEntitlementService
from .serializers import (
    CandidateInterviewerListSerializer,
    CandidateAvailabilitySerializer,
    CandidatePastInterviewSerializer,
    CandidateUpcomingInterviewSerializer,
    CreateInterviewBookingSerializer, 
    CandidateInterviewerDetailSerializer,
    BookingDetailSerializer,
    CandidateRescheduleSerializer,
    AvailableSlotSerializer, 
    InterviewerRescheduleSerializer, 
    RescheduleRequestSerializer,
    NotifyInterviewerNewSlotSerializer
)

from django.utils.timezone import localtime
from notifications.events import emit_event
from notifications.constants import EventType






# Create your views here.


User = get_user_model()
logger = logging.getLogger(__name__)


class CandidateInterviewerListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        today = timezone.localdate()

        qs = (
            CustomUser.objects.filter(
                role="interviewer",
                interviewer_status=InterviewerStatus.ACTIVE,
                interviewer_profile__is_profile_public=True,
                interviewer_profile__is_accepting_bookings=True,

                # ✅ FIX HERE
                verification__status="APPROVED",

                availabilities__date__gte=today,
                availabilities__is_active=True,
            )
            .distinct()
            .select_related("interviewer_profile", "verification")  # ✅ Optional improvement
        )

        serializer = CandidateInterviewerListSerializer(qs, many=True)
        return Response(serializer.data)
    




class CandidateInterviewerDetailAPIView(APIView):
    """
    Candidate-facing interviewer profile detail API.
    Only returns profiles that are:
    - ACTIVE interviewers (interviewer_status=ACTIVE)
    - Public profile enabled
    - Accepting bookings enabled
    - Verification APPROVED
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, interviewer_id: int):
        # ✅ User must be an ACTIVE interviewer
        interviewer = get_object_or_404(
            CustomUser.objects.select_related("interviewer_profile", "verification"),
            id=interviewer_id,
            role="interviewer",
            interviewer_status="ACTIVE",
        )

        # ✅ Must have profile
        profile = get_object_or_404(
            InterviewerProfile,
            user=interviewer,
            is_profile_public=True,
            is_accepting_bookings=True,
        )

        # ✅ Must be verified
        # (If verification row may not exist, handle safely)
        if not hasattr(interviewer, "verification") or interviewer.verification.status != VerificationStatus.APPROVED:
            return Response(
                {"detail": "Interviewer is not verified."},
                status=404,
            )

        serializer = CandidateInterviewerDetailSerializer(profile)
        return Response(serializer.data)






class CandidateInterviewerAvailabilityAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, interviewer_id):
        print(f"🔍 DEBUG: interviewer_id={interviewer_id}")
        today = timezone.localdate()
        date_filter = request.query_params.get("date")
        print(f"🔍 DEBUG: today={today}, date_filter={date_filter}")

        # ✅ FIXED: Correct relation path (use your actual model structure)
        interviewer = get_object_or_404(
            CustomUser,
            id=interviewer_id,
            role="interviewer",
            interviewer_status=InterviewerStatus.ACTIVE,
            interviewer_profile__is_profile_public=True,
            interviewer_profile__is_accepting_bookings=True,
            verification__status="APPROVED",  
        )
        print(f"🔍 DEBUG: interviewer found={interviewer.username}")

        if not InterviewerEntitlementService.has_active_subscription(interviewer):
            print("🔍 DEBUG: No active subscription")
            return Response([], status=200)

        # ✅ FIXED: No remaining_capacity__gt=0 (method, not field)
        qs = InterviewerAvailability.objects.filter(
            interviewer=interviewer,
            is_active=True,
            date__gte=today,
        ).order_by("date", "start_time")
        print(f"🔍 DEBUG: RAW QS COUNT={qs.count()}")

        if date_filter:
            qs = qs.filter(date=date_filter)
        print(f"🔍 DEBUG: FINAL QS COUNT={qs.count()}")    

        serializer = CandidateAvailabilitySerializer(qs, many=True)

        
        # ✅ FIXED: Filter AFTER serialization
        data = [slot for slot in serializer.data if slot["remaining_capacity"] > 0]

        print(f"🔍 DEBUG: SERIALIZED {len(data)} slots")
        return Response(data)





class CreateInterviewBookingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateInterviewBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        availability = serializer.validated_data["availability_id"]
        candidate = request.user
        interviewer = availability.interviewer

        # -------------------------
        # Pre-checks (no DB writes)
        # -------------------------

        if candidate.id == interviewer.id:
            return Response(
                {"detail": "You cannot book yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not InterviewerEntitlementService.has_active_subscription(interviewer):
            return Response(
                {"detail": "Interviewer does not have an active interviewer subscription."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Dynamically calculate token cost: base_rate × (duration_minutes / 30)
        base_rate = interviewer.interviewer_profile.base_session_rate
        token_cost = availability.token_cost_for(base_rate)

        # -------------------------
        # Atomic section
        # -------------------------
        with transaction.atomic():

            # Lock availability row
            availability = InterviewerAvailability.objects.select_for_update().get(
                id=availability.id
            )

            if not availability.is_active:
                return Response(
                    {"detail": "Slot no longer available."},
                    status=status.HTTP_409_CONFLICT,
                )
            
            # today = timezone.localdate()
            # if availability.date <= today:
            #     return Response(
            #         {"detail": "You can only book sessions from tomorrow onwards."},
            #         status=status.HTTP_400_BAD_REQUEST,
            #     )


            if availability.remaining_capacity() <= 0:
                return Response(
                    {"detail": "Slot already fully booked."},
                    status=status.HTTP_409_CONFLICT,
                )

            # Get & lock wallet (correct pattern)
            wallet = TokenService.get_or_create_wallet(candidate)
            wallet = TokenWallet.objects.select_for_update().get(id=wallet.id)
            if wallet.balance < token_cost:
                return Response(
                    {"detail": "Insufficient token balance."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            # Lock tokens
            TokenService.lock_tokens(
                wallet=wallet,
                amount=token_cost,
                transaction_type=TokenTransactionType.BOOKING_LOCK,
                reference_id=f"availability_{availability.id}",
                note="Interview booking lock",
            )

            slot_tz = pytz.timezone(availability.timezone)

            start_naive = datetime.combine(
                availability.date,
                availability.start_time,
            )

            end_naive = datetime.combine(
                availability.date,
                availability.end_time,
            )

            start_aware = slot_tz.localize(start_naive)
            end_aware = slot_tz.localize(end_naive)

            # Create booking
            booking = InterviewBooking.objects.create(
                candidate=candidate,
                interviewer=interviewer,
                availability=availability,
                start_datetime=start_aware,
                end_datetime=end_aware,
                token_cost=token_cost,
                status=InterviewBooking.Status.CONFIRMED,
            )

            def emit_booking_event():
                emit_event(
                    EventType.INTERVIEW_BOOKED,
                    actor_id=candidate.id,
                    payload={
                        "booking_id": booking.id,
                        "candidate_id": candidate.id,
                        "interviewer_id": interviewer.id,
                        "start_time": localtime(booking.start_datetime).isoformat(),
                    },
                    correlation_id=f"booking:{booking.id}",
                )

            transaction.on_commit(emit_booking_event)
                                                                                            
        # -------------------------
        # Response
        # -------------------------

        return Response(
            {
                "booking_id": booking.id,
                "status": booking.status,
                "tokens_locked": token_cost,
                "duration_minutes": availability.duration_minutes,
            },
            status=status.HTTP_201_CREATED,
        )







class CancelInterviewBookingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, booking_id):
        user = request.user
        cancellation_reason = request.data.get('cancellation_reason', '').strip()

        with transaction.atomic():
            booking = (
                InterviewBooking.objects
                .select_for_update()
                .get(id=booking_id)
            )

            # Authorization
            if booking.candidate != user:
                return Response(
                    {"detail": "Not allowed."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Idempotency / state check
            if booking.status != InterviewBooking.Status.CONFIRMED:
                return Response(
                    {"detail": "Invalid booking state."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Time gate
            if booking.start_datetime <= timezone.now():
                return Response(
                    {"detail": "Cannot cancel started or completed bookings."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            now = timezone.now()
            
            cancel_deadline = booking.start_datetime - timedelta(hours=5)
            if now > cancel_deadline:
                return Response(
                    {"detail": "You can only cancel up to 5 hours before the session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
            
            if not cancellation_reason:
                return Response(
                    {"detail": "Cancellation reason is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Lock candidate wallet (correct pattern)
            wallet = TokenService.get_or_create_wallet(user)
            wallet_fresh = TokenWallet.objects.select_for_update().get(id=wallet.id)

            # Unlock tokens
            TokenService.unlock_tokens(
                wallet=wallet_fresh,
                amount=booking.token_cost,
                transaction_type=TokenTransactionType.BOOKING_RELEASE,
                reference_id=f"booking_{booking.id}",
                note="Booking cancelled by candidate",
            )

            booking.status = InterviewBooking.Status.CANCELLED_BY_CANDIDATE
            booking.cancellation_reason = cancellation_reason
            booking.cancelled_at = timezone.now()
            booking.save(update_fields=["status","cancellation_reason","cancelled_at"])

        return Response(
            {
            "status": "CANCELLED_BY_CANDIDATE",
            "message": "Booking cancelled successfully. Tokens refunded.",
            "tokens_refunded": booking.token_cost
            },
            status=status.HTTP_200_OK,
        )
    






class CompleteInterviewBookingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, booking_id):
        user = request.user

        with transaction.atomic():
            booking = (
                InterviewBooking.objects
                .select_for_update()
                .get(id=booking_id)
            )

            # Authorization
            if booking.interviewer != user:
                return Response(
                    {"detail": "Not allowed."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Idempotency / state check
            if booking.status != InterviewBooking.Status.CONFIRMED:
                return Response(
                    {"detail": "Invalid booking state."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Time gate
            if booking.end_datetime > timezone.now():
                return Response(
                    {"detail": "Session has not ended yet."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Lock candidate wallet
            from_wallet = TokenService.get_or_create_wallet(booking.candidate)
            from_wallet_fresh = TokenWallet.objects.select_for_update().get(
                id=from_wallet.id
            )

            # Lock interviewer wallet
            to_wallet = TokenService.get_or_create_wallet(booking.interviewer)
            to_wallet_fresh = TokenWallet.objects.select_for_update().get(
                id=to_wallet.id
            )

            # Transfer locked tokens
            TokenService.transfer_locked_tokens(
                from_wallet=from_wallet_fresh,
                to_wallet=to_wallet_fresh,
                amount=booking.token_cost,
                reference_id=f"booking_{booking.id}",
                note="Interview completed",
            )

            booking.status = InterviewBooking.Status.COMPLETED
            booking.save(update_fields=["status"])

        return Response(
            {"status": "COMPLETED"},
            status=status.HTTP_200_OK,
        )
    



class CandidateUpcomingInterviewsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        qs = (
            InterviewBooking.objects
            .filter(
                candidate=request.user,
                status=InterviewBooking.Status.CONFIRMED,
                end_datetime__gt=timezone.now(),
            )
            .select_related(
                "availability",
                "interviewer__interviewer_profile",
            )
            .order_by("start_datetime")
        )

        

        serializer = CandidateUpcomingInterviewSerializer(qs, many=True)
        return Response(serializer.data)
    




class CandidatePastInterviewsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        # qs = (
        #     InterviewBooking.objects
        #     .filter(
        #         candidate=request.user,
        #         status__in=[
        #             InterviewBooking.Status.COMPLETED,
        #             InterviewBooking.Status.CANCELLED,
        #             InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
        #             InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
        #         ],
        #     )
        #     .select_related(
        #         "availability",
        #         "interviewer__interviewer_profile",
        #     )
        #     .order_by("-created_at")
        # )
        now = timezone.now()
        qs = (
            InterviewBooking.objects
            .filter(candidate=request.user)
            .filter(
                models.Q(end_datetime__lte=now)
                | models.Q(status__in=[
                    InterviewBooking.Status.COMPLETED,
                    InterviewBooking.Status.CANCELLED,
                    InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                    InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                ])
            )
            .select_related(
                "availability",
                "interviewer__interviewer_profile",
            )
            .order_by("-start_datetime")
        )

        serializer = CandidatePastInterviewSerializer(qs, many=True)
        return Response(serializer.data)





class BookingDetailAPIView(APIView):
    permission_classes     = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking.objects.select_related(
                "candidate",
                "interviewer__interviewer_profile",
                "availability",
                "proposed_availability",   # ← needed for proposed_slot field
                "candidate_evaluation",
            ),
            id=booking_id,
        )

        # Only candidate or interviewer can view
        if booking.candidate != request.user and booking.interviewer != request.user:
            return Response(
                {"detail": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)



class CandidateTokenSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        spent = (
            TokenTransaction.objects
            .filter(
                wallet=request.user.token_wallet,
                transaction_type=TokenTransactionType.SESSION_SPEND,
            )
            .aggregate(total=models.Sum("amount"))["total"] or 0
        )

        return Response({
            "tokens_spent": abs(spent),
            "current_balance": request.user.token_balance,
        })
    



class CandidateTokenBalanceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        from wallet.services import TokenService
        
        wallet = TokenService.get_or_create_wallet(request.user)
        spent = (
            TokenTransaction.objects
            .filter(
                wallet=wallet,
                transaction_type=TokenTransactionType.SESSION_SPEND,
            )
            .aggregate(total=models.Sum("amount"))["total"] or 0
        )
        
        return Response({
            "token_balance": wallet.balance,
            "tokens_spent": abs(spent) if spent else 0,
            "tokens_available": wallet.balance,
        }, status=status.HTTP_200_OK)









class CandidateRescheduleInterviewApiView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, booking_id):
        booking = get_object_or_404(InterviewBooking, id=booking_id)
        availability_id = request.query_params.get("availability_id")
        if not availability_id:
            return Response(
                {"detail":"availability id is required"},
                status=status.HTTP_400_BAD_REQUEST
            ) 
        availability = get_object_or_404(InterviewerAvailability, id=availability_id)
        if availability.candidate != request.user:
            return Response(
                {"detail":"Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )
        if booking.candidate != request.user:
            return Response(
                {"detail":"Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )
        booking.availability = availability
        booking.save(update_fields=["availability", 'updated_at'])

        return Response(
            {
                "detail":"Availability updated"
            },
            status=status.HTTP_200_OK
        )









RESCHEDULE_LIMIT_HOURS = 3



class CandidateRescheduleBookingView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        with transaction.atomic():

            # 🔒 Lock booking row
            try:
                booking = (
                    InterviewBooking.objects
                    .select_for_update()
                    .select_related("availability", "interviewer", "candidate")
                    .get(
                        id=booking_id,
                        candidate=request.user,
                        status=InterviewBooking.Status.CONFIRMED,
                    )
                )
            except InterviewBooking.DoesNotExist:
                return Response(
                    {"detail": "Booking not found or access denied."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            now = timezone.now()

            # ✅ Snapshot time gate
            if booking.start_datetime <= now:
                return Response(
                    {"detail": "Cannot reschedule past or ongoing sessions."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ✅ 3 hour rule
            if booking.start_datetime - now < timedelta(hours=RESCHEDULE_LIMIT_HOURS):
                return Response(
                    {"detail": f"Cannot reschedule within {RESCHEDULE_LIMIT_HOURS} hours of session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ✅ Keep old slot for logging
            old_availability = booking.availability

            serializer = CandidateRescheduleSerializer(
                data=request.data,
                context={"booking": booking},
            )
            serializer.is_valid(raise_exception=True)

            new_availability = serializer.validated_data["new_availability"]
            reason = serializer.validated_data.get("reason", "").strip()[:500]

            # 🔒 Lock new availability row
            new_avail_locked = (
                InterviewerAvailability.objects
                .select_for_update()
                .get(id=new_availability.id)
            )

            # ✅ Commit-time re-check
            if not new_avail_locked.is_active:
                return Response(
                    {"detail": "Selected slot deactivated."},
                    status=status.HTTP_409_CONFLICT,
                )

            if new_avail_locked.remaining_capacity() <= 0:
                return Response(
                    {"detail": "No capacity left in selected slot."},
                    status=status.HTTP_409_CONFLICT,
                )

            # ✅ Save aware datetimes
            start_dt_aware = timezone.make_aware(
                datetime.combine(new_avail_locked.date, new_avail_locked.start_time)
            )
            end_dt_aware = timezone.make_aware(
                datetime.combine(new_avail_locked.date, new_avail_locked.end_time)
            )

            booking.availability = new_avail_locked
            booking.start_datetime = start_dt_aware
            booking.end_datetime = end_dt_aware
            booking.rescheduled_at = now
            booking.reschedule_reason = reason
            booking.reschedule_count += 1

            booking.save(update_fields=[
                "availability",  # ✅ FIXED
                "start_datetime",
                "end_datetime",
                "rescheduled_at",
                "reschedule_reason",
                "reschedule_count",
                "updated_at",
            ])

            logger.info(
                "Booking %s rescheduled by candidate=%s from availability=%s to availability=%s",
                booking.id,
                request.user.id,
                old_availability.id,
                new_avail_locked.id,
            )

        return Response(
            {
                "message": "Booking rescheduled successfully!",
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
                "tokens_locked": booking.token_cost,
            },
            status=status.HTTP_200_OK,
        )
    









############################################Video Call Bokings Code for authenticating the user############################################








from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from bookings.models import InterviewBooking
import logging
from authentication.authentication import MultiRoleJWTAuthentication

logger = logging.getLogger(__name__)

class BookingDetailsView(APIView):
    authentication_classes = [MultiRoleJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    

    def get(self, request, booking_id):
        logger.info(f"get_booking_details called - user: {request.user}, authenticated: {request.user.is_authenticated}, booking_id: {booking_id}")
        
        try:
            booking = InterviewBooking.objects.select_related(
                'candidate',
                'interviewer'
            ).get(id=booking_id)
        except InterviewBooking.DoesNotExist:
            logger.error(f"Booking {booking_id} not found")
            return Response(
                {"detail": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get user_id safely (handles AnonymousUser)
        user_id = request.user.id if request.user.is_authenticated else None
        logger.info(f"User ID: {user_id}, Candidate ID: {booking.candidate_id}, Interviewer ID: {booking.interviewer_id}")
        print("user_id:", user_id)

        # ✅ Authorization check (skips for AnonymousUser or unauthenticated)
        if user_id and user_id not in [booking.candidate_id, booking.interviewer_id]:
            logger.warning(f"User {user_id} not authorized for booking {booking.id}")
            return Response(
                {"detail": "You are not authorized to view this booking"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ Status validation
        allowed_statuses = ['CONFIRMED', 'LIVE']
        if booking.status not in allowed_statuses:
            return Response(
                {
                    "detail": f"Interview is {booking.status.lower()} and cannot be accessed",
                    "status": booking.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Determine user's role (default to 'viewer' for anonymous)
        user_role = "viewer"
        if user_id:
            user_role = "candidate" if user_id == booking.candidate_id else "interviewer"

        # ✅ Return booking data
        return Response({
            "id": booking.id,
            "status": booking.status,
            "start_datetime": booking.start_datetime,
            "user_role": user_role,
            "candidate": {
                "id": booking.candidate.id,
                "name": booking.candidate.get_full_name() or booking.candidate.email,
                "email": booking.candidate.email,
            },
            "interviewer": {
                "id": booking.interviewer.id,
                "name": booking.interviewer.get_full_name() or booking.interviewer.email,
                "email": booking.interviewer.email,
            },
        }, status=status.HTTP_200_OK)

































RESCHEDULE_MIN_HOURS_AHEAD = 2
RESCHEDULE_LIMIT           = 2
 
 
# ─── GET /api/bookings/<booking_id>/reschedule/options/ ──────────────────────
 
class CandidateRescheduleOptionsView(APIView):
    """
    GET /api/bookings/<booking_id>/reschedule/options/
 
    Returns the interviewer's available slots so the candidate can pick one,
    OR tells the candidate there are no slots (open-preference request).
 
    Response — Case A (slots exist):
    {
        "has_slots": true,
        "available_slots": [ { ...slot... }, ... ],
        "current_booking": {
            "start_datetime": "...",
            "end_datetime": "..."
        },
        "reschedule_count": 0,
        "reschedule_limit": 2,
        "can_request": true
    }
 
    Response — Case B (no slots):
    {
        "has_slots": false,
        "message": "No slots available. You can still send a reschedule request.",
        "available_slots": [],
        ...
    }
    """
 
    permission_classes     = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
 
    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            candidate=request.user,
        )
 
        now = timezone.now()
 
        # ── Guard: booking must allow reschedule ──────────────────────────────
        if booking.status not in [
            InterviewBooking.Status.PENDING,
            InterviewBooking.Status.CONFIRMED,
        ]:
            return Response(
                {"detail": "Reschedule is not available for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Guard: reschedule limit ───────────────────────────────────────────
        can_request = True
        block_reason = None
 
        if booking.reschedule_count >= RESCHEDULE_LIMIT:
            can_request  = False
            block_reason = f"Maximum of {RESCHEDULE_LIMIT} reschedules reached."
 
        elif booking.reschedule_status == RescheduleStatus.PENDING:
            can_request  = False
            block_reason = "A reschedule request is already pending."
 
        elif booking.start_datetime - now < timedelta(hours=RESCHEDULE_MIN_HOURS_AHEAD):
            can_request  = False
            block_reason = (
                f"Cannot request reschedule within "
                f"{RESCHEDULE_MIN_HOURS_AHEAD} hours of the session."
            )
 
        # ── Fetch available slots for this interviewer ────────────────────────
        # Exclude:
        #   • The booking's current slot
        #   • Past slots
        #   • Full slots (remaining_capacity == 0 handled in AvailableSlotSerializer)
        future_cutoff = now + timedelta(hours=RESCHEDULE_MIN_HOURS_AHEAD)
 
        candidate_slots = InterviewerAvailability.objects.filter(
            interviewer=booking.interviewer,
            is_active=True,
            date__gte=future_cutoff.date(),
        ).exclude(
            id=booking.availability_id,
        ).order_by("date", "start_time")
 
        # Post-filter: only slots with capacity and strictly in the future
        available = [
            slot for slot in candidate_slots
            if slot.remaining_capacity() > 0
            and timezone.make_aware(
                datetime.combine(slot.date, slot.start_time)
            ) > future_cutoff
        ]
 
        serialized_slots = AvailableSlotSerializer(available, many=True).data
        has_slots        = bool(serialized_slots)

        if not has_slots and can_request:
            can_request  = False
            block_reason = (
                "No slots are currently available. "
                "You can notify the interviewer to open new time slots."
            )
 
        return Response({
            "has_slots":     has_slots,
            "available_slots": serialized_slots,
            "message": (
                None if has_slots
                else "No slots available. You can notify the interviewer to open new time slots."
            ),
            "current_booking": {
                "availability_id": booking.availability_id,
                "start_datetime":  booking.start_datetime.isoformat(),
                "end_datetime":    booking.end_datetime.isoformat(),
            },
            "reschedule_count": booking.reschedule_count,
            "reschedule_limit": RESCHEDULE_LIMIT,
            "can_request":  can_request,
            "block_reason": block_reason,
            # If there's already a pending request, expose it so the UI can
            # show the candidate the current request state
            "pending_request": (
                {
                    "reschedule_status":  booking.reschedule_status,
                    "proposed_slot": (
                        AvailableSlotSerializer(booking.proposed_availability).data
                        if booking.proposed_availability else None
                    ),
                    "note": booking.reschedule_reason,
                    "requested_at": booking.reschedule_requested_at,
                }
                if booking.reschedule_status == RescheduleStatus.PENDING
                else None
            ),
        })
 
 
# ─── POST /api/bookings/<booking_id>/reschedule/request/ ─────────────────────
 
class CandidateRescheduleRequestView(APIView):
    """
    POST /api/bookings/<booking_id>/reschedule/request/
 
    Candidate submits a reschedule request.
 
    Case A — slot provided:
        { "proposed_availability_id": 42, "note": "Prefer morning" }
 
    Case B — no slot (open preference):
        { "proposed_availability_id": null, "note": "Any evening this week" }
 
    On success:
        booking.reschedule_status       = PENDING
        booking.rescheduled_by          = CANDIDATE
        booking.proposed_availability   = <slot or null>
        booking.reschedule_reason       = note
        booking.reschedule_requested_at          = now()
 
    booking.reschedule_count is NOT incremented here.
    It is incremented only when the interviewer ACCEPTS the request.
    """
 
    permission_classes     = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
 
    def post(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            candidate=request.user,
        )
 
        serializer = RescheduleRequestSerializer(
            data=request.data,
            context={"booking": booking},
        )
        serializer.is_valid(raise_exception=True)
 
        data = serializer.validated_data
        now  = timezone.now()
 
        with transaction.atomic():
            # Lock the booking row
            booking = (
                InterviewBooking.objects
                .select_for_update()
                .get(id=booking.id)
            )
 
            # Re-validate under lock (prevent race condition)
            if booking.reschedule_status == RescheduleStatus.PENDING:
                return Response(
                    {"detail": "A reschedule request is already pending."},
                    status=status.HTTP_409_CONFLICT,
                )
 
            proposed_slot = data.get("proposed_availability")
 
            # If a slot was proposed, lock it too and re-check capacity
            if proposed_slot is not None:
                locked_slot = (
                    InterviewerAvailability.objects
                    .select_for_update()
                    .get(id=proposed_slot.id)
                )
 
                if not locked_slot.is_active:
                    return Response(
                        {"detail": "Proposed slot is no longer available."},
                        status=status.HTTP_409_CONFLICT,
                    )
 
                if locked_slot.remaining_capacity() <= 0:
                    return Response(
                        {"detail": "Proposed slot is fully booked."},
                        status=status.HTTP_409_CONFLICT,
                    )
 
                booking.proposed_availability = locked_slot
            else:
                booking.proposed_availability = None
 
            booking.reschedule_status = RescheduleStatus.PENDING
            booking.rescheduled_by    = "CANDIDATE"
            booking.reschedule_reason = data.get("note", "")
            booking.reschedule_requested_at    = now
 
            booking.save(update_fields=[
                "reschedule_status",
                "rescheduled_by",
                "proposed_availability",
                "reschedule_reason",
                "reschedule_requested_at",
                "updated_at",
            ])
 
        logger.info(
            "Reschedule request created: booking=%s candidate=%s proposed_slot=%s",
            booking.id,
            request.user.id,
            booking.proposed_availability_id,
        )
 
        # TODO: send notification to interviewer
        # notify_reschedule_request.delay(booking.id)
 
        proposed_slot_data = (
            AvailableSlotSerializer(booking.proposed_availability).data
            if booking.proposed_availability else None
        )
 
        return Response(
            {
                "message":        "Reschedule request sent to the interviewer.",
                "reschedule_status": booking.reschedule_status,
                "proposed_slot":  proposed_slot_data,
                "note":           booking.reschedule_reason,
                "requested_at":   booking.reschedule_requested_at,
            },
            status=status.HTTP_200_OK,
        )
 








 # bookings/views.py (candidate notify section)

from notifications.events import emit_event
from notifications.constants import EventType
from django.utils.timezone import localtime

class CandidateNotifyInterviewerForNewSlotView(APIView):
    """
    POST /api/bookings/<booking_id>/reschedule/notify-interviewer/

    Used when there are no available slots.
    Sends a notification to the interviewer with the candidate's
    preferred time window, but does NOT create a reschedule request.
    """

    permission_classes     = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            candidate=request.user,
        )

        now = timezone.now()

        if booking.status not in [
            InterviewBooking.Status.PENDING,
            InterviewBooking.Status.CONFIRMED,
        ]:
            return Response(
                {"detail": "This booking cannot be rescheduled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.start_datetime - now < timedelta(hours=RESCHEDULE_MIN_HOURS_AHEAD):
            return Response(
                {"detail": f"Cannot request new slots within {RESCHEDULE_MIN_HOURS_AHEAD} hours of the session."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If a real reschedule request is already pending, no need to notify again
        if booking.reschedule_status == RescheduleStatus.PENDING:
            return Response(
                {"detail": "A reschedule request is already pending for this booking."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = NotifyInterviewerNewSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preferred_window = serializer.validated_data["preferred_window"]

        candidate   = request.user
        interviewer = booking.interviewer

        def emit_reschedule_slot_event():
            emit_event(
                EventType.RESCHEDULE_SLOT_REQUESTED,
                actor_id=candidate.id,
                payload={
                    "booking_id":     booking.id,
                    "candidate_id":   candidate.id,
                    "interviewer_id": interviewer.id,
                    "preferred_window": preferred_window,
                    "start_time":     localtime(booking.start_datetime).isoformat(),
                },
                correlation_id=f"booking:{booking.id}:reschedule-slot-request",
            )

        transaction.on_commit(emit_reschedule_slot_event)

        logger.info(
            "Candidate notified interviewer to open new slots: booking=%s candidate=%s preferred_window=%s",
            booking.id,
            candidate.id,
            preferred_window,
        )

        return Response(
            {
                "status":  "ok",
                "message": "Interviewer will be notified to open new time slots.",
            },
            status=status.HTTP_200_OK,
        )