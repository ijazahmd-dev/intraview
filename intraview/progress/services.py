# progress/services.py
"""
Candidate Progress Dashboard — Service Layer

All analytics logic lives here. Views are thin wrappers.
No direct model mutation — this is read-only analytics.
"""

from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Avg, Count, Q, F, StdDev
from django.db.models.functions import TruncMonth
from django.utils import timezone

from bookings.models import InterviewBooking
from feedbacks.models import CandidateEvaluation, FeedbackType
from ai_interviews.models import AIInterviewSession, AIInterviewFinalReport


# ─── Readiness level thresholds ─────────────────────────────
READINESS_LEVELS = [
    (81, "INTERVIEW_STRONG"),
    (61, "JOB_READY"),
    (31, "IMPROVING"),
    (0, "BEGINNER"),
]

# ─── Readiness score weights ────────────────────────────────
READINESS_WEIGHT_PERFORMANCE = 0.40
READINESS_WEIGHT_CONSISTENCY = 0.20
READINESS_WEIGHT_TREND = 0.20
READINESS_WEIGHT_SESSION_COUNT = 0.20

# Session count cap for scoring (after this, full marks for volume)
SESSION_COUNT_CAP = 20


def _readiness_level(score: int) -> str:
    """Map a 0–100 readiness score to a human-readable level."""
    for threshold, level in READINESS_LEVELS:
        if score >= threshold:
            return level
    return "BEGINNER"


def _safe_float(value, default=0.0) -> float:
    """Safely convert aggregation result to float."""
    if value is None:
        return default
    return round(float(value), 1)


