# admin_dashboard/services.py
"""
Admin Dashboard — Service Layer

All analytics logic lives here. Views are thin wrappers.
No direct model mutation — this is read-only analytics.

Each service class corresponds to one dashboard section/endpoint.
All methods return plain dicts ready for serialization.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import (
    Avg, Count, F, Q, Sum, Value, CharField,
    Case, When, IntegerField, FloatField,
)
from django.db.models.functions import (
    TruncDay, TruncWeek, TruncMonth, TruncYear, Coalesce,
)
from django.utils import timezone

from authentication.models import CustomUser, InterviewerStatus
from bookings.models import InterviewBooking
from ai_interviews.models import AIInterviewSession, AIInterviewFinalReport
from feedbacks.models import CandidateEvaluation, InterviewerReview, FeedbackType
from issues.models import SessionIssue
from notifications.models import NotificationLog
from payments.models import PaymentOrder, PaymentStatus
from wallet.models import (
    TokenTransaction, TokenTransactionType,
    PayoutRequest, PayoutRequestStatus,
)
from subscriptions.models import (
    UserSubscription, SubscriptionStatus,
    SubscriptionPaymentOrder,
)
from interviewer_subscriptions.models import (
    InterviewerSubscription, InterviewerSubscriptionStatus,
    InterviewerPaymentOrder,
)
from interviewers.models import InterviewerVerification, VerificationStatus

from admin_dashboard.constants import (
    RISKY_MIN_AVG_RATING,
    RISKY_MIN_COMPLAINT_COUNT,
    RISKY_CANCELLATION_RATE_THRESHOLD,
    RISKY_NO_SHOW_RATE_THRESHOLD,
    RISKY_MIN_SESSIONS_FOR_ANALYSIS,
    TOP_INTERVIEWERS_LIMIT,
    PLATFORM_COMMISSION_RATE,
    TOKEN_TO_INR_RATE,
    VALID_PERIODS,
    DEFAULT_PERIOD,
    MAX_TIMESERIES_POINTS,
)


# ─── Helpers ────────────────────────────────────────────────────

def _safe_float(value, default=0.0):
    """Safely convert aggregation result to float."""
    if value is None:
        return default
    return round(float(value), 2)


def _safe_int(value, default=0):
    """Safely convert aggregation result to int."""
    if value is None:
        return default
    return int(value)


def _get_trunc_func(period):
    """Return the Django ORM truncation function for a given period string."""
    return {
        "daily": TruncDay,
        "weekly": TruncWeek,
        "monthly": TruncMonth,
        "yearly": TruncYear,
    }.get(period, TruncMonth)


def _period_start_date(period):
    """Return a sensible default start date for time-series queries."""
    now = timezone.now()
    return {
        "daily": now - timedelta(days=30),
        "weekly": now - timedelta(weeks=12),
        "monthly": now - timedelta(days=365),
        "yearly": now - timedelta(days=365 * 5),
    }.get(period, now - timedelta(days=365))


# ════════════════════════════════════════════════════════════════
# 1. KPI OVERVIEW SERVICE
# ════════════════════════════════════════════════════════════════

class OverviewService:
    """
    High-level KPI cards for the admin dashboard homepage.
    Aggregates user, interview, support, and business metrics.
    """

    @staticmethod
    def get_overview():
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)

        # ── User KPIs ─────────────────────────────────────────
        user_counts = CustomUser.objects.aggregate(
            total_users=Count("id"),
            total_candidates=Count("id", filter=Q(role="user")),
            total_interviewers=Count("id", filter=Q(role="interviewer")),
            active_interviewers=Count(
                "id",
                filter=Q(
                    role="interviewer",
                    interviewer_status=InterviewerStatus.ACTIVE,
                ),
            ),
            pending_verifications=Count(
                "id",
                filter=Q(
                    role="interviewer",
                    interviewer_status=InterviewerStatus.PENDING_APPROVAL,
                ),
            ),
            suspended_users=Count("id", filter=Q(is_suspended=True)),
        )

        # ── Interview KPIs ────────────────────────────────────
        booking_counts = InterviewBooking.objects.aggregate(
            total_peer_interviews=Count("id"),
            completed_peer_interviews=Count(
                "id", filter=Q(status=InterviewBooking.Status.COMPLETED)
            ),
            cancelled_interviews=Count(
                "id",
                filter=Q(
                    status__in=[
                        InterviewBooking.Status.CANCELLED,
                        InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                        InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                    ]
                ),
            ),
            candidate_no_show_count=Count(
                "id", filter=Q(status=InterviewBooking.Status.CANDIDATE_NO_SHOW)
            ),
            interviewer_no_show_count=Count(
                "id", filter=Q(status=InterviewBooking.Status.INTERVIEWER_NO_SHOW)
            ),
        )

        # AI interview completions
        total_ai_completed = AIInterviewSession.objects.filter(
            status=AIInterviewSession.Status.COMPLETED
        ).count()

        # Interview completion rate
        total_bookings = booking_counts["total_peer_interviews"]
        completed = booking_counts["completed_peer_interviews"]
        completion_rate = (
            round((completed / total_bookings) * 100, 1)
            if total_bookings > 0 else 0.0
        )

        # ── Support KPIs ──────────────────────────────────────
        pending_reports = SessionIssue.objects.filter(
            status=SessionIssue.Status.OPEN
        ).count()

        unresolved_tickets = SessionIssue.objects.filter(
            status__in=[
                SessionIssue.Status.OPEN,
                SessionIssue.Status.UNDER_REVIEW,
                SessionIssue.Status.WAITING_FOR_RESPONSE,
                SessionIssue.Status.ACTION_TAKEN,
            ]
        ).count()

        failed_notifications = NotificationLog.objects.filter(
            status="FAILED"
        ).count()

        # ── Business KPIs ─────────────────────────────────────
        # Revenue from token purchases (PaymentOrder with SUCCEEDED status)
        revenue_base = PaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        )

        revenue = revenue_base.aggregate(
            today=Coalesce(
                Sum("amount_inr", filter=Q(created_at__gte=today_start)),
                0,
            ),
            weekly=Coalesce(
                Sum("amount_inr", filter=Q(created_at__gte=week_start)),
                0,
            ),
            monthly=Coalesce(
                Sum("amount_inr", filter=Q(created_at__gte=month_start)),
                0,
            ),
            total=Coalesce(Sum("amount_inr"), 0),
        )

        # Add subscription revenues
        sub_revenue = SubscriptionPaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        ).aggregate(total=Coalesce(Sum("amount_inr"), 0))

        interviewer_sub_revenue = InterviewerPaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        ).aggregate(total=Coalesce(Sum("amount_inr"), 0))

        total_revenue = (
            revenue["total"]
            + sub_revenue["total"]
            + interviewer_sub_revenue["total"]
        )

        # Platform commission from completed bookings
        total_commission_tokens = InterviewBooking.objects.filter(
            status=InterviewBooking.Status.COMPLETED
        ).aggregate(
            total=Coalesce(Sum("token_cost"), 0)
        )["total"]
        total_platform_commission = round(
            float(total_commission_tokens) * TOKEN_TO_INR_RATE * PLATFORM_COMMISSION_RATE,
            2,
        )

        # Pending refunds (REFUND transactions to count)
        pending_refunds = TokenTransaction.objects.filter(
            transaction_type=TokenTransactionType.REFUND
        ).count()

        # Pending payouts
        pending_payouts = PayoutRequest.objects.filter(
            status__in=[
                PayoutRequestStatus.REQUESTED,
                PayoutRequestStatus.APPROVED,
            ]
        ).count()

        return {
            # User KPIs
            **user_counts,
            # Interview KPIs
            **booking_counts,
            "total_ai_interviews_completed": total_ai_completed,
            "interview_completion_rate": completion_rate,
            # Support KPIs
            "pending_reports": pending_reports,
            "unresolved_tickets": unresolved_tickets,
            "failed_notifications": failed_notifications,
            # Business KPIs
            "today_revenue": revenue["today"],
            "weekly_revenue": revenue["weekly"],
            "monthly_revenue": revenue["monthly"],
            "total_revenue": total_revenue,
            "total_platform_commission": total_platform_commission,
            "pending_refunds": pending_refunds,
            "pending_payouts": pending_payouts,
        }


# ════════════════════════════════════════════════════════════════
# 2. REVENUE ANALYTICS SERVICE
# ════════════════════════════════════════════════════════════════

class RevenueService:
    """
    Revenue analytics: summary cards, time-series trends, and
    breakdown by revenue source (peer/AI/subscriptions).
    """

    @staticmethod
    def get_revenue(period=DEFAULT_PERIOD):
        if period not in VALID_PERIODS:
            period = DEFAULT_PERIOD

        trunc_func = _get_trunc_func(period)
        start_date = _period_start_date(period)

        # ── Summary Cards ─────────────────────────────────────
        # Gross revenue = all successful payments across all payment models
        token_revenue = PaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        ).aggregate(total=Coalesce(Sum("amount_inr"), 0))["total"]

        sub_revenue = SubscriptionPaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        ).aggregate(total=Coalesce(Sum("amount_inr"), 0))["total"]

        interviewer_sub_revenue = InterviewerPaymentOrder.objects.filter(
            status=PaymentStatus.SUCCEEDED
        ).aggregate(total=Coalesce(Sum("amount_inr"), 0))["total"]

        gross_revenue = token_revenue + sub_revenue + interviewer_sub_revenue

        # Total refunds (sum of refund token transactions × token rate)
        total_refund_tokens = TokenTransaction.objects.filter(
            transaction_type=TokenTransactionType.REFUND
        ).aggregate(total=Coalesce(Sum("amount"), 0))["total"]
        # Refund amounts are positive in token transactions
        total_refunds = abs(float(total_refund_tokens)) * TOKEN_TO_INR_RATE

        # Platform commission
        commission_tokens = InterviewBooking.objects.filter(
            status=InterviewBooking.Status.COMPLETED
        ).aggregate(total=Coalesce(Sum("token_cost"), 0))["total"]
        platform_commission = round(
            float(commission_tokens) * TOKEN_TO_INR_RATE * PLATFORM_COMMISSION_RATE,
            2,
        )

        # Net revenue
        net_revenue = round(gross_revenue - total_refunds, 2)

        # Pending payout amount
        pending_payout_amount = PayoutRequest.objects.filter(
            status__in=[
                PayoutRequestStatus.REQUESTED,
                PayoutRequestStatus.APPROVED,
            ]
        ).aggregate(
            total=Coalesce(Sum("amount_inr"), Decimal("0"))
        )["total"]

        # ── Time-Series Trend Data ────────────────────────────
        # Token purchase revenue over time
        trend_data = (
            PaymentOrder.objects.filter(
                status=PaymentStatus.SUCCEEDED,
                created_at__gte=start_date,
            )
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(
                token_revenue=Coalesce(Sum("amount_inr"), 0),
            )
            .order_by("period")
        )

        # Subscription revenue over time
        sub_trend = (
            SubscriptionPaymentOrder.objects.filter(
                status=PaymentStatus.SUCCEEDED,
                created_at__gte=start_date,
            )
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(
                subscription_revenue=Coalesce(Sum("amount_inr"), 0),
            )
            .order_by("period")
        )

        # Merge trends into a dict keyed by period
        trend_map = {}
        for entry in trend_data:
            key = entry["period"].isoformat()
            trend_map[key] = {
                "period": key,
                "token_revenue": entry["token_revenue"],
                "subscription_revenue": 0,
                "total_revenue": entry["token_revenue"],
            }

        for entry in sub_trend:
            key = entry["period"].isoformat()
            if key in trend_map:
                trend_map[key]["subscription_revenue"] = entry["subscription_revenue"]
                trend_map[key]["total_revenue"] += entry["subscription_revenue"]
            else:
                trend_map[key] = {
                    "period": key,
                    "token_revenue": 0,
                    "subscription_revenue": entry["subscription_revenue"],
                    "total_revenue": entry["subscription_revenue"],
                }

        trends = sorted(trend_map.values(), key=lambda x: x["period"])

        # ── Revenue Breakdown ─────────────────────────────────
        # Peer interview revenue = tokens spent on completed bookings × rate
        peer_tokens = InterviewBooking.objects.filter(
            status=InterviewBooking.Status.COMPLETED
        ).aggregate(total=Coalesce(Sum("token_cost"), 0))["total"]
        peer_interview_revenue = round(float(peer_tokens) * TOKEN_TO_INR_RATE, 2)

        # AI interview revenue = currently no direct charge, so 0
        # (AI interviews are gated by subscription entitlements, not tokens)
        ai_interview_revenue = 0.0

        subscription_revenue = float(sub_revenue + interviewer_sub_revenue)

        return {
            "summary": {
                "gross_revenue": float(gross_revenue),
                "net_revenue": float(net_revenue),
                "platform_commission": platform_commission,
                "total_refunds": total_refunds,
                "pending_payout_amount": float(pending_payout_amount),
            },
            "trends": trends,
            "breakdown": {
                "peer_interview_revenue": peer_interview_revenue,
                "ai_interview_revenue": ai_interview_revenue,
                "subscription_revenue": subscription_revenue,
            },
        }


# ════════════════════════════════════════════════════════════════
# 3. INTERVIEW ANALYTICS SERVICE
# ════════════════════════════════════════════════════════════════

class InterviewAnalyticsService:
    """
    Interview activity analytics: counts, funnel, rates,
    performance averages, and actionable insights.
    """

    @staticmethod
    def get_analytics():
        # ── Status Counts ─────────────────────────────────────
        counts = InterviewBooking.objects.aggregate(
            booked=Count(
                "id", filter=Q(status=InterviewBooking.Status.PENDING)
            ),
            confirmed=Count(
                "id", filter=Q(status=InterviewBooking.Status.CONFIRMED)
            ),
            live=Count(
                "id", filter=Q(status=InterviewBooking.Status.LIVE)
            ),
            completed=Count(
                "id", filter=Q(status=InterviewBooking.Status.COMPLETED)
            ),
            cancelled=Count(
                "id",
                filter=Q(
                    status__in=[
                        InterviewBooking.Status.CANCELLED,
                        InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
                        InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                    ]
                ),
            ),
        )

        # ── Completion Funnel ─────────────────────────────────
        # booked → confirmed → live → completed → feedback submitted
        total_booked = InterviewBooking.objects.count()
        total_confirmed = InterviewBooking.objects.filter(
            status__in=[
                InterviewBooking.Status.CONFIRMED,
                InterviewBooking.Status.LIVE,
                InterviewBooking.Status.COMPLETED,
            ]
        ).count()
        total_completed = counts["completed"]
        feedback_submitted = CandidateEvaluation.objects.filter(
            feedback_type=FeedbackType.HUMAN
        ).count()

        funnel = {
            "booked": total_booked,
            "confirmed": total_confirmed,
            "completed": total_completed,
            "feedback_submitted": feedback_submitted,
        }

        # ── Rates ─────────────────────────────────────────────
        no_show_count = InterviewBooking.objects.filter(
            status__in=[
                InterviewBooking.Status.CANDIDATE_NO_SHOW,
                InterviewBooking.Status.INTERVIEWER_NO_SHOW,
            ]
        ).count()

        completion_rate = (
            round((total_completed / total_booked) * 100, 1)
            if total_booked > 0 else 0.0
        )
        cancellation_rate = (
            round((counts["cancelled"] / total_booked) * 100, 1)
            if total_booked > 0 else 0.0
        )
        no_show_rate = (
            round((no_show_count / total_booked) * 100, 1)
            if total_booked > 0 else 0.0
        )

        rates = {
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
            "no_show_rate": no_show_rate,
        }

        # ── Performance Averages ──────────────────────────────
        # Average candidate rating (from CandidateEvaluation overall_score)
        avg_candidate_rating = _safe_float(
            CandidateEvaluation.objects.filter(
                feedback_type=FeedbackType.HUMAN
            ).aggregate(avg=Avg("overall_score"))["avg"]
        )

        # Average interviewer rating (from InterviewerReview overall_rating)
        avg_interviewer_rating = _safe_float(
            InterviewerReview.objects.filter(
                feedback_type=FeedbackType.HUMAN
            ).aggregate(avg=Avg("overall_rating"))["avg"]
        )

        performance = {
            "avg_candidate_rating": avg_candidate_rating,
            "avg_interviewer_rating": avg_interviewer_rating,
        }

        # ── Top Interviewers by Session Count ─────────────────
        top_interviewers = list(
            InterviewBooking.objects.filter(
                status=InterviewBooking.Status.COMPLETED
            )
            .values("interviewer__id", "interviewer__email", "interviewer__first_name", "interviewer__last_name")
            .annotate(session_count=Count("id"))
            .order_by("-session_count")[:TOP_INTERVIEWERS_LIMIT]
        )

        top_by_sessions = [
            {
                "user_id": entry["interviewer__id"],
                "email": entry["interviewer__email"],
                "name": f"{entry['interviewer__first_name'] or ''} {entry['interviewer__last_name'] or ''}".strip(),
                "session_count": entry["session_count"],
            }
            for entry in top_interviewers
        ]

        # ── Risky Interviewers ────────────────────────────────
        # Interviewers with low avg rating OR high complaints OR
        # high cancellation/no-show rates
        risky_interviewers = _get_risky_interviewers()

        return {
            "counts": counts,
            "funnel": funnel,
            "rates": rates,
            "performance": performance,
            "top_interviewers_by_sessions": top_by_sessions,
            "risky_interviewers": risky_interviewers,
        }


# ════════════════════════════════════════════════════════════════
# 4. INTERVIEWER HEALTH SERVICE
# ════════════════════════════════════════════════════════════════

class InterviewerHealthService:
    """
    Interviewer ecosystem health: status distribution,
    top performers, risky interviewers, verification queue.
    """

    @staticmethod
    def get_health():
        # ── Status Distribution ───────────────────────────────
        status_counts = CustomUser.objects.filter(
            role="interviewer"
        ).aggregate(
            total_interviewers=Count("id"),
            approved=Count(
                "id",
                filter=Q(
                    interviewer_status__in=[
                        InterviewerStatus.ACTIVE,
                        InterviewerStatus.APPROVED_NOT_ONBOARDED,
                    ]
                ),
            ),
            active=Count(
                "id",
                filter=Q(interviewer_status=InterviewerStatus.ACTIVE),
            ),
            suspended=Count(
                "id",
                filter=Q(interviewer_status=InterviewerStatus.SUSPENDED),
            ),
            pending_verification=Count(
                "id",
                filter=Q(
                    interviewer_status=InterviewerStatus.PENDING_APPROVAL,
                ),
            ),
        )

        # ── Top Performers ────────────────────────────────────
        # Highest rated (by InterviewerReview average)
        highest_rated = list(
            InterviewerReview.objects.filter(
                feedback_type=FeedbackType.HUMAN
            )
            .values(
                "interviewer__id",
                "interviewer__email",
                "interviewer__first_name",
                "interviewer__last_name",
            )
            .annotate(
                avg_rating=Avg("overall_rating"),
                review_count=Count("id"),
            )
            .filter(review_count__gte=RISKY_MIN_SESSIONS_FOR_ANALYSIS)
            .order_by("-avg_rating")[:TOP_INTERVIEWERS_LIMIT]
        )

        top_rated = [
            {
                "user_id": e["interviewer__id"],
                "email": e["interviewer__email"],
                "name": f"{e['interviewer__first_name'] or ''} {e['interviewer__last_name'] or ''}".strip(),
                "avg_rating": _safe_float(e["avg_rating"]),
                "review_count": e["review_count"],
            }
            for e in highest_rated
        ]

        # Most completed interviews
        most_completed = list(
            InterviewBooking.objects.filter(
                status=InterviewBooking.Status.COMPLETED
            )
            .values(
                "interviewer__id",
                "interviewer__email",
                "interviewer__first_name",
                "interviewer__last_name",
            )
            .annotate(completed_count=Count("id"))
            .order_by("-completed_count")[:TOP_INTERVIEWERS_LIMIT]
        )

        top_by_completions = [
            {
                "user_id": e["interviewer__id"],
                "email": e["interviewer__email"],
                "name": f"{e['interviewer__first_name'] or ''} {e['interviewer__last_name'] or ''}".strip(),
                "completed_count": e["completed_count"],
            }
            for e in most_completed
        ]

        # ── Risky Interviewers ────────────────────────────────
        risky = _get_risky_interviewers()

        # ── Pending Verification Queue Summary ────────────────
        verification_queue = InterviewerVerification.objects.filter(
            status=VerificationStatus.PENDING
        ).count()

        return {
            **status_counts,
            "top_performers": {
                "highest_rated": top_rated,
                "most_completed": top_by_completions,
            },
            "risky_interviewers": risky,
            "pending_verification_queue": verification_queue,
        }


# ════════════════════════════════════════════════════════════════
# 5. MODERATION / REPORTS SERVICE
# ════════════════════════════════════════════════════════════════

class ModerationService:
    """
    Reports and moderation analytics: status breakdown,
    trends, and most-reported users.
    """

    @staticmethod
    def get_moderation():
        # ── Issue Status Breakdown ────────────────────────────
        status_counts = SessionIssue.objects.aggregate(
            total_reports=Count("id"),
            pending_reports=Count(
                "id", filter=Q(status=SessionIssue.Status.OPEN)
            ),
            resolved_reports=Count(
                "id", filter=Q(status=SessionIssue.Status.RESOLVED)
            ),
            escalated_reports=Count(
                "id",
                filter=Q(
                    status__in=[
                        SessionIssue.Status.UNDER_REVIEW,
                        SessionIssue.Status.WAITING_FOR_RESPONSE,
                        SessionIssue.Status.ACTION_TAKEN,
                    ]
                ),
            ),
            critical_reports=Count(
                "id",
                filter=Q(priority=SessionIssue.Priority.CRITICAL),
            ),
        )

        # ── Most Reported Interviewers ────────────────────────
        most_reported = list(
            SessionIssue.objects.filter(
                against_user__role="interviewer"
            )
            .values(
                "against_user__id",
                "against_user__email",
                "against_user__first_name",
                "against_user__last_name",
            )
            .annotate(report_count=Count("id"))
            .order_by("-report_count")[:TOP_INTERVIEWERS_LIMIT]
        )

        most_reported_interviewers = [
            {
                "user_id": e["against_user__id"],
                "email": e["against_user__email"],
                "name": f"{e['against_user__first_name'] or ''} {e['against_user__last_name'] or ''}".strip(),
                "report_count": e["report_count"],
            }
            for e in most_reported
        ]

        # ── Most Common Complaint Categories ─────────────────
        complaint_categories = list(
            SessionIssue.objects.values("issue_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return {
            **status_counts,
            "most_reported_interviewers": most_reported_interviewers,
            "complaint_categories": complaint_categories,
        }


# ════════════════════════════════════════════════════════════════
# 6. PAYOUTS & REFUNDS (FINANCE) SERVICE
# ════════════════════════════════════════════════════════════════

class FinanceService:
    """
    Financial operations: payout status breakdown with amounts,
    and refund tracking via wallet token transactions.
    """

    @staticmethod
    def get_finance():
        # ── Payouts ───────────────────────────────────────────
        payout_counts = PayoutRequest.objects.aggregate(
            pending_payouts=Count(
                "id",
                filter=Q(
                    status__in=[
                        PayoutRequestStatus.REQUESTED,
                        PayoutRequestStatus.APPROVED,
                    ]
                ),
            ),
            failed_payouts=Count(
                "id", filter=Q(status=PayoutRequestStatus.REJECTED)
            ),
            completed_payouts=Count(
                "id", filter=Q(status=PayoutRequestStatus.PAID)
            ),
        )

        payout_amounts = PayoutRequest.objects.aggregate(
            pending_amount=Coalesce(
                Sum(
                    "amount_inr",
                    filter=Q(
                        status__in=[
                            PayoutRequestStatus.REQUESTED,
                            PayoutRequestStatus.APPROVED,
                        ]
                    ),
                ),
                Decimal("0"),
            ),
            completed_amount=Coalesce(
                Sum(
                    "amount_inr",
                    filter=Q(status=PayoutRequestStatus.PAID),
                ),
                Decimal("0"),
            ),
            total_amount=Coalesce(Sum("amount_inr"), Decimal("0")),
        )

        # ── Refunds ───────────────────────────────────────────
        # Refunds are tracked as TokenTransactions with type REFUND
        # Each refund transaction has a positive amount (tokens returned)
        refund_transactions = TokenTransaction.objects.filter(
            transaction_type=TokenTransactionType.REFUND
        )

        total_refund_count = refund_transactions.count()
        total_refund_tokens = _safe_int(
            refund_transactions.aggregate(
                total=Coalesce(Sum("amount"), 0)
            )["total"]
        )
        total_refund_amount = abs(float(total_refund_tokens)) * TOKEN_TO_INR_RATE

        return {
            "payouts": {
                "pending_payouts": payout_counts["pending_payouts"],
                "failed_payouts": payout_counts["failed_payouts"],
                "completed_payouts": payout_counts["completed_payouts"],
                "pending_payout_amount": float(payout_amounts["pending_amount"]),
                "completed_payout_amount": float(payout_amounts["completed_amount"]),
                "total_payout_amount": float(payout_amounts["total_amount"]),
            },
            "refunds": {
                "total_refunds": total_refund_count,
                "total_refund_amount": total_refund_amount,
            },
        }


# ════════════════════════════════════════════════════════════════
# 7. SUBSCRIPTION ANALYTICS SERVICE
# ════════════════════════════════════════════════════════════════

class SubscriptionService:
    """
    Subscription analytics for both candidate and interviewer subscriptions.
    """

    @staticmethod
    def get_subscriptions():
        now = timezone.now()

        # ── Candidate Subscriptions ───────────────────────────
        candidate_subs = UserSubscription.objects.aggregate(
            active=Count(
                "id",
                filter=Q(
                    status=SubscriptionStatus.ACTIVE,
                    end_date__gt=now,
                ),
            ),
            expired=Count(
                "id",
                filter=Q(status=SubscriptionStatus.EXPIRED)
                | Q(status=SubscriptionStatus.ACTIVE, end_date__lte=now),
            ),
            total=Count("id"),
        )

        # ── Interviewer Subscriptions ─────────────────────────
        interviewer_subs = InterviewerSubscription.objects.aggregate(
            active=Count(
                "id",
                filter=Q(
                    status=InterviewerSubscriptionStatus.ACTIVE,
                    end_date__gt=now,
                ),
            ),
            expired=Count(
                "id",
                filter=Q(status=InterviewerSubscriptionStatus.EXPIRED)
                | Q(
                    status=InterviewerSubscriptionStatus.ACTIVE,
                    end_date__lte=now,
                ),
            ),
            total=Count("id"),
        )

        # Combined totals
        active_subscriptions = candidate_subs["active"] + interviewer_subs["active"]
        expired_subscriptions = candidate_subs["expired"] + interviewer_subs["expired"]
        total_subscriptions = candidate_subs["total"] + interviewer_subs["total"]

        # Renewal rate = (total - expired - cancelled) / total
        renewal_rate = (
            round(
                (active_subscriptions / total_subscriptions) * 100, 1
            )
            if total_subscriptions > 0
            else 0.0
        )

        # Subscription revenue
        candidate_sub_revenue = _safe_float(
            SubscriptionPaymentOrder.objects.filter(
                status=PaymentStatus.SUCCEEDED
            ).aggregate(total=Sum("amount_inr"))["total"]
        )

        interviewer_sub_revenue = _safe_float(
            InterviewerPaymentOrder.objects.filter(
                status=PaymentStatus.SUCCEEDED
            ).aggregate(total=Sum("amount_inr"))["total"]
        )

        return {
            "active_subscriptions": active_subscriptions,
            "expired_subscriptions": expired_subscriptions,
            "renewal_rate": renewal_rate,
            "subscription_revenue": candidate_sub_revenue + interviewer_sub_revenue,
            "candidate_subscriptions": {
                "active": candidate_subs["active"],
                "expired": candidate_subs["expired"],
            },
            "interviewer_subscriptions": {
                "active": interviewer_subs["active"],
                "expired": interviewer_subs["expired"],
            },
        }


# ════════════════════════════════════════════════════════════════
# 8. PLATFORM GROWTH ANALYTICS SERVICE
# ════════════════════════════════════════════════════════════════

class GrowthService:
    """
    Platform growth time-series: user registrations,
    interview volume, and revenue over time.
    """

    @staticmethod
    def get_growth(period=DEFAULT_PERIOD):
        if period not in VALID_PERIODS:
            period = DEFAULT_PERIOD

        trunc_func = _get_trunc_func(period)
        start_date = _period_start_date(period)

        # ── User Growth ───────────────────────────────────────
        user_growth = list(
            CustomUser.objects.filter(
                date_joined__gte=start_date
            )
            .annotate(period=trunc_func("date_joined"))
            .values("period")
            .annotate(
                new_users=Count("id"),
                new_candidates=Count("id", filter=Q(role="user")),
                new_interviewers=Count("id", filter=Q(role="interviewer")),
            )
            .order_by("period")[:MAX_TIMESERIES_POINTS]
        )

        user_growth_data = [
            {
                "period": entry["period"].isoformat(),
                "new_users": entry["new_users"],
                "new_candidates": entry["new_candidates"],
                "new_interviewers": entry["new_interviewers"],
            }
            for entry in user_growth
        ]

        # ── Interview Growth ──────────────────────────────────
        interview_growth = list(
            InterviewBooking.objects.filter(
                created_at__gte=start_date
            )
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(
                total_bookings=Count("id"),
                completed=Count(
                    "id",
                    filter=Q(status=InterviewBooking.Status.COMPLETED),
                ),
            )
            .order_by("period")[:MAX_TIMESERIES_POINTS]
        )

        interview_growth_data = [
            {
                "period": entry["period"].isoformat(),
                "total_bookings": entry["total_bookings"],
                "completed": entry["completed"],
            }
            for entry in interview_growth
        ]

        # ── Revenue Growth ────────────────────────────────────
        revenue_growth = list(
            PaymentOrder.objects.filter(
                status=PaymentStatus.SUCCEEDED,
                created_at__gte=start_date,
            )
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(revenue=Coalesce(Sum("amount_inr"), 0))
            .order_by("period")[:MAX_TIMESERIES_POINTS]
        )

        revenue_growth_data = [
            {
                "period": entry["period"].isoformat(),
                "revenue": entry["revenue"],
            }
            for entry in revenue_growth
        ]

        return {
            "user_growth": user_growth_data,
            "interview_growth": interview_growth_data,
            "revenue_growth": revenue_growth_data,
        }


# ════════════════════════════════════════════════════════════════
# SHARED HELPER: RISKY INTERVIEWERS
# ════════════════════════════════════════════════════════════════

def _get_risky_interviewers():
    """
    Identify risky interviewers based on multiple signals:
    - Low average rating (below RISKY_MIN_AVG_RATING)
    - High complaint count (above RISKY_MIN_COMPLAINT_COUNT)
    - High cancellation rate (above RISKY_CANCELLATION_RATE_THRESHOLD)
    - High no-show rate (above RISKY_NO_SHOW_RATE_THRESHOLD)

    Only considers interviewers with at least RISKY_MIN_SESSIONS_FOR_ANALYSIS
    total bookings (to avoid flagging new interviewers).

    Returns list of dicts with risk signals.
    """
    # Annotate interviewers with booking stats
    interviewer_stats = (
        CustomUser.objects.filter(role="interviewer")
        .annotate(
            total_bookings=Count(
                "interviewer_bookings",
                distinct=True,
            ),
            completed_bookings=Count(
                "interviewer_bookings",
                filter=Q(
                    interviewer_bookings__status=InterviewBooking.Status.COMPLETED
                ),
                distinct=True,
            ),
            cancelled_bookings=Count(
                "interviewer_bookings",
                filter=Q(
                    interviewer_bookings__status__in=[
                        InterviewBooking.Status.CANCELLED,
                        InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
                    ]
                ),
                distinct=True,
            ),
            no_show_bookings=Count(
                "interviewer_bookings",
                filter=Q(
                    interviewer_bookings__status=InterviewBooking.Status.INTERVIEWER_NO_SHOW
                ),
                distinct=True,
            ),
            avg_rating=Avg("reviews_received__overall_rating"),
            complaint_count=Count(
                "issues_against",
                distinct=True,
            ),
        )
        .filter(total_bookings__gte=RISKY_MIN_SESSIONS_FOR_ANALYSIS)
    )

    risky = []
    for interviewer in interviewer_stats:
        risk_signals = []
        total = interviewer.total_bookings

        # Check average rating
        if (
            interviewer.avg_rating is not None
            and float(interviewer.avg_rating) < RISKY_MIN_AVG_RATING
        ):
            risk_signals.append(
                f"Low avg rating: {_safe_float(interviewer.avg_rating)}"
            )

        # Check complaint count
        if interviewer.complaint_count >= RISKY_MIN_COMPLAINT_COUNT:
            risk_signals.append(
                f"High complaints: {interviewer.complaint_count}"
            )

        # Check cancellation rate
        if total > 0:
            cancel_rate = (interviewer.cancelled_bookings / total) * 100
            if cancel_rate >= RISKY_CANCELLATION_RATE_THRESHOLD:
                risk_signals.append(
                    f"High cancellation rate: {round(cancel_rate, 1)}%"
                )

        # Check no-show rate
        if total > 0:
            noshow_rate = (interviewer.no_show_bookings / total) * 100
            if noshow_rate >= RISKY_NO_SHOW_RATE_THRESHOLD:
                risk_signals.append(
                    f"High no-show rate: {round(noshow_rate, 1)}%"
                )

        if risk_signals:
            risky.append({
                "user_id": interviewer.id,
                "email": interviewer.email,
                "name": f"{interviewer.first_name or ''} {interviewer.last_name or ''}".strip(),
                "risk_signals": risk_signals,
                "total_bookings": total,
                "avg_rating": _safe_float(interviewer.avg_rating),
                "complaint_count": interviewer.complaint_count,
            })

    return risky
