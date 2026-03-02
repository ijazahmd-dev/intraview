from django.db import transaction

from feedbacks.models import InterviewerReview, FeedbackType


class ReviewService:


    @staticmethod
    @transaction.atomic
    def create_review(*, booking, candidate, validated_data):

        review = InterviewerReview.objects.create(

            booking=booking,

            candidate=candidate,

            interviewer=booking.interviewer,

            feedback_type=FeedbackType.HUMAN,

            **validated_data

        )


        # ⭐ FUTURE READY:
        # Add rating aggregation / notifications here


        return review