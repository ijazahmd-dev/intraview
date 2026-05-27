# admin_dashboard/services/booking_service.py
"""
Admin Session Management — Service Layer

All session inspection/intelligence logic lives here.
Views are thin wrappers that call these services.

Services:
    SessionOverviewService  — KPI cards (Feature 1)
    SessionListService      — Paginated, filterable sessions table (Feature 2)
    SessionDetailService    — Full session inspection (Feature 3)
    SessionActionService    — Safe admin actions (Feature 4)
"""

from datetime import timedelta

from django.db.models import (
    Avg, Count, Q, Sum,
)
from django.db.models.functions import Coalesce
from django.core.paginator import Paginator, EmptyPage
from django.utils import timezone

from bookings.models import InterviewBooking, RescheduleStatus
from feedbacks.models import CandidateEvaluation, InterviewerReview
from issues.models import SessionIssue
from wallet.models import TokenTransaction, TokenTransactionType, PayoutRequest, PayoutRequestStatus

from admin_dashboard.constants import (
    # Session risk thresholds
    RISKY_SESSION_RESCHEDULE_THRESHOLD,
    RISKY_SESSION_LOW_RATING_THRESHOLD,
    RISKY_SESSION_OPEN_REPORT_TRIGGERS_FLAG,
    RISKY_SESSION_REFUND_TRIGGERS_FLAG,
    RISKY_SESSION_NO_SHOW_STATUSES,
    # List pagination
    SESSION_LIST_DEFAULT_PAGE_SIZE,
    SESSION_LIST_MAX_PAGE_SIZE,
    SESSION_LIST_DEFAULT_ORDERING,
    # Actions
    ADMIN_ACTION_MARK_FOR_REVIEW,
    ADMIN_ACTION_ESCALATE,
    ADMIN_ACTION_ADD_NOTE,
    ADMIN_ACTION_FLAG_RISKY,
    VALID_ADMIN_SESSION_ACTIONS,
)


# ────────────────────────────────────────────────────────────────
# PRIVATE HELPERS
# ────────────────────────────────────────────────────────────────

def _safe_float(value, default=0.0):
    if value is None:
        return default
    return round(float(value), 2)


def _full_name(user):
    """Return display name from a user object."""
    if not user:
        return ""
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name or user.email


def _compute_high_risk(booking, issues_qs, review):
    """
    Determine whether a session should be flagged as high-risk.

    Uses only constants — no magic numbers in this function.

    Parameters
    ----------
    booking  : InterviewBooking instance (already fetched)
    issues_qs: QuerySet or list of SessionIssue for this booking
    review   : InterviewerReview instance or None
    """
    # Repeated reschedules
    if booking.reschedule_count >= RISKY_SESSION_RESCHEDULE_THRESHOLD:
        return True

    # No-show statuses
    if booking.status in RISKY_SESSION_NO_SHOW_STATUSES:
        return True

    # Refund issued
    if (
        RISKY_SESSION_REFUND_TRIGGERS_FLAG
        and booking.payment_status == "REFUNDED_TO_CANDIDATE"
    ):
        return True

    # Active report exists
    if RISKY_SESSION_OPEN_REPORT_TRIGGERS_FLAG:
        active_statuses = {
            SessionIssue.Status.OPEN,
            SessionIssue.Status.UNDER_REVIEW,
            SessionIssue.Status.WAITING_FOR_RESPONSE,
            SessionIssue.Status.ACTION_TAKEN,
        }
        for issue in issues_qs:
            if issue.status in active_statuses:
                return True

    # Low interviewer rating
    if review and review.overall_rating <= RISKY_SESSION_LOW_RATING_THRESHOLD:
        return True

    return False


