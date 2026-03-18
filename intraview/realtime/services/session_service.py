

"""
Session Service - Manages interview session lifecycle and state transitions.

Key architectural change:
  Sessions are ended by TIME, not by disconnects.
  Disconnects only record timestamps. Users may reconnect freely.
  Celery cleanup job calls check_session_end_by_time() every minute.
"""

import logging
from django.db import transaction
from django.utils import timezone
from bookings.models import InterviewBooking
from realtime.models import InterviewSession, SessionStatus

logger = logging.getLogger(__name__)


class SessionService:
    """
    Service layer for managing real-time interview sessions.
    All session state mutations go through this service.

    Session lifecycle:
        CREATED  → no one has joined yet
        LIVE     → both participants have connected at least once
        ENDED    → scheduled end time reached (set by cleanup job)
        NO_SHOW  → nobody (or only one side) joined within timeout window
        ABORTED  → one participant abandoned for longer than grace period
    """

    # How long after booking.start_datetime before declaring a no-show
    NO_SHOW_TIMEOUT_MINUTES = 15

    # How long a single-sided disconnect is tolerated before ABORTED
    GRACE_PERIOD_MINUTES = 10

    # ─────────────────────────────────────────────────────────────────────────
    # CONNECT
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def handle_connect(booking: InterviewBooking, role: str) -> InterviewSession:
        """
        Handle a participant joining the interview room.

        - Creates the session record if it doesn't exist yet.
        - Records the connection timestamp.
        - Increments reconnect_count if the participant previously disconnected.
        - Transitions to LIVE when BOTH sides have connected.

        Does NOT end the session on disconnect — time does that.
        """
        session, _ = InterviewSession.objects.select_for_update().get_or_create(
            booking=booking,
            defaults={"status": SessionStatus.CREATED},
        )

        now = timezone.now()

        if role == "candidate":
            if session.candidate_disconnected_at:
                # Reconnecting after a previous disconnect
                session.reconnect_count += 1
            session.candidate_connected_at = now
            session.candidate_disconnected_at = None   # clear → currently online
            logger.info(
                f"Candidate connected to session {session.id} "
                f"(booking {booking.id}, reconnects: {session.reconnect_count})"
            )

        elif role == "interviewer":
            if session.interviewer_disconnected_at:
                session.reconnect_count += 1
            session.interviewer_connected_at = now
            session.interviewer_disconnected_at = None
            logger.info(
                f"Interviewer connected to session {session.id} "
                f"(booking {booking.id}, reconnects: {session.reconnect_count})"
            )

        # Transition CREATED → LIVE once both sides have connected
        if (
            session.candidate_connected_at
            and session.interviewer_connected_at
            and session.status == SessionStatus.CREATED
        ):
            session.status = SessionStatus.LIVE
            session.started_at = now

            booking.status = InterviewBooking.Status.LIVE
            booking.save(update_fields=["status", "updated_at"])

            logger.info(
                f"Session {session.id} transitioned to LIVE (booking {booking.id})"
            )

        session.save()
        return session

    # ─────────────────────────────────────────────────────────────────────────
    # DISCONNECT
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def handle_disconnect(booking: InterviewBooking, role: str) -> InterviewSession | None:
        """
        Handle a participant leaving the interview room.

        Records the disconnection timestamp ONLY.
        Does NOT end the session — reconnects are allowed freely until the
        scheduled end time.  Time-based ending is handled by the Celery job
        via check_session_end_by_time().
        """
        try:
            session = InterviewSession.objects.select_for_update().get(booking=booking)
        except InterviewSession.DoesNotExist:
            logger.warning(f"Session not found for booking {booking.id} on disconnect")
            return None

        # Nothing to do if session is already in a terminal state
        if session.status not in [SessionStatus.CREATED, SessionStatus.LIVE]:
            logger.info(
                f"Session {session.id} already terminal ({session.status}), "
                f"ignoring disconnect for role={role}"
            )
            return session

        now = timezone.now()

        if role == "candidate":
            session.candidate_disconnected_at = now
            logger.info(f"Candidate disconnected from session {session.id}")
        elif role == "interviewer":
            session.interviewer_disconnected_at = now
            logger.info(f"Interviewer disconnected from session {session.id}")

        # ── IMPORTANT: Do NOT end the session here. ──────────────────────────
        # Both users may reconnect freely until booking.end_datetime.
        # The Celery job (cleanup_stale_sessions) calls check_session_end_by_time()
        # and will end it automatically when the scheduled time is reached.
        # ─────────────────────────────────────────────────────────────────────

        session.save()
        return session
    


        # ─────────────────────────────────────────────────────────────────────────
    # FINISH  (user pressed "Finish Interview" button)
    # ─────────────────────────────────────────────────────────────────────────
 
    @staticmethod
    @transaction.atomic
    def handle_finish(booking: InterviewBooking, role: str) -> InterviewSession | None:
        """
        Mark a participant as "finished" — they explicitly pressed the button.
 
        This UNLOCKS feedback submission for that participant.
        It does NOT end the session; the Celery job does that at scheduled time.
 
        Returns the updated session, or None if no session exists.
        """
        try:
            session = InterviewSession.objects.select_for_update().get(booking=booking)
        except InterviewSession.DoesNotExist:
            logger.warning(f"No session for booking {booking.id} on finish (role={role})")
            return None
 
        if role == "candidate":
            session.candidate_finished = True
            logger.info(f"Candidate finished session={session.id} booking={booking.id}")
        elif role == "interviewer":
            session.interviewer_finished = True
            logger.info(f"Interviewer finished session={session.id} booking={booking.id}")
 
        session.save(update_fields=["candidate_finished", "interviewer_finished"])
        return session
 
    # ─────────────────────────────────────────────────────────────────────────
    # FEEDBACK ELIGIBILITY
    # ─────────────────────────────────────────────────────────────────────────
 
    @staticmethod
    def can_submit_feedback(booking: InterviewBooking, role: str) -> tuple[bool, str]:
        """
        Check whether a participant is allowed to submit feedback.
 
        Rule: the participant must have pressed "Finish Interview" (finished flag),
              OR the session must have ended normally (ENDED / booking COMPLETED).
 
        This decouples feedback from the booking.status clock — a participant
        who leaves early can still submit feedback immediately.
        """
        try:
            session = InterviewSession.objects.get(booking=booking)
        except InterviewSession.DoesNotExist:
            return False, "No session found for this booking."
 
        # If the session ended normally, always allow feedback
        if session.status in [SessionStatus.ENDED] or \
           booking.status == InterviewBooking.Status.COMPLETED:
            return True, "Session completed."
 
        # Otherwise require the explicit finish flag
        if role == "candidate":
            if session.candidate_finished:
                return True, "Candidate has finished the interview."
            return False, "Please press 'Finish Interview' before submitting feedback."
 
        if role == "interviewer":
            if session.interviewer_finished:
                return True, "Interviewer has finished the interview."
            return False, "Please press 'Finish Interview' before submitting feedback."
 
        return False, "Invalid role."
    



    # ─────────────────────────────────────────────────────────────────────────
    # TIME-BASED SESSION ENDING  (the primary ending mechanism)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def check_session_end_by_time(session: InterviewSession) -> bool:
        """
        End a LIVE session if its scheduled end time has been reached.

        Called every minute by cleanup_stale_sessions().

        Returns:
            True  — session was ended now
            False — not time yet, or already in terminal state
        """
        if session.status != SessionStatus.LIVE:
            return False

        now = timezone.now()
        booking_end = session.booking.end_datetime

        if now < booking_end:
            return False   # Still within the scheduled window

        # Time is up — end the session
        session.status = SessionStatus.ENDED
        session.ended_at = now
        session.save(update_fields=["status", "ended_at"])

        booking = session.booking
        booking.status = InterviewBooking.Status.COMPLETED
        booking.save(update_fields=["status", "updated_at"])

        logger.info(
            f"Session {session.id} ended by scheduled time "
            f"(booking {booking.id}, duration: {session.duration_seconds}s)"
        )
        return True

    # ─────────────────────────────────────────────────────────────────────────
    # NO-SHOW CHECK
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def check_no_show(session: InterviewSession) -> bool:
        """
        Mark session as NO_SHOW if not both participants joined within the
        allowed window after booking.start_datetime.

        Booking status is set to the appropriate side-specific value:
            CANDIDATE_NO_SHOW  — candidate never joined
            INTERVIEWER_NO_SHOW — interviewer never joined
        (If neither joined, we blame the interviewer and refund the candidate.)

        Returns:
            True  — session was marked NO_SHOW
            False — window not elapsed yet, or both already connected
        """
        if session.status != SessionStatus.CREATED:
            return False

        now = timezone.now()
        booking_start = session.booking.start_datetime

        if not booking_start:
            logger.warning(
                f"Session {session.id} has no booking.start_datetime, "
                f"skipping no-show check"
            )
            return False

        elapsed_minutes = (now - booking_start).total_seconds() / 60
        if elapsed_minutes < SessionService.NO_SHOW_TIMEOUT_MINUTES:
            return False   # Still within the join window

        candidate_connected  = session.candidate_connected_at  is not None
        interviewer_connected = session.interviewer_connected_at is not None

        # Both joined — not a no-show; session should already be LIVE.
        # This branch shouldn't be reached, but guard anyway.
        if candidate_connected and interviewer_connected:
            return False

        # Decide which side is responsible
        if not candidate_connected and not interviewer_connected:
            # Neither joined — treat as interviewer no-show, refund candidate
            booking_no_show_status = InterviewBooking.Status.INTERVIEWER_NO_SHOW
            logger.warning(
                f"Session {session.id} NO_SHOW — neither side joined "
                f"(booking {session.booking_id})"
            )
        elif not candidate_connected:
            booking_no_show_status = InterviewBooking.Status.CANDIDATE_NO_SHOW
            logger.warning(
                f"Session {session.id} NO_SHOW — candidate never joined "
                f"(booking {session.booking_id})"
            )
        else:
            # interviewer never joined
            booking_no_show_status = InterviewBooking.Status.INTERVIEWER_NO_SHOW
            logger.warning(
                f"Session {session.id} NO_SHOW — interviewer never joined "
                f"(booking {session.booking_id})"
            )

        session.status = SessionStatus.NO_SHOW
        session.ended_at = now
        session.save(update_fields=["status", "ended_at"])

        session.booking.status = booking_no_show_status
        session.booking.save(update_fields=["status", "updated_at"])

        return True

    # ─────────────────────────────────────────────────────────────────────────
    # GRACE PERIOD CHECK
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def check_grace_period_expiry(session: InterviewSession) -> bool:
        """
        Abort a LIVE session if one participant has been absent longer than
        GRACE_PERIOD_MINUTES without reconnecting.

        "Currently disconnected" means:
            disconnected_at is set  (handle_connect clears it on reconnect)

        Returns:
            True  — session aborted
            False — within grace period, or no one is currently disconnected
        """
        if session.status != SessionStatus.LIVE:
            return False

        now = timezone.now()

        # ── Candidate absent too long ─────────────────────────────────────────
        if session.candidate_disconnected_at:
            # disconnected_at is only set while they're offline
            # (handle_connect clears it when they come back)
            elapsed = (now - session.candidate_disconnected_at).total_seconds() / 60
            if elapsed > SessionService.GRACE_PERIOD_MINUTES:
                session.status   = SessionStatus.ABORTED
                session.ended_at = now
                session.save(update_fields=["status", "ended_at"])

                session.booking.status = InterviewBooking.Status.CANCELLED_BY_CANDIDATE
                session.booking.save(update_fields=["status", "updated_at"])
                print("GRACE PERIOD EXPIRED so i am doing this CANCELLED_BY_CANDIDATE")

                logger.warning(
                    f"Session {session.id} ABORTED — candidate grace period expired "
                    f"(booking {session.booking_id})"
                )
                return True

        # ── Interviewer absent too long ───────────────────────────────────────
        if session.interviewer_disconnected_at:
            elapsed = (now - session.interviewer_disconnected_at).total_seconds() / 60
            if elapsed > SessionService.GRACE_PERIOD_MINUTES:
                session.status   = SessionStatus.ABORTED
                session.ended_at = now
                session.save(update_fields=["status", "ended_at"])

                session.booking.status = InterviewBooking.Status.CANCELLED_BY_INTERVIEWER
                session.booking.save(update_fields=["status", "updated_at"])
                print("GRACE PERIOD EXPIRED so i am doing this CANCELLED_BY_INTERVIEWER")

                logger.warning(
                    f"Session {session.id} ABORTED — interviewer grace period expired "
                    f"(booking {session.booking_id})"
                )
                return True

        return False

    # ─────────────────────────────────────────────────────────────────────────
    # CLEANUP JOB  (called by Celery Beat every 60 seconds)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def cleanup_stale_sessions() -> dict:
        """
        Periodic cleanup — called by Celery Beat every minute.

        Order of checks per session:
            1. check_session_end_by_time  — LIVE sessions whose time is up
            2. check_no_show              — CREATED sessions past join window
            3. check_grace_period_expiry  — LIVE sessions with long absence

        Returns dict with counts for monitoring.
        """
        from django.db.models import Q

        print("cleanup_stale_sessions started")

        active_sessions = (
            InterviewSession.objects
            .select_for_update(skip_locked=True)
            .filter(
                Q(status=SessionStatus.CREATED) | Q(status=SessionStatus.LIVE)
            )
            .select_related("booking")
        )
        print(active_sessions,"this is the active sessions")

        ended_by_time_count  = 0
        no_show_count        = 0
        grace_expired_count  = 0

        for session in active_sessions:
            print(session, "this is the live sessions")
            # 1) Time-based ending — highest priority
            if SessionService.check_session_end_by_time(session):
                ended_by_time_count += 1
                continue   # session is terminal; skip other checks

            # 2) No-show check (only fires for CREATED sessions)
            if SessionService.check_no_show(session):
                no_show_count += 1
                continue

            # # 3) Grace period (only fires for LIVE sessions)
            # if SessionService.check_grace_period_expiry(session):
            #     grace_expired_count += 1

        logger.info(
            f"Session cleanup — ended_by_time: {ended_by_time_count}, "
            f"no_shows: {no_show_count}, grace_expired: {grace_expired_count}"
        )

        return {
            "ended_by_time_count":  ended_by_time_count,
            "no_show_count":        no_show_count,
            "grace_expired_count":  grace_expired_count,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def get_active_session(booking_id: int) -> InterviewSession | None:
        try:
            return InterviewSession.objects.select_related("booking").get(
                booking_id=booking_id,
                status__in=[SessionStatus.CREATED, SessionStatus.LIVE],
            )
        except InterviewSession.DoesNotExist:
            return None

    @staticmethod
    def get_session_stats(session: InterviewSession) -> dict:
        return {
            "session_id":              session.id,
            "booking_id":              session.booking_id,
            "status":                  session.status,
            "duration_seconds":        session.duration_seconds,
            "reconnect_count":         session.reconnect_count,
            "candidate_connected_at":  session.candidate_connected_at,
            "interviewer_connected_at": session.interviewer_connected_at,
            "started_at":              session.started_at,
            "ended_at":                session.ended_at,
        }