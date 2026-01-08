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
}




# celery -A intraview worker --loglevel=info