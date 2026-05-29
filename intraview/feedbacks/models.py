# feedback/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class FeedbackType(models.TextChoices):
    HUMAN = "HUMAN", "Human Interview"
    AI = "AI", "AI Interview"


class CandidateEvaluation(models.Model):
    """
    Core structured evaluation.
    This is the primary product value for candidates.
    """

    booking = models.OneToOneField(
        "bookings.InterviewBooking",
        on_delete=models.CASCADE,
        related_name="candidate_evaluation"
    )

    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="evaluations_given",
        null=True,
        blank=True
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="evaluations_received"
    )

    feedback_type = models.CharField(
        max_length=10,
        choices=FeedbackType.choices,
        default=FeedbackType.HUMAN,
        db_index=True
    )

    # Structured ratings (1–5)
    technical_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    communication_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    problem_solving_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    confidence_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    overall_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        editable=False
    )

    hire_recommendation = models.CharField(
        max_length=20,
        choices=[
            ('STRONG_YES', 'Strong Yes'),
            ('YES', 'Yes'),
            ('MAYBE', 'Maybe'),
            ('NO', 'No'),
            ('STRONG_NO', 'Strong No'),
        ]
    )

    strengths = models.TextField()
    areas_for_improvement = models.TextField()
    actionable_suggestions = models.TextField()
    additional_notes = models.TextField(blank=True)

    interview_difficulty = models.CharField(
        max_length=20,
        choices=[
            ('EASY', 'Easy'),
            ('MEDIUM', 'Medium'),
            ('HARD', 'Hard'),
            ('EXPERT', 'Expert'),
        ]
    )

    topics_covered = models.JSONField(default=list)

    is_visible_to_candidate = models.BooleanField(default=True)

    is_edited = models.BooleanField(default=False)
    edit_count = models.PositiveIntegerField(default=0)
    edited_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['booking'],
                name='unique_evaluation_per_booking'
            )
        ]
        indexes = [
            models.Index(fields=['candidate', 'feedback_type']),
            models.Index(fields=['overall_score']),
        ]

    def clean(self):
        """
        Enforce interviewer presence rules.
        """
        if self.feedback_type == FeedbackType.HUMAN and not self.interviewer:
            raise ValidationError("Human evaluation must have an interviewer.")

        if self.feedback_type == FeedbackType.AI and self.interviewer:
            raise ValidationError("AI evaluation should not have a human interviewer.")

    def save(self, *args, **kwargs):
        self.overall_score = round(
            (
                self.technical_score +
                self.communication_score +
                self.problem_solving_score +
                self.confidence_score
            ) / 4,
            1
        )
        self.full_clean()
        super().save(*args, **kwargs)

    def is_positive_feedback(self):
        return self.overall_score >= 3.5












class InterviewerReview(models.Model):
    """
    Candidate → Interviewer rating.
    Used for ranking, moderation, and governance.
    """

    booking = models.OneToOneField(
        "bookings.InterviewBooking",
        on_delete=models.CASCADE,
        related_name="interviewer_review"
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given"
    )

    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received"
    )

    feedback_type = models.CharField(
        max_length=10,
        choices=FeedbackType.choices,
        default=FeedbackType.HUMAN,
        db_index=True
    )

    overall_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    was_interviewer_prepared = models.BooleanField()
    was_professional = models.BooleanField(default=True)
    would_recommend = models.BooleanField()

    comment = models.TextField(blank=True, max_length=500)

    reported_issues = models.JSONField(default=list, blank=True)

    is_anonymous = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['booking'],
                name='unique_review_per_booking'
            )
        ]
        indexes = [
            models.Index(fields=['interviewer', 'overall_rating']),
        ]

    def has_red_flags(self):
        return (
            self.overall_rating <= 2 or
            not self.was_professional or
            len(self.reported_issues) > 0
        )
