# ai_interviews/models.py

from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class Role(models.Model):
    """
    Catalog of interview roles (Software Engineer, Data Scientist, etc.)
    Used for role-based AI interviews.
    """

    name = models.CharField(
        max_length=150,
        unique=True,
        help_text="Human-readable role name, e.g. 'Software Engineer'.",
    )
    slug = models.SlugField(
        max_length=160,
        unique=True,
        help_text="URL-safe identifier, auto-generated from name if blank.",
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional category/group, e.g. 'Engineering', 'Data', 'Business'.",
    )
    description = models.TextField(
        blank=True,
        help_text="Optional short description for UI/tooltips.",
    )

    # Lightweight structure for now; can be migrated to ArrayField or separate tables later.
    aliases = models.JSONField(
        default=list,
        blank=True,
        help_text="List of alternative titles, e.g. ['SDE', 'Software Developer'].",
    )
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text="List of key skills/tags, e.g. ['Python', 'Django', 'REST'].",
    )

    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether to show this role in the top 15 grid.",
    )
    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Controls ordering of featured roles (lower first).",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Soft toggle for deactivating roles without deleting data.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        indexes = [
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Role.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)
























User = settings.AUTH_USER_MODEL


class AIInterviewSession(models.Model):
    """
    One AI mock interview session for a candidate and a specific role.
    This will later be the parent for questions, answers, evaluations, reports, etc.
    """

    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"        # reserved for future flows
        READY = "READY", "Ready to Join"      # config done, user can join the room
        LIVE = "LIVE", "Live"                 # interview in progress
        COMPLETED = "COMPLETED", "Completed"  # finished normally
        CANCELLED = "CANCELLED", "Cancelled"  # user aborted before/while live
        FAILED = "FAILED", "Failed"           # technical failure

    class RoundType(models.TextChoices):
        WARMUP = "WARMUP", "Warm-up"
        BEHAVIORAL = "BEHAVIORAL", "Behavioral"
        ROLE_RELATED = "ROLE_RELATED", "Role Related"
        CODING = "CODING", "Coding"

    class Difficulty(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        PROFESSIONAL = "PROFESSIONAL", "Professional"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ai_interview_sessions",
    )

    role = models.ForeignKey(
        "ai_interviews.Role",
        on_delete=models.PROTECT,
        related_name="ai_interview_sessions",
        help_text="The role this AI interview is targeted at.",
    )

    round_type = models.CharField(
        max_length=32,
        choices=RoundType.choices,
    )

    difficulty = models.CharField(
        max_length=32,
        choices=Difficulty.choices,
    )

    duration_minutes = models.PositiveIntegerField(
        help_text="Planned interview duration (e.g. 5, 15, 30).",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.READY,
        db_index=True,
    )

    # LiveKit room identifiers (token will be created later in /join/ endpoint)
    livekit_room_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Room name/ID used by LiveKit. Can be generated when joining.",
    )

    # When we start generating tokens, we won't store the token in DB for security;
    # instead we will generate short-lived tokens on demand in /join/.

    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["role", "status"]),
        ]

    def __str__(self) -> str:
        return f"AIInterviewSession #{self.id} | {self.user} | {self.role.name} | {self.status}"

    def mark_live(self):
        if self.status in {self.Status.READY, self.Status.CREATED}:
            self.status = self.Status.LIVE
            self.started_at = self.started_at or timezone.now()
            self.save(update_fields=["status", "started_at", "updated_at"])

    def mark_completed(self):
        if self.status == self.Status.LIVE:
            self.status = self.Status.COMPLETED
            self.ended_at = timezone.now()
            self.save(update_fields=["status", "ended_at", "updated_at"])

    @property
    def is_expired(self) -> bool:
        """
        A READY/CREATED session should not remain joinable forever.
        For now, we expire sessions 10 minutes after creation if they were never joined.
        """
        expiry_window = timedelta(minutes=10)
        return (
            self.status in {self.Status.CREATED, self.Status.READY}
            and self.created_at < timezone.now() - expiry_window
        )

    @property
    def is_owner_join_allowed(self) -> bool:
        """
        Owner can join only if the session is READY/CREATED and not expired,
        or if it is already LIVE.
        """
        if self.status == self.Status.LIVE:
            return True

        if self.status in {self.Status.CREATED, self.Status.READY} and not self.is_expired:
            return True

        return False