def _build_timeline(booking, evaluation, review, issues):
    """
    Reconstruct a chronological timeline from existing field-level timestamps.

    Returns a list of dicts:  {"event": str, "timestamp": ISO-8601 str | None}
    """
    events = []

    def _add(label, ts):
        events.append({
            "event": label,
            "timestamp": ts.isoformat() if ts else None,
        })

    # 1. Always: booking created
    _add("Booking Created", booking.created_at)

    # 2. Confirmed (inferred: non-PENDING status that progressed)
    confirmed_statuses = {
        InterviewBooking.Status.CONFIRMED,
        InterviewBooking.Status.LIVE,
        InterviewBooking.Status.COMPLETED,
    }
    if booking.status in confirmed_statuses:
        # We don't store a dedicated confirm_at; use created_at as proxy
        # and flag it so the frontend can distinguish
        _add("Booking Confirmed", None)  # timestamp not stored

    # 3. Reschedule requested
    if booking.reschedule_count > 0 and booking.reschedule_requested_at:
        _add("Reschedule Requested", booking.reschedule_requested_at)

    # 4. Reschedule resolved
    if booking.rescheduled_at:
        status_label = {
            RescheduleStatus.ACCEPTED: "Reschedule Accepted",
            RescheduleStatus.REJECTED: "Reschedule Rejected",
        }.get(booking.reschedule_status, "Reschedule Updated")
        _add(status_label, booking.rescheduled_at)

    # 5. Session live (use start_datetime as proxy)
    if booking.status in {InterviewBooking.Status.LIVE, InterviewBooking.Status.COMPLETED}:
        _add("Session Went Live", booking.start_datetime)

    # 6. Session ended
    if booking.status == InterviewBooking.Status.COMPLETED:
        _add("Session Completed", booking.end_datetime)

    # 7. Cancellation
    if booking.cancelled_at:
        _add("Session Cancelled", booking.cancelled_at)

    # 8. Evaluation submitted (candidate receives written feedback)
    if evaluation:
        _add("Candidate Evaluation Submitted", evaluation.created_at)

    # 9. Interviewer review (candidate rates interviewer)
    if review:
        _add("Interviewer Reviewed by Candidate", review.created_at)

    # 10. Issues raised
    for issue in sorted(issues, key=lambda i: i.created_at):
        _add(f"Report Raised ({issue.get_issue_type_display()})", issue.created_at)
        if issue.resolved_at:
            _add(f"Report Resolved ({issue.get_issue_type_display()})", issue.resolved_at)

    # 11. Payment finalisation (infer from payment_status)
    if booking.payment_status == "PAID_TO_INTERVIEWER":
        _add("Payout Completed", None)  # no timestamp stored on booking

    # Sort by timestamp (None-timestamp events keep their insertion order at the end)
    def sort_key(e):
        return e["timestamp"] or "9999"

    events.sort(key=sort_key)
    return events


# ════════════════════════════════════════════════════════════════
# FEATURE 1: SESSION OVERVIEW KPIs
# ════════════════════════════════════════════════════════════════

class SessionOverviewService:
    """
    Returns all KPI cards for the Sessions overview panel.

    Single aggregated query — no N+1.
    """

    @staticmethod
    def get_kpis():
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())

        # ── Core status counts (single aggregated query) ─────
        counts = InterviewBooking.objects.aggregate(
            total_sessions=Count("id"),
            pending_sessions=Count("id", filter=Q(status=InterviewBooking.Status.PENDING)),
            confirmed_sessions=Count("id", filter=Q(status=InterviewBooking.Status.CONFIRMED)),
            live_sessions=Count("id", filter=Q(status=InterviewBooking.Status.LIVE)),
            completed_sessions=Count("id", filter=Q(status=InterviewBooking.Status.COMPLETED)),
            cancelled_sessions=Count(
                "id",
                filter=Q(status__in=[
                    InterviewBooking.Status.CANCELLED,
                    InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                    InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                ]),
            ),
            candidate_no_show_count=Count(
                "id", filter=Q(status=InterviewBooking.Status.CANDIDATE_NO_SHOW)
            ),
            interviewer_no_show_count=Count(
                "id", filter=Q(status=InterviewBooking.Status.INTERVIEWER_NO_SHOW)
            ),
            rescheduled_sessions=Count("id", filter=Q(reschedule_count__gt=0)),
            today_sessions=Count("id", filter=Q(start_datetime__date=today_start.date())),
            weekly_sessions=Count("id", filter=Q(start_datetime__gte=week_start)),
        )

        total = counts["total_sessions"] or 1  # Avoid division by zero

        # Completion rate: completed / total
        completion_rate = round(
            (counts["completed_sessions"] / total) * 100, 1
        )

        # Cancellation rate: all cancelled variants / total
        all_cancelled = (
            counts["cancelled_sessions"]
            + counts["candidate_no_show_count"]
            + counts["interviewer_no_show_count"]
        )
        cancellation_rate = round((all_cancelled / total) * 100, 1)

        return {
            **counts,
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
        }


