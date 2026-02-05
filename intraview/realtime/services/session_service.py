"""
Session Service - Manages interview session lifecycle and state transitions.
Handles connection/disconnection logic with atomic database operations.
"""

import logging
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from bookings.models import InterviewBooking
from realtime.models import InterviewSession, SessionStatus

logger = logging.getLogger(__name__)


class SessionService:
    """
    Service layer for managing real-time interview sessions.
    All session state mutations go through this service.
    """

    # Configuration constants
    GRACE_PERIOD_MINUTES = 3
    NO_SHOW_TIMEOUT_MINUTES = 15

    @staticmethod
    @transaction.atomic
    def handle_connect(booking: InterviewBooking, role: str) -> InterviewSession:
        """
        Handle user connection to interview session.
        
        Args:
            booking: The interview booking instance
            role: Either 'candidate' or 'interviewer'
            
        Returns:
            Updated InterviewSession instance
            
        Logic:
            - Creates session if doesn't exist
            - Records connection timestamp
            - Transitions to LIVE if both users connected
            - Thread-safe via select_for_update()
        """
        session, created = InterviewSession.objects.select_for_update().get_or_create(
            booking=booking,
            defaults={"status": SessionStatus.CREATED}
        )

        now = timezone.now()

        # ✅ FIX: Only increment reconnect if previously disconnected
        if role == "candidate":
            if session.candidate_disconnected_at:  # Previously disconnected
                session.reconnect_count += 1
            session.candidate_connected_at = now
            session.candidate_disconnected_at = None  # Clear disconnect time
            logger.info(
                f"Candidate connected to session {session.id} "
                f"(booking {booking.id}, reconnects: {session.reconnect_count})"
            )

        elif role == "interviewer":
            if session.interviewer_disconnected_at:  # Previously disconnected
                session.reconnect_count += 1
            session.interviewer_connected_at = now
            session.interviewer_disconnected_at = None  # Clear disconnect time
            logger.info(
                f"Interviewer connected to session {session.id} "
                f"(booking {booking.id}, reconnects: {session.reconnect_count})"
            )

        # ✅ Transition to LIVE if both users connected
        if (
            session.candidate_connected_at
            and session.interviewer_connected_at
            and session.status == SessionStatus.CREATED
        ):
            session.status = SessionStatus.LIVE
            session.started_at = now

            # ✅ FIX: Use LIVE status (not CONFIRMED)
            booking.status = InterviewBooking.Status.LIVE
            booking.save(update_fields=["status", "updated_at"])
                                    
            logger.info(
                f"Session {session.id} transitioned to LIVE (booking {booking.id})"
            )

        session.save()
        return session

    @staticmethod
    @transaction.atomic
    def handle_disconnect(booking: InterviewBooking, role: str) -> InterviewSession:
        """
        Handle user disconnection from interview session.
        
        Args:
            booking: The interview booking instance
            role: Either 'candidate' or 'interviewer'
            
        Returns:
            Updated InterviewSession instance or None
            
        Logic:
            - Records disconnection timestamp
            - Transitions to ENDED if both users disconnected
            - Marks booking as COMPLETED
            - Grace period handled in separate timeout check
        """
        try:
            session = InterviewSession.objects.select_for_update().get(
                booking=booking
            )
        except InterviewSession.DoesNotExist:
            logger.warning(f"Session not found for booking {booking.id} on disconnect")
            return None

        # ✅ FIX: Early exit if session already ended (prevents double mutation)
        if session.status not in [SessionStatus.CREATED, SessionStatus.LIVE]:
            logger.info(
                f"Session {session.id} already in terminal state ({session.status})"
            )
            return session

        now = timezone.now()

        # Record disconnection timestamp
        if role == "candidate":
            session.candidate_disconnected_at = now
            logger.info(f"Candidate disconnected from session {session.id}")

        elif role == "interviewer":
            session.interviewer_disconnected_at = now
            logger.info(f"Interviewer disconnected from session {session.id}")

        # End session if both disconnected and session was LIVE
        if (
            session.candidate_disconnected_at
            and session.interviewer_disconnected_at
            and session.status == SessionStatus.LIVE
        ):
            session.status = SessionStatus.ENDED
            session.ended_at = now

            # Mark booking completed
            booking.status = InterviewBooking.Status.COMPLETED
            booking.save(update_fields=["status", "updated_at"])

            logger.info(
                f"Session {session.id} ended - Duration: {session.duration_seconds}s "
                f"(booking {booking.id})"
            )

        session.save()
        return session

    @staticmethod
    @transaction.atomic
    def check_no_show(session: InterviewSession) -> bool:
        """
        Check if session should be marked as NO_SHOW.
        
        Args:
            session: InterviewSession instance
            
        Returns:
            True if marked as NO_SHOW, False otherwise
            
        Logic:
            - Called periodically by background job (Celery Beat)
            - Uses booking.start_datetime (not session.created_at)
            - If only one user connected after timeout → NO_SHOW
            - Refund candidate tokens (handled separately in booking service)
        """
        if session.status != SessionStatus.CREATED:
            return False

        now = timezone.now()

        # ✅ FIX: Use booking start time (not session created_at)
        booking_start = session.booking.start_datetime

        if not booking_start:
            logger.warning(
                f"Session {session.id} has no booking start_datetime, cannot check no-show"
            )
            return False

        elapsed_minutes = (now - booking_start).total_seconds() / 60

        if elapsed_minutes < SessionService.NO_SHOW_TIMEOUT_MINUTES:
            return False  # Still within allowed window

        # Check if both users connected
        candidate_connected = session.candidate_connected_at is not None
        interviewer_connected = session.interviewer_connected_at is not None

        if not (candidate_connected and interviewer_connected):
            session.status = SessionStatus.NO_SHOW
            session.ended_at = now

            # ✅ Use proper NO_SHOW status
            session.booking.status = InterviewBooking.Status.NO_SHOW
            session.booking.save(update_fields=["status", "updated_at"])

            session.save(update_fields=["status", "ended_at"])

            logger.warning(
                f"Session {session.id} marked as NO_SHOW - "
                f"Candidate: {candidate_connected}, Interviewer: {interviewer_connected} "
                f"(booking {session.booking_id})"
            )
            return True

        return False

    @staticmethod
    @transaction.atomic
    def check_grace_period_expiry(session: InterviewSession) -> bool:
        """
        Check if grace period expired after disconnect.
        
        Args:
            session: InterviewSession instance
            
        Returns:
            True if session ended due to grace expiry, False otherwise
            
        Logic:
            - Called periodically by background job (Celery Beat)
            - If one user disconnected and didn't reconnect within grace period
            - Mark session as ABORTED
            - Issue partial refund (handled separately in booking service)
        """
        if session.status != SessionStatus.LIVE:
            return False

        now = timezone.now()

        # Check candidate grace period
        if (
            session.candidate_disconnected_at
            and not session.candidate_connected_at  # Still disconnected
        ):
            elapsed_minutes = (
                now - session.candidate_disconnected_at
            ).total_seconds() / 60

            if elapsed_minutes > SessionService.GRACE_PERIOD_MINUTES:
                session.status = SessionStatus.ABORTED
                session.ended_at = now

                # ✅ Use proper cancellation status
                session.booking.status = InterviewBooking.Status.CANCELLED_BY_CANDIDATE
                session.booking.save(update_fields=["status", "updated_at"])

                session.save(update_fields=["status", "ended_at"])

                logger.warning(
                    f"Session {session.id} aborted - "
                    f"Candidate grace period expired (booking {session.booking_id})"
                )
                return True

        # Check interviewer grace period
        if (
            session.interviewer_disconnected_at
            and not session.interviewer_connected_at  # Still disconnected
        ):
            elapsed_minutes = (
                now - session.interviewer_disconnected_at
            ).total_seconds() / 60

            if elapsed_minutes > SessionService.GRACE_PERIOD_MINUTES:
                session.status = SessionStatus.ABORTED
                session.ended_at = now

                # ✅ Use proper cancellation status
                session.booking.status = InterviewBooking.Status.CANCELLED_BY_INTERVIEWER
                session.booking.save(update_fields=["status", "updated_at"])

                session.save(update_fields=["status", "ended_at"])

                logger.warning(
                    f"Session {session.id} aborted - "
                    f"Interviewer grace period expired (booking {session.booking_id})"
                )
                return True

        return False

    @staticmethod
    def get_active_session(booking_id: int) -> InterviewSession:
        """
        Get active session for a booking.
        
        Args:
            booking_id: ID of the booking
            
        Returns:
            InterviewSession instance or None
        """
        try:
            return InterviewSession.objects.select_related("booking").get(
                booking_id=booking_id,
                status__in=[SessionStatus.CREATED, SessionStatus.LIVE]
            )
        except InterviewSession.DoesNotExist:
            return None

    @staticmethod
    def get_session_stats(session: InterviewSession) -> dict:
        """
        Get session statistics for analytics.
        
        Args:
            session: InterviewSession instance
            
        Returns:
            Dictionary with session stats
        """
        return {
            "session_id": session.id,
            "booking_id": session.booking_id,
            "status": session.status,
            "duration_seconds": session.duration_seconds,
            "reconnect_count": session.reconnect_count,
            "candidate_connected_at": session.candidate_connected_at,
            "interviewer_connected_at": session.interviewer_connected_at,
            "started_at": session.started_at,
            "ended_at": session.ended_at,
        }

    @staticmethod
    @transaction.atomic
    def cleanup_stale_sessions():
        """
        Background job to check all active sessions for timeouts.
        Called by Celery Beat every minute.
        
        Returns:
            Dictionary with cleanup stats
        """
        from django.db.models import Q

        active_sessions = InterviewSession.objects.select_for_update(
            skip_locked=True
        ).filter(
            Q(status=SessionStatus.CREATED) | Q(status=SessionStatus.LIVE)
        ).select_related("booking")

        no_show_count = 0
        grace_expired_count = 0

        for session in active_sessions:
            # Check no-show
            if SessionService.check_no_show(session):
                no_show_count += 1

            # Check grace period
            if SessionService.check_grace_period_expiry(session):
                grace_expired_count += 1

        logger.info(
            f"Session cleanup completed - "
            f"No-shows: {no_show_count}, Grace expired: {grace_expired_count}"
        )

        return {
            "no_show_count": no_show_count,
            "grace_expired_count": grace_expired_count,
        }
