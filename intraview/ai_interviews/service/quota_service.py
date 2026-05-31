# ai_interviews/service/quota_service.py
"""
Centralized AI Interview Quota & Pricing Service.

Consumption priority (highest first):
  1. has_unlimited_ai = True  → no cost
  2. subscription_ai_interviews_remaining > 0  → consume subscription quota
  3. free_ai_interviews_remaining > 0  → consume free quota
  4. tokens → deduct according to duration pricing

IMPORTANT: Token deduction happens BEFORE the interview starts to prevent abuse.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from django.db import transaction
from django.utils import timezone

from candidates.models import CandidateProfile
from wallet.models import TokenTransactionType
from wallet.services import InsufficientBalanceError, TokenService


# ---------------------------------------------------------------------------
# Centralized Pricing Config
# ---------------------------------------------------------------------------

AI_INTERVIEW_PRICING: dict[int, int] = {
    5: 5,
    15: 10,
    30: 20,
}

VALID_DURATIONS = frozenset(AI_INTERVIEW_PRICING.keys())


def get_token_cost(duration_minutes: int) -> int:
    """
    Return the token cost for the given duration.
    Raises ValueError for unsupported durations.
    """
    if duration_minutes not in AI_INTERVIEW_PRICING:
        valid = sorted(AI_INTERVIEW_PRICING.keys())
        raise ValueError(
            f"Unsupported duration: {duration_minutes} min. "
            f"Valid options: {valid}."
        )
    return AI_INTERVIEW_PRICING[duration_minutes]


# ---------------------------------------------------------------------------
# Result Types
# ---------------------------------------------------------------------------

PaymentType = Literal["UNLIMITED", "SUBSCRIPTION", "FREE_QUOTA", "TOKENS"]


@dataclass
class EligibilityResult:
    can_start: bool
    payment_type: PaymentType | None = None
    cost: int = 0
    remaining_free: int | None = None
    remaining_subscription: int | None = None
    remaining_tokens: int | None = None
    message: str | None = None

    def to_response_dict(self) -> dict:
        data: dict = {"can_start": self.can_start}

        if not self.can_start:
            data["message"] = self.message or "Cannot start interview."
            return data

        data["payment_type"] = self.payment_type
        data["cost"] = self.cost

        if self.payment_type == "UNLIMITED":
            pass  # no extra fields needed

        elif self.payment_type == "SUBSCRIPTION":
            data["remaining_subscription"] = self.remaining_subscription

        elif self.payment_type == "FREE_QUOTA":
            data["remaining_free"] = self.remaining_free

        elif self.payment_type == "TOKENS":
            data["remaining_tokens"] = self.remaining_tokens

        return data


# ---------------------------------------------------------------------------
# Main Service
# ---------------------------------------------------------------------------


class AIInterviewQuotaService:
    """
    Single source of truth for AI interview quota management.

    Thread-safe: all quota mutations use select_for_update + atomic transactions.
    """

    # -------------------------------------------------------------------------
    # Private helpers
    # -------------------------------------------------------------------------

    @staticmethod
    def _get_profile(user) -> CandidateProfile:
        try:
            return CandidateProfile.objects.select_for_update().get(user=user)
        except CandidateProfile.DoesNotExist:
            raise ValueError("Candidate profile not found.")

    @staticmethod
    def _is_subscription_valid(profile: CandidateProfile) -> bool:
        """Return True if the subscription-granted quota has not expired."""
        if profile.ai_subscription_expires_at is None:
            return False
        return profile.ai_subscription_expires_at > timezone.now()

    # -------------------------------------------------------------------------
    # Public: Eligibility check (READ-ONLY, no mutations)
    # -------------------------------------------------------------------------

    @staticmethod
    def check_eligibility(*, user, duration_minutes: int) -> EligibilityResult:
        """
        Determine whether a user can start an AI interview and how it will be paid.

        This is a READ-ONLY operation — nothing is deducted here.
        Call `consume_quota` (inside create_session) to actually deduct.
        """
        try:
            cost = get_token_cost(duration_minutes)
        except ValueError as exc:
            return EligibilityResult(can_start=False, message=str(exc))

        try:
            profile = CandidateProfile.objects.select_related("user").get(user=user)
        except CandidateProfile.DoesNotExist:
            return EligibilityResult(
                can_start=False, message="Candidate profile not found."
            )

        # Priority 1: Unlimited (Pro plan)
        if profile.has_unlimited_ai and AIInterviewQuotaService._is_subscription_valid(profile):
            return EligibilityResult(
                can_start=True,
                payment_type="UNLIMITED",
                cost=0,
            )

        # Priority 2: Subscription quota
        if (
            AIInterviewQuotaService._is_subscription_valid(profile)
            and profile.subscription_ai_interviews_remaining > 0
        ):
            return EligibilityResult(
                can_start=True,
                payment_type="SUBSCRIPTION",
                cost=0,
                remaining_subscription=profile.subscription_ai_interviews_remaining,
            )

        # Priority 3: Free quota
        if profile.free_ai_interviews_remaining > 0:
            return EligibilityResult(
                can_start=True,
                payment_type="FREE_QUOTA",
                cost=0,
                remaining_free=profile.free_ai_interviews_remaining,
            )

        # Priority 4: Token payment
        wallet = TokenService.get_or_create_wallet(user)
        available = TokenService.get_available_balance(wallet)

        if available >= cost:
            return EligibilityResult(
                can_start=True,
                payment_type="TOKENS",
                cost=cost,
                remaining_tokens=available,
            )

        return EligibilityResult(
            can_start=False,
            message=(
                f"Insufficient tokens. You need {cost} tokens but only have {available}."
            ),
        )

    # -------------------------------------------------------------------------
    # Public: Consume quota (WRITE — must be called inside a transaction)
    # -------------------------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def consume_quota(*, user, duration_minutes: int, session_id: str | int) -> PaymentType:
        """
        Deduct the appropriate quota/tokens before the interview starts.

        Returns the payment_type that was used so caller can record it.

        Raises:
            ValueError  – bad duration or missing profile
            InsufficientBalanceError – not enough tokens
        """
        cost = get_token_cost(duration_minutes)
        profile = AIInterviewQuotaService._get_profile(user)

        # Priority 1: Unlimited
        if profile.has_unlimited_ai and AIInterviewQuotaService._is_subscription_valid(profile):
            return "UNLIMITED"

        # Priority 2: Subscription quota
        if (
            AIInterviewQuotaService._is_subscription_valid(profile)
            and profile.subscription_ai_interviews_remaining > 0
        ):
            profile.subscription_ai_interviews_remaining -= 1
            profile.save(update_fields=["subscription_ai_interviews_remaining", "updated_at"])
            return "SUBSCRIPTION"

        # Priority 3: Free quota
        if profile.free_ai_interviews_remaining > 0:
            profile.free_ai_interviews_remaining -= 1
            profile.save(update_fields=["free_ai_interviews_remaining", "updated_at"])
            return "FREE_QUOTA"

        # Priority 4: Token deduction
        wallet = TokenService.get_or_create_wallet(user)
        TokenService.debit_tokens(
            wallet=wallet,
            amount=cost,
            transaction_type=TokenTransactionType.AI_INTERVIEW_PAYMENT,
            reference_id=f"ai_session_{session_id}",
            note=f"AI interview payment for {duration_minutes}-minute session",
        )
        return "TOKENS"


# ---------------------------------------------------------------------------
# Subscription Integration Helpers
# ---------------------------------------------------------------------------


class AIInterviewSubscriptionSync:
    """
    Called by the subscription activation / expiry flow to update
    candidate AI quota fields.

    Import this in subscriptions/services/subscription_service.py or
    wherever subscription activation/expiry is triggered.
    """

    # Starter plan: 10 interviews per subscription period
    STARTER_AI_INTERVIEWS = 10

    @staticmethod
    @transaction.atomic
    def on_subscription_activated(*, user, plan_name: str, expires_at) -> None:
        """
        Grant AI quota when a subscription becomes active.

        plan_name must match exactly: "Starter" or "Pro"
        (case-insensitive check used below for safety).
        """
        try:
            profile = CandidateProfile.objects.select_for_update().get(user=user)
        except CandidateProfile.DoesNotExist:
            return  # Not a candidate — skip silently

        plan_lower = (plan_name or "").lower()

        if "pro" in plan_lower:
            profile.has_unlimited_ai = True
            profile.subscription_ai_interviews_remaining = -1  # sentinel for unlimited
            profile.ai_subscription_expires_at = expires_at
        elif "starter" in plan_lower:
            profile.has_unlimited_ai = False
            profile.subscription_ai_interviews_remaining = AIInterviewSubscriptionSync.STARTER_AI_INTERVIEWS
            profile.ai_subscription_expires_at = expires_at
        else:
            # Unknown plan — don't touch quota
            return

        profile.save(update_fields=[
            "has_unlimited_ai",
            "subscription_ai_interviews_remaining",
            "ai_subscription_expires_at",
            "updated_at",
        ])

    @staticmethod
    @transaction.atomic
    def on_subscription_expired(*, user) -> None:
        """
        Reset AI quota when subscription expires/is cancelled.
        """
        try:
            profile = CandidateProfile.objects.select_for_update().get(user=user)
        except CandidateProfile.DoesNotExist:
            return

        profile.has_unlimited_ai = False
        profile.subscription_ai_interviews_remaining = 0
        # Intentionally keep ai_subscription_expires_at so history is preserved.
        profile.save(update_fields=[
            "has_unlimited_ai",
            "subscription_ai_interviews_remaining",
            "updated_at",
        ])