# ════════════════════════════════════════════════════════════════
# FEATURE 2: SESSIONS LIST (TABLE API)
# ════════════════════════════════════════════════════════════════

class SessionListService:
    """
    Powers the admin sessions table.
    Supports filters, search, sort, and pagination.
    Uses a single optimized queryset with select_related + prefetch_related.
    """

    # Allowed ordering fields (prevent arbitrary column injection)
    ALLOWED_ORDERINGS = {
        "created_at", "-created_at",
        "start_datetime", "-start_datetime",
        "token_cost", "-token_cost",
        "reschedule_count", "-reschedule_count",
        "status", "-status",
    }

    @classmethod
    def get_sessions(cls, query_params):
        """
        Parameters
        ----------
        query_params : dict-like (request.query_params)

        Returns
        -------
        dict with keys: results, count, total_pages, page, page_size
        """
        qs = (
            InterviewBooking.objects
            .select_related(
                "candidate",
                "interviewer",
                "availability",
            )
            .prefetch_related(
                "candidate_evaluation",
                "interviewer_review",
                "issues",
            )
        )

        # ── Filter: status ────────────────────────────────────
        status = query_params.get("status")
        if status:
            qs = qs.filter(status=status)

        # ── Filter: payment_status ────────────────────────────
        payment_status = query_params.get("payment_status")
        if payment_status:
            qs = qs.filter(payment_status=payment_status)

        # ── Filter: reschedule_status ─────────────────────────
        reschedule_status = query_params.get("reschedule_status")
        if reschedule_status:
            qs = qs.filter(reschedule_status=reschedule_status)

        # ── Filter: date range (on start_datetime) ────────────
        start_date = query_params.get("start_date")
        end_date = query_params.get("end_date")
        if start_date:
            qs = qs.filter(start_datetime__date__gte=start_date)
        if end_date:
            qs = qs.filter(start_datetime__date__lte=end_date)

        # ── Search ────────────────────────────────────────────
        search = query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(id__icontains=search)
                | Q(candidate__first_name__icontains=search)
                | Q(candidate__last_name__icontains=search)
                | Q(candidate__email__icontains=search)
                | Q(interviewer__first_name__icontains=search)
                | Q(interviewer__last_name__icontains=search)
                | Q(interviewer__email__icontains=search)
            )

        # ── Ordering ──────────────────────────────────────────
        ordering = query_params.get("ordering", SESSION_LIST_DEFAULT_ORDERING)
        if ordering not in cls.ALLOWED_ORDERINGS:
            ordering = SESSION_LIST_DEFAULT_ORDERING
        qs = qs.order_by(ordering)

        # ── Pagination ────────────────────────────────────────
        try:
            page_size = min(
                int(query_params.get("page_size", SESSION_LIST_DEFAULT_PAGE_SIZE)),
                SESSION_LIST_MAX_PAGE_SIZE,
            )
        except (ValueError, TypeError):
            page_size = SESSION_LIST_DEFAULT_PAGE_SIZE

        try:
            page_number = max(1, int(query_params.get("page", 1)))
        except (ValueError, TypeError):
            page_number = 1

        paginator = Paginator(qs, page_size)
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        results = [
            cls._serialize_booking(booking)
            for booking in page_obj.object_list
        ]

        return {
            "results": results,
            "count": paginator.count,
            "total_pages": paginator.num_pages,
            "page": page_obj.number,
            "page_size": page_size,
        }

    @staticmethod
    def _serialize_booking(booking):
        """Serialize a single booking row for the table. No extra DB hits."""
        # Pre-fetched relations
        try:
            evaluation = booking.candidate_evaluation
        except CandidateEvaluation.DoesNotExist:
            evaluation = None

        try:
            review = booking.interviewer_review
        except InterviewerReview.DoesNotExist:
            review = None

        issues = list(booking.issues.all())

        # Duration in minutes
        duration_minutes = None
        if booking.start_datetime and booking.end_datetime:
            duration_minutes = int(
                (booking.end_datetime - booking.start_datetime).total_seconds() / 60
            )

        cancelled_statuses = {
            InterviewBooking.Status.CANCELLED,
            InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
            InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
        }
        no_show_statuses = {
            InterviewBooking.Status.CANDIDATE_NO_SHOW,
            InterviewBooking.Status.INTERVIEWER_NO_SHOW,
        }

        return {
            # Core
            "booking_id": booking.id,
            "status": booking.status,
            "candidate_name": _full_name(booking.candidate),
            "candidate_email": booking.candidate.email if booking.candidate else None,
            "interviewer_name": _full_name(booking.interviewer),
            "interviewer_email": booking.interviewer.email if booking.interviewer else None,
            # Timing
            "scheduled_start": booking.start_datetime.isoformat() if booking.start_datetime else None,
            "scheduled_end": booking.end_datetime.isoformat() if booking.end_datetime else None,
            "duration_minutes": duration_minutes,
            "timezone": (
                booking.availability.timezone
                if booking.availability
                else None
            ),
            # Payment
            "token_cost": booking.token_cost,
            "payment_status": booking.payment_status,
            # Reschedule
            "reschedule_count": booking.reschedule_count,
            "reschedule_status": booking.reschedule_status,
            "has_pending_reschedule": booking.reschedule_status == RescheduleStatus.PENDING,
            # Flags
            "is_cancelled": booking.status in cancelled_statuses,
            "is_no_show": booking.status in no_show_statuses,
            "is_live": booking.status == InterviewBooking.Status.LIVE,
            "has_feedback": evaluation is not None or review is not None,
            "has_report": bool(issues),
            "high_risk_session": _compute_high_risk(booking, issues, review),
            # Timestamps
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
        }


