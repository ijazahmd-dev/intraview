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






class CandidateEvaluationUpdateSerializer(CandidateEvaluationCreateSerializer):
    """
    Same fields/validators as create, but used for PATCH updates.
    """
    class Meta(CandidateEvaluationCreateSerializer.Meta):
        # Same fields, model, validation; we allow partial via `partial=True` in the view.
        pass










# class CandidateEvaluationDetailSerializer(serializers.ModelSerializer):

#     candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
#     interviewer_email = serializers.EmailField(source="interviewer.email", read_only=True)

#     class Meta:
#         model = CandidateEvaluation
#         fields = "__all__"
#         read_only_fields = "__all__"








class CandidateEvaluationDetailSerializer(serializers.ModelSerializer):
    """
    Full evaluation payload used by BOTH:
      - Interviewer list/detail
      - Candidate list/detail

    Adds denormalized fields used in the React UI:
      - candidate_name
      - candidate_email
      - interviewer_email
      - booking_title
    """

    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(
        source="candidate.email", read_only=True
    )
    interviewer_email = serializers.EmailField(
        source="interviewer.email", read_only=True
    )
    booking_title = serializers.SerializerMethodField()

    class Meta:
        model = CandidateEvaluation
        fields = [
            "id",
            "booking",
            "feedback_type",
            "technical_score",
            "communication_score",
            "problem_solving_score",
            "confidence_score",
            "overall_score",
            "hire_recommendation",
            "strengths",
            "areas_for_improvement",
            "actionable_suggestions",
            "additional_notes",
            "interview_difficulty",
            "topics_covered",
            "is_visible_to_candidate",
            "candidate",
            "interviewer",
            "candidate_name",
            "candidate_email",
            "interviewer_email",
            "booking_title",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_candidate_name(self, obj):
        full = f"{obj.candidate.first_name} {obj.candidate.last_name}".strip()
        return full or obj.candidate.email

    def get_booking_title(self, obj):
        # You can customize this later if booking has its own title field.
        return f"Mock Interview #{obj.booking_id}"






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
# CANDIDATE EVALUATION LIST
# ============================================


class CandidateEvaluationListSerializer(serializers.ModelSerializer):
    """
    Compact list view for candidate evaluations.
    Used on candidate side where we only show high‑level info.
    """

    interviewer_email = serializers.EmailField(
        source="interviewer.email",
        read_only=True,
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