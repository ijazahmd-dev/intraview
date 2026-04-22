import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intraview.settings")

app = Celery("intraview")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()




# -----------------------------------
# Celery Beat Schedule
# -----------------------------------
app.conf.beat_schedule = {
    "expire-user-subscriptions-daily": {
        "task": "subscriptions.tasks.user_expiry.expire_user_subscriptions",
        "schedule": crontab(hour=2, minute=0),  # 02:00 UTC daily
    },
    "expire-interviewer-subscriptions-daily": {
        "task": "interviewer_subscriptions.tasks.expiry.expire_interviewer_subscriptions",
        "schedule": crontab(hour=2, minute=10),  # 10 min after users
    },
    'cleanup-stale-sessions': {
        'task': 'realtime.tasks.cleanup_stale_sessions',
        'schedule': 60.0,  # Every 60 seconds
    },
    "interview-start-reminders-5min": {
        "task": "notifications.tasks.send_interview_start_reminders",
        "schedule": 300.0,  # seconds
    },
    # Every hour: feedback reminders (tune to your needs)
    "feedback-reminders-hourly": {
        "task": "notifications.tasks.send_feedback_reminders",
        "schedule": crontab(minute="0", hour="*"),
    },
}




# celery -A intraview worker --loglevel=info
# celery -A intraview beat -l info
