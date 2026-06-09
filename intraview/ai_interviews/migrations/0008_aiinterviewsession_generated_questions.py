from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ai_interviews", "0007_aiinterviewavatarsession"),
    ]

    operations = [
        migrations.AddField(
            model_name="aiinterviewsession",
            name="generated_questions",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    "Structured interview questions prepared at session creation. "
                    "Each item stores text/topic/followup_allowed for the live agent."
                ),
            ),
        ),
    ]