# ════════════════════════════════════════════════════════════════
# FEATURE 3: SESSION DETAIL VIEW
# ════════════════════════════════════════════════════════════════

class SessionDetailService:
    """
    Full inspection object for a single session.
    Fetches everything in one round-trip via select_related + prefetch_related.
    """

    @staticmethod
    def get_session_detail(booking_id):
        """
        Raises InterviewBooking.DoesNotExist if not found.
        """
        booking = (
            InterviewBooking.objects
            .select_related(
                "candidate",
                "interviewer",
                "availability",
                "proposed_availability",
                # Wallet not a FK on booking, fetched separately below
            )
            .prefetch_related(
                "candidate_evaluation",
                "interviewer_review",
                "issues",
                # Candidate stats
                "candidate__candidate_bookings",
                "candidate__raised_issues",
                # Interviewer stats
                "interviewer__interviewer_bookings",
                "interviewer__reviews_received",
                "interviewer__interviewer_profile",
                "interviewer__verification",
            )
            .get(id=booking_id)
        )

        # ─── Resolved Objects ──────────────────────────────────
        try:
            evaluation = booking.candidate_evaluation
        except CandidateEvaluation.DoesNotExist:
            evaluation = None

        try:
            review = booking.interviewer_review
        except InterviewerReview.DoesNotExist:
            review = None

        issues = list(booking.issues.all())

        # ─── TOKEN TRANSACTIONS for this booking ───────────────
        # Keyed by reference_id = str(booking.id)
        booking_ref = str(booking.id)
        tx_qs = TokenTransaction.objects.filter(reference_id=booking_ref)
        refund_tx = tx_qs.filter(
            transaction_type=TokenTransactionType.REFUND
        ).first()

        # Payout request: look for one linked to the interviewer
        # (no direct FK to booking on PayoutRequest)
        payout_request = (
            PayoutRequest.objects
            .filter(interviewer=booking.interviewer)
            .order_by("-requested_at")
            .first()
        )

        # ─── Section A: Session Details ────────────────────────
        duration_minutes = None
        if booking.start_datetime and booking.end_datetime:
            duration_minutes = int(
                (booking.end_datetime - booking.start_datetime).total_seconds() / 60
            )

        section_a = {
            "booking_id": booking.id,
            "status": booking.status,
            "payment_status": booking.payment_status,
            "token_cost": booking.token_cost,
            "start_datetime": booking.start_datetime.isoformat() if booking.start_datetime else None,
            "end_datetime": booking.end_datetime.isoformat() if booking.end_datetime else None,
            "duration_minutes": duration_minutes,
            "evaluation_deadline": (
                booking.evaluation_deadline.isoformat()
                if booking.evaluation_deadline else None
            ),
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
        }

        # ─── Section B: Candidate Details ─────────────────────
        candidate = booking.candidate
        candidate_all_bookings = list(candidate.candidate_bookings.all())
        candidate_completed = sum(
            1 for b in candidate_all_bookings
            if b.status == InterviewBooking.Status.COMPLETED
        )
        candidate_cancelled = sum(
            1 for b in candidate_all_bookings
            if b.status in {
                InterviewBooking.Status.CANCELLED,
                InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
            }
        )
        candidate_report_count = candidate.raised_issues.count()

        section_b = {
            "candidate_id": candidate.id,
            "full_name": _full_name(candidate),
            "email": candidate.email,
            "total_sessions": len(candidate_all_bookings),
            "total_completed": candidate_completed,
            "total_cancellations": candidate_cancelled,
            "report_count": candidate_report_count,
        }

        # ─── Section C: Interviewer Details ───────────────────
        interviewer = booking.interviewer
        interviewer_all_bookings = list(interviewer.interviewer_bookings.all())
        ir_completed = sum(
            1 for b in interviewer_all_bookings
            if b.status == InterviewBooking.Status.COMPLETED
        )
        ir_cancelled = sum(
            1 for b in interviewer_all_bookings
            if b.status in {
                InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                InterviewBooking.Status.CANCELLED,
            }
        )
        ir_no_show = sum(
            1 for b in interviewer_all_bookings
            if b.status == InterviewBooking.Status.INTERVIEWER_NO_SHOW
        )
        ir_total = len(interviewer_all_bookings) or 1

        # Avg rating from all interviewer reviews (prefetched)
        reviews = list(interviewer.reviews_received.all())
        ir_avg_rating = (
            _safe_float(
                sum(r.overall_rating for r in reviews) / len(reviews)
            ) if reviews else None
        )

        # Verification status
        try:
            verification_status = interviewer.verification.status
        except Exception:
            verification_status = None

        # Interviewer profile display name
        try:
            profile = interviewer.interviewer_profile
            interviewer_display_name = profile.display_name or _full_name(interviewer)
        except Exception:
            interviewer_display_name = _full_name(interviewer)

        section_c = {
            "interviewer_id": interviewer.id,
            "name": interviewer_display_name,
            "email": interviewer.email,
            "verification_status": verification_status,
            "avg_rating": ir_avg_rating,
            "completed_interviews": ir_completed,
            "cancellation_rate": round((ir_cancelled / ir_total) * 100, 1),
            "no_show_rate": round((ir_no_show / ir_total) * 100, 1),
            "reports_count": SessionIssue.objects.filter(
                against_user=interviewer
            ).count(),
        }

        # ─── Section D: Reschedule Details ────────────────────
        proposed_slot = None
        if booking.proposed_availability:
            pa = booking.proposed_availability
            proposed_slot = {
                "availability_id": pa.id,
                "date": pa.date.isoformat() if pa.date else None,
                "start_time": pa.start_time.isoformat() if pa.start_time else None,
                "end_time": pa.end_time.isoformat() if pa.end_time else None,
                "timezone": pa.timezone,
            }

        section_d = {
            "reschedule_count": booking.reschedule_count,
            "requested_by": booking.rescheduled_by,
            "requested_at": (
                booking.reschedule_requested_at.isoformat()
                if booking.reschedule_requested_at else None
            ),
            "reschedule_reason": booking.reschedule_reason or None,
            "reschedule_status": booking.reschedule_status,
            "proposed_slot": proposed_slot,
        }

        # ─── Section E: Cancellation Details ──────────────────
        # "cancelled_by" is inferred from booking.status
        cancelled_by_map = {
            InterviewBooking.Status.CANCELLED_BY_CANDIDATE: "CANDIDATE",
            InterviewBooking.Status.CANCELLED_BY_INTERVIEWER: "INTERVIEWER",
            InterviewBooking.Status.CANDIDATE_NO_SHOW: "CANDIDATE",  # no-show
            InterviewBooking.Status.INTERVIEWER_NO_SHOW: "INTERVIEWER",
            InterviewBooking.Status.CANCELLED: "ADMIN_OR_SYSTEM",
        }
        section_e = None
        if booking.cancelled_at or booking.cancellation_reason:
            section_e = {
                "cancelled_at": (
                    booking.cancelled_at.isoformat()
                    if booking.cancelled_at else None
                ),
                "cancelled_by": cancelled_by_map.get(booking.status, "UNKNOWN"),
                "cancellation_reason": booking.cancellation_reason or None,
            }

        # ─── Section F: Feedback Details ──────────────────────
        candidate_eval_data = None
        if evaluation:
            candidate_eval_data = {
                "technical_score": evaluation.technical_score,
                "communication_score": evaluation.communication_score,
                "problem_solving_score": evaluation.problem_solving_score,
                "confidence_score": evaluation.confidence_score,
                "overall_score": float(evaluation.overall_score),
                "hire_recommendation": evaluation.hire_recommendation,
                "strengths": evaluation.strengths,
                "areas_for_improvement": evaluation.areas_for_improvement,
                "actionable_suggestions": evaluation.actionable_suggestions,
                "submitted_at": evaluation.created_at.isoformat(),
            }

        interviewer_review_data = None
        if review:
            interviewer_review_data = {
                "overall_rating": review.overall_rating,
                "was_professional": review.was_professional,
                "was_prepared": review.was_interviewer_prepared,
                "would_recommend": review.would_recommend,
                "comment": review.comment or None,
                "reported_issues": review.reported_issues,
                "submitted_at": review.created_at.isoformat(),
            }

        section_f = {
            "candidate_evaluation": candidate_eval_data,
            "interviewer_review": interviewer_review_data,
        }

        # ─── Section G: Financial Details ─────────────────────
        section_g = {
            "token_cost": booking.token_cost,
            "payment_status": booking.payment_status,
            "refund_issued": refund_tx is not None,
            "refund_tokens": abs(refund_tx.amount) if refund_tx else 0,
            "payout_status": payout_request.status if payout_request else None,
            "payout_reference": payout_request.reference_number if payout_request else None,
            "payout_amount_inr": (
                float(payout_request.amount_inr) if payout_request else None
            ),
        }

        # ─── Section H: Reports / Tickets ─────────────────────
        if issues:
            section_h = {
                "report_count": len(issues),
                "reports": [
                    {
                        "issue_id": issue.id,
                        "issue_type": issue.issue_type,
                        "status": issue.status,
                        "priority": issue.priority,
                        "description": issue.description,
                        "raised_by": issue.raised_by_id,
                        "resolution": issue.resolution or None,
                        "admin_notes": issue.admin_notes or None,
                        "created_at": issue.created_at.isoformat(),
                        "resolved_at": (
                            issue.resolved_at.isoformat()
                            if issue.resolved_at else None
                        ),
                    }
                    for issue in issues
                ],
            }
        else:
            section_h = {"report_count": 0, "reports": []}

        # ─── Section I: Timeline ──────────────────────────────
        section_i = _build_timeline(booking, evaluation, review, issues)

        return {
            "session_details": section_a,
            "candidate_details": section_b,
            "interviewer_details": section_c,
            "reschedule_details": section_d,
            "cancellation_details": section_e,
            "feedback_details": section_f,
            "financial_details": section_g,
            "report_details": section_h,
            "timeline": section_i,
            # Top-level flag for quick UI rendering
            "high_risk_session": _compute_high_risk(booking, issues, review),
        }


