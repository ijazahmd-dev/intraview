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

    ACTIVE_STATUSES = {Status.CREATED, Status.READY, Status.LIVE}    

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


    def mark_cancelled(self):
        """
        Mark as CANCELLED from any active status (READY/LIVE/CREATED).
        Used when user aborts or when a newer session replaces this one.
        """
        if self.status in self.ACTIVE_STATUSES:
            self.status = self.Status.CANCELLED
            self.ended_at = timezone.now()
            self.save(update_fields=["status", "ended_at", "updated_at"])

    def mark_failed(self, reason: str | None = None):
        """
        Mark as FAILED due to timeout or technical error.
        """
        if self.status in self.ACTIVE_STATUSES:
            self.status = self.Status.FAILED
            self.ended_at = timezone.now()
            self.save(update_fields=["status", "ended_at", "updated_at"])
            # `reason` can be logged later if you add an audit model.
        

    # ---- Derived state helpers ----    


    # ---------- Time helpers ----------

    def elapsed_seconds(self, now: timezone.datetime | None = None) -> int:
        """
        How many seconds this session has been LIVE.
        """
        if not self.started_at:
            return 0
        if now is None:
            now = timezone.now()
        return max(0, int((now - self.started_at).total_seconds()))

    def remaining_seconds(self, now: timezone.datetime | None = None) -> int:
        """
        Remaining allowed interview time in seconds (0 when over).
        """
        total = int(self.duration_minutes * 60)
        elapsed = self.elapsed_seconds(now)
        return max(0, total - elapsed)


    @property
    def is_expired_before_live(self) -> bool:
        """
        READY/CREATED sessions expire if never joined within 10 minutes.
        """
        expiry_window = timedelta(minutes=10)
        return (
            self.status in {self.Status.CREATED, self.Status.READY}
            and self.created_at < timezone.now() - expiry_window
        )

    @property
    def is_duration_over(self) -> bool:
        """
        Return True if LIVE session has run past its planned duration.
        """
        if self.status != self.Status.LIVE or not self.started_at:
            return False
        return self.remaining_seconds() <= 0

    def refresh_status_from_time(self):
        """
        Apply time-based transitions (expiry / auto-complete).
        This is called from service layer before decisions.
        """
        if self.status in {self.Status.CREATED, self.Status.READY} and self.is_expired_before_live:
            self.mark_failed()
        elif self.status == self.Status.LIVE and self.is_duration_over:
            self.mark_completed()

    @property
    def is_owner_join_allowed(self) -> bool:
        """
        Owner can join only if session is still active and not expired or finished.
        """
        # Apply time-based transitions first
        self.refresh_status_from_time()

        if self.status in {self.Status.READY, self.Status.LIVE}:
            return True

        return False
    










class InterviewRuntimeState(models.Model):
    """
    Durable runtime state owned by the backend.

    The LiveKit agent treats this as the single source of truth for:
      - which turn we're on
      - whether we're waiting for an answer
      - high-level runtime state (e.g. INTRO, ASKING, LISTENING, PROCESSING)
      - reconnect-related metadata

    Separated from AIInterviewSession to avoid cluttering the main model
    with runtime-only concerns.
    """

    # Use OneToOne so session.id == runtime_state.session_id
    session = models.OneToOneField(
        AIInterviewSession,
        on_delete=models.CASCADE,
        related_name="runtime_state",
        primary_key=True,
    )

    # 0-based index of current turn (matches TurnManager / agent)
    current_turn_index = models.PositiveIntegerField(default=0)

    # Whether the agent is currently waiting for the candidate's answer
    waiting_for_answer = models.BooleanField(default=False)

    # String representation of InterviewState (INTRO, ASKING, LISTENING, etc.)
    current_state = models.CharField(max_length=32, default="INITIALIZING")

    # Optional identifier for the current question (e.g. topic or question id)
    current_question_id = models.CharField(max_length=128, blank=True)

    # Remaining seconds as perceived by backend (optional – good for UI)
    remaining_seconds = models.PositiveIntegerField(null=True, blank=True)

    # When we last saw any event for this session (agent / user / system)
    last_event_at = models.DateTimeField(auto_now=True)

    # If user disconnects, we can set a grace deadline when they can resume
    reconnect_grace_until = models.DateTimeField(null=True, blank=True)

    # Count of times the candidate has disconnected
    disconnect_count = models.PositiveIntegerField(default=0)

    # Optional: LiveKit agent session / job id for observability/debugging
    agent_session_id = models.CharField(max_length=64, blank=True)

    # Which runtime currently owns this interview session.
    #
    # Prevents multiple LiveKit runtimes from simultaneously controlling
    # the same interview after reconnects or worker failures.
    active_runtime_id = models.CharField(max_length=128, blank=True)

    # Incrementing ownership generation number.
    #
    # Every time ownership changes, generation increments.
    # Helps stale runtimes detect they are no longer valid.
    runtime_generation = models.PositiveIntegerField(default=0)

    # Last heartbeat received from the owning runtime.
    last_runtime_heartbeat_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Lease expiration timestamp for runtime ownership.
    #
    # If current time exceeds this:
    # - runtime is considered stale/dead
    # - new runtime may safely acquire ownership
    runtime_lease_expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Interview runtime state"
        verbose_name_plural = "Interview runtime states"

    def __str__(self) -> str:
        return (
            f"RuntimeState(session={self.session_id}, "
            f"state={self.current_state}, "
            f"turn={self.current_turn_index})"
        )



















