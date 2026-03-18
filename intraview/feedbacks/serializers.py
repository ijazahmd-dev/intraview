# feedback/serializers.py

from rest_framework import serializers
from .models import CandidateEvaluation, InterviewerReview
from bookings.models import InterviewBooking









#################################################### Interviewer side ##############################################################


class CandidateEvaluationCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = CandidateEvaluation
        fields = [
            "technical_score",
            "communication_score",
            "problem_solving_score",
            "confidence_score",
            "hire_recommendation",
            "strengths",
            "areas_for_improvement",
            "actionable_suggestions",
            "additional_notes",
            "interview_difficulty",
            "topics_covered",
        ]

    def validate_strengths(self, value):
        if len(value) < 20:
            raise serializers.ValidationError(
                "Strengths must be at least 20 characters."
            )
        return value


class CandidateEvaluationDetailSerializer(serializers.ModelSerializer):

    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    interviewer_email = serializers.EmailField(source="interviewer.email", read_only=True)

    class Meta:
        model = CandidateEvaluation
        fields = "__all__"
        read_only_fields = "__all__"










#################################################### Candidate side ##############################################################





# ============================================
# INTERVIEWER REVIEW CREATE
# ============================================

class InterviewerReviewCreateSerializer(serializers.ModelSerializer):

    class Meta:

        model = InterviewerReview

        fields = [

            "overall_rating",

            "was_interviewer_prepared",

            "was_professional",

            "would_recommend",

            "comment",

            "reported_issues",

            "is_anonymous",

        ]


    # ✅ Explicit rating validation (recommended)
    def validate_overall_rating(self, value):

        if value < 1 or value > 5:

            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value


    # ✅ Optional comment validation
    def validate_comment(self, value):

        if value and len(value.strip()) < 5:

            raise serializers.ValidationError(
                "Comment must be at least 5 characters."
            )

        return value


    # ✅ Main business validation
    def validate(self, data):

        booking = self.context["booking"]

        user = self.context["request"].user


        # Ownership validation
        if booking.candidate != user:

            raise serializers.ValidationError(
                "You can review only your own interview."
            )


        # # Booking status validation
        # if booking.status != InterviewBooking.Status.COMPLETED:

        #     raise serializers.ValidationError(
        #         "Interview must be completed before review."
        #     )


        # Duplicate prevention
        if hasattr(booking, "interviewer_review"):

            raise serializers.ValidationError(
                "Review already submitted."
            )


        return data



# ============================================
# INTERVIEWER REVIEW DETAIL
# ============================================

class InterviewerReviewDetailSerializer(serializers.ModelSerializer):

    interviewer_email = serializers.EmailField(
        source="interviewer.email",
        read_only=True
    )

    class Meta:

        model = InterviewerReview

        fields = "__all__"



# ============================================
# CANDIDATE EVALUATION DETAIL
# ============================================

class CandidateEvaluationDetailSerializer(serializers.ModelSerializer):

    interviewer_email = serializers.EmailField(
        source="interviewer.email",
        read_only=True
    )

    class Meta:

        model = CandidateEvaluation

        fields = "__all__"



# ============================================
# CANDIDATE EVALUATION LIST
# ============================================

class CandidateEvaluationListSerializer(serializers.ModelSerializer):

    interviewer_email = serializers.EmailField(
        source="interviewer.email",
        read_only=True
    )

    class Meta:

        model = CandidateEvaluation

        fields = [

            "id",

            "overall_score",

            "hire_recommendation",

            "created_at",

            "interviewer_email",

        ]