# ════════════════════════════════════════════════════════════════
# FEATURE 4: QUICK ADMIN ACTIONS
# ════════════════════════════════════════════════════════════════

class SessionActionService:
    """
    Safe, non-destructive admin actions on individual sessions.

    Admins INSPECT and annotate — they never mutate booking status directly.
    All mutations are limited to SessionIssue (admin_notes, status) only.
    """

    @staticmethod
    def apply_action(booking_id, action, payload, admin_user):
        """
        Dispatch the requested admin action.

        Parameters
        ----------
        booking_id : int
        action     : str (one of VALID_ADMIN_SESSION_ACTIONS)
        payload    : dict (extra data like 'note')
        admin_user : User instance (the acting admin)

        Returns
        -------
        dict with { "success": bool, "message": str, "detail": dict }

        Raises ValueError if action is invalid or booking not found.
        """
        if action not in VALID_ADMIN_SESSION_ACTIONS:
            raise ValueError(
                f"Invalid action '{action}'. "
                f"Valid actions: {sorted(VALID_ADMIN_SESSION_ACTIONS)}"
            )

        # Validate booking exists
        try:
            booking = InterviewBooking.objects.get(id=booking_id)
        except InterviewBooking.DoesNotExist:
            raise ValueError(f"Booking #{booking_id} not found.")

        handler = {
            ADMIN_ACTION_MARK_FOR_REVIEW: SessionActionService._mark_for_review,
            ADMIN_ACTION_ESCALATE: SessionActionService._escalate,
            ADMIN_ACTION_ADD_NOTE: SessionActionService._add_note,
            ADMIN_ACTION_FLAG_RISKY: SessionActionService._flag_risky,
        }[action]

        return handler(booking, payload, admin_user)

    # ── Private action handlers ────────────────────────────────

    @staticmethod
    def _mark_for_review(booking, payload, admin_user):
        """
        Move all open issues on this booking to UNDER_REVIEW.
        If no issues exist, create a system-initiated one.
        """
        issues = list(
            SessionIssue.objects.filter(
                booking=booking,
                status=SessionIssue.Status.OPEN,
            )
        )

        if issues:
            SessionIssue.objects.filter(
                booking=booking,
                status=SessionIssue.Status.OPEN,
            ).update(
                status=SessionIssue.Status.UNDER_REVIEW,
            )
            return {
                "success": True,
                "message": f"{len(issues)} open issue(s) marked for review.",
                "detail": {"booking_id": booking.id, "issues_updated": len(issues)},
            }
        else:
            # Create an admin-initiated review issue
            note = payload.get("note", "Admin initiated review.")
            issue = SessionIssue.objects.create(
                booking=booking,
                raised_by=admin_user,
                against_user=booking.interviewer,
                issue_type=SessionIssue.IssueType.OTHER,
                description=note,
                status=SessionIssue.Status.UNDER_REVIEW,
                admin_notes=f"Manually triggered by admin: {admin_user.email}",
            )
            return {
                "success": True,
                "message": "No existing issues found. Admin review issue created.",
                "detail": {"booking_id": booking.id, "issue_id": issue.id},
            }

    @staticmethod
    def _escalate(booking, payload, admin_user):
        """
        Escalate all active issues on this booking to UNDER_REVIEW
        with an admin escalation note appended.
        """
        note = payload.get("note", "Escalated by admin.")
        issues = SessionIssue.objects.filter(
            booking=booking,
            status__in=[
                SessionIssue.Status.OPEN,
                SessionIssue.Status.WAITING_FOR_RESPONSE,
            ],
        )
        escalated = 0
        for issue in issues:
            # Append note to admin_notes
            separator = "\n" if issue.admin_notes else ""
            issue.admin_notes = (
                f"{issue.admin_notes}{separator}"
                f"[ESCALATED by {admin_user.email}]: {note}"
            )
            issue.status = SessionIssue.Status.UNDER_REVIEW
            issue.save(update_fields=["admin_notes", "status", "updated_at"])
            escalated += 1

        return {
            "success": True,
            "message": f"{escalated} issue(s) escalated to UNDER_REVIEW.",
            "detail": {"booking_id": booking.id, "issues_escalated": escalated},
        }

    @staticmethod
    def _add_note(booking, payload, admin_user):
        """
        Append an internal admin note to the most recent active issue,
        or create a new OTHER-type issue if none exists.
        """
        note = payload.get("note", "").strip()
        if not note:
            raise ValueError("A non-empty 'note' is required for add_internal_note.")

        issue = (
            SessionIssue.objects
            .filter(booking=booking)
            .order_by("-created_at")
            .first()
        )

        if issue:
            separator = "\n" if issue.admin_notes else ""
            issue.admin_notes = (
                f"{issue.admin_notes}{separator}"
                f"[NOTE by {admin_user.email} @ {timezone.now().strftime('%Y-%m-%d %H:%M')} UTC]: {note}"
            )
            issue.save(update_fields=["admin_notes", "updated_at"])
            return {
                "success": True,
                "message": "Internal note appended to existing issue.",
                "detail": {"booking_id": booking.id, "issue_id": issue.id},
            }
        else:
            new_issue = SessionIssue.objects.create(
                booking=booking,
                raised_by=admin_user,
                against_user=booking.interviewer,
                issue_type=SessionIssue.IssueType.OTHER,
                description="Admin internal note.",
                admin_notes=(
                    f"[NOTE by {admin_user.email} @ "
                    f"{timezone.now().strftime('%Y-%m-%d %H:%M')} UTC]: {note}"
                ),
                status=SessionIssue.Status.OPEN,
            )
            return {
                "success": True,
                "message": "No existing issue. New issue created with internal note.",
                "detail": {"booking_id": booking.id, "issue_id": new_issue.id},
            }

    @staticmethod
    def _flag_risky(booking, payload, admin_user):
        """
        Flag a session as risky by adding a note to any existing issue
        or creating a new one. The booking itself is NOT mutated.
        """
        note = payload.get("note", "Session manually flagged as risky by admin.")
        existing = (
            SessionIssue.objects
            .filter(booking=booking)
            .order_by("-created_at")
            .first()
        )

        flag_note = (
            f"[RISKY FLAG by {admin_user.email} @ "
            f"{timezone.now().strftime('%Y-%m-%d %H:%M')} UTC]: {note}"
        )

        if existing:
            separator = "\n" if existing.admin_notes else ""
            existing.admin_notes = f"{existing.admin_notes}{separator}{flag_note}"
            existing.save(update_fields=["admin_notes", "updated_at"])
            return {
                "success": True,
                "message": "Risky flag note appended to existing issue.",
                "detail": {"booking_id": booking.id, "issue_id": existing.id},
            }
        else:
            new_issue = SessionIssue.objects.create(
                booking=booking,
                raised_by=admin_user,
                against_user=booking.interviewer,
                issue_type=SessionIssue.IssueType.OTHER,
                description="Admin-flagged as risky session.",
                admin_notes=flag_note,
                status=SessionIssue.Status.OPEN,
            )
            return {
                "success": True,
                "message": "Session flagged as risky. New internal issue created.",
                "detail": {"booking_id": booking.id, "issue_id": new_issue.id},
            }
