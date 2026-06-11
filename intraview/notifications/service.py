# notifications/service.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

from django.conf import settings
from django.contrib.auth import get_user_model

from .constants import EventType, NotificationChannel, NotificationStatus
from .models import NotificationLog
from .novu_client import NovuClient


User = get_user_model()


@dataclass
class EventContext:
    event_type: str
    actor_id: Optional[int]
    payload: Dict[str, Any]
    correlation_id: str


class NotificationService:
    """
    Central brain: maps domain events to concrete notifications.

    Phase 2:
      - still decides recipients + channel(s)
      - creates NotificationLog rows
      - AND calls Novu as provider when workflow mapping exists
    """

    # Lazy-initialized Novu client
    _novu_client: Optional[NovuClient] = None

    @classmethod
    def _get_novu_client(cls) -> NovuClient:
        if cls._novu_client is None:
            cls._novu_client = NovuClient()
        return cls._novu_client

    @classmethod
    def _get_workflow_id_for_event(cls, event_type: str) -> Optional[str]:
        """
        Look up Novu workflow id from settings.NOVU_WORKFLOW_IDS.
        Returns None if no mapping exists (we still log locally).
        """
        mapping = getattr(settings, "NOVU_WORKFLOW_IDS", {})
        return mapping.get(event_type)

    @classmethod
    def handle_event(
        cls,
        event_type: str,
        actor_id: Optional[int],
        payload: Dict[str, Any],
        correlation_id: str,
    ) -> None:
        ctx = EventContext(
            event_type=event_type,
            actor_id=actor_id,
            payload=payload,
            correlation_id=correlation_id,
        )

        # Dispatch per-event-type
        if event_type == EventType.INTERVIEW_BOOKED.value:
            cls._handle_interview_booked(ctx)

        elif event_type == EventType.PAYMENT_SUCCESS.value:
            cls._handle_payment_success(ctx)

        elif event_type == EventType.PAYOUT_FAILED.value:
            cls._handle_payout_failed(ctx)

        elif event_type == EventType.FEEDBACK_PENDING.value:
            cls._handle_feedback_pending(ctx)

        elif event_type == EventType.INTERVIEW_REMINDER_30M.value:
            cls._handle_interview_reminder_30m(ctx)   

        elif event_type == EventType.RESCHEDULE_SLOT_REQUESTED.value:
            cls._handle_reschedule_slot_requested(ctx)    

        elif event_type == EventType.FEEDBACK_SUBMITTED.value:
            cls._handle_feedback_submitted(ctx)
        elif event_type == EventType.ISSUE_RAISED.value:
            cls._handle_issue_raised(ctx)

        elif event_type == EventType.ISSUE_RESOLVED.value:
            cls._handle_issue_resolved(ctx)

        elif event_type == EventType.ISSUE_REJECTED.value:
            cls._handle_issue_rejected(ctx)

        elif event_type == EventType.ISSUE_ACTION_TAKEN.value:
            cls._handle_issue_action_taken(ctx)

        elif event_type == EventType.ISSUE_WAITING_RESPONSE.value:
            cls._handle_issue_waiting_response(ctx)    
     

        # Add other events here as you go: INTERVIEW_COMPLETED, etc.

    # --- Handlers per event ---

    @classmethod
    def _handle_interview_booked(cls, ctx: EventContext) -> None:
        """
        Expect payload to contain:
          - booking_id
          - candidate_id
          - interviewer_id
          - start_time (ISO string or datetime)
        """
        candidate_id = ctx.payload.get("candidate_id")
        interviewer_id = ctx.payload.get("interviewer_id")
        start_time = ctx.payload.get("start_time")
        booking_id = ctx.payload.get("booking_id")

        notifications: List[Tuple[int, str, Dict[str, Any]]] = []

        if candidate_id:
            notifications.append(
                (
                    candidate_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Interview booked",
                        "body": f"Your interview is scheduled at {start_time}.",
                        "booking_id": booking_id,
                        "role": "candidate",
                        "redirect_url": f"/candidate/bookings-detail/{booking_id}",
                    },
                )
            )

        if interviewer_id:
            notifications.append(
                (
                    interviewer_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "New interview booked",
                        "body": f"A candidate booked an interview at {start_time}.",
                        "booking_id": booking_id,
                        "role": "interviewer",
                        "redirect_url": f"/interviewer/dashboard/bookings/{booking_id}",
                    },
                )
            )

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_payment_success(cls, ctx: EventContext) -> None:
        """
        payload:
          - booking_id
          - interviewer_id
          - amount
        """
        interviewer_id = ctx.payload.get("interviewer_id")
        booking_id = ctx.payload.get("booking_id")
        amount = ctx.payload.get("amount")

        if not interviewer_id:
            return

        notifications = [
            (
                interviewer_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Payment received",
                    "body": f"Payment for interview #{booking_id} has been processed.",
                    "booking_id": booking_id,
                    "amount": amount,
                    "redirect_url": f"/interviewer/payout/history",
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_payout_failed(cls, ctx: EventContext) -> None:
        """
        payload:
          - booking_id
          - interviewer_id
          - reason
        """
        interviewer_id = ctx.payload.get("interviewer_id")
        booking_id = ctx.payload.get("booking_id")
        reason = ctx.payload.get("reason") or "Unknown reason."

        if not interviewer_id:
            return

        notifications = [
            (
                interviewer_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Payout failed",
                    "body": f"Payout for interview #{booking_id} could not be completed. Reason: {reason}",
                    "booking_id": booking_id,
                    "redirect_url": f"/interviewer/payout/history",
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_feedback_pending(cls, ctx: EventContext) -> None:
        """
        payload:
          - booking_id
          - candidate_id
          - interviewer_id
          - candidate_pending   (bool) — candidate hasn't submitted their review yet
          - interviewer_pending (bool) — interviewer hasn't submitted evaluation yet
        """
        booking_id = ctx.payload.get("booking_id")
        candidate_id = ctx.payload.get("candidate_id")
        interviewer_id = ctx.payload.get("interviewer_id")
        candidate_pending = ctx.payload.get("candidate_pending", False)
        interviewer_pending = ctx.payload.get("interviewer_pending", False)

        if not booking_id:
            return

        notifications: List[Tuple[int, str, Dict[str, Any]]] = []

        # Notify candidate if they haven't submitted their review
        if candidate_pending and candidate_id:
            notifications.append(
                (
                    candidate_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Feedback requested",
                        "body": "Please submit your review for your recent interview.",
                        "booking_id": booking_id,
                        "role": "candidate",
                        "redirect_url": f"/candidate/bookings/{booking_id}/review",
                    },
                )
            )

        # Notify interviewer if they haven't submitted their evaluation
        if interviewer_pending and interviewer_id:
            notifications.append(
                (
                    interviewer_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Evaluation pending",
                        "body": "Please submit your evaluation for a recently completed interview.",
                        "booking_id": booking_id,
                        "role": "interviewer",
                        "redirect_url": f"/interviewer/bookings/{booking_id}/evaluate",
                    },
                )
            )

        if not notifications:
            return

        cls._create_logs_for(ctx, notifications)



    @classmethod
    def _handle_interview_reminder_30m(cls, ctx: EventContext) -> None:
        """
        payload:
          - booking_id
          - candidate_id
          - interviewer_id
          - start_time (ISO string or datetime string)
        """
        candidate_id = ctx.payload.get("candidate_id")
        interviewer_id = ctx.payload.get("interviewer_id")
        booking_id = ctx.payload.get("booking_id")
        start_time = ctx.payload.get("start_time")

        notifications: List[Tuple[int, str, Dict[str, Any]]] = []

        if candidate_id:
            notifications.append(
                (
                    candidate_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Interview starts in 30 minutes",
                        "body": f"Your interview (#{booking_id}) starts at {start_time}.",
                        "booking_id": booking_id,
                        "role": "candidate",
                        "start_time": start_time,
                        "redirect_url": f"/candidate/dashboard/upcoming",
                    },
                )
            )

        if interviewer_id:
            notifications.append(
                (
                    interviewer_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Upcoming interview in 30 minutes",
                        "body": f"Your interview (#{booking_id}) starts at {start_time}.",
                        "booking_id": booking_id,
                        "role": "interviewer",
                        "start_time": start_time,
                    },
                )
            )

        cls._create_logs_for(ctx, notifications)    



    @classmethod
    def _handle_reschedule_slot_requested(cls, ctx: EventContext) -> None:
        """
        payload expects:
        - booking_id
        - candidate_id
        - interviewer_id
        - preferred_window
        - start_time (optional current booking start time)
        """
        booking_id = ctx.payload.get("booking_id")
        candidate_id = ctx.payload.get("candidate_id")
        interviewer_id = ctx.payload.get("interviewer_id")
        preferred_window = ctx.payload.get("preferred_window")
        start_time = ctx.payload.get("start_time")

        if not interviewer_id or not booking_id or not preferred_window:
            return

        body = (
            f"The candidate for interview #{booking_id} requested new time slots "
            f"around: {preferred_window}."
        )
        if start_time:
            body += f" Current interview time: {start_time}."

        notifications: List[Tuple[int, str, Dict[str, Any]]] = [
            (
                interviewer_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Candidate requested new slots",
                    "body": body,
                    "booking_id": booking_id,
                    "candidate_id": candidate_id,
                    "role": "interviewer",
                    "preferred_window": preferred_window,
                    "start_time": start_time,
                    "action": "open_slots",
                    "redirect_url": f"/interviewer/dashboard/availability",
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)


    @classmethod
    def _handle_feedback_submitted(cls, ctx: EventContext) -> None:
        """
        payload expects:
          - booking_id
          - candidate_id
          - interviewer_id
          - submitted_by  ("candidate" or "interviewer")
        """
        booking_id = ctx.payload.get("booking_id")
        candidate_id = ctx.payload.get("candidate_id")
        interviewer_id = ctx.payload.get("interviewer_id")
        submitted_by = ctx.payload.get("submitted_by")  # "candidate" or "interviewer"
        evaluation_id = ctx.payload.get("evaluation_id")

        if not booking_id:
            return

        notifications: List[Tuple[int, str, Dict[str, Any]]] = []

        # If candidate submitted → notify interviewer
        if submitted_by == "candidate" and interviewer_id:
            notifications.append(
                (
                    interviewer_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Candidate submitted feedback",
                        "body": f"The candidate has submitted feedback for interview #{booking_id}.",
                        "booking_id": booking_id,
                        "role": "interviewer",
                        "redirect_url": f"/interviewer/evaluations/{evaluation_id}",
                    },
                )
            )

        # If interviewer submitted → notify candidate
        if submitted_by == "interviewer" and candidate_id:
            notifications.append(
                (
                    candidate_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Your interview feedback is ready",
                        "body": f"The interviewer has submitted feedback for interview #{booking_id}. Check your results.",
                        "booking_id": booking_id,
                        "role": "candidate",
                        "redirect_url": f"/candidate/feedback/{evaluation_id}",
                    },
                )
            )

        if not notifications:
            return

        cls._create_logs_for(ctx, notifications)   




    @classmethod
    def _handle_issue_raised(cls, ctx: EventContext) -> None:
        """
        payload:
          - issue_id
          - booking_id
          - raised_by_id
          - against_user_id
          - issue_type
          - priority
          - redirect_url
        """
        issue_id = ctx.payload.get("issue_id")
        booking_id = ctx.payload.get("booking_id")
        raised_by_id = ctx.payload.get("raised_by_id")
        against_user_id = ctx.payload.get("against_user_id")
        redirect_url = ctx.payload.get("redirect_url")

        notifications = []

        # Notify the user who raised the issue (confirmation)
        if raised_by_id:
            notifications.append(
                (
                    raised_by_id,
                    NotificationChannel.IN_APP.value,
                    {
                        "title": "Issue submitted",
                        "body": f"Your issue for interview #{booking_id} has been submitted. Our team will review it shortly.",
                        "issue_id": issue_id,
                        "booking_id": booking_id,
                        "redirect_url": redirect_url,
                    },
                )
            )

        # You can also notify admins here later via a separate channel/email

        if notifications:
            cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_issue_resolved(cls, ctx: EventContext) -> None:
        issue_id = ctx.payload.get("issue_id")
        booking_id = ctx.payload.get("booking_id")
        raised_by_id = ctx.payload.get("raised_by_id")
        resolution = ctx.payload.get("resolution")
        redirect_url = ctx.payload.get("redirect_url")

        if not raised_by_id:
            return

        notifications = [
            (
                raised_by_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Issue resolved",
                    "body": f"Your issue for interview #{booking_id} has been resolved.",
                    "issue_id": issue_id,
                    "booking_id": booking_id,
                    "resolution": resolution,
                    "redirect_url": redirect_url,
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_issue_rejected(cls, ctx: EventContext) -> None:
        issue_id = ctx.payload.get("issue_id")
        booking_id = ctx.payload.get("booking_id")
        raised_by_id = ctx.payload.get("raised_by_id")
        admin_notes = ctx.payload.get("admin_notes")
        redirect_url = ctx.payload.get("redirect_url")

        if not raised_by_id:
            return

        notifications = [
            (
                raised_by_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Issue rejected",
                    "body": f"Your issue for interview #{booking_id} was rejected. Please see details for more information.",
                    "issue_id": issue_id,
                    "booking_id": booking_id,
                    "admin_notes": admin_notes,
                    "redirect_url": redirect_url,
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_issue_action_taken(cls, ctx: EventContext) -> None:
        issue_id = ctx.payload.get("issue_id")
        booking_id = ctx.payload.get("booking_id")
        raised_by_id = ctx.payload.get("raised_by_id")
        redirect_url = ctx.payload.get("redirect_url")

        if not raised_by_id:
            return

        notifications = [
            (
                raised_by_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "Action taken on your issue",
                    "body": f"An action has been taken on your issue for interview #{booking_id}.",
                    "issue_id": issue_id,
                    "booking_id": booking_id,
                    "redirect_url": redirect_url,
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)

    @classmethod
    def _handle_issue_waiting_response(cls, ctx: EventContext) -> None:
        issue_id = ctx.payload.get("issue_id")
        booking_id = ctx.payload.get("booking_id")
        raised_by_id = ctx.payload.get("raised_by_id")
        redirect_url = ctx.payload.get("redirect_url")

        if not raised_by_id:
            return

        notifications = [
            (
                raised_by_id,
                NotificationChannel.IN_APP.value,
                {
                    "title": "More information requested",
                    "body": f"We need more information to review your issue for interview #{booking_id}.",
                    "issue_id": issue_id,
                    "booking_id": booking_id,
                    "redirect_url": redirect_url,
                },
            )
        ]

        cls._create_logs_for(ctx, notifications)     






    # --- Internal helpers ---




    @classmethod
    def _create_logs_for(
        cls,
        ctx: EventContext,
        notifications: Iterable[Tuple[int, str, Dict[str, Any]]],
    ) -> None:
        """
        notifications: iterable of (recipient_id, channel, payload_dict)

        Phase 2:
          - Create logs
          - For each log, attempt to trigger corresponding Novu workflow
        """
        logs: List[NotificationLog] = []

        for recipient_id, channel, payload in notifications:
            log = NotificationLog(
                event_type=ctx.event_type,
                recipient_id=recipient_id,
                channel=channel,
                status=NotificationStatus.PENDING.value,
                payload=payload,
                correlation_id=ctx.correlation_id,
            )
            logs.append(log)

        # Bulk insert logs first so we always have audit even if Novu fails
        NotificationLog.objects.bulk_create(logs)

        # ── Real-time WebSocket push ─────────────────────────────────────────
        # Push the updated unread count to each unique recipient's open
        # WebSocket connections. Wrapped in try/except so a channel layer
        # failure (e.g. Redis down) never breaks notification creation.
        try:
            from .realtime import NotificationCountPublisher  # local import avoids circular
            unique_recipient_ids = {log.recipient_id for log in logs}
            for recipient_id in unique_recipient_ids:
                NotificationCountPublisher.push_count(recipient_id)
        except Exception:
            import logging
            logging.getLogger(__name__).exception(
                "NotificationService: WS push failed after bulk_create"
            )






        # Attempt to send via Novu for each log
        workflow_id = cls._get_workflow_id_for_event(ctx.event_type)
        if not workflow_id:
            # No mapped workflow → we keep logs but do not call Novu
            return

        novu_client = cls._get_novu_client()

        # OPTIONAL: prefetch users to avoid N queries (simple version shown here)
        recipient_ids = {log.recipient_id for log in logs}
        users_by_id = {
            u.id: u
            for u in User.objects.filter(id__in=recipient_ids)
        }

        for log in logs:
            try:
                user = users_by_id.get(log.recipient_id)

                subscriber_email = getattr(user, "email", None) if user else None
                subscriber_first_name = (
                    getattr(user, "first_name", None) or getattr(user, "username", None)
                    if user
                    else None
                )

                print(subscriber_email," ",subscriber_first_name,"this is subscriber_email and subscriber_first_name")

                # Merge event-level context + per-recipient payload into Novu payload
                novu_payload: Dict[str, Any] = {
                    "event_type": ctx.event_type,
                    "correlation_id": ctx.correlation_id,
                    **(log.payload or {}),
                }

                novu_client.trigger_workflow(
                    workflow_id=workflow_id,
                    subscriber_id=log.recipient_id,
                    payload=novu_payload,
                    subscriber_email=subscriber_email,
                    subscriber_first_name=subscriber_first_name,
                )

                log.mark_sent(provider="novu", provider_ref="")

            except Exception as e:
                log.mark_failed(error_message=str(e)[:500])
