# realtime/services/session_payment_service.py

"""
Session Payment Service

Token settlement is now a two-step process:

  Step 1 — Session ends (Celery job, scheduled time):
    • If interviewer did NOT meet minimum presence → IMMEDIATE REFUND.
      The service was never delivered; no point waiting.
    • If interviewer DID meet minimum presence → set payment_status =
      AWAITING_EVALUATION and write evaluation_deadline (now + 24 h).
      Tokens stay locked in the candidate's wallet.

  Step 2 — One of two things happens:
    (a) Interviewer submits evaluation BEFORE deadline:
        → Transfer locked tokens to interviewer. PAID_TO_INTERVIEWER.
    (b) Celery job finds deadline has expired without an evaluation:
        → Refund candidate. REFUNDED_TO_CANDIDATE.
        → Interviewer gets nothing for skipping the evaluation.

Decision matrix (at session end)
────────────────────────────────────────────────────────────────────────
Interviewer ≥ 50 % present  │  Next step
────────────────────────────┼──────────────────────────────────────────
        No                  │  Immediate refund
        Yes                 │  AWAITING_EVALUATION (24-h window opens)
────────────────────────────┴──────────────────────────────────────────

Decision matrix (at evaluation deadline)
────────────────────────────────────────────────────────────────────────
Evaluation submitted in time  │  Outcome
──────────────────────────────┼────────────────────────────────────────
         Yes                  │  Pay interviewer
         No                   │  Refund candidate
──────────────────────────────┴────────────────────────────────────────
"""

import logging
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from bookings.models import InterviewBooking
from realtime.models import InterviewSession
from wallet.services import TokenService
from wallet.models import TokenTransactionType, TokenTransaction

logger = logging.getLogger(__name__)

# Interviewer must be connected for at least this fraction of scheduled time
MINIMUM_PARTICIPATION_RATIO = 0.5

# Hours the interviewer has to submit their evaluation after the session ends
EVALUATION_DEADLINE_HOURS = 24


