from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("ai_interviews", "0006_alter_aiinterviewevaluation_strengths_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AIInterviewAvatarSession",
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
                    "provider",
                    models.CharField(
                        choices=[("tavus", "Tavus")],
                        default="tavus",
                        max_length=24,
                    ),
                ),
                ("enabled", models.BooleanField(default=True)),
                ("replica_id", models.CharField(max_length=64)),
                ("persona_id", models.CharField(max_length=64)),
                (
                    "avatar_participant_identity",
                    models.CharField(blank=True, default="", max_length=128),
                ),
                (
                    "avatar_participant_name",
                    models.CharField(blank=True, default="", max_length=128),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("READY", "Ready"),
                            ("ACTIVE", "Active"),
                            ("ENDED", "Ended"),
                            ("FAILED", "Failed"),
                        ],
                        db_index=True,
                        default="READY",
                        max_length=16,
                    ),
                ),
                ("last_error", models.TextField(blank=True, default="")),
                ("activated_at", models.DateTimeField(blank=True, null=True)),
                ("ended_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "session",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="avatar_session",
                        to="ai_interviews.aiinterviewsession",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
