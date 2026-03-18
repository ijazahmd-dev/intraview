# from django.db import transaction

# from feedbacks.models import InterviewerReview, FeedbackType


# class ReviewService:


#     @staticmethod
#     @transaction.atomic
#     def create_review(*, booking, candidate, validated_data):

#         review = InterviewerReview.objects.create(

#             booking=booking,

#             candidate=candidate,

#             interviewer=booking.interviewer,

#             feedback_type=FeedbackType.HUMAN,

#             **validated_data

#         )


#         # ⭐ FUTURE READY:
#         # Add rating aggregation / notifications here


#         return review
























# feedback/services/review_service.py

from django.db import transaction

from feedbacks.models import InterviewerReview, FeedbackType
from bookings.models import InterviewBooking


class ReviewService:
    """
    Service for creating and validating interviewer reviews (candidate → interviewer).

    Feedback eligibility rule (updated):
      The candidate can submit a review when EITHER:
        (a) They pressed "Finish Interview" → session.candidate_finished = True
        (b) The session ended normally by scheduled time → booking.status = COMPLETED

      This mirrors EvaluationService's logic exactly.
    """

    @staticmethod
    def _get_session(booking):
        try:
            return booking.session  # OneToOne reverse accessor from InterviewSession
        except Exception:
            return None

    @staticmethod
    def can_submit_review(booking, candidate) -> tuple[bool, str]:
        """
        Check whether the candidate is allowed to submit a review.

        Returns (can_submit: bool, reason: str).

        Eligibility requires ONE of:
          1. session.candidate_finished == True
          2. booking.status == COMPLETED
        """
        # Must be the candidate of this booking
        if booking.candidate != candidate:
            return False, "You can only review your own booking."

        # No duplicate reviews
        if InterviewerReview.objects.filter(booking=booking).exists():
            return False, "Review already submitted for this booking."

        # ── Session ended by scheduled time ────────────────────────────────────
        if booking.status == InterviewBooking.Status.COMPLETED:
            return True, "Session completed — ready to submit review."

        # ── Candidate pressed "Finish Interview" ───────────────────────────────
        session = ReviewService._get_session(booking)

        if session is None:
            return False, "No interview session found. Please join the interview first."

        if session.candidate_finished:
            return True, "You have finished the interview — ready to submit review."

        # ── Not yet eligible ───────────────────────────────────────────────────
        if booking.status == InterviewBooking.Status.LIVE:
            return (
                False,
                "The interview is still live. "
                "Press 'Finish Interview' to unlock feedback submission.",
            )

        if booking.status == InterviewBooking.Status.CONFIRMED:
            return False, "The interview has not started yet."

        if booking.status in [
            InterviewBooking.Status.CANCELLED,
            InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
            InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
        ]:
            return False, "This interview was cancelled."

        if booking.status in [
            InterviewBooking.Status.CANDIDATE_NO_SHOW,
            InterviewBooking.Status.INTERVIEWER_NO_SHOW,
        ]:
            return False, "This interview ended as a no-show."

        return False, f"Review not allowed (booking status: {booking.status})."

    @staticmethod
    def _validate_business_rules(booking, candidate):
        can_submit, reason = ReviewService.can_submit_review(booking, candidate)
        if not can_submit:
            raise ValueError(reason)

    @staticmethod
    @transaction.atomic
    def create_review(*, booking, candidate, validated_data):
        ReviewService._validate_business_rules(booking=booking, candidate=candidate)

        review = InterviewerReview.objects.create(
            booking=booking,
            candidate=candidate,
            interviewer=booking.interviewer,
            feedback_type=FeedbackType.HUMAN,
            **validated_data,
        )

        # ⭐ FUTURE READY: Add rating aggregation / notifications here

        return review