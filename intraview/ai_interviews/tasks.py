# ai_interviews/tasks.py

import logging
from typing import Any, Dict, List, Optional
from django.conf import settings

from celery import shared_task
from django.db import transaction

from .models import (
    AIInterviewTurn,
    AIInterviewEvaluation,
    AIInterviewFinalReport,
    AIInterviewSession,
)

from .service.gemini.client import (
    GeminiPermanentError,
    GeminiTransientError,
)
from .service.gemini.evaluation import evaluate_turn_payload
from .service.gemini.reporting import generate_final_report_payload


logger = logging.getLogger(__name__)

SKIPPED_NO_ANSWER_TEXT = "Candidate did not provide an answer to this question."






def _build_combined_turn_answer(
    turn: AIInterviewTurn,
    *,
    max_length: int,
) -> str:
    metadata = turn.metadata or {}

    if metadata.get("skipped_no_answer"):
        return SKIPPED_NO_ANSWER_TEXT

    followup_exchanges = (
        metadata.get("followup_exchanges")
        or []
    )

    base_answer = (
        metadata.get("base_answer_text")
        or turn.answer_text
        or ""
    ).strip()

    parts = []

    if base_answer:
        parts.append(base_answer)

    for i, exchange in enumerate(
        followup_exchanges,
        start=1,
    ):
        is_skipped = bool(
            exchange.get("skipped")
        )

        fu_q = (
            exchange.get("question")
            or ""
        ).strip()

        fu_a = (
            exchange.get("answer")
            or ""
        ).strip()

        if not fu_a or is_skipped:
            continue

        parts.append(
            f"[Clarification {i}] Interviewer: {fu_q}"
        )

        parts.append(
            f"Candidate: {fu_a}"
        )

    combined = "\n\n".join(parts)

    if len(combined) > max_length:
        combined = combined[:max_length].rsplit(" ", 1)[0] + "..."

    return combined






def _build_evaluation_input(turn: AIInterviewTurn) -> Dict[str, Any]:
    session = turn.session
    role_name = session.role.name
    difficulty = session.difficulty
    round_type = session.round_type

    combined_answer = _build_combined_turn_answer(
        turn,
        max_length=4000,
    )

    question_text = (turn.question_text or "").strip()
    if len(question_text) > 1000:
        question_text = question_text[:1000]

    # You can enrich this with role.expected_skills later.
    return {
        "role": role_name,
        "round_type": round_type,
        "difficulty": difficulty,
        "question": question_text,
        "answer": combined_answer,
        "expected_skills": [],  # TODO: fill from role metadata
    }


