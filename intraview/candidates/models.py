from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator

# Create your models here.




class CurrentStatus(models.TextChoices):
    STUDENT = "Student", "Student"
    WORKING_PROFESSIONAL = "Working Professional", "Working Professional"
    FREELANCER = "Freelancer", "Freelancer"
    JOB_SEEKER = "Job Seeker", "Job Seeker"
    CAREER_SWITCHER = "Career Switcher", "Career Switcher"

class ExperienceLevel(models.TextChoices):
    BEGINNER = "Beginner", "Beginner"
    INTERMEDIATE = "Intermediate", "Intermediate"
    ADVANCED = "Advanced", "Advanced"

class InterviewType(models.TextChoices):
    HR = "HR", "HR Round"
    TECHNICAL = "TECHNICAL", "Technical"
    SYSTEM_DESIGN = "SYSTEM_DESIGN", "System Design"
    DSA = "DSA", "Data Structures & Algorithms"
    BEHAVIORAL = "BEHAVIORAL", "Behavioral"

class DifficultyLevel(models.TextChoices):
    BEGINNER = "BEGINNER", "Beginner"
    INTERMEDIATE = "INTERMEDIATE", "Intermediate" 
    ADVANCED = "ADVANCED", "Advanced"








class CandidateProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
        limit_choices_to={'role': 'user'}
    )
    

    full_name = models.CharField(max_length=100, blank=True)
    headline = models.CharField(max_length=150, blank=True)  # e.g. "Aspiring ML Engineer"
    bio = models.TextField(blank=True)  # About me section
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    

    

    current_status = models.CharField(max_length=50, choices=CurrentStatus.choices, blank=True)
    current_role = models.CharField(max_length=120, blank=True)
    target_role = models.CharField(max_length=120, blank=True)
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices, blank=True)
    years_experience = models.PositiveIntegerField(null=True, blank=True)  # ✅ FIXED: removed default=0
    skills = models.JSONField(default=list, blank=True)
    

    preferred_interview_types = models.JSONField(default=list, blank=True)
    preferred_difficulty = models.CharField(
        max_length=20, 
        choices=DifficultyLevel.choices, 
        default="INTERMEDIATE"
    )
    preferred_duration = models.PositiveIntegerField(default=30, blank=True)
    interviewer_notes = models.TextField(blank=True)

    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    

    resume_file = models.FileField(
        upload_to='candidate_resumes/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    resume_url = models.URLField(blank=True)

    resume_upload_status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("DONE", "Done"),
            ("FAILED", "Failed")
        ],
        default="DONE"
    )
    resume_uploaded_at = models.DateTimeField(null=True, blank=True)
    

    profile_completion = models.FloatField(default=0.0, editable=False)
    interviews_completed = models.PositiveIntegerField(default=0, editable=False)

    # ---- AI Interview Quota ----
    free_ai_interviews_remaining = models.PositiveIntegerField(
        default=3,
        help_text="Free onboarding AI interviews for new signups.",
    )
    subscription_ai_interviews_remaining = models.IntegerField(
        default=0,
        help_text="Remaining AI interview quota from paid subscription. -1 means unlimited (Pro).",
    )
    has_unlimited_ai = models.BooleanField(
        default=False,
        help_text="True for Pro plan users — no quota or token deduction.",
    )
    ai_subscription_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the subscription-based AI quota expires.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Candidate Profile"
        verbose_name_plural = "Candidate Profiles"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - Candidate Profile"  
    
    def save(self, *args, **kwargs):
        self.update_profile_completion()
        super().save(*args, **kwargs)
    
    def update_profile_completion(self):
        """Calculate profile completion percentage based on filled fields."""
        total_fields = 14
        filled_fields = 0

        if self.full_name: filled_fields += 1
        if self.headline: filled_fields += 1
        if self.bio: filled_fields += 1
        if self.phone: filled_fields += 1
        if self.location: filled_fields += 1
        if self.target_role: filled_fields += 1
        if self.experience_level: filled_fields += 1
        if self.years_experience is not None: filled_fields += 1
        if self.skills: filled_fields += 1
        if self.resume_file or self.resume_url: filled_fields += 1
        if self.linkedin_url: filled_fields += 1
        if self.github_url: filled_fields += 1
        if self.preferred_interview_types: filled_fields += 1
        if self.interviewer_notes: filled_fields += 1

        self.profile_completion = round((filled_fields / total_fields) * 100, 2)
    
    def get_profile_picture_url(self):
        """Return profile picture URL or a generated avatar fallback."""
        if self.user.profile_picture_url:
            return self.user.profile_picture_url
        name = (self.full_name or self.user.get_full_name() or self.user.email).strip()
        return f"https://ui-avatars.com/api/?name={name}&background=random"


    



