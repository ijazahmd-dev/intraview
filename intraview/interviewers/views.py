# interviewers views.py

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from datetime import timedelta, datetime



from authentication.models import InterviewerStatus
from .models import InterviewerApplication,InterviewerProfile,InterviewerAvailability,InterviewerVerification,VerificationStatus
from .serializers import (
    InterviewerApplicationCreateSerializer,
    InterviewerApplicationAdminSerializer,
    InterviewerProfileSerializer,
    InterviewerAvailabilityCreateSerializer,
    InterviewerVerificationSubmitSerializer,
    InterviewerVerificationDetailSerializer,
    InterviewerProfilePictureSerializer,
    InterviewerApplicationReadSerializer,
    InterviewerApplicationUpdateSerializer
)
from authentication.permissions import IsAdminRole  # adjust import
from authentication.authentication import AdminCookieJWTAuthentication
from .tasks import send_application_approved_email, send_application_rejected_email,send_application_submitted_email
from authentication.permissions import IsOnboardingInterviewer,IsActiveInterviewer
from authentication.authentication import InterviewerCookieJWTAuthentication
from interviewer_subscriptions.services.entitlement_service import (
    InterviewerEntitlementService,
)
from bookings.models import InterviewBooking


# ------------------------------------------ User-facing APIs --------------------------------------------------




# class InterviewerApplicationCreateView(APIView):
#     """
#     POST /api/interviewer/apply/
#     Authenticated normal user submits an application.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         user = request.user

#         try:
#             existing_app = user.interviewer_application
#             if existing_app.status == InterviewerApplication.STATUS_REJECTED:
#                 print(f"🗑️ Deleting old rejected application for {user.email}")
#                 existing_app.delete()
#             elif existing_app.status in [InterviewerApplication.STATUS_PENDING, InterviewerApplication.STATUS_APPROVED]:
#                 return Response({
#                     "error": "Cannot apply. You have a pending or approved application."
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except InterviewerApplication.DoesNotExist:
#             pass

#         serializer = InterviewerApplicationCreateSerializer(
#             data=request.data,
#             context={"request": request},
#         )
#         if serializer.is_valid():
#             serializer.save(user=request.user)

#             user = request.user
#             user.interviewer_status = InterviewerStatus.PENDING_APPROVAL
#             user.save(update_fields=["interviewer_status"])


#             send_application_submitted_email.delay(
#                 request.user.email,
#                 request.user.username,
#             )
#             return Response(
#                 {"message": "Interviewer application submitted successfully."},
#                 status=status.HTTP_201_CREATED,
#             )
#         print(serializer.errors)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)









# ─── Application create / update ──────────────────────────────────────────────
 
