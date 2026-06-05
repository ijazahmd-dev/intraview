import json
import logging
import os
from dataclasses import dataclass
from typing import Any

from livekit.agents import AgentSession, room_io
from livekit.plugins import tavus
from livekit.rtc import Room

logger = logging.getLogger("tavus_avatar")


@dataclass
class TavusAvatarMetadata:
    enabled: bool = False
    avatar_session_id: int | None = None
    provider: str = "tavus"
    replica_id: str = ""
    persona_id: str = ""
    participant_identity: str = "tavus-avatar-agent"
    participant_name: str = "AI Interviewer"

    @classmethod
    def from_job_metadata(cls, raw_metadata: Any) -> "TavusAvatarMetadata":
        if raw_metadata is None:
            return cls(enabled=False)

        if isinstance(raw_metadata, str):
            raw_metadata = raw_metadata.strip()
            if not raw_metadata:
                return cls(enabled=False)
            try:
                payload = json.loads(raw_metadata)
            except json.JSONDecodeError:
                logger.warning("Unable to parse LiveKit job metadata for Tavus avatar.")
                return cls(enabled=False)
        elif isinstance(raw_metadata, dict):
            payload = raw_metadata
        else:
            logger.warning(
                "Unsupported LiveKit job metadata type for Tavus avatar: %r",
                type(raw_metadata),
            )
            return cls(enabled=False)

        avatar_payload = payload.get("avatar_session") or {}
        if not isinstance(avatar_payload, dict):
            return cls(enabled=False)

        return cls(
            enabled=bool(avatar_payload.get("enabled", False)),
            avatar_session_id=avatar_payload.get("avatar_session_id"),
            provider=str(avatar_payload.get("provider") or "tavus"),
            replica_id=str(avatar_payload.get("replica_id") or ""),
            persona_id=str(avatar_payload.get("persona_id") or ""),
            participant_identity=str(
                avatar_payload.get("participant_identity") or "tavus-avatar-agent"
            ),
            participant_name=str(
                avatar_payload.get("participant_name") or "AI Interviewer"
            ),
        )


class TavusAvatarBridge:
    def __init__(self, metadata: TavusAvatarMetadata):
        self.metadata = metadata
        self._avatar_session: tavus.AvatarSession | None = None
        self._started = False

    @classmethod
    def from_job_metadata(cls, raw_metadata: Any) -> "TavusAvatarBridge":
        return cls(TavusAvatarMetadata.from_job_metadata(raw_metadata))

    @property
    def enabled(self) -> bool:
        return (
            self.metadata.enabled
            and bool(self.metadata.replica_id)
            and bool(self.metadata.persona_id)
        )

    def build_room_output_options(self) -> room_io.RoomOutputOptions | None:
        if not self._started:
            return None
        return room_io.RoomOutputOptions(audio_enabled=False)

    async def start(self, agent_session: AgentSession, room: Room) -> None:
        if not self.enabled or self._started:
            return

        api_key = os.getenv("TAVUS_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("TAVUS_API_KEY is not set for the Tavus avatar bridge.")

        self._avatar_session = tavus.AvatarSession(
            replica_id=self.metadata.replica_id,
            persona_id=self.metadata.persona_id,
            api_key=api_key,
            avatar_participant_identity=self.metadata.participant_identity,
            avatar_participant_name=self.metadata.participant_name,
        )
        await self._avatar_session.start(agent_session, room)
        self._started = True
        logger.info(
            "Started Tavus avatar session: avatar_session_id=%s participant_identity=%s",
            self.metadata.avatar_session_id,
            self.metadata.participant_identity,
        )

    async def shutdown(self) -> None:
        if self._avatar_session is None:
            return

        try:
            await self._avatar_session.aclose()
        finally:
            logger.info(
                "Closed Tavus avatar session: avatar_session_id=%s",
                self.metadata.avatar_session_id,
            )
            self._avatar_session = None
            self._started = False
