# feedback/serializers.py

import re

from rest_framework import serializers
from .models import CandidateEvaluation, InterviewerReview
from bookings.models import InterviewBooking


def _strip_html(value: str) -> str:
    """
    Strip HTML tags and collapse whitespace.
    Rejects payloads that still contain <script after stripping.
    """
    # Remove all HTML/XML tags
    cleaned = re.sub(r'<[^>]+>', '', value)
    # Collapse leading/trailing whitespace per line, then overall
    cleaned = cleaned.strip()
    return cleaned


def _has_malicious_content(value: str) -> bool:
    """Detect common XSS patterns even after tag stripping."""
    patterns = [
        r'javascript\s*:',
        r'on\w+\s*=',
        r'<\s*script',
        r'data\s*:\s*text/html',
        r'vbscript\s*:',
    ]
    lower = value.lower()
    return any(re.search(p, lower) for p in patterns)


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

    # ─── Score fields ─────────────────────────────────────────────────────────

    def _validate_score(self, value, field_label):
        if value is None:
            raise serializers.ValidationError(f"Please rate {field_label}.")
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                f"{field_label} must be between 1 and 5."
            )
        return value

    def validate_technical_score(self, value):
        return self._validate_score(value, "Technical Skills")

    def validate_communication_score(self, value):
        return self._validate_score(value, "Communication & Clarity")

    def validate_problem_solving_score(self, value):
        return self._validate_score(value, "Problem Solving Ability")

    def validate_confidence_score(self, value):
        return self._validate_score(value, "Confidence & Composure")

    # ─── Text fields ──────────────────────────────────────────────────────────

    def _validate_text_field(self, value, field_label, min_len=30, max_len=500, required=True):
        cleaned = _strip_html(value or "")

        if _has_malicious_content(value or ""):
            raise serializers.ValidationError(
                f"{field_label} contains disallowed content."
            )

        if required and not cleaned:
            raise serializers.ValidationError(
                f"Please provide {field_label}."
            )

        if required and len(cleaned) < min_len:
            raise serializers.ValidationError(
                f"Minimum {min_len} characters required."
            )

        if len(cleaned) > max_len:
            raise serializers.ValidationError(
                f"{field_label} cannot exceed {max_len} characters."
            )

        return cleaned

    def validate_strengths(self, value):
        return self._validate_text_field(value, "candidate strengths")

    def validate_areas_for_improvement(self, value):
        return self._validate_text_field(value, "areas for improvement")

    def validate_actionable_suggestions(self, value):
        return self._validate_text_field(value, "actionable recommendations")

    def validate_additional_notes(self, value):
        return self._validate_text_field(
            value, "additional notes", min_len=0, required=False
        )

    # ─── Choice fields ────────────────────────────────────────────────────────

    def validate_hire_recommendation(self, value):
        valid = {'STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO'}
        if not value:
            raise serializers.ValidationError(
                "Please select a hiring recommendation."
            )
        if value not in valid:
            raise serializers.ValidationError(
                "Invalid hiring recommendation."
            )
        return value

    def validate_interview_difficulty(self, value):
        valid = {'EASY', 'MEDIUM', 'HARD', 'EXPERT'}
        if not value:
            raise serializers.ValidationError(
                "Please select interview difficulty."
            )
        if value not in valid:
            raise serializers.ValidationError(
                "Invalid difficulty level."
            )
        return value

    # ─── Topics ───────────────────────────────────────────────────────────────

    def validate_topics_covered(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Topics must be a list."
            )

        if len(value) < 1:
            raise serializers.ValidationError(
                "Add at least one topic covered."
            )

        if len(value) > 20:
            raise serializers.ValidationError(
                "You cannot add more than 20 topics."
            )

        cleaned_topics = []
        seen = set()

        for i, topic in enumerate(value):
            if not isinstance(topic, str):
                raise serializers.ValidationError(
                    f"Topic #{i + 1} must be a string."
                )

            topic = topic.strip()

            if not topic:
                raise serializers.ValidationError(
                    f"Topic #{i + 1} cannot be empty or whitespace."
                )

            if len(topic) < 2:
                raise serializers.ValidationError(
                    f"Topic '{topic}' is too short (minimum 2 characters)."
                )

            if len(topic) > 50:
                raise serializers.ValidationError(
                    f"Topic '{topic}' is too long (maximum 50 characters)."
                )

            lower = topic.lower()
            if lower in seen:
                raise serializers.ValidationError(
                    f"Duplicate topic: '{topic}'."
                )

            seen.add(lower)
            cleaned_topics.append(topic)

        return cleaned_topics


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