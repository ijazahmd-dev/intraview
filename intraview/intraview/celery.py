import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intraview.settings")

app = Celery("intraview")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()









# celery -A intraview worker --loglevel=info