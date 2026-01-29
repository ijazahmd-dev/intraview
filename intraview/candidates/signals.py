from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import CandidateProfile


User = settings.AUTH_USER_MODEL



@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_candidate_profile(sender, instance, created, **kwargs):
    """
    ✅ Create CandidateProfile ONLY when a candidate user is created.
    
    SOLID:
    - SRP: only creation logic
    - Avoids recursion / double save
    """
    if not created:
        return

    # Only for candidate users
    if getattr(instance, "role", None) != "user":
        return

    CandidateProfile.objects.get_or_create(user=instance)