from django.contrib.auth.models import AbstractUser
from django.db import models



class InterviewerStatus(models.TextChoices):
    NOT_APPLIED = "NOT_APPLIED", "Not Applied"
    PENDING_APPROVAL = "PENDING_APPROVAL", "Pending Approval"
    REJECTED = "REJECTED", "Rejected"
    APPROVED_NOT_ONBOARDED = "APPROVED_NOT_ONBOARDED", "Approved (Not Onboarded)"
    ACTIVE = "ACTIVE", "Active"
    SUSPENDED = "SUSPENDED", "Suspended"



class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Candidate'),
        ('interviewer', 'Interviewer'),
        ('admin', 'Admin'),
        ('company', 'Company'),
    )

    AUTH_PROVIDER_CHOICES = (
        ('email','Email/Password'),
        ('google','Google')
    )


    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES,default='user')
    interviewer_status = models.CharField(max_length=30,choices=InterviewerStatus.choices,default=InterviewerStatus.NOT_APPLIED,)
    profile_picture_url = models.URLField(blank=True, null=True)
    social_auth_id = models.CharField(max_length=255, blank=True, null=True)  # For Google ID
    is_email_verified = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=50, choices=AUTH_PROVIDER_CHOICES,default='email')
    last_otp_sent_at = models.DateTimeField(null=True,blank=True)


    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def token_balance(self):
        """Total available tokens (balance - locked)"""
        wallet = getattr(self, 'token_wallet', None)
        return wallet.balance - wallet.locked_balance if wallet else 0

    @property
    def total_balance(self):
        """Total tokens owned (balance + locked)"""
        wallet = getattr(self, 'token_wallet', None)
        return wallet.balance + wallet.locked_balance if wallet else 0


    def __str__(self):
        return self.username
    



