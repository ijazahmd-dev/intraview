# ai_interviews/tasks.py

import logging
from typing import Any, Dict, List, Optional

from celery import shared_task
from django.db import transaction

from .models import (
    AIInterviewTurn,
    AIInterviewEvaluation,
    AIInterviewFinalReport,
    AIInterviewSession,
)


logger = logging.getLogger(__name__)







def _build_evaluation_input(turn: AIInterviewTurn) -> Dict[str, Any]:
    session = turn.session
    role_name = session.role.name
    difficulty = session.difficulty
    round_type = session.round_type

    # You can enrich this with role.expected_skills later.
    return {
        "role": role_name,
        "round_type": round_type,
        "difficulty": difficulty,
        "question": turn.question_text,
        "answer": turn.answer_text,
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
        turn = AIInterviewTurn.objects.select_related("session", "evaluation").get(
            pk=turn_id
        )
    except AIInterviewTurn.DoesNotExist:
        logger.warning("evaluate_turn: turn %s does not exist", turn_id)
        return

    evaluation = turn.evaluation  # OneToOne

    if evaluation.status == AIInterviewEvaluation.Status.SUCCESS:
        logger.info("evaluate_turn: turn %s already evaluated, skipping", turn_id)
        return

    if not turn.answer_text or not turn.answer_text.strip():
        # Nothing to evaluate; mark FAILED but do not retry.
        evaluation.status = AIInterviewEvaluation.Status.FAILED
        evaluation.suggestions = ["Empty answer; no evaluation generated."]
        evaluation.save(update_fields=["status", "suggestions", "updated_at"])
        logger.info("evaluate_turn: empty answer for turn %s, marking FAILED", turn_id)
        return

    payload = _build_evaluation_input(turn)
    logger.info("evaluate_turn: evaluating turn %s", turn_id)

    try:
        result = _call_gemini_flash_evaluation(payload)
    except Exception as exc:
        logger.exception("evaluate_turn: error while evaluating turn %s", turn_id)
        # raise to trigger autoretry
        raise exc

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
            "score": evaluation.score,
        },
    )




























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

        interview_data.append(
            {
                "turn_index": t.turn_index,
                "question": t.question_text,
                "answer": t.answer_text,
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
            extra={"session_id": session_id, "status": session.status},
        )
        return

    report = AIInterviewReportService.ensure_final_report(session)

    if report.status == AIInterviewFinalReport.Status.SUCCESS:
        logger.info(
            "generate_final_report: report already SUCCESS for session %s, skipping",
            session_id,
        )
        return

    payload = _build_final_report_input(session)
    logger.info("generate_final_report: generating report for session %s", session_id)

    try:
        result = _call_gemini_pro_report(payload)
    except Exception as exc:
        logger.exception(
            "generate_final_report: error for session %s (will retry)", session_id
        )
        raise exc

    report.overall_score = result.get("overall_score")
    report.summary = result.get("summary", "")
    report.strengths = "\n".join(result.get("strengths") or [])
    report.areas_for_improvement = "\n".join(
        result.get("areas_for_improvement") or []
    )
    report.recommendations = "\n".join(result.get("recommendations") or [])
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

    logger.info("generate_final_report: SUCCESS for session %s", session_id)