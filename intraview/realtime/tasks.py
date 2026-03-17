from celery import shared_task
from .services.session_service import SessionService

@shared_task
def cleanup_stale_sessions():
    return SessionService.cleanup_stale_sessions()