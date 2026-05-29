# # feedback/services/evaluation_service.py

# from django.db import transaction
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta

# from feedbacks.models import CandidateEvaluation, FeedbackType
# from bookings.models import InterviewBooking
# from feedbacks.signals import evaluation_created


# class EvaluationService:

#     @staticmethod
#     def _validate_business_rules(booking, interviewer):

#         if booking.interviewer != interviewer:
#             raise ValueError("You can only evaluate your own booking.")

#         if booking.status != InterviewBooking.Status.COMPLETED:
#             raise ValueError("Booking must be completed.")

#         if CandidateEvaluation.objects.filter(booking=booking).exists():
#             raise ValueError("Evaluation already submitted.")

#         # if booking.completed_at:
#         #     deadline = booking.completed_at + timedelta(
#         #         hours=settings.FEEDBACK_DEADLINE_HOURS
#         #     )
#         #     if timezone.now() > deadline:
#         #         raise ValueError("Feedback deadline expired.")

#     @staticmethod
#     @transaction.atomic
#     def create_evaluation(*, booking, interviewer, validated_data):

#         EvaluationService._validate_business_rules(
#             booking=booking,
#             interviewer=interviewer
#         )

#         evaluation = CandidateEvaluation.objects.create(
#             booking=booking,
#             interviewer=interviewer,
#             candidate=booking.candidate,
#             feedback_type=FeedbackType.HUMAN,
#             **validated_data
#         )


#         # Emit domain event (decoupled)
#         evaluation_created.send(
#             sender=EvaluationService,
#             booking=booking,
#             evaluation=evaluation
#         )

#         return evaluation
    

#     @staticmethod
#     def can_submit_evaluation(booking):
#         """
#         Check if interviewer can submit evaluation for this booking.
#         Returns: (can_submit: bool, reason: str)
#         """
#         interviewer = booking.interviewer
        
#         # Check 1: Must be your own booking
#         if booking.interviewer != interviewer:
#             return False, "You can only evaluate your own bookings."
        
#         # Check 2: Booking must be COMPLETED
#         if booking.status != InterviewBooking.Status.COMPLETED:
#             return False, f"Booking status must be 'COMPLETED' (current: {booking.status})."
        
#         # Check 3: No existing evaluation
#         if CandidateEvaluation.objects.filter(booking=booking).exists():
#             return False, "Evaluation already submitted for this booking."
        
#         # # Check 4: Feedback deadline (if you have completed_at field)
#         # # : Add completed_at to InterviewBooking if needed
#         # if hasattr(booking, 'completed_at') and booking.completed_at:
#         #     deadline = booking.completed_at + timedelta(
#         #         hours=settings.FEEDBACK_DEADLINE_HOURS
#         #     )
#         #     if timezone.now() > deadline:
#         #         return False, "Feedback submission deadline has expired."
        
#         # All checks passed
#         return True, "Ready to submit evaluation."    















# feedbacks/services/evaluation_service.py

from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from feedbacks.models import CandidateEvaluation, FeedbackType
from bookings.models import InterviewBooking
from feedbacks.signals import evaluation_created


EVALUATION_EDIT_WINDOW_HOURS = 24  # you can change this to 48 or 168 later