class AIInterviewTurn(models.Model):
  """
  One question-answer pair inside an AI interview session.
  Backend is authoritative for `turn_index` to ensure idempotency.
  """

  session = models.ForeignKey(
      AIInterviewSession,
      on_delete=models.CASCADE,
      related_name="turns",
  )

  # 1-based index: 1, 2, 3, ...
  turn_index = models.PositiveIntegerField()

  question_text = models.TextField()
  answer_text = models.TextField(blank=True)

  # Optional extra metadata coming from agent (JSON).
  # Example: {"agent_question_id": "q1", "topic": "behavioral"}
  metadata = models.JSONField(blank=True, null=True)

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
      ordering = ["turn_index"]
      constraints = [
          # Enforce uniqueness for (session, turn_index) for idempotent POSTs.[web:160][web:166]
          models.UniqueConstraint(
              fields=["session", "turn_index"],
              name="uniq_turn_per_session_index",
          )
      ]

  def __str__(self) -> str:
      return f"Turn {self.turn_index} for session #{self.session_id}"


class AIInterviewEvaluation(models.Model):
  """
  Per-question evaluation: score & feedback for a single turn.
  Generated asynchronously by an evaluation LLM (Gemini Flash).
  """

  class Status(models.TextChoices):
      PENDING = "PENDING", "Pending"
      SUCCESS = "SUCCESS", "Success"
      FAILED = "FAILED", "Failed"

  turn = models.OneToOneField(
      AIInterviewTurn,
      on_delete=models.CASCADE,
      related_name="evaluation",
  )

  # Numeric score (you can decide 0–10 or 0–100; keep it flexible).
  score = models.FloatField(blank=True, null=True)

  # High-level feedback – we treat them as plain text; you can change to JSON later.
  strengths = models.TextField(blank=True)
  weaknesses = models.TextField(blank=True)
  suggestions = models.TextField(blank=True)

  confidence = models.CharField(
      max_length=16,
      blank=True,
      help_text="Optional model confidence label: low/medium/high.",
  )

  status = models.CharField(
      max_length=16,
      choices=Status.choices,
      default=Status.PENDING,
      db_index=True,
  )

  # Raw LLM response for debugging/auditing.
  raw_response = models.JSONField(blank=True, null=True)

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:
      return f"Evaluation for turn {self.turn.turn_index} in session #{self.turn.session_id}"


class AIInterviewFinalReport(models.Model):
  """
  Final session-level report aggregating all per-turn evaluations.
  Generated asynchronously by a higher-quality model (Gemini Pro).
  """

  class Status(models.TextChoices):
      PENDING = "PENDING", "Pending"
      SUCCESS = "SUCCESS", "Success"
      FAILED = "FAILED", "Failed"

  session = models.OneToOneField(
      AIInterviewSession,
      on_delete=models.CASCADE,
      related_name="final_report",
  )

  overall_score = models.FloatField(blank=True, null=True)

  summary = models.TextField(blank=True)
  strengths = models.TextField(blank=True)
  areas_for_improvement = models.TextField(blank=True)
  recommendations = models.TextField(blank=True)

  status = models.CharField(
      max_length=16,
      choices=Status.choices,
      default=Status.PENDING,
      db_index=True,
  )

  raw_response = models.JSONField(blank=True, null=True)

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self) -> str:
      return f"Final report for session #{self.session_id} ({self.status})"