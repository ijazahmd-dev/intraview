# ai_interviews/repositories.py

from typing import Iterable, Optional

from django.db.models import Q, QuerySet

from django.db import transaction

from .models import Role, AIInterviewSession


class RoleRepository:
    @staticmethod
    def list_featured(limit: int = 15) -> QuerySet[Role]:
        """
        Return up to `limit` featured, active roles ordered by display_order then name.
        """
        qs = (
            Role.objects.filter(is_active=True, is_featured=True)
            .order_by("display_order", "name")
        )
        if limit:
            qs = qs[:limit]
        return qs

    @staticmethod
    def search(query: str, limit: int = 10) -> QuerySet[Role]:
        """
        Search roles by name and aliases (case-insensitive).
        Simple JSONField icontains for now; can be swapped for trigram/FTS later.
        """
        if not query:
            return Role.objects.none()

        query = query.strip()
        if not query:
            return Role.objects.none()

        qs = Role.objects.filter(is_active=True)
        qs = qs.filter(
            Q(name__icontains=query)
            | Q(aliases__icontains=query)  # JSONB -> text icontains
            | Q(category__icontains=query)
        ).order_by("display_order", "name")

        if limit:
            qs = qs[:limit]
        return qs

    @staticmethod
    def get_by_slug(slug: str) -> Optional[Role]:
        try:
            return Role.objects.get(slug=slug, is_active=True)
        except Role.DoesNotExist:
            return None

    @staticmethod
    def all_active() -> QuerySet[Role]:
        return Role.objects.filter(is_active=True).order_by("display_order", "name")
    















class AIInterviewSessionRepository:
    @staticmethod
    @transaction.atomic
    def create_session_for_user(
        *,
        user,
        role: Role,
        round_type: str,
        difficulty: str,
        duration_minutes: int,
    ) -> AIInterviewSession:
        """
        Creates a new AI interview session.

        We intentionally create a fresh row for each new interview request so:
        - the selected config is preserved per session
        - generated questions can be stored deterministically for that session
        - the service layer can cancel older active sessions after creation
        """
        session = AIInterviewSession.objects.create(
            user=user,
            role=role,
            round_type=round_type,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
            status=AIInterviewSession.Status.READY,
        )
        return session

    @staticmethod
    def get_owned_session(session_id: int, user) -> Optional[AIInterviewSession]:
        try:
            return AIInterviewSession.objects.get(id=session_id, user=user)
        except AIInterviewSession.DoesNotExist:
            return None
