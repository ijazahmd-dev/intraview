from rest_framework import serializers
from .models import InterviewerApplication


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