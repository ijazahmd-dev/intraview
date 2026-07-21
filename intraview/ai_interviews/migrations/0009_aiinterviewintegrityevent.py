from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ai_interviews", "0008_aiinterviewsession_generated_questions"),
    ]

    operations = [
        migrations.CreateModel(
            name="AIInterviewIntegrityEvent",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "client_event_id",
                    models.CharField(
                        help_text="Client-generated id used for best-effort de-duplication.",
                        max_length=64,
                    ),
                ),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("TAB_SWITCH", "Tab Switch"),
                            ("WINDOW_FOCUS_LOSS", "Window Focus Loss"),
                            ("FULLSCREEN_EXIT", "Fullscreen Exit"),
                            ("FACE_MISSING", "Face Missing"),
                        ],
                        db_index=True,
                        max_length=32,
                    ),
                ),
                (
                    "started_at",
                    models.DateTimeField(
                        help_text="When the browser-side event started."
                    ),
                ),
                (
                    "ended_at",
                    models.DateTimeField(
                        blank=True,
                        help_text="When the event ended, if a duration could be measured.",
                        null=True,
                    ),
                ),
                (
                    "duration_seconds",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Rounded event duration in seconds when available.",
                        null=True,
                    ),
                ),
                (
                    "metadata",
                    models.JSONField(
                        blank=True,
                        default=dict,
                        help_text="Lightweight structured context such as warning variant or visibility state.",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "session",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="integrity_events",
                        to="ai_interviews.aiinterviewsession",
                    ),
                ),
            ],
            options={
                "ordering": ["started_at", "id"],
                "indexes": [
                    models.Index(
                        fields=["session", "event_type"],
                        name="ai_intervie_session_707238_idx",
                    ),
                    models.Index(
                        fields=["session", "started_at"],
                        name="ai_intervie_session_475319_idx",
                    ),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="aiinterviewintegrityevent",
            constraint=models.UniqueConstraint(
                fields=("session", "client_event_id"),
                name="uniq_ai_integrity_event_per_session_client_id",
            ),
        ),
    ]
