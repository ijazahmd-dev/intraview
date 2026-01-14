from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from datetime import timedelta

from authentication.models import InterviewerStatus
from .models import InterviewerApplication,InterviewerProfile,InterviewerAvailability,InterviewerVerification,VerificationStatus
from .serializers import (
    InterviewerApplicationCreateSerializer,
    InterviewerApplicationAdminSerializer,
    InterviewerProfileSerializer,
    InterviewerAvailabilityCreateSerializer,
    InterviewerVerificationSubmitSerializer,
    InterviewerVerificationDetailSerializer,
    InterviewerProfilePictureSerializer
)
from authentication.permissions import IsAdminRole  # adjust import
from authentication.authentication import AdminCookieJWTAuthentication
from .tasks import send_application_approved_email, send_application_rejected_email,send_application_submitted_email
from authentication.permissions import IsOnboardingInterviewer,IsActiveInterviewer
from authentication.authentication import InterviewerCookieJWTAuthentication
from interviewer_subscriptions.services.entitlement_service import (
    InterviewerEntitlementService,
)


# ------------------------------------------ User-facing APIs --------------------------------------------------




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

            user = request.user
            user.interviewer_status = InterviewerStatus.PENDING_APPROVAL
            user.save(update_fields=["interviewer_status"])


            send_application_submitted_email.delay(
                request.user.email,
                request.user.username,
            )
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














class InterviewerDashboardSummaryView(APIView):
    """
    GET /api/interviewer/dashboard/
    Static/placeholder summary for interviewer dashboard widgets.
    """
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):
        # Dummy data for now; later you will compute from Interview model
        data = {
            "header": {
                "name": request.user.interviewer_profile.display_name
                if hasattr(request.user, "interviewer_profile")
                else request.user.get_full_name() or request.user.email,
            },
            "stats": {
                "total_interviews": 128,
                "total_interviews_change": "+12% this month",
                "average_rating": 4.8,
                "average_rating_change": "+0.3 from last month",
                "completion_rate": 0.96,
                "completion_rate_note": "Same as last month",
                "total_earnings": 3840,
                "total_earnings_change": "+18% this month",
            },
            "upcoming_interviews": [
                {
                    "id": 1,
                    "candidate_name": "Sarah Johnson",
                    "type": "System Design",
                    "status": "Confirmed",
                    "date": "2025-10-17",
                    "time": "14:00",
                    "timezone": "IST",
                    "mode": "Live",
                },
                {
                    "id": 2,
                    "candidate_name": "Michael Chen",
                    "type": "Backend",
                    "status": "Confirmed",
                    "date": "2025-10-18",
                    "time": "10:30",
                    "timezone": "IST",
                    "mode": "Live",
                },
                {
                    "id": 3,
                    "candidate_name": "Emily Rodriguez",
                    "type": "Behavioral",
                    "status": "Pending",
                    "date": "2025-10-19",
                    "time": "16:00",
                    "timezone": "IST",
                    "mode": "Live",
                },
            ],
            "notifications": [
                {
                    "id": 1,
                    "title": "New Session Request",
                    "description": "A new mock interview request has arrived.",
                    "type": "info",
                    "created_at": "2025-10-17T10:00:00Z",
                },
                {
                    "id": 2,
                    "title": "Session Starting Soon",
                    "description": "Your next session starts in 30 minutes.",
                    "type": "warning",
                    "created_at": "2025-10-17T10:30:00Z",
                },
            ],
            "performance": {
                "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "interviews": [10, 14, 13, 18, 22, 26],
            },
            "session_breakdown": {
                "human_interviews": 78,
                "peer_reviews": 32,
                "ai_assisted": 18,
            },
            "availability_this_week": {
                "available_hours": 24,
                "booked_hours": 16,
                "open_slots": 8,
            },
            "average_session_duration": {
                "technical": 45,
                "behavioral": 35,
                "overall": 42,
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
