from django.shortcuts import render
from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models


from authentication.models import CustomUser, InterviewerStatus
from interviewers.models import InterviewerAvailability
from authentication.authentication import InterviewerCookieJWTAuthentication,CookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer
from .models import InterviewBooking
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
    InterviewerCancelBookingSerializer,
    CandidatePastInterviewSerializer,
    CandidateUpcomingInterviewSerializer,
    CreateInterviewBookingSerializer, 
    CandidateInterviewerDetailSerializer,
    BookingDetailSerializer,
)






# Create your views here.


User = get_user_model()


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
        today = timezone.localdate()
        date_filter = request.query_params.get("date")

        interviewer = get_object_or_404(
            CustomUser,
            id=interviewer_id,
            role="interviewer",
            interviewer_status=InterviewerStatus.ACTIVE,
            interviewer_profile__is_profile_public=True,
            interviewer_profile__is_accepting_bookings=True,

            # ✅ FIX HERE (Correct relation)
            verification__status="APPROVED",
        )

        # ✅ FIX: correct entitlement check (interviewer subscription)
        if not InterviewerEntitlementService.has_active_subscription(interviewer):
            return Response([], status=200)

        qs = InterviewerAvailability.objects.filter(
            interviewer=interviewer,
            is_active=True,
            date__gte=today,
        )
        print("availability list",qs)

        if date_filter:
            qs = qs.filter(date=date_filter)

        qs = qs.order_by("date", "start_time")

        serializer = CandidateAvailabilitySerializer(qs, many=True)
        return Response(serializer.data)
    





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

        TOKEN_COST = 10  # static for now

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

            if availability.remaining_capacity() <= 0:
                return Response(
                    {"detail": "Slot already fully booked."},
                    status=status.HTTP_409_CONFLICT,
                )

            # Get & lock wallet (correct pattern)
            wallet = TokenService.get_or_create_wallet(candidate)
            wallet = TokenWallet.objects.select_for_update().get(id=wallet.id)

            if wallet.balance < TOKEN_COST:
                return Response(
                    {"detail": "Insufficient token balance."},
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            # Lock tokens
            TokenService.lock_tokens(
                wallet=wallet,
                amount=TOKEN_COST,
                transaction_type=TokenTransactionType.BOOKING_LOCK,
                reference_id=f"availability_{availability.id}",
                note="Interview booking lock",
            )

            # Create booking
            booking = InterviewBooking.objects.create(
                candidate=candidate,
                interviewer=interviewer,
                availability=availability,
                start_datetime=timezone.make_aware(
                    datetime.combine(
                        availability.date,
                        availability.start_time,
                    )
                ),
                end_datetime=timezone.make_aware(
                    datetime.combine(
                        availability.date,
                        availability.end_time,
                    )
                ),
                token_cost=TOKEN_COST,
                status=InterviewBooking.Status.CONFIRMED,
            )
                                                                                            
        # -------------------------
        # Response
        # -------------------------

        return Response(
            {
                "booking_id": booking.id,
                "status": booking.status,
                "tokens_locked": TOKEN_COST,
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
                start_datetime__gt=timezone.now(),
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
        qs = (
            InterviewBooking.objects
            .filter(
                candidate=request.user,
                status__in=[
                    InterviewBooking.Status.COMPLETED,
                    InterviewBooking.Status.CANCELLED,
                    InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                    InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                ],
            )
            .select_related(
                "availability",
                "interviewer__interviewer_profile",
            )
            .order_by("-created_at")
        )

        serializer = CandidatePastInterviewSerializer(qs, many=True)
        return Response(serializer.data)






class BookingDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking.objects.select_related(
                "candidate",
                "interviewer__interviewer_profile",
                "availability",
            ),
            id=booking_id,
        )

        # ✅ Only candidate or interviewer can view
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







############################################Interviewer Api ##########################################################





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
                    transaction_type="BOOKING_CANCEL_INTERVIEWER",
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