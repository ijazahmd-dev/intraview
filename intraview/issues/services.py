from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from bookings.models import InterviewBooking
from notifications.events import emit_event
from notifications.constants import EventType
from .constants import (
    ISSUE_RAISE_WINDOW_HOURS,
    AdminActionType,
)
from authentication.tasks import lift_user_suspension
from .models import SessionIssue
from wallet.services import TokenService, InsufficientBalanceError
from wallet.models import TokenTransactionType
from authentication.models import InterviewerStatus


ACTIVE_STATUSES = {
    SessionIssue.Status.OPEN,
    SessionIssue.Status.UNDER_REVIEW,
    SessionIssue.Status.WAITING_FOR_RESPONSE,
    SessionIssue.Status.ACTION_TAKEN,
}


@dataclass
class CanRaiseResult:
    allowed: bool
    reason: str = ""


class IssueService:
    """
    Core business logic for session issues:
    - validation (who can raise, when)
    - creation
    - status transitions
    - high-level admin actions
    - emitting notification events
    """

    # ---------- Validation ----------

    @staticmethod
    def can_raise_issue(booking: InterviewBooking, user) -> CanRaiseResult:
        """
        Checks:
        1. Booking is completed
        2. User is candidate or interviewer for this booking
        3. Within ISSUE_RAISE_WINDOW_HOURS after end_datetime
        4. No active issue already raised by this user for this booking
        """
        # 1. Must be completed
        if booking.status != InterviewBooking.Status.COMPLETED:
            return CanRaiseResult(
                False,
                "You can raise an issue only for completed interviews.",
            )

        # 2. Must belong to booking
        is_candidate = booking.candidate_id == getattr(user, "id", None)
        is_interviewer = booking.interviewer_id == getattr(user, "id", None)

        if not (is_candidate or is_interviewer):
            return CanRaiseResult(
                False,
                "You are not part of this interview.",
            )

        # 3. Time window
        end_dt = getattr(booking, "end_datetime", None)
        if end_dt is None:
            return CanRaiseResult(
                False,
                "Interview end time is not available.",
            )

        now = timezone.now()
        if now > end_dt + timezone.timedelta(hours=ISSUE_RAISE_WINDOW_HOURS):
            return CanRaiseResult(
                False,
                "The time window to raise an issue for this interview has expired.",
            )

        # 4. One active issue per (booking, raised_by)
        has_active = SessionIssue.objects.filter(
            booking=booking,
            raised_by=user,
            status__in=[s.value for s in ACTIVE_STATUSES],
        ).exists()

        if has_active:
            return CanRaiseResult(
                False,
                "You already have an active issue for this interview.",
            )

        return CanRaiseResult(True, "")

    # ---------- Creation ----------

    @staticmethod
    @transaction.atomic
    def create_issue(
        booking: InterviewBooking,
        raised_by,
        issue_type: str,
        description: str,
        candidate_presence_minutes: Optional[int] = None,
        interviewer_presence_minutes: Optional[int] = None,
    ) -> SessionIssue:
        """
        Creates a new SessionIssue and emits ISSUE_RAISED notifications.

        - Validates via can_raise_issue
        - Determines against_user from role (candidate vs interviewer)
        - Creates SessionIssue
        - Emits EventType.ISSUE_RAISED
        """
        check = IssueService.can_raise_issue(booking, raised_by)
        if not check.allowed:
            raise ValidationError({"detail": check.reason})

        # Determine who the issue is against
        if booking.candidate_id == raised_by.id:
            against_user = booking.interviewer
        elif booking.interviewer_id == raised_by.id:
            against_user = booking.candidate
        else:
            # Should not happen because can_raise_issue already checks
            raise ValidationError({"detail": "You are not part of this interview."})

        issue = SessionIssue.objects.create(
            booking=booking,
            raised_by=raised_by,
            against_user=against_user,
            issue_type=issue_type,
            description=description,
            candidate_presence_minutes=candidate_presence_minutes,
            interviewer_presence_minutes=interviewer_presence_minutes,
        )

        # Emit notification event for issue raised
        IssueService._emit_issue_raised(issue)

        return issue

    # ---------- Status / Admin Actions ----------

    @staticmethod
    @transaction.atomic
    def update_status(
        issue: SessionIssue,
        new_status: str,
        admin_user,
        admin_notes: str = "",
    ) -> SessionIssue:
        """
        Generic status update by admin.
        Handles terminal state side-effects and notifications.
        """
        old_status = issue.status

        if new_status not in SessionIssue.Status.values:
            raise ValidationError({"status": "Invalid status value."})

        issue.status = new_status
        if admin_notes:
            issue.admin_notes = (
                issue.admin_notes + "\n" + admin_notes
                if issue.admin_notes
                else admin_notes
            )

        # Handle terminal states
        if new_status in {
            SessionIssue.Status.RESOLVED,
            SessionIssue.Status.REJECTED,
        }:
            issue.resolved_by = admin_user
            issue.resolved_at = timezone.now()

        issue.save()

        # Emit events
        if new_status == SessionIssue.Status.RESOLVED:
            IssueService._emit_issue_resolved(issue)
        elif new_status == SessionIssue.Status.REJECTED:
            IssueService._emit_issue_rejected(issue)
        elif new_status == SessionIssue.Status.UNDER_REVIEW:
            IssueService._emit_issue_under_review(issue)
        elif new_status == SessionIssue.Status.WAITING_FOR_RESPONSE:
            IssueService._emit_issue_waiting_response(issue)
        elif new_status == SessionIssue.Status.ACTION_TAKEN:
            IssueService._emit_issue_action_taken(issue)

        return issue

    @staticmethod
    @transaction.atomic
    def resolve_issue(
        issue: SessionIssue,
        admin_user,
        resolution: str,
        action_taken: str = "",
    ) -> SessionIssue:
        """
        Convenience wrapper for resolving with a resolution text and optional action summary.
        """
        notes = action_taken.strip()
        if notes:
            issue.admin_notes = (
                issue.admin_notes + "\n" + notes
                if issue.admin_notes
                else notes
            )

        issue.mark_resolved(by_user=admin_user, resolution_text=resolution)
        IssueService._emit_issue_resolved(issue)
        return issue

    @staticmethod
    @transaction.atomic
    def reject_issue(
        issue: SessionIssue,
        admin_user,
        admin_notes: str,
    ) -> SessionIssue:
        issue.mark_rejected(by_user=admin_user, notes=admin_notes)
        IssueService._emit_issue_rejected(issue)
        return issue

    @staticmethod
    @transaction.atomic
    def apply_admin_action(
        issue: SessionIssue,
        action_type: str,
        admin_user,
        **kwargs,
    ) -> Tuple[SessionIssue, str]:
        """
        Applies a high-level admin action and logs it into the issue.

        Actions (recommended):
          - FULL_REFUND
          - PARTIAL_REFUND (amount or percent)
          - WARN_INTERVIEWER
          - SUSPEND_INTERVIEWER  (7 days)
          - BAN_INTERVIEWER

          - COMPENSATE_INTERVIEWER
          - WARN_CANDIDATE
          - SUSPEND_CANDIDATE    (7 days)
          - BAN_CANDIDATE

          - NO_ACTION

        For refunds:
          - Debits interviewer wallet
          - Credits candidate wallet
          - Uses booking.token_cost as base

        For compensation:
          - Debits candidate wallet
          - Credits interviewer wallet
          - Uses booking.token_cost as base
        """
        try:
            action_enum = AdminActionType(action_type)
        except ValueError:
            raise ValidationError({"action_type": "Invalid admin action type."})

        booking = issue.booking
        candidate = booking.candidate
        interviewer = booking.interviewer

        summary = ""

        # Helper for refund logic (kept from your original code)
        def _get_refund_amount_tokens() -> int:
            tokens_for_session = booking.token_cost
            amount = kwargs.get("amount")
            percent = kwargs.get("percent")

            if amount is not None:
                amount = int(amount)
                if amount <= 0:
                    raise ValidationError({"amount": "Refund amount must be positive."})
                if amount > tokens_for_session:
                    raise ValidationError(
                        {
                            "amount": (
                                "Refund amount cannot exceed session token cost "
                                f"({tokens_for_session})."
                            )
                        }
                    )
                return amount

            if percent is not None:
                percent = int(percent)
                if percent <= 0 or percent > 100:
                    raise ValidationError(
                        {"percent": "Percent must be between 1 and 100."}
                    )
                # integer division so we stay in whole tokens
                computed = max(1, tokens_for_session * percent // 100)
                return computed

            # If nothing provided → full refund
            return tokens_for_session

        # ---------- Candidate → reporting interviewer ----------

        # FULL_REFUND (unchanged logic)
        if action_enum is AdminActionType.FULL_REFUND:
            refund_tokens = _get_refund_amount_tokens()

            candidate_wallet = TokenService.get_or_create_wallet(candidate)
            interviewer_wallet = TokenService.get_or_create_wallet(interviewer)

            try:
                # Debit interviewer
                TokenService.debit_tokens(
                    wallet=interviewer_wallet,
                    amount=refund_tokens,
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Full refund for booking #{booking.id} via issue #{issue.id}"
                    ),
                )

                # Credit candidate
                TokenService.credit_tokens(
                    wallet=candidate_wallet,
                    amount=refund_tokens,
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Full refund for booking #{booking.id} via issue #{issue.id}"
                    ),
                )
            except InsufficientBalanceError as e:
                raise ValidationError(
                    {
                        "detail": (
                            "Cannot process refund: interviewer has insufficient tokens. "
                            f"{str(e)}"
                        )
                    }
                )

            # Update payment_status snapshot
            booking.payment_status = "REFUNDED_TO_CANDIDATE"
            booking.save(update_fields=["payment_status"])

            summary = f"FULL_REFUND of {refund_tokens} tokens for booking #{booking.id}."

        # PARTIAL_REFUND (unchanged logic)
        elif action_enum is AdminActionType.PARTIAL_REFUND:
            refund_tokens = _get_refund_amount_tokens()

            candidate_wallet = TokenService.get_or_create_wallet(candidate)
            interviewer_wallet = TokenService.get_or_create_wallet(interviewer)

            try:
                TokenService.debit_tokens(
                    wallet=interviewer_wallet,
                    amount=refund_tokens,
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Partial refund for booking #{booking.id} via issue #{issue.id}"
                    ),
                )
                TokenService.credit_tokens(
                    wallet=candidate_wallet,
                    amount=refund_tokens,
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Partial refund for booking #{booking.id} via issue #{issue.id}"
                    ),
                )
            except InsufficientBalanceError as e:
                raise ValidationError(
                    {
                        "detail": (
                            "Cannot process partial refund: interviewer has "
                            f"insufficient tokens. {str(e)}"
                        )
                    }
                )

            # We still mark payment_status as refunded snapshot-wise.
            booking.payment_status = "REFUNDED_TO_CANDIDATE"
            booking.save(update_fields=["payment_status"])

            summary = (
                f"PARTIAL_REFUND of {refund_tokens} tokens for booking #{booking.id}."
            )

        # WARN_INTERVIEWER
        elif action_enum is AdminActionType.WARN_INTERVIEWER:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "interviewer":
                raise ValidationError(
                    {"target_user": "WARN_INTERVIEWER can only target an interviewer."}
                )

            current = getattr(target, "interviewer_warning_count", 0) or 0
            target.interviewer_warning_count = current + 1
            target.save(update_fields=["interviewer_warning_count"])

            summary = (
                f"WARN_INTERVIEWER applied to interviewer user_id={target.id}. "
                f"Total warnings={target.interviewer_warning_count}."
            )

        # SUSPEND_INTERVIEWER (7 days, auto-unsuspend via Celery)
        elif action_enum is AdminActionType.SUSPEND_INTERVIEWER:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "interviewer":
                raise ValidationError(
                    {
                        "target_user": (
                            "SUSPEND_INTERVIEWER can only be applied to interviewers."
                        )
                    }
                )

            until = timezone.now() + timezone.timedelta(days=7)
            target.is_suspended = True
            target.suspended_until = until
            target.interviewer_status = InterviewerStatus.SUSPENDED
            target.save(
                update_fields=["is_suspended", "suspended_until", "interviewer_status"]
            )

            # schedule automatic lift of suspension
            lift_user_suspension.apply_async(args=[target.id], eta=until)

            summary = (
                f"SUSPEND_INTERVIEWER (7 days) applied to interviewer user_id={target.id} "
                f"until {until.isoformat()}."
            )

        # BAN_INTERVIEWER (permanent)
        elif action_enum is AdminActionType.BAN_INTERVIEWER:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "interviewer":
                raise ValidationError(
                    {
                        "target_user": (
                            "BAN_INTERVIEWER can only be applied to interviewers."
                        )
                    }
                )

            target.interviewer_status = InterviewerStatus.SUSPENDED
            target.is_suspended = True
            target.suspended_until = None
            target.is_active = False
            target.save(
                update_fields=[
                    "interviewer_status",
                    "is_suspended",
                    "suspended_until",
                    "is_active",
                ]
            )

            summary = (
                f"BAN_INTERVIEWER applied to interviewer user_id={target.id} "
                f"(status=SUSPENDED, is_suspended=True, is_active=False)."
            )

        # ---------- Interviewer → reporting candidate ----------

        # COMPENSATE_INTERVIEWER
        elif action_enum is AdminActionType.COMPENSATE_INTERVIEWER:
            tokens_for_session = booking.token_cost

            candidate_wallet = TokenService.get_or_create_wallet(candidate)
            interviewer_wallet = TokenService.get_or_create_wallet(interviewer)

            try:
                # Debit candidate
                TokenService.debit_tokens(
                    wallet=candidate_wallet,
                    amount=tokens_for_session,
                    # you can introduce TokenTransactionType.COMPENSATION later
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Compensation to interviewer for booking #{booking.id} "
                        f"via issue #{issue.id}"
                    ),
                )
                # Credit interviewer
                TokenService.credit_tokens(
                    wallet=interviewer_wallet,
                    amount=tokens_for_session,
                    transaction_type=TokenTransactionType.REFUND,
                    reference_id=str(booking.id),
                    note=(
                        f"Compensation for booking #{booking.id} "
                        f"via issue #{issue.id}"
                    ),
                )
            except InsufficientBalanceError as e:
                raise ValidationError(
                    {
                        "detail": (
                            "Cannot compensate interviewer: candidate has "
                            f"insufficient tokens. {str(e)}"
                        )
                    }
                )

            summary = (
                f"COMPENSATE_INTERVIEWER of {tokens_for_session} tokens for "
                f"booking #{booking.id}."
            )

        # WARN_CANDIDATE
        elif action_enum is AdminActionType.WARN_CANDIDATE:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "user":
                raise ValidationError(
                    {"target_user": "WARN_CANDIDATE can only target a candidate."}
                )

            # For now just log it; you can add candidate_warning_count later.
            summary = f"WARN_CANDIDATE applied to candidate user_id={target.id}."

        # SUSPEND_CANDIDATE (7 days)
        elif action_enum is AdminActionType.SUSPEND_CANDIDATE:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "user":
                raise ValidationError(
                    {
                        "target_user": (
                            "SUSPEND_CANDIDATE can only be applied to candidates."
                        )
                    }
                )

            until = timezone.now() + timezone.timedelta(days=7)
            target.is_suspended = True
            target.suspended_until = until
            target.save(update_fields=["is_suspended", "suspended_until"])

            lift_user_suspension.apply_async(args=[target.id], eta=until)

            summary = (
                f"SUSPEND_CANDIDATE (7 days) applied to candidate user_id={target.id} "
                f"until {until.isoformat()}."
            )

        # BAN_CANDIDATE (permanent)
        elif action_enum is AdminActionType.BAN_CANDIDATE:
            target = kwargs.get("target_user") or issue.against_user

            if getattr(target, "role", None) != "user":
                raise ValidationError(
                    {"target_user": "BAN_CANDIDATE can only be applied to candidates."}
                )

            target.is_suspended = True
            target.suspended_until = None
            target.is_active = False
            target.save(
                update_fields=["is_suspended", "suspended_until", "is_active"]
            )

            summary = (
                f"BAN_CANDIDATE applied to candidate user_id={target.id} "
                f"(is_suspended=True, is_active=False)."
            )

        # ---------- NO_ACTION ----------
        elif action_enum is AdminActionType.NO_ACTION:
            summary = "Admin action: NO_ACTION (logged only)."

        # ---------- Log + status update (unchanged) ----------
        if summary:
            issue.admin_notes = (
                issue.admin_notes + "\n" + summary
                if issue.admin_notes
                else summary
            )
            issue.status = SessionIssue.Status.ACTION_TAKEN
            issue.resolved_by = admin_user
            issue.resolved_at = timezone.now()
            issue.save(
                update_fields=[
                    "admin_notes",
                    "status",
                    "resolved_by",
                    "resolved_at",
                    "updated_at",
                ]
            )

            IssueService._emit_issue_action_taken(issue)

        return issue, summary

    # ---------- Internal: Notifications ----------

    @staticmethod
    def _emit_issue_raised(issue: SessionIssue) -> None:
        """
        Notify:
        - Admins (via whatever channel you decide later)
        - The user who raised the issue (confirmation)
        """
        # Redirect: user's issue detail page (you can adjust this path)
        user_redirect = f"/issues/{issue.id}"
        correlation_id = f"issue:{issue.id}:raised"

        emit_event(
            EventType.ISSUE_RAISED,
            actor_id=issue.raised_by_id,
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "against_user_id": issue.against_user_id,
                "issue_type": issue.issue_type,
                "status": issue.status,
                "priority": issue.priority,
                "redirect_url": user_redirect,
            },
            correlation_id=correlation_id,
        )

    @staticmethod
    def _emit_issue_resolved(issue: SessionIssue) -> None:
        emit_event(
            EventType.ISSUE_RESOLVED,
            actor_id=getattr(issue.resolved_by, "id", None),
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "status": issue.status,
                "resolution": issue.resolution,
                "redirect_url": f"/issues/{issue.id}",
            },
            correlation_id=f"issue:{issue.id}:resolved",
        )

    @staticmethod
    def _emit_issue_rejected(issue: SessionIssue) -> None:
        emit_event(
            EventType.ISSUE_REJECTED,
            actor_id=getattr(issue.resolved_by, "id", None),
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "status": issue.status,
                "admin_notes": issue.admin_notes,
                "redirect_url": f"/issues/{issue.id}",
            },
            correlation_id=f"issue:{issue.id}:rejected",
        )

    @staticmethod
    def _emit_issue_under_review(issue: SessionIssue) -> None:
        emit_event(
            EventType.ISSUE_ACTION_TAKEN,
            actor_id=None,
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "status": issue.status,
                "redirect_url": f"/issues/{issue.id}",
            },
            correlation_id=f"issue:{issue.id}:under_review",
        )

    @staticmethod
    def _emit_issue_waiting_response(issue: SessionIssue) -> None:
        emit_event(
            EventType.ISSUE_WAITING_RESPONSE,
            actor_id=None,
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "status": issue.status,
                "redirect_url": f"/issues/{issue.id}",
            },
            correlation_id=f"issue:{issue.id}:waiting_response",
        )

    @staticmethod
    def _emit_issue_action_taken(issue: SessionIssue) -> None:
        emit_event(
            EventType.ISSUE_ACTION_TAKEN,
            actor_id=None,
            payload={
                "issue_id": issue.id,
                "booking_id": issue.booking_id,
                "raised_by_id": issue.raised_by_id,
                "status": issue.status,
                "redirect_url": f"/issues/{issue.id}",
            },
            correlation_id=f"issue:{issue.id}:action_taken",
        )