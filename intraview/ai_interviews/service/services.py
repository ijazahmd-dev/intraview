# ai_interviews/services.py

from typing import Optional

from ai_interviews.models import (
    Role,
    AIInterviewSession,
    AIInterviewTurn,
    AIInterviewEvaluation,
    AIInterviewFinalReport,
)
from ai_interviews.repositories import RoleRepository, AIInterviewSessionRepository
from ai_interviews.tasks import generate_final_report
from ai_interviews.service.tavus_avatar_service import TavusAvatarSessionService
from django.utils.crypto import get_random_string

from django.conf import settings
from django.db import transaction
import json
from livekit import api as lkapi

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
        Called from join view.

        - Ensure ownership
        - Apply time-based transitions
        - Ensure room name exists
        - Mark session LIVE (on first join)
        - Generate LiveKit token that:
            * lets the user join the room
            * dispatches the 'intraview-agent' with JSON metadata
        - Return payload for frontend (including remaining_seconds)
        """
        if session.user != user:
            raise PermissionError("You do not own this interview session.")

        # Apply time-based transitions first (expiry / duration auto-complete)
        session.refresh_status_from_time()

        remaining = session.remaining_seconds()
        if remaining <= 0:
            if session.status == AIInterviewSession.Status.LIVE:
                session.mark_completed()

            raise ValueError("This interview session has ended.")

        if not session.is_owner_join_allowed:
            raise ValueError("This interview is no longer joinable.")

        # Ensure room name exists
        session = AIInterviewSessionService.ensure_room_name(session)

        # If first join, move READY/CREATED -> LIVE and set started_at
        if session.status in {AIInterviewSession.Status.READY, AIInterviewSession.Status.CREATED}:
            session.mark_live()
            remaining = session.remaining_seconds()
        else:
            # Already LIVE: this join is a resume. Do not touch started_at.
            remaining = session.remaining_seconds()

        avatar_session = None
        try:
            avatar_session = TavusAvatarSessionService.ensure_avatar_session(session)
        except ValueError:
            avatar_session = None

        livekit_url = getattr(settings, "LIVEKIT_URL", "").rstrip("/")
        livekit_api_key = getattr(settings, "LIVEKIT_API_KEY", "")
        livekit_api_secret = getattr(settings, "LIVEKIT_API_SECRET", "")

        if not (livekit_url and livekit_api_key and livekit_api_secret):
            raise RuntimeError("LiveKit configuration is missing on the server.")

        # Metadata that will be forwarded to your LiveKit agent as job.metadata.
        # LiveKit passes this as a JSON string.[web:225][web:238]
        metadata_dict = {
            "session_id": session.id,
            "role_slug": session.role.slug,
            "round_type": session.round_type,
            "difficulty": session.difficulty,
            "duration_minutes": session.duration_minutes,
            # You can add max_questions here later if you want the backend
            # to control it:
            # "max_questions": 5,
            "avatar_session": TavusAvatarSessionService.build_agent_metadata(
                avatar_session
            ),
        }
        metadata_str = json.dumps(metadata_dict)

        # Identity for the LiveKit participant
        identity = f"user-{user.id}"
        display_name = (
            getattr(user, "full_name", None)
            or getattr(user, "username", None)
            or str(user.id)
        )

        video_grants = lkapi.VideoGrants(
            room_join=True,
            room=session.livekit_room_name,
            can_publish=True,
            can_subscribe=True,
        )

        # AccessToken with RoomConfiguration + RoomAgentDispatch[web:238]
        token_builder = (
            lkapi.AccessToken(livekit_api_key, livekit_api_secret)
            .with_identity(identity)
            .with_name(display_name)
            .with_grants(video_grants)
            .with_room_config(
                lkapi.RoomConfiguration(
                    agents=[
                        lkapi.RoomAgentDispatch(
                            agent_name="intraview-agent",  # must match your agent_name
                            metadata=metadata_str,
                        )
                    ]
                )
            )
        )
        livekit_token = token_builder.to_jwt()

        # Build response payload for frontend
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
            "started_at": session.started_at,
            "ended_at": session.ended_at,
            "remaining_seconds": remaining,
            "livekit_room_name": session.livekit_room_name,
            "livekit_token": livekit_token,
            "livekit_server_url": livekit_url,
            "avatar_session": TavusAvatarSessionService.build_public_payload(
                avatar_session
            ),
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
            # Accept READY, LIVE, or already COMPLETED as valid end states
            if session.status in (
                AIInterviewSession.Status.LIVE,
                AIInterviewSession.Status.READY,
            ):
                elapsed = session.elapsed_seconds()
                if elapsed < MIN_COMPLETION_SECONDS:
                    session.mark_cancelled()
                else:
                    session.mark_completed()
            elif session.status == AIInterviewSession.Status.COMPLETED:
                # Already completed — return session as-is without error
                pass
            else:
                raise ValueError(
                    f"Interview cannot be ended from status: {session.status}"
                )

        TavusAvatarSessionService.stop_avatar_session(session)

        if session.status == AIInterviewSession.Status.COMPLETED:
            generate_final_report.delay(session.id)        

        return session
    

































class AIInterviewTurnService:
    """
    Helper for creating turns and ensuring turn_index uniqueness.
    """

    @staticmethod
    @transaction.atomic
    def create_turn(
        *,
        session: AIInterviewSession,
        question_text: str,
        answer_text: str,
        metadata: Optional[dict] = None,
        proposed_index: Optional[int] = None,
    ) -> AIInterviewTurn:
        """
        Create a new AIInterviewTurn for a session.

        - Backend computes turn_index if not provided (count + 1).
        - If agent retries with same (session, proposed_index), we return existing turn
          instead of creating duplicates (idempotent behavior).
        """
        if proposed_index is not None:
            # Try to find existing turn with this index for idempotency.
            existing = AIInterviewTurn.objects.filter(
                session=session,
                turn_index=proposed_index,
            ).first()
            if existing:
                # Optionally update answer/metadata if they were blank.
                if not existing.answer_text and answer_text:
                    existing.answer_text = answer_text
                if metadata:
                    existing.metadata = {**(existing.metadata or {}), **metadata}
                existing.save(update_fields=["answer_text", "metadata", "updated_at"])
                return existing

            turn_index = proposed_index
        else:
            # Backend-authoritative index: count existing + 1 (inside transaction).
            max_index = (
                AIInterviewTurn.objects.filter(session=session)
                .order_by("-turn_index")
                .values_list("turn_index", flat=True)
                .first()
            )
            turn_index = (max_index or 0) + 1

        turn = AIInterviewTurn.objects.create(
            session=session,
            turn_index=turn_index,
            question_text=question_text,
            answer_text=answer_text,
            metadata=metadata or {},
        )

        # Create a placeholder evaluation row in PENDING status.
        AIInterviewEvaluation.objects.create(
            turn=turn,
            status=AIInterviewEvaluation.Status.PENDING,
        )

        return turn


class AIInterviewReportService:
    """
    Helper for managing the final report record; the actual content will be filled
    by Phase 2 Celery tasks.
    """

    @staticmethod
    def ensure_final_report(session: AIInterviewSession) -> AIInterviewFinalReport:
        """
        Get or create the final report record for a session.
        """
        report, _ = AIInterviewFinalReport.objects.get_or_create(
            session=session,
            defaults={
                "status": AIInterviewFinalReport.Status.PENDING,
            },
        )
        return report

    @staticmethod
    def mark_report_failed(session: AIInterviewSession, reason: Optional[dict] = None):
        """
        Mark final report as FAILED and optionally attach error metadata.
        """
        report = AIInterviewReportService.ensure_final_report(session)
        report.status = AIInterviewFinalReport.Status.FAILED
        if reason:
            report.raw_response = reason
        report.save(update_fields=["status", "raw_response", "updated_at"])
        return report