class InterviewerApplicationCreateView(APIView):
    """
    GET  /api/interviewer/apply/
        Returns the user's existing application data so the frontend can
        pre-populate the re-apply form. Returns 404 if no application exists.
 
    POST /api/interviewer/apply/
        • First-time applicants  → creates a new InterviewerApplication.
        • Rejected applicants    → UPDATES the existing application in-place
          (no delete/re-create). File fields are kept if no new file is sent.
          Status is reset to PENDING automatically by the update serializer.
    """
 
    permission_classes = [IsAuthenticated]
 
    # ── GET — return existing application for pre-population ─────────────────
    def get(self, request):
        user = request.user
 
        try:
            app = user.interviewer_application
        except InterviewerApplication.DoesNotExist:
            return Response(
                {"detail": "No application found."},
                status=status.HTTP_404_NOT_FOUND,
            )
 
        serializer = InterviewerApplicationReadSerializer(
            app, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
 
    # ── POST — create (first time) or update (rejected) ──────────────────────
    def post(self, request):
        user = request.user
 
        existing_app = getattr(user, "interviewer_application", None)
 
        # ── Rejected applicant: UPDATE existing application ───────────────────
        if existing_app and existing_app.status == InterviewerApplication.STATUS_REJECTED:
            serializer = InterviewerApplicationUpdateSerializer(
                instance=existing_app,
                data=request.data,
                partial=True,                 # files are optional
                context={"request": request},
            )
            if serializer.is_valid():
                serializer.save()
 
                # Interviewer status back to pending
                user.interviewer_status = InterviewerStatus.PENDING_APPROVAL
                user.save(update_fields=["interviewer_status"])
 
                send_application_submitted_email.delay(
                    user.email,
                    user.username,
                )
                return Response(
                    {"message": "Application re-submitted successfully."},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
        # ── Pending / Approved: block ─────────────────────────────────────────
        if existing_app and existing_app.status in [
            InterviewerApplication.STATUS_PENDING,
            InterviewerApplication.STATUS_APPROVED,
        ]:
            return Response(
                {"error": "Cannot apply. You have a pending or approved application."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── First-time applicant: CREATE new application ──────────────────────
        serializer = InterviewerApplicationCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save(user=user)
 
            user.interviewer_status = InterviewerStatus.PENDING_APPROVAL
            user.save(update_fields=["interviewer_status"])
 
            send_application_submitted_email.delay(
                user.email,
                user.username,
            )
            return Response(
                {"message": "Interviewer application submitted successfully."},
                status=status.HTTP_201_CREATED,
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
















class InterviewerApplicationStatusView(APIView):
    """
    GET /api/interviewer/status/
    Returns current user's interviewer-application status.
    """


    def get(self, request):
        user = request.user
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
                "interviewer_status": user.interviewer_status,
                "rejection_reason": app.rejection_reason,
                "submitted_at": app.created_at,
                "application_id": app.id,
            },
            status=status.HTTP_200_OK,
        )





# ------------------------------------------ Admin-facing APIs --------------------------------------------------




class AdminInterviewerApplicationListView(ListAPIView):
    """
    GET /api/admin/interviewer-applications/
    List all applications for review.
    """
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = InterviewerApplicationAdminSerializer
    # queryset = InterviewerApplication.objects.all()

    def get_queryset(self):
        qs = InterviewerApplication.objects.select_related("user").all()

        status_param = self.request.query_params.get("status")

        if status_param:
            statuses = status_param.split(",")
            qs = qs.filter(status__in=statuses)

        return qs.order_by("-created_at")
    

    # def get(self, request, *args, **kwargs):
    #     print("USER:", request.user)
    #     print("AUTH:", request.auth)
    #     return super().get(request, *args, **kwargs)
    

        


class AdminInterviewerApplicationDetailView(RetrieveAPIView):
    """
    GET /api/admin/interviewer-applications/<id>/
    Detailed view of a single application.
    """
    authentication_classes = [AdminCookieJWTAuthentication]
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
    authentication_classes = [AdminCookieJWTAuthentication]
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
            user = app.user
            user.role = "interviewer"
            user.interviewer_status = InterviewerStatus.APPROVED_NOT_ONBOARDED
            print(user.interviewer_status,"the interviewer status is:")
            user.save(update_fields=["role", "interviewer_status"])

            InterviewerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "display_name": 
                    # (f"{app.first_name} {app.last_name}".strip()or user.username),
                    user.username,
                    "headline": f"{app.years_of_experience}+ years experience",
                    "bio": app.expertise_summary,
                    "years_of_experience": app.years_of_experience,
                    "location": app.location,
                    "timezone": app.timezone,
                    "specializations": app.specializations,
                    "languages": app.languages,
                    "education": [app.education] if app.education else [],
                    "certifications": [],
                    "industries": [],
                    "is_profile_public": False,
                    "is_accepting_bookings": False,
                    "is_completed": False,  # onboarding not done yet
                },
            )

            send_application_approved_email.delay(
                app.user.email,
                app.user.username,
            )


        elif action == "reject":
            if not rejection_reason:
                return Response(
                    {"detail": "Rejection reason is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            app.status = InterviewerApplication.STATUS_REJECTED
            app.rejection_reason = rejection_reason

            user = app.user
            user.interviewer_status = InterviewerStatus.REJECTED
            user.save(update_fields=["interviewer_status"])

            send_application_rejected_email.delay(
                app.user.email,
                app.user.username,
                rejection_reason,
            )

        else:
            return Response({"detail": "Invalid action."}, status=400)

        app.reviewed_by = request.user
        app.reviewed_at = timezone.now()
        app.save()

        return Response({"message": f"Application {action}d successfully."})
    

# ------------------------------------------ Admin-facing APIs end --------------------------------------------------




class InterviewerApplicationEligibilityView(APIView):
    

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






# ------------------------------------------ Interviewer Onboarding-facing APIs --------------------------------------------------



class InterviewerProfileView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOnboardingInterviewer]

    def get(self, request):
        profile = getattr(request.user, "interviewer_profile", None)
        if not profile:
            return Response(
                {"detail": "Profile not created yet"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InterviewerProfileSerializer(profile)
        return Response(serializer.data)

    def post(self, request):
        serializer = InterviewerProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile, created = InterviewerProfile.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data,
        )

        # Move onboarding step to AVAILABILITY after profile save
        profile.onboarding_step = InterviewerProfile.OnboardingStep.AVAILABILITY
        profile.save(update_fields=["onboarding_step"])

        return Response(
            {
                "message": "Profile saved successfully",
                "profile_id": profile.id,
                "onboarding_step": profile.onboarding_step,
            },
            status=status.HTTP_200_OK,
        )
    



class InterviewerAvailabilityCreateView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOnboardingInterviewer]

    def post(self, request):
        serializer = InterviewerAvailabilityCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        interviewer = request.user

        created_slots = []

        if data.get("is_recurring"):
            current_date = data["date"]
            end_date = data["recurrence_end_date"]

            delta = timedelta(
                days=1 if data["recurrence_type"] == "DAILY" else 7
            )

            while current_date <= end_date:
                slot, _ = InterviewerAvailability.objects.get_or_create(
                    interviewer=interviewer,
                    date=current_date,
                    start_time=data["start_time"],
                    end_time=data["end_time"],
                    defaults={
                        "timezone": data["timezone"],
                        "is_recurring": True,
                        "recurrence_type": data["recurrence_type"],
                        "recurrence_end_date": end_date,
                    },
                )
                created_slots.append(slot.id)
                current_date += delta
        else:
            slot = InterviewerAvailability.objects.create(
                interviewer=interviewer,
                **data
            )
            created_slots.append(slot.id)


        try:
            profile = interviewer.interviewer_profile
            if profile.onboarding_step == InterviewerProfile.OnboardingStep.AVAILABILITY:
                profile.onboarding_step = InterviewerProfile.OnboardingStep.VERIFICATION
                profile.save(update_fields=["onboarding_step"])
        except InterviewerProfile.DoesNotExist:
            pass    
        

        return Response(
            {
                "message": "Availability added successfully.",
                "slots_created": created_slots,
            },
            status=status.HTTP_201_CREATED,
        )
    



class InterviewerAvailabilityListView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOnboardingInterviewer]

    def get(self, request):
        qs = InterviewerAvailability.objects.filter(
            interviewer=request.user,
            is_active=True,  # Only show active slots
        ).order_by("date", "start_time")

        data = [
            {
                "id": slot.id,
                "date": slot.date,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "timezone": slot.timezone,
                "is_recurring": slot.is_recurring,
            }
            for slot in qs
        ]

        return Response(data)




class InterviewerAvailabilityDeleteView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOnboardingInterviewer]

    def delete(self, request, slot_id):
        try:
            slot = InterviewerAvailability.objects.get(
                id=slot_id,
                interviewer=request.user
            )
        except InterviewerAvailability.DoesNotExist:
            return Response(
                {"detail": "Slot not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # slot.delete()
        slot.is_active = False
        slot.save(update_fields=["is_active"])
        return Response(
            {"message": "Availability removed."},
            status=status.HTTP_204_NO_CONTENT,
        )








class SubmitInterviewerVerificationView(APIView):
    """
    POST /api/interviewer/verification/
    Optional identity verification submission.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        verification, _ = InterviewerVerification.objects.get_or_create(
            user=request.user
        )

        serializer = InterviewerVerificationSubmitSerializer(
            instance=verification,
            data=request.data,
            context={"request": request},
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(
            status=VerificationStatus.PENDING,
            submitted_at=timezone.now(),
            rejection_reason="",
        )

        return Response(
            {"message": "Verification submitted successfully and is under review."},
            status=status.HTTP_200_OK,
        )






class InterviewerVerificationStatusView(APIView):
    """
    GET /api/interviewer/verification/status/
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            verification = request.user.verification
        except InterviewerVerification.DoesNotExist:
            return Response({
                "status": "NOT_SUBMITTED"
            })

        return Response({
            "status": verification.status,
            "rejection_reason": verification.rejection_reason,
            "submitted_at": verification.submitted_at,
        })
    


class InterviewerVerificationDetailView(APIView):
    """
    GET /api/interviewer/verification/
    Returns current verification object (if any), including document_file URL.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            verification = request.user.verification
        except InterviewerVerification.DoesNotExist:
            return Response(
                {
                    "status": VerificationStatus.NOT_SUBMITTED,
                    "document_file": None,
                    "document_type": None,
                    "document_number": None,
                    "rejection_reason": "",
                    "submitted_at": None,
                },
                status=status.HTTP_200_OK,
            )

        serializer = InterviewerVerificationDetailSerializer(verification)
        return Response(serializer.data, status=status.HTTP_200_OK)




class CompleteInterviewerOnboardingView(APIView):
    """
    POST /api/interviewer/onboarding/complete/
    Finalizes onboarding and activates interviewer account.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOnboardingInterviewer]

    def post(self, request):
        user = request.user

        # Safety checks
        if user.interviewer_status != InterviewerStatus.APPROVED_NOT_ONBOARDED:
            return Response(
                {"detail": "Onboarding already completed or not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check profile completion
        try:
            profile = user.interviewer_profile
        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if profile.onboarding_step not in [
            InterviewerProfile.OnboardingStep.AVAILABILITY,
            InterviewerProfile.OnboardingStep.VERIFICATION,
            InterviewerProfile.OnboardingStep.COMPLETED,
        ]:
            # has not even finished profile step properly
            return Response(
                {"detail": "Complete your profile before finishing onboarding."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check availability
        has_availability = InterviewerAvailability.objects.filter(
            interviewer=user
        ).exists()

        if not has_availability:
            return Response(
                {"detail": "Set your availability before finishing onboarding."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        profile.mark_completed()

        # ✅ All checks passed → activate interviewer
        user.interviewer_status = InterviewerStatus.ACTIVE
        user.save(update_fields=["interviewer_status"])

        return Response(
            {
                "message": "Onboarding completed successfully.",
                "next": "DASHBOARD",
            },
            status=status.HTTP_200_OK,
        )






class InterviewerOnboardingStatusView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "interviewer_profile", None)

        return Response({
            "interviewer_status": user.interviewer_status,
            "profile_completed": bool(profile and profile.onboarding_step != InterviewerProfile.OnboardingStep.PROFILE),
            "has_availability": InterviewerAvailability.objects.filter(
                interviewer=user
            ).exists(),
            "verification_status": getattr(
                getattr(user, "verification", None),
                "status",
                "NOT_SUBMITTED"
            ),
            "onboarding_step": getattr(
                profile, "onboarding_step", InterviewerProfile.OnboardingStep.PROFILE
            ),
            "is_completed": getattr(profile, "is_completed", False),
        })








from django.db.models import Q, Count, Avg, Sum




class InterviewerDashboardSummaryView(APIView):
    """
    GET /api/interviewer/dashboard/
    Real data for interviewer dashboard from actual models.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        user = request.user
        
        # Get basic info
        profile = user.interviewer_profile if hasattr(user, 'interviewer_profile') else None
        wallet = user.token_wallet if hasattr(user, 'token_wallet') else None

        # ============================================
        # 1. TOTAL INTERVIEWS & STATS
        # ============================================
        all_bookings = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED
        )
        
        total_interviews = all_bookings.count()
        
        # Get this month's interviews
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        interviews_this_month = all_bookings.filter(
            created_at__gte=month_start
        ).count()
        
        # Calculate change percentage
        if total_interviews > 0:
            interviews_change = f"+{int((interviews_this_month / max(total_interviews, 1)) * 100)}% this month"
        else:
            interviews_change = "No interviews yet"

        # ============================================
        # 2. AVERAGE RATING (from completed bookings)
        # ============================================
        # Assuming you have a rating field in InterviewBooking
        
        avg_rating = 0.0
        avg_rating = round(avg_rating, 1)
        
        # Last month average for comparison
        last_month_start = month_start - timedelta(days=30)
        last_month_bookings = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED,
            created_at__gte=last_month_start,
            created_at__lt=month_start
        )
        
        last_month_avg = 0.0
        rating_change = f"+{round(avg_rating - last_month_avg, 1)} from last month" if avg_rating >= last_month_avg else f"{round(avg_rating - last_month_avg, 1)} from last month"

        # ============================================
        # 3. COMPLETION RATE
        # ============================================
        total_confirmed_or_completed = InterviewBooking.objects.filter(
            interviewer=user,
            status__in=[
                InterviewBooking.Status.COMPLETED,
                InterviewBooking.Status.CONFIRMED,
                InterviewBooking.Status.PENDING
            ]
        ).count()
        
        completion_rate = (total_interviews / max(total_confirmed_or_completed, 1)) if total_confirmed_or_completed > 0 else 0
        
        # Compare with last month
        last_month_total = InterviewBooking.objects.filter(
            interviewer=user,
            status__in=[
                InterviewBooking.Status.COMPLETED,
                InterviewBooking.Status.CONFIRMED,
                InterviewBooking.Status.PENDING
            ],
            created_at__gte=last_month_start,
            created_at__lt=month_start
        ).count()
        
        last_month_completed = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED,
            created_at__gte=last_month_start,
            created_at__lt=month_start
        ).count()
        
        last_month_rate = (last_month_completed / max(last_month_total, 1)) if last_month_total > 0 else 0
        
        completion_rate_note = "Same as last month" if abs(completion_rate - last_month_rate) < 0.01 else f"{'↑' if completion_rate > last_month_rate else '↓'} from last month"

        # ============================================
        # 4. TOTAL EARNINGS (from completed sessions)
        # ============================================
        # Sum of token_cost from completed bookings
        total_tokens_earned = all_bookings.aggregate(Sum('token_cost'))['token_cost__sum'] or 0
        
        # If you have a token rate, multiply to get INR
        # For now, assuming 1 token = ₹1 for display (adjust based on your rate)
        total_earnings = total_tokens_earned
        
        # This month earnings
        earnings_this_month = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED,
            created_at__gte=month_start
        ).aggregate(Sum('token_cost'))['token_cost__sum'] or 0
        
        earnings_change = f"+{int((earnings_this_month / max(total_earnings, 1)) * 100)}% this month" if total_earnings > 0 else "No earnings yet"

        # ============================================
        # 5. UPCOMING INTERVIEWS
        # ============================================
        now = timezone.now()
        upcoming_bookings = InterviewBooking.objects.filter(
            interviewer=user,
            status__in=[
                InterviewBooking.Status.PENDING,
                InterviewBooking.Status.CONFIRMED
            ],
            start_datetime__gte=now
        ).order_by('start_datetime')[:5]

        upcoming_interviews = [
            {
                "id": booking.id,
                "candidate_name": booking.candidate.get_full_name() or booking.candidate.email,
                "type": "Interview",  # You may have an interview_type field
                "status": booking.status,
                "date": booking.start_datetime.strftime('%Y-%m-%d'),
                "time": booking.start_datetime.strftime('%H:%M'),
                "timezone": profile.timezone if profile else "UTC",
                "mode": "Live",
            }
            for booking in upcoming_bookings
        ]

        # ============================================
        # 6. NOTIFICATIONS (from system events)
        # ============================================
        # This is a placeholder - expand based on your notification system
        notifications = []
        
        # Check for pending bookings
        pending_count = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.PENDING
        ).count()
        
        if pending_count > 0:
            notifications.append({
                "id": 1,
                "title": f"{pending_count} New Session Request{'s' if pending_count > 1 else ''}",
                "description": f"You have {pending_count} pending interview request(s).",
                "type": "info",
                "created_at": timezone.now().isoformat(),
            })
        
        # Check for interviews starting soon (next 24 hours)
        next_24h = now + timedelta(hours=24)
        starting_soon = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.CONFIRMED,
            start_datetime__gte=now,
            start_datetime__lte=next_24h
        ).count()
        
        if starting_soon > 0:
            notifications.append({
                "id": 2,
                "title": f"Session{'s' if starting_soon > 1 else ''} Starting Soon",
                "description": f"{starting_soon} session(s) start(s) in the next 24 hours.",
                "type": "warning",
                "created_at": timezone.now().isoformat(),
            })

        # ============================================
        # 7. PERFORMANCE TRENDS (last 6 months)
        # ============================================
        performance_months = []
        performance_interviews = []
        
        for i in range(5, -1, -1):  # Last 6 months
            month_date = now - timedelta(days=30*i)
            month_start_iter = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end_iter = (month_start_iter + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            
            count = InterviewBooking.objects.filter(
                interviewer=user,
                status=InterviewBooking.Status.COMPLETED,
                created_at__gte=month_start_iter,
                created_at__lte=month_end_iter
            ).count()
            
            performance_months.append(month_date.strftime('%b'))
            performance_interviews.append(count)

        # ============================================
        # 8. SESSION BREAKDOWN
        # ============================================
        # This depends on how you categorize interviews
        total_completed = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED
        ).count()
        
        # Placeholder: you'll need to add interview_type to BookingModel
        human_interviews = total_completed  # Adjust based on actual type
        peer_reviews = 0  # Add if you have this data
        ai_assisted = 0   # Add if you have this data

        # ============================================
        # 9. AVAILABILITY THIS WEEK
        # ============================================
        week_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)
        
        week_availabilities = InterviewerAvailability.objects.filter(
            interviewer=user,
            is_active=True,
            date__gte=week_start.date(),
            date__lt=week_end.date()
        )
        
        # Calculate total available hours
        total_available_hours = 0
        for avail in week_availabilities:
            start = datetime.combine(avail.date, avail.start_time)
            end = datetime.combine(avail.date, avail.end_time)
            hours = (end - start).total_seconds() / 3600
            total_available_hours += hours
        
        # Calculate booked hours
        booked_hours = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.CONFIRMED,
            start_datetime__gte=week_start,
            start_datetime__lt=week_end
        ).aggregate(
            total_duration=Sum('token_cost')  # Or calculate from start_datetime and end_datetime
        )['total_duration'] or 0
        
        # Convert token_cost to hours (depends on your conversion)
        booked_hours_formatted = int(booked_hours / 60)  # Adjust conversion
        
        open_slots = int(total_available_hours) - booked_hours_formatted

        # ============================================
        # 10. AVERAGE SESSION DURATION
        # ============================================
        completed_bookings = InterviewBooking.objects.filter(
            interviewer=user,
            status=InterviewBooking.Status.COMPLETED
        )
        
        # Calculate duration from start and end times
        total_duration_seconds = 0
        count = 0
        for booking in completed_bookings:
            if hasattr(booking, 'start_datetime') and hasattr(booking, 'end_datetime'):
                duration = (booking.end_datetime - booking.start_datetime).total_seconds() / 60
                total_duration_seconds += duration
                count += 1
        
        overall_avg = int(total_duration_seconds / max(count, 1))
        
        # You can categorize by type if you have that info
        technical_avg = overall_avg  # Placeholder
        behavioral_avg = overall_avg  # Placeholder

        # ============================================
        # FINAL RESPONSE
        # ============================================
        data = {
            "header": {
                "name": profile.display_name if profile else user.get_full_name() or user.email,
            },
            "stats": {
                "total_interviews": total_interviews,
                "total_interviews_change": interviews_change,
                "average_rating": avg_rating,
                "average_rating_change": rating_change,
                "completion_rate": completion_rate,
                "completion_rate_note": completion_rate_note,
                "total_earnings": total_earnings,
                "total_earnings_change": earnings_change,
            },
            "upcoming_interviews": upcoming_interviews,
            "notifications": notifications,
            "performance": {
                "months": performance_months,
                "interviews": performance_interviews,
            },
            "session_breakdown": {
                "human_interviews": human_interviews,
                "peer_reviews": peer_reviews,
                "ai_assisted": ai_assisted,
            },
            "availability_this_week": {
                "available_hours": int(total_available_hours),
                "booked_hours": booked_hours_formatted,
                "open_slots": max(0, open_slots),
            },
            "average_session_duration": {
                "technical": technical_avg,
                "behavioral": behavioral_avg,
                "overall": overall_avg,
            },
        }
        return Response(data)





class InterviewerDashboardProfileView(APIView):
    """
    GET /api/interviewer/me/profile/
    PUT/PATCH /api/interviewer/me/profile/
    Used from the dashboard/profile screen (not onboarding).
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        try:
            profile = request.user.interviewer_profile
        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Interviewer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # if not InterviewerEntitlementService.has_active_subscription(request.user):
        #     profile.is_profile_public = False
        #     profile.is_accepting_bookings = False

        serializer = InterviewerProfileSerializer(profile)
        data = serializer.data
        
        data['verification_status'] = getattr(
            getattr(request.user, 'verification', None), 
            'status', 
            VerificationStatus.NOT_SUBMITTED
        )

        print(data)
        return Response(data)

    def put(self, request):
        """
        Replace full profile (for a full edit form).
        """
        try:
            profile = request.user.interviewer_profile
        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Interviewer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = InterviewerProfileSerializer(
            instance=profile,
            data=request.data,
            partial=False,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        """
        Partial update (for toggles from dashboard, e.g. public/accepting bookings).
        """
        try:
            profile = request.user.interviewer_profile

        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Interviewer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if not hasattr(request.user, 'verification') or request.user.verification.status != VerificationStatus.APPROVED:
            if 'is_profile_public' in request.data or 'is_accepting_bookings' in request.data:
                return Response(
                    {"detail": "Identity verification required to make profile public."}, 
                    status=400
                )
            
        if any(
            field in request.data
            for field in ["is_profile_public", "is_accepting_bookings"]
        ):
            if not InterviewerEntitlementService.has_active_subscription(request.user):
                return Response(
                    {
                        "detail": (
                            "Active interviewer subscription required "
                            "to go public or accept bookings."
                        )
                    },
                    status=403,
                ) 

        serializer = InterviewerProfileSerializer(
            instance=profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)






class InterviewerProfilePictureView(APIView):
    """
    POST /api/interviewer/me/profile-picture/ - Upload profile picture
    DELETE /api/interviewer/me/profile-picture/ - Remove profile picture
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def post(self, request):
        """
        Upload new profile picture
        Expects: multipart/form-data with profile_picture file
        """
        try:
            profile = request.user.interviewer_profile
            
            serializer = InterviewerProfilePictureSerializer(
                profile,
                data=request.FILES,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                
                return Response(
                    {
                        "message": "Profile picture updated successfully",
                        "profile_picture": serializer.data["profile_picture"],
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Interviewer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"detail": "Upload failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        """
        Remove current profile picture
        """
        try:
            profile = request.user.interviewer_profile
            
            if profile.profile_picture:
                # Delete file from storage
                profile.profile_picture.delete(save=False)
                profile.profile_picture = None
                profile.save(update_fields=["profile_picture"])
                
                return Response(
                    {
                        "message": "Profile picture removed successfully",
                        "profile_picture": None
                    },
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"message": "No profile picture to remove"},
                    status=status.HTTP_200_OK
                )
                
        except InterviewerProfile.DoesNotExist:
            return Response(
                {"detail": "Interviewer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
