from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.



User = get_user_model()


class InterviewerApplication(models.Model):
    STATUS_PENDING = "PENDING"
    STATUS_APPROVED = "APPROVED"
    STATUS_REJECTED = "REJECTED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending review"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="interviewer_application",
        help_text="The normal user who applied to become an interviewer.",
    )

    # Personal info
    phone_number = models.CharField(max_length=20, help_text="Include country code")
    location = models.CharField(max_length=100)
    timezone = models.CharField(max_length=100)

    # Professional info
    years_of_experience = models.PositiveIntegerField()
    years_of_interview_experience = models.PositiveIntegerField(default=0)
    education = models.CharField(max_length=255, blank=True)

    # Flexible multi-select fields (store as list of strings)
    specializations = models.JSONField(
        default=list,
        help_text="Example: ['Frontend', 'Backend', 'System Design']",
    )
    languages = models.JSONField(
        default=list,
        help_text="Example: ['English', 'Hindi']",
    )

    # Links
    linkedin_url = models.URLField(max_length=300, blank=True)
    github_url = models.URLField(max_length=300, blank=True)
    portfolio_url = models.URLField(max_length=300, blank=True)

    # Narrative
    expertise_summary = models.TextField(
        help_text="Short summary of interviewer’s experience and strengths."
    )
    motivation = models.TextField(
        blank=True,
        help_text="Why do you want to be an interviewer?",
    )

    # Documents
    resume = models.FileField(upload_to="interviewers/resumes/")
    certifications = models.FileField(
        upload_to="interviewers/certifications/",
        null=True,
        blank=True,
    )
    additional_docs = models.FileField(
    upload_to="interviewers/additional_docs/",
    null=True,
    blank=True
    )

    # Admin side
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_interviewer_applications",
    )
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Interviewer Application"
        verbose_name_plural = "Interviewer Applications"

        constraints = [
        models.UniqueConstraint(
            fields=["user"],
            name="unique_interviewer_application_per_user"
        )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.status}"

