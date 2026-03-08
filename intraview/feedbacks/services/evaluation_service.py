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

        if booking.status != InterviewBooking.Status.COMPLETED:
            raise ValueError("Booking must be completed.")

        if CandidateEvaluation.objects.filter(booking=booking).exists():
            raise ValueError("Evaluation already submitted.")

        # if booking.completed_at:
        #     deadline = booking.completed_at + timedelta(
        #         hours=settings.FEEDBACK_DEADLINE_HOURS
        #     )
        #     if timezone.now() > deadline:
        #         raise ValueError("Feedback deadline expired.")

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
    

    @staticmethod
    def can_submit_evaluation(booking):
        """
        Check if interviewer can submit evaluation for this booking.
        Returns: (can_submit: bool, reason: str)
        """
        interviewer = booking.interviewer
        
        # Check 1: Must be your own booking
        if booking.interviewer != interviewer:
            return False, "You can only evaluate your own bookings."
        
        # Check 2: Booking must be COMPLETED
        if booking.status != InterviewBooking.Status.COMPLETED:
            return False, f"Booking status must be 'COMPLETED' (current: {booking.status})."
        
        # Check 3: No existing evaluation
        if CandidateEvaluation.objects.filter(booking=booking).exists():
            return False, "Evaluation already submitted for this booking."
        
        # # Check 4: Feedback deadline (if you have completed_at field)
        # # : Add completed_at to InterviewBooking if needed
        # if hasattr(booking, 'completed_at') and booking.completed_at:
        #     deadline = booking.completed_at + timedelta(
        #         hours=settings.FEEDBACK_DEADLINE_HOURS
        #     )
        #     if timezone.now() > deadline:
        #         return False, "Feedback submission deadline has expired."
        
        # All checks passed
        return True, "Ready to submit evaluation."    
