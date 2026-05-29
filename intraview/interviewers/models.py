# intervewers models.py


from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

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
    company_name = models.CharField(max_length=200,blank=True,help_text="Current or most recent company the applicant works/worked at.",)
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

    
    @classmethod
    def can_user_apply(cls, user):
        """
        Check if user is allowed to submit new application
        """
        try:
            app = user.interviewer_application
            if app.status == cls.STATUS_REJECTED:
                return True, "Previous application was rejected. Can reapply."
            elif app.status == cls.STATUS_PENDING:
                return False, "Pending application exists."
            elif app.status == cls.STATUS_APPROVED:
                return False, "Already approved interviewer."
        except cls.DoesNotExist:
            return True, "No previous application."
        return False, "Unknown status."
    
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

    base_session_rate = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(5), MaxValueValidator(50)],
        help_text="Token cost for a 30-minute session"
    )

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

    DURATION_CHOICES = [
        (30, "30 minutes"),
        (45, "45 minutes"),
        (60, "60 minutes"),
        (90, "90 minutes"),
    ]
    VALID_DURATIONS = {30, 45, 60, 90}

    interviewer = models.ForeignKey(User,on_delete=models.CASCADE,related_name="availabilities", )
    date = models.DateField(help_text="Date for which this availability applies")
    start_time = models.TimeField()
    end_time = models.TimeField()  # Derived from start_time + duration_minutes
    duration_minutes = models.PositiveIntegerField(
        choices=DURATION_CHOICES,
        default=30,
        help_text="Session duration in minutes. Must be 30, 45, 60, or 90.",
    )
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
    # 🔒 Soft delete
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
        from datetime import datetime, timedelta
        if self.duration_minutes not in self.VALID_DURATIONS:
            raise ValueError(
                f"Invalid duration. Must be one of {sorted(self.VALID_DURATIONS)} minutes."
            )
        if self.start_time and self.duration_minutes:
            start_dt = datetime.combine(datetime.today(), self.start_time)
            end_dt = start_dt + timedelta(minutes=self.duration_minutes)
            self.end_time = end_dt.time()
        if self.start_time and self.end_time:
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
                InterviewBooking.Status.LIVE,
            ],
        ).count()
        return max(0, self.max_bookings - used)

    def token_cost_for(self, base_rate):
        """Calculate token cost for this slot duration, based on base_rate (30-min rate)."""
        return int(base_rate * self.duration_minutes / 30)

    def __str__(self):
        return f"{self.interviewer} | {self.date} {self.start_time}-{self.end_time} ({self.duration_minutes}min)"
    





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
    