class SessionPaymentService:
    """
    Handles all token settlement that results from a completed interview session.

    Public API
    ──────────
    settle_session_payment(session, booking)
        Called by SessionService.check_session_end_by_time() when a session
        ends by scheduled time. Either refunds immediately (low presence) or
        sets AWAITING_EVALUATION and writes the deadline.

    settle_after_evaluation(booking)
        Called by wallet/signals.py when the interviewer submits their
        CandidateEvaluation. Pays the interviewer if everything checks out.

    refund_expired_deadlines()
        Called by cleanup_stale_sessions() every minute. Finds bookings in
        AWAITING_EVALUATION whose evaluation_deadline has passed and refunds
        the candidate.
    """

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 1 — called at session end
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def settle_session_payment(
        *,
        session: InterviewSession,
        booking: InterviewBooking,
    ) -> None:
        """
        Called automatically when a LIVE session ends by scheduled time.

        Checks presence and either:
          • Refunds immediately (interviewer did not qualify), or
          • Sets AWAITING_EVALUATION + evaluation_deadline (interviewer qualified).
        """
        # ── Idempotency guard ────────────────────────────────────────────────
        if booking.payment_status != "PENDING":
            logger.info(
                f"settle_session_payment: booking {booking.id} already has "
                f"payment_status={booking.payment_status}. Skipping."
            )
            return

        # ── Calculate minimum required presence ─────────────────────────────
        scheduled_seconds = int(
            (booking.end_datetime - booking.start_datetime).total_seconds()
        )
        minimum_seconds = int(scheduled_seconds * MINIMUM_PARTICIPATION_RATIO)

        interviewer_seconds = session.interviewer_total_seconds
        candidate_seconds   = session.candidate_total_seconds

        logger.info(
            f"settle_session_payment booking={booking.id}: "
            f"scheduled={scheduled_seconds}s minimum={minimum_seconds}s | "
            f"interviewer={interviewer_seconds}s candidate={candidate_seconds}s"
        )

        interviewer_qualified = interviewer_seconds >= minimum_seconds

        if not interviewer_qualified:
            # Interviewer did not deliver the session → immediate refund
            logger.info(
                f"Interviewer did not meet minimum presence for booking {booking.id}. "
                f"Issuing immediate refund."
            )
            SessionPaymentService._refund_candidate(
                booking=booking,
                reason=(
                    f"Refund — interviewer only present {interviewer_seconds}s "
                    f"(minimum required {minimum_seconds}s)"
                ),
            )
        else:
            # Interviewer qualified → open evaluation window
            deadline = timezone.now() + timedelta(hours=EVALUATION_DEADLINE_HOURS)

            booking.payment_status    = "AWAITING_EVALUATION"
            booking.evaluation_deadline = deadline
            booking.save(update_fields=["payment_status", "evaluation_deadline", "updated_at"])

            logger.info(
                f"Booking {booking.id} set to AWAITING_EVALUATION. "
                f"Interviewer has until {deadline.isoformat()} to submit evaluation."
            )

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2a — called when the interviewer submits their evaluation
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def settle_after_evaluation(*, booking: InterviewBooking) -> None:
        """
        Called from wallet/signals.py immediately after an evaluation is created.

        Transfers the candidate's locked tokens to the interviewer only if:
          • booking.payment_status == AWAITING_EVALUATION  (correct state)
          • evaluation_deadline has not yet passed         (still in time)

        If the deadline has already passed (race condition: evaluation submitted
        at the exact same second the Celery job was running) we refund instead.
        """
        # ── State guard ──────────────────────────────────────────────────────
        if booking.payment_status != "AWAITING_EVALUATION":
            logger.info(
                f"settle_after_evaluation: booking {booking.id} is "
                f"payment_status={booking.payment_status}, not AWAITING_EVALUATION. "
                f"Skipping."
            )
            return

        # ── Deadline guard ───────────────────────────────────────────────────
        if booking.evaluation_deadline and timezone.now() > booking.evaluation_deadline:
            # Deadline already expired — refund instead of paying
            logger.warning(
                f"Evaluation submitted after deadline for booking {booking.id}. "
                f"Refunding candidate."
            )
            SessionPaymentService._refund_candidate(
                booking=booking,
                reason="Refund — evaluation submitted after deadline",
            )
            return

        # ── Ledger idempotency check ─────────────────────────────────────────
        interviewer_wallet = TokenService.get_or_create_wallet(booking.interviewer)
        already_paid = TokenTransaction.objects.filter(
            wallet=interviewer_wallet,
            reference_id=str(booking.id),
            transaction_type=TokenTransactionType.SESSION_EARN,
        ).exists()

        if already_paid:
            logger.info(
                f"Interviewer already paid for booking {booking.id}. Skipping."
            )
            return

        # ── Pay interviewer ──────────────────────────────────────────────────
        candidate_wallet = TokenService.get_or_create_wallet(booking.candidate)

        try:
            TokenService.transfer_locked_tokens(
                from_wallet=candidate_wallet,
                to_wallet=interviewer_wallet,
                amount=booking.token_cost,
                reference_id=str(booking.id),
                note="Tokens earned — evaluation submitted within deadline",
            )

            booking.payment_status = "PAID_TO_INTERVIEWER"
            booking.save(update_fields=["payment_status", "updated_at"])

            logger.info(
                f"Paid {booking.token_cost} tokens to interviewer "
                f"{booking.interviewer_id} for booking {booking.id} "
                f"(evaluation submitted on time)"
            )

        except Exception as e:
            logger.error(
                f"Interviewer payment FAILED for booking {booking.id}: {e}",
                exc_info=True,
            )
            raise

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2b — called by Celery every minute to catch expired deadlines
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def refund_expired_deadlines() -> int:
        """
        Finds all bookings in AWAITING_EVALUATION whose evaluation_deadline
        has passed without an evaluation being submitted, and refunds the
        candidate's locked tokens.

        Called by SessionService.cleanup_stale_sessions() every minute.

        Returns the number of bookings refunded.
        """
        from feedbacks.models import CandidateEvaluation

        now = timezone.now()

        # Bookings past their deadline and still awaiting evaluation
        expired_bookings = InterviewBooking.objects.select_for_update(
            skip_locked=True
        ).filter(
            payment_status="AWAITING_EVALUATION",
            evaluation_deadline__lt=now,
        ).select_related("candidate", "interviewer")

        refunded_count = 0

        for booking in expired_bookings:
            # Double-check: evaluation might have been submitted at the last second
            if CandidateEvaluation.objects.filter(booking=booking).exists():
                # Evaluation exists but payment wasn't processed — pay now
                logger.warning(
                    f"Evaluation exists for booking {booking.id} but payment is "
                    f"still AWAITING_EVALUATION. Settling now."
                )
                try:
                    SessionPaymentService.settle_after_evaluation(booking=booking)
                except Exception as e:
                    logger.error(
                        f"Late payment settlement failed for booking {booking.id}: {e}",
                        exc_info=True,
                    )
                continue

            # No evaluation → refund
            logger.warning(
                f"Evaluation deadline expired for booking {booking.id}. "
                f"Refunding candidate {booking.candidate_id}."
            )
            try:
                SessionPaymentService._refund_candidate(
                    booking=booking,
                    reason=(
                        f"Refund — interviewer did not submit evaluation within "
                        f"{EVALUATION_DEADLINE_HOURS} hours"
                    ),
                )
                refunded_count += 1
            except Exception as e:
                logger.error(
                    f"Deadline refund FAILED for booking {booking.id}: {e}",
                    exc_info=True,
                )

        if refunded_count:
            logger.info(
                f"refund_expired_deadlines: refunded {refunded_count} booking(s)"
            )

        return refunded_count

    # ─────────────────────────────────────────────────────────────────────────
    # NO-SHOW REFUND  — called when session never became LIVE
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def handle_no_show_refund(
        *,
        session: InterviewSession,
        booking: InterviewBooking,
        no_show_status: str,
    ) -> None:
        """
        Refund candidate's locked tokens when the session is declared a no-show.
        Called by SessionService.check_no_show().
        """
        if booking.payment_status != "PENDING":
            logger.info(
                f"No-show refund skipped for booking {booking.id}: "
                f"payment_status={booking.payment_status}"
            )
            return

        candidate_wallet = TokenService.get_or_create_wallet(booking.candidate)

        # Ledger idempotency check
        already_refunded = TokenTransaction.objects.filter(
            wallet=candidate_wallet,
            reference_id=str(booking.id),
            transaction_type=TokenTransactionType.REFUND,
        ).exists()

        if already_refunded:
            logger.info(
                f"No-show refund already exists for booking {booking.id}. Skipping."
            )
            return

        SessionPaymentService._refund_candidate(
            booking=booking,
            reason=f"Refund — no-show ({no_show_status})",
        )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE HELPER — single refund path used by all refund scenarios
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def _refund_candidate(*, booking: InterviewBooking, reason: str) -> None:
        """
        Unlock the candidate's locked tokens (return them to spendable balance).
        Shared by all refund scenarios so the logic lives in one place.
        """
        candidate_wallet = TokenService.get_or_create_wallet(booking.candidate)

        try:
            TokenService.unlock_tokens(
                wallet=candidate_wallet,
                amount=booking.token_cost,
                transaction_type=TokenTransactionType.REFUND,
                reference_id=str(booking.id),
                note=reason,
            )

            booking.payment_status = "REFUNDED_TO_CANDIDATE"
            booking.save(update_fields=["payment_status", "updated_at"])

            logger.info(
                f"Refunded {booking.token_cost} tokens to candidate "
                f"{booking.candidate_id} for booking {booking.id}. Reason: {reason}"
            )

        except Exception as e:
            logger.error(
                f"Candidate refund FAILED for booking {booking.id}: {e}",
                exc_info=True,
            )
            raise