from rest_framework import serializers
from .models import InterviewerApplication, InterviewerProfile, InterviewerAvailability, InterviewerVerification



class InterviewerApplicationCreateSerializer(serializers.ModelSerializer):


    specializations = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    languages = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )



    class Meta:
        model = InterviewerApplication
        exclude = ("user", "status", "reviewed_at", "reviewed_by", "rejection_reason", "created_at")

    def validate(self, attrs):
        user = self.context["request"].user

        # Only allow one application
        if hasattr(user, "interviewer_application"):
            raise serializers.ValidationError({
            "code": "APPLICATION_EXISTS",
            "message": "You have already submitted an interviewer application."
        })

        return attrs


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
            "specializations",
            "languages",
            "education",
            "certifications",
            "industries",
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
        




class InterviewerAvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewerAvailability
        fields = [
            "date",
            "start_time",
            "end_time",
            "timezone",
            "is_recurring",
            "recurrence_type",
            "recurrence_end_date",
        ]

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError(
                "Start time must be before end time."
            )

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

        if hasattr(user, "verification") and user.verification.status == "PENDING":
            raise serializers.ValidationError(
                "Your verification is already under review."
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
