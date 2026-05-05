# ai_interviews/services.py

from typing import Optional

from ai_interviews.models import Role, AIInterviewSession
from ai_interviews.repositories import RoleRepository, AIInterviewSessionRepository
from django.utils.crypto import get_random_string

from django.conf import settings
from livekit import api as lk_api  # LiveKit Python SDK


class RoleService:
    @staticmethod
    def get_featured_roles(limit: int = 15):
        return RoleRepository.list_featured(limit=limit)

    @staticmethod
    def search_roles(query: str, limit: int = 10):
        return RoleRepository.search(query=query, limit=limit)

    @staticmethod
    def get_role_by_slug(slug: str) -> Optional[Role]:
        return RoleRepository.get_by_slug(slug)
    















MIN_COMPLETION_SECONDS = 90  # threshold: <90s → CANCELLED, otherwise COMPLETED
READY_EXPIRY_MINUTES = 10    # still used inside model, here for clarity





class AIInterviewSessionService:
    ACTIVE_STATUSES = {
        AIInterviewSession.Status.CREATED,
        AIInterviewSession.Status.READY,
        AIInterviewSession.Status.LIVE,
    }

    @staticmethod
    def _cancel_other_active_sessions(user, keep_session_id: int | None = None) -> None:
        """
        Ensure the user has only one active session.
        Any other READY/CREATED/LIVE sessions are marked CANCELLED.
        """
        qs = AIInterviewSession.objects.filter(
            user=user,
            status__in=AIInterviewSessionService.ACTIVE_STATUSES,
        )
        if keep_session_id:
            qs = qs.exclude(id=keep_session_id)

        for s in qs:
            s.mark_cancelled()

    @staticmethod
    def create_session(
        *,
        user,
        role_slug: str,
        round_type: str,
        difficulty: str,
        duration_minutes: int,
    ) -> AIInterviewSession:
        role = RoleRepository.get_by_slug(role_slug)
        if not role:
            raise ValueError("Invalid or inactive role.")

        session = AIInterviewSessionRepository.create_session_for_user(
            user=user,
            role=role,
            round_type=round_type,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
        )

        # Enforce one active session: cancel all others
        AIInterviewSessionService._cancel_other_active_sessions(
            user=user, keep_session_id=session.id
        )

        return session

    @staticmethod
    def get_session_for_user(session_id: int, user) -> Optional[AIInterviewSession]:
        session = AIInterviewSessionRepository.get_owned_session(session_id, user)
        if session:
            session.refresh_status_from_time()
        return session

    @staticmethod
    def ensure_room_name(session: AIInterviewSession) -> AIInterviewSession:
        if not session.livekit_room_name:
            random_suffix = get_random_string(6).lower()
            session.livekit_room_name = f"ai-{session.id}-{random_suffix}"
            session.save(update_fields=["livekit_room_name", "updated_at"])
        return session



    @staticmethod
    def build_join_payload(session: AIInterviewSession, user) -> dict:
        """
        Called from /join/:

        - Ensure ownership & that session can be joined
        - Ensure room name exists
        - Move READY/CREATED → LIVE (first join)
        - Treat LIVE as resume (no state reset)
        - Generate LiveKit token
        - Return remaining_seconds so frontend never resets duration
        """
        if session.user != user:
            raise PermissionError("You do not own this interview session.")

        # Apply time-based transitions first.
        session.refresh_status_from_time()

        # Hard guard: if remaining_seconds <= 0, session has ended.
        remaining = session.remaining_seconds()
        if remaining <= 0:
            if session.status == AIInterviewSession.Status.LIVE:
                # Make sure we don't leave a LIVE session without duration.
                session.mark_completed()
            raise ValueError("This interview session has ended.")

        if not session.is_owner_join_allowed:
            raise ValueError("This interview is no longer joinable.")

        # Ensure room name exists.
        session = AIInterviewSessionService.ensure_room_name(session)

        # First-time join: READY/CREATED → LIVE.
        if session.status in {
            AIInterviewSession.Status.READY,
            AIInterviewSession.Status.CREATED,
        }:
            session.mark_live()
            # After marking live, remaining time is full duration again
            # (this is the first join).
            remaining = session.remaining_seconds()
        else:
            # Already LIVE; this /join/ is a resume. Do not touch started_at.
            remaining = session.remaining_seconds()

        # LiveKit config.
        livekit_url = getattr(settings, "LIVEKIT_URL", "")
        livekit_api_key = getattr(settings, "LIVEKIT_API_KEY", "")
        livekit_api_secret = getattr(settings, "LIVEKIT_API_SECRET", "")

        if not (livekit_url and livekit_api_key and livekit_api_secret):
            raise RuntimeError("LiveKit configuration is missing on the server.")

        identity = f"user-{user.id}"
        display_name = getattr(user, "full_name", None) or getattr(
            user, "username", str(user.id)
        )

        token_builder = (
            lk_api.AccessToken(livekit_api_key, livekit_api_secret)
            .with_identity(identity)
            .with_name(display_name)
            .with_grants(
                lk_api.VideoGrants(
                    room_join=True,
                    room=session.livekit_room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            )
        )
        livekit_token = token_builder.to_jwt()

        return {
            "session_id": session.id,
            "role": {
                "name": session.role.name,
                "slug": session.role.slug,
                "category": session.role.category,
            },
            "round_type": session.round_type,
            "difficulty": session.difficulty,
            "duration_minutes": session.duration_minutes,
            "status": session.status,  # usually LIVE here
            "started_at": session.started_at,
            "ended_at": session.ended_at,
            "remaining_seconds": remaining,
            "livekit_room_name": session.livekit_room_name,
            "livekit_token": livekit_token,
            "livekit_server_url": livekit_url,
        }

    # ---- End / cancel APIs ----

    @staticmethod
    def end_session(session: AIInterviewSession, user, *, as_cancel: bool = False):
        """
        Called when user clicks "End interview" or cancels before starting.

        - If as_cancel=True and status is active → CANCELLED.
        - If as_cancel=False and status is LIVE:
              elapsed < MIN_COMPLETION_SECONDS → CANCELLED
              elapsed >= MIN_COMPLETION_SECONDS → COMPLETED
        """
        if session.user != user:
            raise PermissionError("You do not own this interview session.")

        session.refresh_status_from_time()

        if as_cancel:
            if session.status in AIInterviewSession.ACTIVE_STATUSES:
                session.mark_cancelled()
            else:
                raise ValueError("This interview cannot be cancelled anymore.")
        else:
            if session.status != AIInterviewSession.Status.LIVE:
                raise ValueError("Interview is not live, cannot complete.")

            elapsed = session.elapsed_seconds()
            if elapsed < MIN_COMPLETION_SECONDS:
                session.mark_cancelled()
            else:
                session.mark_completed()

        return session