def _call_gemini_flash_evaluation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Placeholder: call your real evaluation model (Gemini Flash) here.

    Expected return structure:
    {
      "score": 7.0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "suggestions": ["..."],
      "confidence": "medium",
      "raw": {...}  # full model response
    }
    # Example: use HTTP timeout or SDK timeout when calling the real model.
    # Timeout target: 5 to 10 seconds.
    """
    # TODO: replace stub with real API call.
    # For now, return a deterministic fake result so you can test the pipeline.
    return {
        "score": 7.0,
        "strengths": ["Good structure in the answer."],
        "weaknesses": ["Missing some depth on edge cases."],
        "suggestions": ["Include more concrete examples next time."],
        "confidence": "medium",
        "raw": payload,
    }


@shared_task(
    bind=True,
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,       # exponential backoff[web:174][web:183]
    retry_backoff_max=60,     # cap delay at 60 seconds
    retry_jitter=True,
)
def evaluate_turn(self, turn_id: int) -> None:
    """
    Async evaluation of a single Q&A turn using Gemini Flash (or similar).

    Retries on transient errors with exponential backoff.
    """
    try:
        turn = AIInterviewTurn.objects.select_related("session", "evaluation", "session__role").get(
            pk=turn_id
        )
    except AIInterviewTurn.DoesNotExist:
        logger.warning("evaluate_turn: turn %s does not exist", turn_id)
        return

    evaluation = turn.evaluation  # OneToOne

    if evaluation.status == AIInterviewEvaluation.Status.SUCCESS:
        logger.info(
            "evaluate_turn: turn %s already evaluated, skipping",
            turn_id,
            extra={
                "turn_id": turn.id,
                "session_id": turn.session_id,
                "task_id": self.request.id,
            },
        )
        return

    if (turn.metadata or {}).get("skipped_no_answer"):
        evaluation.score = 0.0
        evaluation.strengths = []
        evaluation.weaknesses = [
            "No answer was provided for this question."
        ]
        evaluation.suggestions = [
            "Practice giving a brief structured response even when you are unsure."
        ]
        evaluation.confidence = "high"
        evaluation.status = AIInterviewEvaluation.Status.SUCCESS
        evaluation.raw_response = {
            "reason": "NO_ANSWER_SKIPPED",
            "skip_reason": (turn.metadata or {}).get("skip_reason"),
            "answer": SKIPPED_NO_ANSWER_TEXT,
        }
        evaluation.save(
            update_fields=[
                "score",
                "strengths",
                "weaknesses",
                "suggestions",
                "confidence",
                "status",
                "raw_response",
                "updated_at",
            ]
        )

        logger.info(
            "evaluate_turn: unanswered skipped turn %s evaluated deterministically",
            turn_id,
            extra={
                "turn_id": turn.id,
                "session_id": turn.session_id,
                "task_id": self.request.id,
            },
        )

        session = turn.session

        if session.status == AIInterviewSession.Status.COMPLETED:
            unfinished_count = AIInterviewEvaluation.objects.filter(
                turn__session=session,
                status=AIInterviewEvaluation.Status.PENDING,
            ).count()

            if unfinished_count == 0:
                generate_final_report.delay(session.id)

        return

    if not turn.answer_text or not turn.answer_text.strip():
        evaluation.status = AIInterviewEvaluation.Status.FAILED
        evaluation.suggestions = [
            "Empty answer; no evaluation generated."
        ]
        evaluation.raw_response = {
            "reason": "EMPTY_ANSWER",
            "retryable": False,
        }

        evaluation.save(
            update_fields=[
                "status",
                "suggestions",
                "raw_response",
                "updated_at",
            ]
        )

        logger.info(
            "evaluate_turn: empty answer for turn %s, marking FAILED",
            turn_id,
            extra={
                "turn_id": turn.id,
                "session_id": turn.session_id,
                "task_id": self.request.id,
            },
        )

        session = turn.session

        if session.status == AIInterviewSession.Status.COMPLETED:
            unfinished_count = AIInterviewEvaluation.objects.filter(
                turn__session=session,
                status=AIInterviewEvaluation.Status.PENDING,
            ).count()

            if unfinished_count == 0:
                generate_final_report.delay(session.id)

        return

    payload = _build_evaluation_input(turn)
    logger.info(
        "evaluate_turn: evaluating turn %s",
        turn_id,
        extra={
            "turn_id": turn.id,
            "session_id": turn.session_id,
            "task_id": self.request.id,
            "model_name": getattr(settings, "GEMINI_EVALUATION_MODEL", "gemini-2.5-flash"),
            "retry_count": self.request.retries,
        },
    )

    try:
        result = evaluate_turn_payload(payload)

    except GeminiPermanentError as exc:
        logger.exception(
            "evaluate_turn: permanent Gemini error for turn %s",
            turn_id,
            extra={
                "turn_id": turn.id,
                "session_id": turn.session_id,
                "task_id": self.request.id,
            },
        )

        evaluation.status = AIInterviewEvaluation.Status.FAILED
        evaluation.suggestions = ["Evaluation unavailable."]
        evaluation.raw_response = {
            "reason": "MODEL_OUTPUT_INVALID",
            "retryable": False,
            "error": str(exc),
        }

        evaluation.save(
            update_fields=[
                "status",
                "suggestions",
                "raw_response",
                "updated_at",
            ]
        )

        # ------------------------------------------
        # If session completed, check whether all
        # evaluations are now terminal.
        # ------------------------------------------
        session = turn.session

        if session.status == AIInterviewSession.Status.COMPLETED:
            unfinished_count = AIInterviewEvaluation.objects.filter(
                turn__session=session,
                status=AIInterviewEvaluation.Status.PENDING,
            ).count()

            if unfinished_count == 0:
                logger.info(
                    "All evaluations terminal for session %s → generating report",
                    session.id,
                )

                generate_final_report.delay(session.id)

        return

    except Exception as exc:
        logger.exception(
            "evaluate_turn: transient error for turn %s",
            turn_id,
            extra={
                "turn_id": turn.id,
                "session_id": turn.session_id,
                "task_id": self.request.id,
                "retry_count": self.request.retries,
            },
        )
        raise self.retry(exc=exc)
    
    

    # Persist structured output.
    with transaction.atomic():
        evaluation.score = result.get("score")
        evaluation.strengths = result.get("strengths") or []
        evaluation.weaknesses = result.get("weaknesses") or []
        evaluation.suggestions = result.get("suggestions") or []
        evaluation.confidence = result.get("confidence") or ""
        evaluation.raw_response = result.get("raw")
        evaluation.status = AIInterviewEvaluation.Status.SUCCESS
        evaluation.save(
            update_fields=[
                "score",
                "strengths",
                "weaknesses",
                "suggestions",
                "confidence",
                "raw_response",
                "status",
                "updated_at",
            ]
        )

    logger.info(
        "evaluate_turn success",
        extra={
            "turn_id": turn.id,
            "session_id": turn.session_id,
            "task_id": self.request.id,
            "score": evaluation.score,
        },
    )

    # -------------------------------------------------
    # Trigger final report if session already completed
    # and all evaluations are now terminal.
    # -------------------------------------------------

    session = turn.session

    if session.status == AIInterviewSession.Status.COMPLETED:
        unfinished_count = AIInterviewEvaluation.objects.filter(
            turn__session=session,
            status=AIInterviewEvaluation.Status.PENDING,
        ).count()

        if unfinished_count == 0:
            logger.info(
                "All evaluations finished for session %s → generating report",
                session.id,
            )

            generate_final_report.delay(session.id)




























def _build_final_report_input(session: AIInterviewSession) -> Dict[str, Any]:
    """
    Build the JSON payload that will be sent to Gemini Pro for final report.
    """
    turns = (
        AIInterviewTurn.objects.filter(session=session)
        .select_related("evaluation")
        .order_by("turn_index")
    )

    interview_data: List[Dict[str, Any]] = []

    for t in turns:
        eval_obj: Optional[AIInterviewEvaluation] = getattr(t, "evaluation", None)
        eval_payload: Optional[Dict[str, Any]] = None

        if eval_obj and eval_obj.status == AIInterviewEvaluation.Status.SUCCESS:
            eval_payload = {
                "score": eval_obj.score,
                "strengths": eval_obj.strengths,
                "weaknesses": eval_obj.weaknesses,
                "suggestions": eval_obj.suggestions,
                "confidence": eval_obj.confidence,
            }

        combined_answer = _build_combined_turn_answer(
            t,
            max_length=2000,
        )

        question_text = (t.question_text or "").strip()
        if len(question_text) > 500:
            question_text = question_text[:500]    

        interview_data.append(
            {
                "turn_index": t.turn_index,
                "question": question_text,
                "answer": combined_answer,
                "evaluation": eval_payload,  # may be None – Gemini must handle missing evals
            }
        )

    return {
        "role": session.role.name,
        "difficulty": session.difficulty,
        "round_type": session.round_type,
        "interview_data": interview_data,
    }


def _call_gemini_pro_report(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Placeholder: call your real final-report model (Gemini Pro) here.

    Expected return structure:
    {
      "overall_score": 7.5,
      "summary": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."],
      "recommendations": ["..."],
      "raw": {...}
    }
    # Example: use HTTP timeout or SDK timeout when calling the real model.
    # Timeout target: 5 to 10 seconds.
    """
    # TODO: replace stub with real API call.
    return {
        "overall_score": 7.5,
        "summary": "Strong fundamentals with some gaps in depth.",
        "strengths": ["Good communication", "Clear structure"],
        "areas_for_improvement": ["Give more concrete examples"],
        "recommendations": ["Practice explaining trade-offs in detail"],
        "raw": payload,
    }


