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
    














class AIInterviewSessionService:
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

        # TODO: you can later enforce allowed duration per round type here.

        session = AIInterviewSessionRepository.create_session_for_user(
            user=user,
            role=role,
            round_type=round_type,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
        )
        return session

    @staticmethod
    def get_session_for_user(session_id: int, user) -> Optional[AIInterviewSession]:
        return AIInterviewSessionRepository.get_owned_session(session_id, user)

    @staticmethod
    def ensure_room_name(session: AIInterviewSession) -> AIInterviewSession:
        """
        Ensure the session has a unique LiveKit room name.
        Using session.id makes collisions far less likely.
        """
        if not session.livekit_room_name:
            random_suffix = get_random_string(6).lower()
            session.livekit_room_name = f"ai-{session.id}-{random_suffix}"
            session.save(update_fields=["livekit_room_name", "updated_at"])
        return session

    @staticmethod
    def build_join_payload(session: AIInterviewSession, user) -> dict:
        """
        Return data needed by the frontend to prepare joining the LiveKit room.
        This now generates a real LiveKit access token using the Python SDK.
        """
        if session.user != user:
            raise PermissionError("You do not own this interview session.")

        if session.is_expired:
            raise ValueError("Session expired.")

        if not session.is_owner_join_allowed:
            raise ValueError("This session is not joinable in its current state.")

        # Ensure the room name exists
        session = AIInterviewSessionService.ensure_room_name(session)

        # Validate LiveKit configuration
        livekit_url = getattr(settings, "LIVEKIT_URL", "")
        livekit_api_key = getattr(settings, "LIVEKIT_API_KEY", "")
        livekit_api_secret = getattr(settings, "LIVEKIT_API_SECRET", "")

        if not (livekit_url and livekit_api_key and livekit_api_secret):
            # Misconfiguration is a server error, not a user error
            raise RuntimeError("LiveKit configuration is missing on the server.")

        # Build a LiveKit access token for this participant
        # Using the Python server SDK (livekit.api.AccessToken)[web:43][web:35]
        identity = f"user-{user.id}"
        display_name = getattr(user, "full_name", None) or getattr(user, "username", str(user.id))

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

        livekit_token = token_builder.to_jwt()  # signed JWT string[web:43][web:37]

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
            "status": session.status,
            "livekit_room_name": session.livekit_room_name,
            "livekit_token": livekit_token,
            "livekit_server_url": livekit_url,
        }