class CandidateProgressService:
    """
    Encapsulates all dashboard analytics queries.
    Every method takes the authenticated user and returns plain dicts
    ready for serialization.
    """

    # ════════════════════════════════════════════════════════════
    # 1. OVERVIEW STATISTICS
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def get_overview_stats(user) -> dict:
        """
        Returns high-level dashboard numbers:
        total sessions, peer/ai counts, avg score, practice hours, readiness.
        """

        # ── Peer interview stats ──────────────────────────────
        peer_bookings = InterviewBooking.objects.filter(
            candidate=user,
            status=InterviewBooking.Status.COMPLETED,
        )
        peer_count = peer_bookings.count()

        # Average overall score from human evaluations
        peer_score_agg = CandidateEvaluation.objects.filter(
            candidate=user,
            feedback_type=FeedbackType.HUMAN,
        ).aggregate(avg_score=Avg("overall_score"))

        # Practice hours from booking durations
        peer_hours = 0.0
        for b in peer_bookings.only("start_datetime", "end_datetime"):
            if b.start_datetime and b.end_datetime:
                delta = (b.end_datetime - b.start_datetime).total_seconds()
                peer_hours += max(0, delta) / 3600

        # ── AI interview stats ────────────────────────────────
        ai_sessions = AIInterviewSession.objects.filter(
            user=user,
            status=AIInterviewSession.Status.COMPLETED,
        )
        ai_count = ai_sessions.count()

        # AI practice hours from duration_minutes
        ai_hours_agg = ai_sessions.aggregate(
            total_mins=Count("id")  # placeholder — sum below
        )
        ai_hours = 0.0
        for s in ai_sessions.only("duration_minutes"):
            ai_hours += (s.duration_minutes or 0) / 60

        # AI average score from final reports
        ai_score_agg = AIInterviewFinalReport.objects.filter(
            session__user=user,
            session__status=AIInterviewSession.Status.COMPLETED,
            status=AIInterviewFinalReport.Status.SUCCESS,
        ).aggregate(avg_score=Avg("overall_score"))

        # ── Combined metrics ──────────────────────────────────
        total_sessions = peer_count + ai_count
        total_hours = round(peer_hours + ai_hours, 1)

        # Weighted average score (peer scores are 1-5, AI may differ)
        # Normalize both to the same scale before averaging
        peer_avg = _safe_float(peer_score_agg["avg_score"])
        ai_avg = _safe_float(ai_score_agg["avg_score"])

        if peer_count > 0 and ai_count > 0:
            # AI reports use 0-10 scale; normalize to 1-5 for consistency
            ai_avg_normalized = (ai_avg / 10) * 5 if ai_avg > 5 else ai_avg
            average_overall_score = round(
                (peer_avg * peer_count + ai_avg_normalized * ai_count)
                / total_sessions,
                1,
            )
        elif peer_count > 0:
            average_overall_score = peer_avg
        elif ai_count > 0:
            average_overall_score = ai_avg
        else:
            average_overall_score = 0.0

        # Readiness
        readiness_score, readiness_level = CandidateProgressService._calculate_readiness_score(user)

        return {
            "total_sessions_attended": total_sessions,
            "peer_sessions_count": peer_count,
            "ai_sessions_count": ai_count,
            "average_overall_score": average_overall_score,
            "total_practice_hours": total_hours,
            "readiness_score": readiness_score,
            "readiness_level": readiness_level,
        }

    # ════════════════════════════════════════════════════════════
    # 2. GROWTH ANALYTICS (time-series trend data)
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def get_growth_analytics(user, source: str = "all") -> list[dict]:
        """
        Monthly trend data for skill scores.
        `source` can be "all", "peer", or "ai".

        Returns list of dicts sorted by month:
        [
            {
                "month": "2026-01",
                "technical_score": 3.5,
                "communication_score": 4.0,
                "problem_solving_score": 3.0,
                "confidence_score": 3.8,
                "overall_score": 3.6,
                "session_count": 4,
            },
            ...
        ]
        """
        results = []

        # ── Peer evaluations trend ────────────────────────────
        if source in ("all", "peer"):
            peer_trends = (
                CandidateEvaluation.objects.filter(
                    candidate=user,
                    feedback_type=FeedbackType.HUMAN,
                )
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(
                    technical_score=Avg("technical_score"),
                    communication_score=Avg("communication_score"),
                    problem_solving_score=Avg("problem_solving_score"),
                    confidence_score=Avg("confidence_score"),
                    overall_score=Avg("overall_score"),
                    session_count=Count("id"),
                )
                .order_by("month")
            )

            for entry in peer_trends:
                results.append({
                    "month": entry["month"].strftime("%Y-%m"),
                    "source": "peer",
                    "technical_score": _safe_float(entry["technical_score"]),
                    "communication_score": _safe_float(entry["communication_score"]),
                    "problem_solving_score": _safe_float(entry["problem_solving_score"]),
                    "confidence_score": _safe_float(entry["confidence_score"]),
                    "overall_score": _safe_float(entry["overall_score"]),
                    "session_count": entry["session_count"],
                })

        # ── AI evaluations trend (from final reports) ─────────
        if source in ("all", "ai"):
            ai_trends = (
                AIInterviewFinalReport.objects.filter(
                    session__user=user,
                    session__status=AIInterviewSession.Status.COMPLETED,
                    status=AIInterviewFinalReport.Status.SUCCESS,
                )
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(
                    overall_score=Avg("overall_score"),
                    session_count=Count("id"),
                )
                .order_by("month")
            )

            for entry in ai_trends:
                results.append({
                    "month": entry["month"].strftime("%Y-%m"),
                    "source": "ai",
                    # AI final reports don't have per-skill breakdown,
                    # so we return null for skills not available
                    "technical_score": None,
                    "communication_score": None,
                    "problem_solving_score": None,
                    "confidence_score": None,
                    "overall_score": _safe_float(entry["overall_score"]),
                    "session_count": entry["session_count"],
                })

        # Sort combined results by month for frontend consumption
        results.sort(key=lambda x: x["month"])
        return results

    # ════════════════════════════════════════════════════════════
    # 3. SKILL BREAKDOWN (for radar chart)
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def get_skill_breakdown(user) -> dict:
        """
        Average per-skill scores from peer evaluations.
        AI final reports don't have per-skill scores, so this
        only uses CandidateEvaluation (HUMAN) data.
        """
        agg = CandidateEvaluation.objects.filter(
            candidate=user,
            feedback_type=FeedbackType.HUMAN,
        ).aggregate(
            technical=Avg("technical_score"),
            communication=Avg("communication_score"),
            problem_solving=Avg("problem_solving_score"),
            confidence=Avg("confidence_score"),
            overall=Avg("overall_score"),
            total_evaluations=Count("id"),
        )

        return {
            "technical": _safe_float(agg["technical"]),
            "communication": _safe_float(agg["communication"]),
            "problem_solving": _safe_float(agg["problem_solving"]),
            "confidence": _safe_float(agg["confidence"]),
            "overall": _safe_float(agg["overall"]),
            "total_evaluations": agg["total_evaluations"],
        }

    # ════════════════════════════════════════════════════════════
    # 4. STRENGTHS & WEAKNESSES
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def get_strengths_weaknesses(
        user,
        strength_threshold: float = 4.0,
        weakness_threshold: float = 3.0,
    ) -> dict:
        """
        Classify skills as strengths or weaknesses based on
        configurable thresholds against historical averages.

        Default: score >= 4.0 → strength, score < 3.0 → weakness.
        """
        skills = CandidateProgressService.get_skill_breakdown(user)

        # Map internal keys to user-friendly labels
        SKILL_LABELS = {
            "technical": "Technical Skills",
            "communication": "Communication",
            "problem_solving": "Problem Solving",
            "confidence": "Confidence",
        }

        strengths = []
        weaknesses = []

        for key, label in SKILL_LABELS.items():
            score = skills.get(key, 0.0)
            if score == 0.0:
                continue  # No data, skip

            if score >= strength_threshold:
                strengths.append({
                    "skill": label,
                    "score": score,
                })
            elif score < weakness_threshold:
                weaknesses.append({
                    "skill": label,
                    "score": score,
                })

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "thresholds": {
                "strength": strength_threshold,
                "weakness": weakness_threshold,
            },
        }

    # ════════════════════════════════════════════════════════════
    # 5. INTERVIEW HISTORY (paginated queryset)
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def get_interview_history_qs(user, source: str = "all"):
        """
        Returns a list of dicts representing the candidate's interview
        history (both peer and AI). The result is a plain list because
        it merges two different models.

        Each item:
        {
            "interview_type": "peer" | "ai",
            "booking_id": <int>,
            "completed_date": <datetime>,
            "interviewer_name": <str | None>,
            "overall_score": <float | None>,
            "hire_recommendation": <str | None>,
            "feedback_summary": <str | None>,
        }

        Filtering by `source` ("all", "peer", "ai") is supported.
        """
        history = []

        # ── Peer interviews ───────────────────────────────────
        if source in ("all", "peer"):
            peer_bookings = (
                InterviewBooking.objects.filter(
                    candidate=user,
                    status=InterviewBooking.Status.COMPLETED,
                )
                .select_related("interviewer")
                .prefetch_related("candidate_evaluation")
                .order_by("-end_datetime")
            )

            for booking in peer_bookings:
                evaluation = getattr(booking, "candidate_evaluation", None)
                interviewer = booking.interviewer

                history.append({
                    "interview_type": "peer",
                    "booking_id": booking.id,
                    "completed_date": booking.end_datetime,
                    "interviewer_name": (
                        f"{interviewer.first_name or ''} {interviewer.last_name or ''}".strip()
                        if interviewer else None
                    ),
                    "overall_score": (
                        float(evaluation.overall_score) if evaluation else None
                    ),
                    "hire_recommendation": (
                        evaluation.hire_recommendation if evaluation else None
                    ),
                    "feedback_summary": (
                        evaluation.strengths[:200] if evaluation else None
                    ),
                })

        # ── AI interviews ─────────────────────────────────────
        if source in ("all", "ai"):
            ai_sessions = (
                AIInterviewSession.objects.filter(
                    user=user,
                    status=AIInterviewSession.Status.COMPLETED,
                )
                .select_related("role")
                .prefetch_related("final_report")
                .order_by("-ended_at")
            )

            for session in ai_sessions:
                report = getattr(session, "final_report", None)

                history.append({
                    "interview_type": "ai",
                    "booking_id": session.id,
                    "completed_date": session.ended_at,
                    "interviewer_name": f"AI — {session.role.name}",
                    "overall_score": (
                        float(report.overall_score)
                        if report and report.overall_score is not None
                        else None
                    ),
                    "hire_recommendation": None,  # AI doesn't give hire recs
                    "feedback_summary": (
                        report.summary[:200]
                        if report and report.summary
                        else None
                    ),
                })

        # Sort combined history by date descending
        history.sort(
            key=lambda x: x["completed_date"] or timezone.datetime.min.replace(
                tzinfo=timezone.utc
            ),
            reverse=True,
        )
        return history

    # ════════════════════════════════════════════════════════════
    # 6. READINESS SCORE CALCULATOR
    # ════════════════════════════════════════════════════════════

    @staticmethod
    def _calculate_readiness_score(user) -> tuple[int, str]:
        """
        MVP readiness formula (0–100):

        40% — Overall performance (avg score normalized to 0–100)
        20% — Consistency (inverse of std-dev, normalized)
        20% — Recent trend (last 3 vs previous 3 sessions)
        20% — Session count (capped at SESSION_COUNT_CAP)

        Returns (score: int, level: str).
        """
        evaluations = CandidateEvaluation.objects.filter(
            candidate=user,
            feedback_type=FeedbackType.HUMAN,
        ).order_by("-created_at")

        eval_count = evaluations.count()

        # If no evaluations at all, check AI-only data
        if eval_count == 0:
            ai_reports = AIInterviewFinalReport.objects.filter(
                session__user=user,
                session__status=AIInterviewSession.Status.COMPLETED,
                status=AIInterviewFinalReport.Status.SUCCESS,
            )
            ai_count = ai_reports.count()
            if ai_count == 0:
                return (0, "BEGINNER")

            ai_avg = ai_reports.aggregate(avg=Avg("overall_score"))["avg"] or 0
            # Normalize AI score (0-10 scale) to 0-100
            perf_score = min(100, (float(ai_avg) / 5) * 100) if ai_avg <= 5 else min(100, float(ai_avg) * 10)
            count_score = min(100, (ai_count / SESSION_COUNT_CAP) * 100)

            raw = (
                READINESS_WEIGHT_PERFORMANCE * perf_score
                + READINESS_WEIGHT_SESSION_COUNT * count_score
            )
            score = max(0, min(100, int(round(raw))))
            return (score, _readiness_level(score))

        # ── 1. Performance (40%) ──────────────────────────────
        # Peer scores are 1–5; normalize to 0–100
        avg_score = evaluations.aggregate(avg=Avg("overall_score"))["avg"]
        # (score / 5) * 100
        perf_score = (float(avg_score) / 5) * 100 if avg_score else 0

        # ── 2. Consistency (20%) ──────────────────────────────
        # Lower std-dev = more consistent = higher score
        stddev = evaluations.aggregate(sd=StdDev("overall_score"))["sd"]
        if stddev is not None and stddev > 0:
            # Max possible stddev for 1-5 scale is ~2.0
            # Normalize: consistency = (1 - stddev/2) * 100, clamped 0–100
            consistency_score = max(0, min(100, (1 - float(stddev) / 2) * 100))
        else:
            # Perfect consistency (or single evaluation)
            consistency_score = 100.0

        # ── 3. Recent trend (20%) ─────────────────────────────
        # Compare avg of last 3 sessions vs previous 3
        recent_evals = list(evaluations[:6].values_list("overall_score", flat=True))

        if len(recent_evals) >= 4:
            recent_avg = sum(float(s) for s in recent_evals[:3]) / 3
            previous_avg = sum(float(s) for s in recent_evals[3:6]) / len(recent_evals[3:6])

            # Positive delta = improving, negative = declining
            delta = recent_avg - previous_avg
            # Normalize: +1.0 delta → 100, -1.0 → 0, 0 → 50
            trend_score = max(0, min(100, 50 + (delta * 50)))
        else:
            # Not enough data for trend — neutral
            trend_score = 50.0

        # ── 4. Session count (20%) ────────────────────────────
        total_sessions = eval_count + AIInterviewSession.objects.filter(
            user=user,
            status=AIInterviewSession.Status.COMPLETED,
        ).count()

        count_score = min(100, (total_sessions / SESSION_COUNT_CAP) * 100)

        # ── Combine ───────────────────────────────────────────
        raw = (
            READINESS_WEIGHT_PERFORMANCE * perf_score
            + READINESS_WEIGHT_CONSISTENCY * consistency_score
            + READINESS_WEIGHT_TREND * trend_score
            + READINESS_WEIGHT_SESSION_COUNT * count_score
        )

        score = max(0, min(100, int(round(raw))))
        return (score, _readiness_level(score))