class EvaluationService:
    """
    Service for creating and validating candidate evaluations.

    Feedback eligibility rule (updated):
      The interviewer can submit an evaluation when EITHER:
        (a) They pressed "Finish Interview" → session.interviewer_finished = True
        (b) The session ended normally by scheduled time → session.status = ENDED
            which results in booking.status = COMPLETED

      This decouples feedback from the booking lifecycle clock.
      An interviewer who leaves early can still evaluate immediately.
    """

    @staticmethod
    def _get_session(booking):
        """
        Safely fetch the InterviewSession for a booking.
        Returns None if no session exists yet.
        """
        try:
            return booking.session  # OneToOne reverse accessor
        except Exception:
            return None

    @staticmethod
    def _validate_business_rules(booking, interviewer):
        """
        Raises ValueError with a user-facing message if submission is not allowed.
        """
        # Must be the interviewer of this booking
        if booking.interviewer != interviewer:
            raise ValueError("You can only evaluate your own booking.")

        # No duplicate evaluations
        if CandidateEvaluation.objects.filter(booking=booking).exists():
            raise ValueError("Evaluation already submitted for this booking.")

        # Check eligibility using the same logic as can_submit_evaluation
        can_submit, reason = EvaluationService.can_submit_evaluation(booking)
        if not can_submit:
            raise ValueError(reason)

    @staticmethod
    @transaction.atomic
    def create_evaluation(*, booking, interviewer, validated_data):
        EvaluationService._validate_business_rules(
            booking=booking,
            interviewer=interviewer,
        )

        evaluation = CandidateEvaluation.objects.create(
            booking=booking,
            interviewer=interviewer,
            candidate=booking.candidate,
            feedback_type=FeedbackType.HUMAN,
            **validated_data,
        )

        # Emit domain event (decoupled from view layer)
        evaluation_created.send(
            sender=EvaluationService,
            booking=booking,
            evaluation=evaluation,
        )

        return evaluation

    @staticmethod
    def can_submit_evaluation(booking) -> tuple[bool, str]:
        """
        Check whether the interviewer is allowed to submit an evaluation.

        Returns (can_submit: bool, reason: str).

        Eligibility requires ONE of:
          1. session.interviewer_finished == True
             (interviewer explicitly pressed "Finish Interview")
          2. booking.status == COMPLETED
             (session ended at scheduled time via Celery job)

        This means an interviewer who leaves early can still evaluate
        immediately after pressing Finish, without waiting for the
        session clock to run out.
        """
        # ── Already submitted? ─────────────────────────────────────────────────
        if CandidateEvaluation.objects.filter(booking=booking).exists():
            return False, "Evaluation already submitted for this booking."

        # ── Session ended by scheduled time ────────────────────────────────────
        if booking.status == InterviewBooking.Status.COMPLETED:
            return True, "Session completed — ready to submit evaluation."

        # ── Interviewer pressed "Finish Interview" ──────────────────────────────
        session = EvaluationService._get_session(booking)

        if session is None:
            return False, "No interview session found. Please join the interview first."

        if session.interviewer_finished:
            return True, "You have finished the interview — ready to submit evaluation."

        # ── Not yet eligible ───────────────────────────────────────────────────
        # Provide a helpful, specific message
        if booking.status == InterviewBooking.Status.LIVE:
            return (
                False,
                "The interview is still live. "
                "Press 'Finish Interview' to unlock feedback submission.",
            )

        if booking.status == InterviewBooking.Status.CONFIRMED:
            return False, "The interview has not started yet."

        # Cancelled / no-show states
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

        return False, f"Evaluation not allowed (booking status: {booking.status})."
    




    @staticmethod
    def can_edit_evaluation(evaluation: CandidateEvaluation, interviewer) -> tuple[bool, str]:
        """
        Rules:
        - Only the same interviewer who created it.
        - Only for HUMAN feedback.
        - Only within EVALUATION_EDIT_WINDOW_HOURS from created_at.
        """
        # Must be the owner
        if evaluation.interviewer != interviewer:
            return False, "You can only edit evaluations that you created."

        # (Optional) Only human feedback is editable
        if evaluation.feedback_type != FeedbackType.HUMAN:
            return False, "AI-generated evaluations cannot be edited."

        # Time window
        if not evaluation.created_at:
            return False, "Editing is not allowed for this evaluation."

        deadline = evaluation.created_at + timedelta(hours=EVALUATION_EDIT_WINDOW_HOURS)
        now = timezone.now()

        if now > deadline:
            return False, "The editing window for this evaluation has expired."

        return True, "You can edit this evaluation."
    




    @staticmethod
    @transaction.atomic
    def update_evaluation(*, evaluation: CandidateEvaluation, interviewer, validated_data: dict) -> CandidateEvaluation:
        """
        Update an existing evaluation with new scores/text.

        - Enforces can_edit_evaluation rules.
        - Updates only allowed fields.
        - Bumps edit metadata.
        """
        # Ownership & window checks
        can_edit, reason = EvaluationService.can_edit_evaluation(evaluation, interviewer)
        if not can_edit:
            # Keep same style as create: raise ValueError with user-facing message
            raise ValueError(reason)

        # Whitelist fields that can be edited
        editable_fields = [
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

        for field in editable_fields:
            if field in validated_data:
                setattr(evaluation, field, validated_data[field])

        # Update metadata
        evaluation.is_edited = True
        evaluation.edit_count = (evaluation.edit_count or 0) + 1
        evaluation.edited_at = timezone.now()

        # save() will recompute overall_score and run full_clean()
        evaluation.save()

        return evaluation