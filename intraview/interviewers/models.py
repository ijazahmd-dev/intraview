from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

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
    




class InterviewerProfile(models.Model):

    class OnboardingStep(models.TextChoices):
        PROFILE = "PROFILE", "Profile"
        AVAILABILITY = "AVAILABILITY", "Availability"
        VERIFICATION = "VERIFICATION", "Verification"
        COMPLETED = "COMPLETED", "Completed"


    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="interviewer_profile",
    )

    display_name = models.CharField(max_length=100)
    headline = models.CharField(max_length=150, blank=True)
    bio = models.TextField(max_length=1000)

    profile_picture = models.ImageField(
        upload_to="interviewers/profile_pictures/",
        blank=True,
        null=True,
    )

    years_of_experience = models.PositiveIntegerField()
    location = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default="UTC")

    specializations = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    education = models.JSONField(default=list)
    certifications = models.JSONField(default=list,blank=True)
    industries = models.JSONField(default=list, blank=True)

    is_profile_public = models.BooleanField(default=False)
    is_accepting_bookings = models.BooleanField(default=False)

    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True,null=True,)

    onboarding_step = models.CharField(
        max_length=20,
        choices=OnboardingStep.choices,
        default=OnboardingStep.PROFILE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def mark_completed(self):
        self.is_completed = True
        self.completed_at = timezone.now()
        self.onboarding_step = self.OnboardingStep.COMPLETED
        self.save(update_fields=["is_completed", "completed_at", "onboarding_step"])

    def __str__(self):
        return f"{self.user.email} - Interviewer Profile"







class InterviewerAvailability(models.Model):
    """
    Represents a single availability block for an interviewer.
    """

    interviewer = models.ForeignKey(User,on_delete=models.CASCADE,related_name="availabilities", )
    date = models.DateField(help_text="Date for which this availability applies")
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50,default="UTC",help_text="Timezone of the interviewer" )
    is_recurring = models.BooleanField(default=False)
    RECURRENCE_CHOICES = [("DAILY", "Daily"),("WEEKLY", "Weekly"),]
    recurrence_type = models.CharField(max_length=10,choices=RECURRENCE_CHOICES,null=True,blank=True,)
    recurrence_end_date = models.DateField(null=True,blank=True,help_text="End date for recurring availability")
    created_at = models.DateTimeField(auto_now_add=True)
    max_bookings = models.PositiveIntegerField(
        default=1,
        help_text="Maximum bookings allowed for this availability"
    )
    # 🔒 NEW — Soft delete
    is_active = models.BooleanField(default=True)
    rescheduled_at = models.DateTimeField(null=True, blank=True)
    reschedule_reason = models.TextField(blank=True, max_length=500)
    reschedule_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["date", "start_time"]
        unique_together = (
            "interviewer",
            "date",
            "start_time",
            "end_time",
        )

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValueError("Start time must be before end time")
        
    def remaining_capacity(self):
        """
        How many bookings can still be accepted.
        """
        from bookings.models import InterviewBooking

        used = InterviewBooking.objects.filter(
            availability=self,
            status__in=[
                InterviewBooking.Status.CONFIRMED,
                InterviewBooking.Status.COMPLETED,
            ],
        ).count()
        return max(0, self.max_bookings - used)

    def __str__(self):
        return f"{self.interviewer} | {self.date} {self.start_time}-{self.end_time}"
    





class VerificationStatus(models.TextChoices):
    NOT_SUBMITTED = "NOT_SUBMITTED", "Not Submitted"
    PENDING = "PENDING", "Pending Review"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"




class InterviewerVerification(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="verification"
    )

    # Document details
    document_type = models.CharField(
        max_length=50,
        help_text="e.g. Passport, Aadhaar, Driving License"
    )

    document_number = models.CharField(
        max_length=100,
        blank=True
    )

    document_file = models.FileField(
        upload_to="interviewer_verification/"
    )

    # Review status
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.NOT_SUBMITTED
    )

    rejection_reason = models.TextField(blank=True)

    # Audit fields
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_verifications"
    )

    class Meta:
        verbose_name = "Interviewer Verification"
        verbose_name_plural = "Interviewer Verifications"

    def __str__(self):
        return f"{self.user.email} - {self.status}"
    




