# feedback/services/evaluation_service.py

from django.db import transaction
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from feedbacks.models import CandidateEvaluation, FeedbackType
from bookings.models import InterviewBooking
from feedbacks.signals import evaluation_created


class EvaluationService:

    @staticmethod
    def _validate_business_rules(booking, interviewer):

        if booking.interviewer != interviewer:
            raise ValueError("You can only evaluate your own booking.")

        if booking.status != InterviewBooking.STATUS_COMPLETED:
            raise ValueError("Booking must be completed.")

        if CandidateEvaluation.objects.filter(booking=booking).exists():
            raise ValueError("Evaluation already submitted.")

        if booking.completed_at:
            deadline = booking.completed_at + timedelta(
                hours=settings.FEEDBACK_DEADLINE_HOURS
            )
            if timezone.now() > deadline:
                raise ValueError("Feedback deadline expired.")

    @staticmethod
    @transaction.atomic
    def create_evaluation(*, booking, interviewer, validated_data):

        EvaluationService._validate_business_rules(
            booking=booking,
            interviewer=interviewer
        )

        evaluation = CandidateEvaluation.objects.create(
            booking=booking,
            interviewer=interviewer,
            candidate=booking.candidate,
            feedback_type=FeedbackType.HUMAN,
            **validated_data
        )


        # Emit domain event (decoupled)
        evaluation_created.send(
            sender=EvaluationService,
            booking=booking,
            evaluation=evaluation
        )

        return evaluation
