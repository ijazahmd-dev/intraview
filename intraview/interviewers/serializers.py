# interviewers serializers.py

from rest_framework import serializers
from .models import InterviewerApplication, InterviewerProfile, InterviewerAvailability, InterviewerVerification, VerificationStatus



# class InterviewerApplicationCreateSerializer(serializers.ModelSerializer):


#     specializations = serializers.ListField(
#         child=serializers.CharField(),
#         allow_empty=False
#     )

#     languages = serializers.ListField(
#         child=serializers.CharField(),
#         allow_empty=False
#     )



#     class Meta:
#         model = InterviewerApplication
#         exclude = ("user", "status", "reviewed_at", "reviewed_by", "rejection_reason", "created_at")

#     # def validate(self, attrs):
#     #     user = self.context["request"].user

#     #     # Only allow one application
#     #     if hasattr(user, "interviewer_application"):
#     #         raise serializers.ValidationError({
#     #         "code": "APPLICATION_EXISTS",
#     #         "message": "You have already submitted an interviewer application."
#     #     })

#     #     return attrs

#     def validate(self, attrs):
#         user = self.context["request"].user

#         # ✅ FIXED: Check if user can apply
#         existing_app = getattr(user, "interviewer_application", None)
#         if existing_app:
#             if existing_app.status == InterviewerApplication.STATUS_PENDING:
#                 raise serializers.ValidationError({
#                     "code": "APPLICATION_PENDING",
#                     "message": "You already have a pending application. Please wait for review."
#                 })
#             elif existing_app.status == InterviewerApplication.STATUS_APPROVED:
#                 raise serializers.ValidationError({
#                     "code": "ALREADY_APPROVED",
#                     "message": "You are already an approved interviewer."
#                 })
#             # ✅ ALLOW if REJECTED - user can reapply

#         return attrs









# ─── Application serializers ──────────────────────────────────────────────────
 
class InterviewerApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Used when a user submits their FIRST application.
    Resume is required.
    """
 
    specializations = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
 
    class Meta:
        model  = InterviewerApplication
        exclude = (
            "user", "status", "reviewed_at", "reviewed_by",
            "rejection_reason", "created_at",
        )
 
    def validate(self, attrs):
        user         = self.context["request"].user
        existing_app = getattr(user, "interviewer_application", None)
 
        if existing_app:
            if existing_app.status == InterviewerApplication.STATUS_PENDING:
                raise serializers.ValidationError({
                    "code":    "APPLICATION_PENDING",
                    "message": "You already have a pending application. Please wait for review.",
                })
            elif existing_app.status == InterviewerApplication.STATUS_APPROVED:
                raise serializers.ValidationError({
                    "code":    "ALREADY_APPROVED",
                    "message": "You are already an approved interviewer.",
                })
            # REJECTED — handled by the update path, should not reach here
 
        return attrs
 
 
class InterviewerApplicationUpdateSerializer(serializers.ModelSerializer):
    """
    Used when a REJECTED applicant re-submits their application.
 
    Key differences from the create serializer:
      • resume / certifications / additional_docs are NOT required —
        if the user doesn't upload a new file we keep the existing one.
      • Status / admin fields are excluded as usual.
    """
 
    specializations = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
 
    # Override file fields to make them optional on update
    resume = serializers.FileField(required=False, allow_null=True)
    certifications  = serializers.FileField(required=False, allow_null=True)
    additional_docs = serializers.FileField(required=False, allow_null=True)
 
    class Meta:
        model  = InterviewerApplication
        exclude = (
            "user", "status", "reviewed_at", "reviewed_by",
            "rejection_reason", "created_at",
        )
 
    def update(self, instance, validated_data):
        # Only replace a file field if a new file was actually sent
        for file_field in ("resume", "certifications", "additional_docs"):
            if file_field not in validated_data or validated_data[file_field] is None:
                validated_data.pop(file_field, None)   # keep the existing file
 
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
 
        # Reset admin-review state so the admin sees it as a fresh submission
        instance.status         = InterviewerApplication.STATUS_PENDING
        instance.rejection_reason = ""
        instance.reviewed_at    = None
        instance.reviewed_by    = None
 
        instance.save()
        return instance
 
 
class InterviewerApplicationReadSerializer(serializers.ModelSerializer):
    """
    Read-only serializer — returns existing application data for pre-populating
    the re-apply form. File fields return the URL/path, not the file object.
    """
 
    specializations = serializers.ListField(child=serializers.CharField())
    languages       = serializers.ListField(child=serializers.CharField())
 
    class Meta:
        model  = InterviewerApplication
        fields = (
            "id",
            "phone_number",
            "location",
            "timezone",
            "linkedin_url",
            "github_url",
            "portfolio_url",
            "company_name",
            "years_of_experience",
            "years_of_interview_experience",
            "specializations",
            "languages",
            "education",
            "expertise_summary",
            "motivation",
            "resume",
            "certifications",
            "additional_docs",
            "status",
            "rejection_reason",
            "created_at",
        )

















class InterviewerApplicationAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = InterviewerApplication
        fields = "__all__"





class InterviewerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerProfile
        fields = [
            "id",
            "display_name",
            "headline",
            "bio",
            "profile_picture",
            "years_of_experience",
            "location",
            "timezone",
            "base_session_rate",
            "specializations",
            "languages",
            "education",
            "certifications",
            "industries",
            "supported_interview_types",
            "supported_experience_levels",
            "is_profile_public",
            "is_accepting_bookings",
            "is_completed",
            "onboarding_step",
        ]

    def validate_specializations(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Specializations must be a list.")
        return value

    def validate_languages(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list.")
        return value

    def validate_supported_interview_types(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list.")
        invalid = set(value) - InterviewerProfile.VALID_INTERVIEW_TYPES
        if invalid:
            raise serializers.ValidationError(
                f"Invalid interview types: {sorted(invalid)}. "
                f"Valid values: {sorted(InterviewerProfile.VALID_INTERVIEW_TYPES)}"
            )
        return value

    def validate_supported_experience_levels(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Must be a list.")
        invalid = set(value) - InterviewerProfile.VALID_EXPERIENCE_LEVELS
        if invalid:
            raise serializers.ValidationError(
                f"Invalid experience levels: {sorted(invalid)}. "
                f"Valid values: {sorted(InterviewerProfile.VALID_EXPERIENCE_LEVELS)}"
            )
        return value



class InterviewerAvailabilityCreateSerializer(serializers.ModelSerializer):
    VALID_DURATIONS = [30, 45, 60, 90]

    duration_minutes = serializers.ChoiceField(
        choices=InterviewerAvailability.DURATION_CHOICES,
        help_text="Session duration: 30, 45, 60, or 90 minutes."
    )

    class Meta:
        model = InterviewerAvailability
        fields = [
            "date",
            "start_time",
            "duration_minutes",
            "timezone",
            "is_recurring",
            "recurrence_type",
            "recurrence_end_date",
        ]

    def validate_duration_minutes(self, value):
        if value not in self.VALID_DURATIONS:
            raise serializers.ValidationError(
                f"Duration must be one of {self.VALID_DURATIONS} minutes."
            )
        return value

    def validate(self, attrs):
        from datetime import datetime, timedelta

        # Calculate end_time on the backend from start_time + duration_minutes
        start_time = attrs.get("start_time")
        duration = attrs.get("duration_minutes")
        if start_time and duration:
            start_dt = datetime.combine(datetime.today(), start_time)
            end_dt = start_dt + timedelta(minutes=duration)
            attrs["end_time"] = end_dt.time()

        if attrs.get("is_recurring"):
            if not attrs.get("recurrence_type"):
                raise serializers.ValidationError(
                    "recurrence_type is required for recurring availability."
                )
            if not attrs.get("recurrence_end_date"):
                raise serializers.ValidationError(
                    "recurrence_end_date is required for recurring availability."
                )

        return attrs
    





class InterviewerVerificationSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerVerification
        fields = [
            "document_type",
            "document_number",
            "document_file",
        ]

    def validate(self, attrs):
        user = self.context["request"].user

        if hasattr(user, "verification"):
            status = user.verification.status
            if status == VerificationStatus.PENDING:
                raise serializers.ValidationError(
                    "Your verification is already under review."
                )
            if status == VerificationStatus.APPROVED:
                raise serializers.ValidationError(
                    "Your document is already verified."
                )

        return attrs



class InterviewerVerificationDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = InterviewerVerification
        fields = "__all__"






class InterviewerProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerProfile
        fields = ["profile_picture"]

    def validate_profile_picture(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image too large (max 5MB).")
        return value  