@shared_task(
    bind=True,
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def generate_final_report(self, session_id: int) -> None:
    """
    Async final report generation for a completed session (Gemini Pro).
    """
    from ai_interviews.service.services import AIInterviewReportService
    try:
        session = AIInterviewSession.objects.select_related("role").get(pk=session_id)
    except AIInterviewSession.DoesNotExist:
        logger.warning("generate_final_report: session %s does not exist", session_id)
        return

    if session.status != AIInterviewSession.Status.COMPLETED:
        logger.warning(
            "generate_final_report skipped",
            extra={
                "session_id": session_id,
                "status": session.status,
                "task_id": self.request.id,
            },
        )
        return

    # ------------------------------------------------------------------
    # Check for unfinished evaluations BEFORE acquiring the transaction
    # lock. Raising self.retry() inside transaction.atomic() triggers an
    # immediate rollback (because Retry is an exception), which can roll
    # back the get_or_create inside ensure_final_report — confusing and
    # unnecessary. Do the count outside the transaction boundary.
    # ------------------------------------------------------------------
    unfinished_count = AIInterviewEvaluation.objects.filter(
        turn__session=session,
        status=AIInterviewEvaluation.Status.PENDING,
    ).count()

    if unfinished_count > 0 and self.request.retries < 1:
        logger.warning(
            "generate_final_report delayed: %s unfinished evaluations for session %s",
            unfinished_count,
            session_id,
            extra={
                "session_id": session_id,
                "retry_count": self.request.retries,
            },
        )
        raise self.retry(countdown=15)

    if unfinished_count > 0:
        logger.warning(
            "generate_final_report proceeding with %s unfinished evaluations for session %s",
            unfinished_count,
            session_id,
            extra={"session_id": session_id},
        )

    with transaction.atomic():
        report = AIInterviewReportService.ensure_final_report(session)

        report = (
            AIInterviewFinalReport.objects
            .select_for_update()
            .get(pk=report.pk)
        )

        if report.status == AIInterviewFinalReport.Status.PROCESSING:
            logger.info(
                "generate_final_report: already processing for session %s",
                session_id,
                extra={
                    "session_id": session_id,
                    "task_id": self.request.id,
                },
            )
            return

        if report.status == AIInterviewFinalReport.Status.SUCCESS:
            logger.info(
                "generate_final_report: report already SUCCESS for session %s, skipping",
                session_id,
                extra={
                    "session_id": session_id,
                    "task_id": self.request.id,
                },
            )
            return

        report.status = AIInterviewFinalReport.Status.PROCESSING
        report.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

    payload = _build_final_report_input(session)

    # Guard: if the session had zero turns (e.g. user ended immediately)
    # produce a graceful SUCCESS report so the candidate sees something
    # meaningful rather than a confusing FAILED status.
    if not payload["interview_data"]:
        logger.warning(
            "generate_final_report: no turns found for session %s, generating graceful report",
            session_id,
            extra={"session_id": session_id, "task_id": self.request.id},
        )
        report.overall_score = None
        report.summary = "No interview responses were recorded."
        report.strengths = []
        report.areas_for_improvement = ["Complete at least one interview question."]
        report.recommendations = ["Retry the mock interview."]
        report.raw_response = {"reason": "NO_TURNS"}
        report.status = AIInterviewFinalReport.Status.SUCCESS
        report.save(
            update_fields=[
                "overall_score",
                "summary",
                "strengths",
                "areas_for_improvement",
                "recommendations",
                "raw_response",
                "status",
                "updated_at",
            ]
        )
        return

    logger.info(
        "generate_final_report: generating report for session %s",
        session_id,
        extra={
            "session_id": session_id,
            "task_id": self.request.id,
            "model_name": getattr(settings, "GEMINI_FINAL_REPORT_MODEL", "gemini-2.5-pro"),
            "retry_count": self.request.retries,
        },
    )

    try:
        result = generate_final_report_payload(payload)
    except GeminiTransientError as exc:
        logger.exception(
            "generate_final_report: transient Gemini error for session %s",
            session_id,
            extra={
                "session_id": session_id,
                "task_id": self.request.id,
                "retry_count": self.request.retries,
            },
        )
        # Reset report status to PENDING so the retry attempt can
        # re-enter the generation path instead of hitting the
        # PROCESSING guard and silently exiting.
        report.status = AIInterviewFinalReport.Status.PENDING
        report.save(update_fields=["status", "updated_at"])
        raise self.retry(exc=exc)
    
    except GeminiPermanentError as exc:
        logger.exception(
            "generate_final_report: permanent Gemini error for session %s",
            session_id,
            extra={
                "session_id": session_id,
                "task_id": self.request.id,
            },
        )
        report.status = AIInterviewFinalReport.Status.FAILED
        report.raw_response = {
            "reason": "MODEL_OUTPUT_INVALID",
            "retryable": False,
            "error": str(exc),
        }
        report.save(update_fields=["status", "raw_response", "updated_at"])
        return

    report.overall_score = result.get("overall_score")
    report.summary = result.get("summary", "")
    report.strengths = result.get("strengths") or []
    report.areas_for_improvement = result.get("areas_for_improvement") or []
    report.recommendations = result.get("recommendations") or []
    report.raw_response = result.get("raw")
    report.status = AIInterviewFinalReport.Status.SUCCESS
    report.save(
        update_fields=[
            "overall_score",
            "summary",
            "strengths",
            "areas_for_improvement",
            "recommendations",
            "raw_response",
            "status",
            "updated_at",
        ]
    )

    logger.info(
        "generate_final_report: SUCCESS for session %s",
        session_id,
        extra={
            "session_id": session_id,
            "task_id": self.request.id,
        },
    )





@shared_task
def recover_stuck_reports() -> None:
    """
    Watchdog task (Celery Beat, every 10 minutes).

    Finds AIInterviewFinalReport records that have been stuck in
    PROCESSING for more than 10 minutes — a sign that the Celery
    worker that was handling them crashed mid-generation.

    Resets them to PENDING and re-queues generate_final_report so
    they are retried automatically.
    """
    from django.utils import timezone
    from datetime import timedelta

    cutoff = timezone.now() - timedelta(minutes=10)

    stuck = AIInterviewFinalReport.objects.filter(
        status=AIInterviewFinalReport.Status.PROCESSING,
        updated_at__lt=cutoff,
    ).select_related("session")

    recovered = 0
    for report in stuck:
        session = report.session

        # Only re-queue for sessions that are actually COMPLETED.
        # A PROCESSING report for a non-completed session is
        # unexpected — log and skip instead of silently re-queuing.
        if session.status != AIInterviewSession.Status.COMPLETED:
            logger.warning(
                "recover_stuck_reports: report %s is PROCESSING but "
                "session %s has unexpected status %s — skipping",
                report.pk,
                session.id,
                session.status,
            )
            continue

        # Re-fetch the report row to guard against the race where a
        # successful retry completed between our queryset fetch and
        # now. This avoids a duplicate enqueue of an already-done report.
        report.refresh_from_db(fields=["status"])
        if report.status == AIInterviewFinalReport.Status.SUCCESS:
            logger.info(
                "recover_stuck_reports: report %s already SUCCESS, skipping",
                report.pk,
            )
            continue

        logger.warning(
            "recover_stuck_reports: resetting stuck report %s "
            "for session %s and re-queuing",
            report.pk,
            session.id,
        )
        report.status = AIInterviewFinalReport.Status.PENDING
        report.save(update_fields=["status", "updated_at"])
        generate_final_report.delay(session.id)
        recovered += 1

    if recovered:
        logger.info(
            "recover_stuck_reports: recovered %s stuck report(s)",
            recovered,
        )
