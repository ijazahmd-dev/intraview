from __future__ import annotations

from dataclasses import dataclass

from django.conf import settings
from django.db import transaction

from ai_interviews.models import AIInterviewAvatarSession, AIInterviewSession


@dataclass(frozen=True)
class TavusAvatarRuntimeConfig:
    enabled: bool
    replica_id: str
    persona_id: str
    participant_identity: str
    participant_name: str


class TavusAvatarSessionService:
    @staticmethod
    def _load_runtime_config() -> TavusAvatarRuntimeConfig:
        enabled = bool(getattr(settings, "TAVUS_AVATAR_ENABLED", False))
        replica_id = (getattr(settings, "TAVUS_REPLICA_ID", "") or "").strip()
        persona_id = (getattr(settings, "TAVUS_PERSONA_ID", "") or "").strip()
        participant_identity = (
            getattr(settings, "TAVUS_AVATAR_PARTICIPANT_IDENTITY", "")
            or "tavus-avatar-agent"
        ).strip()
        participant_name = (
            getattr(settings, "TAVUS_AVATAR_PARTICIPANT_NAME", "")
            or "AI Interviewer"
        ).strip()

        return TavusAvatarRuntimeConfig(
            enabled=enabled,
            replica_id=replica_id,
            persona_id=persona_id,
            participant_identity=participant_identity,
            participant_name=participant_name,
        )

    @classmethod
    def ensure_avatar_session(
        cls,
        session: AIInterviewSession,
    ) -> AIInterviewAvatarSession:
        config = cls._load_runtime_config()

        if not config.enabled:
            raise ValueError("Tavus avatar support is disabled on the server.")

        if not config.replica_id or not config.persona_id:
            raise ValueError(
                "Tavus avatar is not fully configured. Set TAVUS_REPLICA_ID and TAVUS_PERSONA_ID."
            )

        with transaction.atomic():
            avatar_session, _ = AIInterviewAvatarSession.objects.select_for_update().get_or_create(
                session=session,
                defaults={
                    "enabled": True,
                    "provider": AIInterviewAvatarSession.Provider.TAVUS,
                    "replica_id": config.replica_id,
                    "persona_id": config.persona_id,
                    "avatar_participant_identity": config.participant_identity,
                    "avatar_participant_name": config.participant_name,
                    "status": AIInterviewAvatarSession.Status.READY,
                },
            )

            fields_to_update: list[str] = []
            desired_values = {
                "enabled": True,
                "replica_id": config.replica_id,
                "persona_id": config.persona_id,
                "avatar_participant_identity": config.participant_identity,
                "avatar_participant_name": config.participant_name,
            }

            for field_name, desired_value in desired_values.items():
                if getattr(avatar_session, field_name) != desired_value:
                    setattr(avatar_session, field_name, desired_value)
                    fields_to_update.append(field_name)

            if avatar_session.status == AIInterviewAvatarSession.Status.FAILED:
                avatar_session.status = AIInterviewAvatarSession.Status.READY
                avatar_session.last_error = ""
                avatar_session.ended_at = None
                fields_to_update.extend(["status", "last_error", "ended_at"])

            if fields_to_update:
                fields_to_update.append("updated_at")
                avatar_session.save(update_fields=fields_to_update)

        return avatar_session

    @classmethod
    def get_or_none(
        cls,
        session: AIInterviewSession,
    ) -> AIInterviewAvatarSession | None:
        return getattr(session, "avatar_session", None)

    @classmethod
    def build_public_payload(
        cls,
        avatar_session: AIInterviewAvatarSession | None,
    ) -> dict | None:
        if avatar_session is None:
            return None

        return {
            "id": avatar_session.id,
            "provider": avatar_session.provider,
            "enabled": avatar_session.enabled,
            "status": avatar_session.status,
            "avatar_participant_identity": avatar_session.avatar_participant_identity,
            "avatar_participant_name": avatar_session.avatar_participant_name,
            "last_error": avatar_session.last_error,
        }

    @classmethod
    def build_agent_metadata(
        cls,
        avatar_session: AIInterviewAvatarSession | None,
    ) -> dict:
        if avatar_session is None:
            return {"enabled": False}

        return {
            "enabled": avatar_session.enabled,
            "avatar_session_id": avatar_session.id,
            "provider": avatar_session.provider,
            "replica_id": avatar_session.replica_id,
            "persona_id": avatar_session.persona_id,
            "participant_identity": avatar_session.avatar_participant_identity,
            "participant_name": avatar_session.avatar_participant_name,
        }

    @classmethod
    def stop_avatar_session(
        cls,
        session: AIInterviewSession,
    ) -> AIInterviewAvatarSession | None:
        avatar_session = cls.get_or_none(session)
        if avatar_session is None:
            return None

        if avatar_session.status not in {
            AIInterviewAvatarSession.Status.ENDED,
            AIInterviewAvatarSession.Status.FAILED,
        }:
            avatar_session.mark_ended()

        return avatar_session
