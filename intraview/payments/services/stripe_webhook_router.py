"""
payments/services/stripe_webhook_router.py

Centralized Stripe webhook routing service.

All Stripe events arrive at the single /api/payments/webhook/stripe/ endpoint
and are dispatched here based on:
  1. event.type  (checkout.session.completed, invoice.payment_succeeded, etc.)
  2. metadata["purchase_type"]  (token_bundle | user_subscription | interviewer_subscription)

For recurring events (invoice / subscription cancel) that carry no checkout
metadata, the subscription ID is looked up against both UserSubscription and
InterviewerSubscription tables to determine the correct handler.
"""

import time
import logging
from datetime import timedelta, datetime

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from payments.models import PaymentOrder, PaymentStatus
from subscriptions.models import (
    SubscriptionPlan,
    SubscriptionStatus,
    SubscriptionPaymentOrder,
    UserSubscription,
)
from subscriptions.services.subscription_service import SubscriptionService
from subscriptions.services.token_grant_service import SubscriptionTokenGrantService
from interviewer_subscriptions.models import (
    InterviewerSubscription,
    InterviewerSubscriptionPlan,
    InterviewerSubscriptionStatus,
    InterviewerPaymentOrder,
)
from interviewer_subscriptions.services.subscription_service import (
    InterviewerSubscriptionService,
)
from wallet.services import TokenService
from wallet.models import TokenTransactionType

User = get_user_model()
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Purchase type constants — must match what checkout session creators inject
# ──────────────────────────────────────────────────────────────────────────────
PURCHASE_TYPE_TOKEN_BUNDLE = "token_bundle"
PURCHASE_TYPE_USER_SUBSCRIPTION = "user_subscription"
PURCHASE_TYPE_INTERVIEWER_SUBSCRIPTION = "interviewer_subscription"


class StripeWebhookRouter:
    """
    Routes all incoming Stripe events to the appropriate business-logic handler.

    Usage (from view):
        router = StripeWebhookRouter(event)
        return router.route_event()

    route_event() returns an (http_status: int, ok: bool) tuple so the view
    can decide what HTTP status code to return to Stripe.
    """

    def __init__(self, event: dict):
        self.event = event
        self.event_type: str = event.get("type", "")
        self.obj: dict = event["data"]["object"]

    # ──────────────────────────────────────────────────────────────────────────
    # Public entry point
    # ──────────────────────────────────────────────────────────────────────────

    def route_event(self) -> int:
        """
        Dispatch the event to the correct handler.
        Returns the HTTP status code to send back to Stripe.
        """
        logger.info("Stripe webhook received | type=%s", self.event_type)

        if self.event_type == "checkout.session.completed":
            return self._handle_checkout_completed()

        elif self.event_type == "invoice.payment_succeeded":
            return self._handle_invoice_payment_succeeded()

        elif self.event_type == "customer.subscription.deleted":
            return self._handle_subscription_cancelled()

        elif self.event_type == "payment_intent.payment_failed":
            return self._handle_failed_payment()

        else:
            # Unknown event type — acknowledge so Stripe doesn't retry
            logger.debug("Stripe webhook: unhandled event type '%s' — ignoring", self.event_type)
            return 200

    # ──────────────────────────────────────────────────────────────────────────
    # checkout.session.completed
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_checkout_completed(self) -> int:
        """
        Routes to the correct handler based on metadata["purchase_type"].

        Backward-compat note: sessions created before this deploy may lack
        'purchase_type'. We attempt to detect them via legacy metadata keys
        so nothing breaks mid-flight.
        """
        session = self.obj
        metadata = session.get("metadata") or {}
        purchase_type = metadata.get("purchase_type", "")

        # ── New routing (post-deploy sessions) ──────────────────────────────
        if purchase_type == PURCHASE_TYPE_TOKEN_BUNDLE:
            return self._handle_token_bundle_purchase(session, metadata)

        elif purchase_type == PURCHASE_TYPE_USER_SUBSCRIPTION:
            return self._handle_user_subscription_purchase(session, metadata)

        elif purchase_type == PURCHASE_TYPE_INTERVIEWER_SUBSCRIPTION:
            return self._handle_interviewer_subscription_purchase(session, metadata)

        # ── Backward-compat: legacy sessions without purchase_type ───────────
        # Token bundle sessions have 'internal_order_id' but NOT 'user_id'
        elif "internal_order_id" in metadata and "user_id" not in metadata and "interviewer_id" not in metadata:
            logger.warning(
                "checkout.session.completed: missing purchase_type — "
                "falling back to legacy token-bundle handler | session=%s",
                session.get("id"),
            )
            return self._handle_token_bundle_purchase(session, metadata)

        # User subscription sessions have 'user_id' and no 'subscription_type'
        elif "user_id" in metadata and metadata.get("subscription_type") != "INTERVIEWER":
            logger.warning(
                "checkout.session.completed: missing purchase_type — "
                "falling back to legacy user-subscription handler | session=%s",
                session.get("id"),
            )
            return self._handle_user_subscription_purchase(session, metadata)

        # Interviewer sessions have 'subscription_type: INTERVIEWER'
        elif metadata.get("subscription_type") == "INTERVIEWER":
            logger.warning(
                "checkout.session.completed: missing purchase_type — "
                "falling back to legacy interviewer-subscription handler | session=%s",
                session.get("id"),
            )
            return self._handle_interviewer_subscription_purchase(session, metadata)

        else:
            logger.error(
                "checkout.session.completed: unroutable — no purchase_type or known legacy keys | "
                "session=%s | metadata=%s",
                session.get("id"),
                metadata,
            )
            return 200  # Acknowledge to avoid infinite Stripe retries

    # ──────────────────────────────────────────────────────────────────────────
    # Token bundle purchase
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_token_bundle_purchase(self, session: dict, metadata: dict) -> int:
        """
        Confirms a one-time token pack purchase and credits tokens to wallet.
        Idempotent: PaymentOrder.can_process_webhook() + select_for_update().
        """
        stripe_session_id = session.get("id")

        if not stripe_session_id:
            logger.warning("Token bundle webhook: missing session ID")
            return 400

        try:
            with transaction.atomic():
                payment_order = (
                    PaymentOrder.objects
                    .select_for_update()
                    .get(stripe_checkout_session_id=stripe_session_id)
                )

                # Idempotency guard
                if not payment_order.can_process_webhook():
                    logger.info(
                        "Token bundle: webhook already processed | order=%s",
                        payment_order.id,
                    )
                    return 200

                # Mark SUCCEEDED
                payment_order.status = PaymentStatus.SUCCEEDED
                payment_order.save(update_fields=["status", "updated_at"])

                # Credit tokens to wallet
                wallet = TokenService.get_or_create_wallet(payment_order.user)
                TokenService.credit_tokens(
                    wallet=wallet,
                    amount=payment_order.token_pack.tokens,
                    transaction_type=TokenTransactionType.TOKEN_PURCHASE,
                    reference_id=f"payment_{payment_order.id}",
                    note=f"Stripe checkout session {stripe_session_id}",
                )

                logger.info(
                    "✅ Token bundle purchase complete | order=%s | tokens=%s | user=%s",
                    payment_order.id,
                    payment_order.token_pack.tokens,
                    payment_order.user.id,
                )

        except PaymentOrder.DoesNotExist:
            logger.error(
                "Token bundle: PaymentOrder not found | stripe_session=%s",
                stripe_session_id,
            )
            # Return 200 so Stripe doesn't retry endlessly for a truly missing order
            return 200

        except Exception:
            logger.exception(
                "Token bundle: unexpected error | stripe_session=%s",
                stripe_session_id,
            )
            return 500

        return 200

    # ──────────────────────────────────────────────────────────────────────────
    # User subscription purchase (first payment / activation)
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_user_subscription_purchase(self, session: dict, metadata: dict) -> int:
        """
        Activates a user subscription and grants the first month's free tokens.
        """
        try:
            user_id = int(metadata["user_id"])
            plan_id = int(metadata["plan_id"])
        except (KeyError, ValueError, TypeError):
            logger.error(
                "User subscription checkout: missing user_id/plan_id in metadata | metadata=%s",
                metadata,
            )
            return 400

        payment_order_id = metadata.get("payment_order_id")
        stripe_subscription_id = session.get("subscription") or session.get("id")
        stripe_session_id = session.get("id")

        logger.info(
            "User subscription checkout | user=%s | plan=%s | order=%s | sub=%s",
            user_id, plan_id, payment_order_id, stripe_subscription_id,
        )

        try:
            with transaction.atomic():
                user = User.objects.select_for_update().get(id=user_id)
                plan = SubscriptionPlan.objects.get(id=plan_id)  # noqa: F841

                # Activate subscription (idempotent via update_or_create)
                subscription = SubscriptionService.activate_subscription(
                    user_id=user_id,
                    plan_id=plan_id,
                    stripe_subscription_id=str(stripe_subscription_id),
                )

                # Update payment order record
                if payment_order_id:
                    try:
                        payment_order = SubscriptionPaymentOrder.objects.select_for_update().get(
                            internal_order_id=payment_order_id,
                            user=user,
                        )
                        payment_order.status = PaymentStatus.SUCCEEDED
                        payment_order.stripe_checkout_session_id = stripe_session_id
                        payment_order.stripe_subscription_id = str(stripe_subscription_id)
                        payment_order.subscription = subscription

                        now = timezone.now()
                        payment_order.period_start = now
                        payment_order.period_end = now + timedelta(days=subscription.plan.billing_cycle_days)

                        payment_order.save(update_fields=[
                            "status",
                            "stripe_checkout_session_id",
                            "stripe_subscription_id",
                            "subscription",
                            "period_start",
                            "period_end",
                            "updated_at",
                        ])
                    except SubscriptionPaymentOrder.DoesNotExist:
                        logger.warning(
                            "User subscription: payment order not found | order_id=%s (continuing)",
                            payment_order_id,
                        )

                # Grant first billing cycle's free tokens
                SubscriptionTokenGrantService.grant_monthly_tokens(subscription=subscription)

                logger.info(
                    "✅ User subscription activated | user=%s | plan=%s | sub=%s",
                    user_id, plan_id, stripe_subscription_id,
                )

        except User.DoesNotExist:
            logger.error("User subscription: user not found | user_id=%s", user_id)
            return 200

        except SubscriptionPlan.DoesNotExist:
            logger.error("User subscription: plan not found | plan_id=%s", plan_id)
            return 200

        except Exception:
            logger.exception("User subscription checkout handler failed")
            return 500

        return 200

    # ──────────────────────────────────────────────────────────────────────────
    # Interviewer subscription purchase (first payment / activation)
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_interviewer_subscription_purchase(self, session: dict, metadata: dict) -> int:
        """
        Activates an interviewer subscription and records the payment order.
        """
        try:
            interviewer_id = int(metadata["interviewer_id"])
            plan_id = int(metadata["plan_id"])
        except (KeyError, ValueError, TypeError):
            logger.error(
                "Interviewer subscription checkout: missing interviewer_id/plan_id | metadata=%s",
                metadata,
            )
            return 400

        payment_order_id = metadata.get("payment_order_id")
        stripe_subscription_id = session.get("subscription") or session.get("id")
        stripe_session_id = session.get("id")

        logger.info(
            "Interviewer subscription checkout | interviewer=%s | plan=%s | order=%s | sub=%s",
            interviewer_id, plan_id, payment_order_id, stripe_subscription_id,
        )

        try:
            with transaction.atomic():
                interviewer = User.objects.select_for_update().get(id=interviewer_id)
                plan = InterviewerSubscriptionPlan.objects.get(id=plan_id)

                # Activate interviewer subscription (idempotent internally)
                subscription = InterviewerSubscriptionService.activate_subscription(
                    interviewer_id=interviewer_id,
                    plan_id=plan_id,
                    stripe_subscription_id=str(stripe_subscription_id),
                )

                # Update payment order record
                if payment_order_id:
                    try:
                        payment_order = InterviewerPaymentOrder.objects.select_for_update().get(
                            internal_order_id=payment_order_id,
                            user=interviewer,
                        )
                        payment_order.status = PaymentStatus.SUCCEEDED
                        payment_order.stripe_checkout_session_id = stripe_session_id
                        payment_order.stripe_subscription_id = str(stripe_subscription_id)
                        payment_order.subscription = subscription
                        payment_order.period_start = timezone.now()
                        payment_order.period_end = timezone.now() + timedelta(days=plan.billing_cycle_days)
                        payment_order.save()
                    except InterviewerPaymentOrder.DoesNotExist:
                        logger.warning(
                            "Interviewer subscription: payment order not found | order_id=%s (continuing)",
                            payment_order_id,
                        )

                logger.info(
                    "✅ Interviewer subscription activated | interviewer=%s | plan=%s | sub=%s",
                    interviewer_id, plan_id, stripe_subscription_id,
                )

        except User.DoesNotExist:
            logger.error("Interviewer subscription: interviewer not found | id=%s", interviewer_id)
            return 200

        except InterviewerSubscriptionPlan.DoesNotExist:
            logger.error("Interviewer subscription: plan not found | plan_id=%s", plan_id)
            return 200

        except Exception:
            logger.exception("Interviewer subscription checkout handler failed")
            return 500

        return 200

    # ──────────────────────────────────────────────────────────────────────────
    # invoice.payment_succeeded  (renewals)
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_invoice_payment_succeeded(self) -> int:
        """
        Handles subscription renewal invoices for both user and interviewer subscriptions.

        Routing: look up stripe_subscription_id in UserSubscription first,
        then InterviewerSubscription. First match wins.
        """
        invoice = self.obj
        stripe_subscription_id = invoice.get("subscription")
        stripe_invoice_id = invoice.get("id")

        if not stripe_subscription_id:
            # Not a subscription invoice (e.g., a one-time payment) — ignore
            return 200

        if not stripe_invoice_id:
            logger.warning("invoice.payment_succeeded: missing invoice ID — skipping")
            return 200

        # ── Try user subscription renewal ────────────────────────────────────
        user_sub = (
            UserSubscription.objects
            .select_related("plan", "user")
            .filter(stripe_subscription_id=stripe_subscription_id)
            .first()
        )
        if user_sub:
            return self._handle_user_subscription_renewal(invoice, user_sub)

        # ── Try interviewer subscription renewal ─────────────────────────────
        interviewer_sub = (
            InterviewerSubscription.objects
            .select_related("plan", "interviewer")
            .filter(stripe_subscription_id=stripe_subscription_id)
            .first()
        )
        if interviewer_sub:
            return self._handle_interviewer_subscription_renewal(invoice, interviewer_sub)

        # No matching subscription found — could be a timing issue (checkout not yet processed)
        logger.warning(
            "invoice.payment_succeeded: no subscription found for stripe_subscription_id=%s "
            "(may be a timing issue — Stripe will retry if needed)",
            stripe_subscription_id,
        )
        return 200

    def _handle_user_subscription_renewal(self, invoice: dict, subscription: "UserSubscription") -> int:
        """Records a renewal payment order and grants monthly tokens for user subscriptions."""
        stripe_subscription_id = invoice.get("subscription")
        stripe_invoice_id = invoice.get("id")

        # Idempotency: if this invoice was already recorded, skip
        if SubscriptionPaymentOrder.objects.filter(stripe_invoice_id=stripe_invoice_id).exists():
            logger.info(
                "User subscription renewal: already recorded | invoice=%s",
                stripe_invoice_id,
            )
            return 200

        try:
            plan = subscription.plan
            period_start_ts = invoice.get("period_start")
            period_end_ts = invoice.get("period_end")

            period_start = (
                timezone.make_aware(datetime.fromtimestamp(period_start_ts))
                if period_start_ts else None
            )
            period_end = (
                timezone.make_aware(datetime.fromtimestamp(period_end_ts))
                if period_end_ts else None
            )

            SubscriptionPaymentOrder.objects.create(
                user=subscription.user,
                subscription=subscription,
                plan=plan,
                amount_inr=plan.price_inr,
                currency="INR",
                status=PaymentStatus.SUCCEEDED,
                stripe_invoice_id=stripe_invoice_id,
                stripe_subscription_id=stripe_subscription_id,
                internal_order_id=f"SUB-REN-{subscription.user.id}-{int(time.time())}",
                period_start=period_start,
                period_end=period_end,
            )

            # Grant renewal tokens (idempotent — SubscriptionTokenGrant unique constraint)
            SubscriptionTokenGrantService.grant_monthly_tokens(subscription=subscription)

            logger.info(
                "✅ User subscription renewal recorded | sub=%s | invoice=%s",
                stripe_subscription_id,
                stripe_invoice_id,
            )

        except Exception:
            logger.exception(
                "User subscription renewal handler failed | sub=%s | invoice=%s",
                stripe_subscription_id,
                stripe_invoice_id,
            )
            return 500

        return 200

    def _handle_interviewer_subscription_renewal(
        self, invoice: dict, subscription: "InterviewerSubscription"
    ) -> int:
        """Records a renewal payment order for interviewer subscriptions."""
        stripe_subscription_id = invoice.get("subscription")
        stripe_invoice_id = invoice.get("id")

        # Idempotency: check if this invoice was already recorded
        if InterviewerPaymentOrder.objects.filter(stripe_invoice_id=stripe_invoice_id).exists():
            logger.info(
                "Interviewer subscription renewal: already recorded | invoice=%s",
                stripe_invoice_id,
            )
            return 200

        try:
            InterviewerPaymentOrder.objects.create(
                user=subscription.interviewer,
                subscription=subscription,
                plan=subscription.plan,
                amount_inr=subscription.plan.price_inr,
                currency="INR",
                status=PaymentStatus.SUCCEEDED,
                stripe_invoice_id=stripe_invoice_id,
                stripe_subscription_id=stripe_subscription_id,
                internal_order_id=f"INT-REN-{subscription.interviewer.id}-{int(timezone.now().timestamp())}",
                period_start=timezone.now(),
                period_end=timezone.now() + timedelta(days=subscription.plan.billing_cycle_days),
            )

            logger.info(
                "✅ Interviewer subscription renewal recorded | sub=%s | invoice=%s",
                stripe_subscription_id,
                stripe_invoice_id,
            )

        except Exception:
            logger.exception(
                "Interviewer subscription renewal handler failed | sub=%s | invoice=%s",
                stripe_subscription_id,
                stripe_invoice_id,
            )
            return 500

        return 200

    # ──────────────────────────────────────────────────────────────────────────
    # customer.subscription.deleted  (cancellations)
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_subscription_cancelled(self) -> int:
        """
        Handles subscription cancellations for both user and interviewer subscriptions.
        Routes by looking up stripe_subscription_id in both tables.
        """
        subscription_obj = self.obj
        stripe_subscription_id = subscription_obj.get("id")

        if not stripe_subscription_id:
            logger.warning("customer.subscription.deleted: missing subscription ID")
            return 200

        handled = False

        # ── Check user subscription ──────────────────────────────────────────
        try:
            user_sub = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            user_sub.status = SubscriptionStatus.CANCELLED
            user_sub.save(update_fields=["status", "updated_at"])
            logger.info(
                "✅ User subscription cancelled | sub=%s | user=%s",
                stripe_subscription_id,
                user_sub.user_id,
            )
            handled = True
        except UserSubscription.DoesNotExist:
            pass
        except Exception:
            logger.exception(
                "User subscription cancel handler failed | sub=%s",
                stripe_subscription_id,
            )
            return 500

        # ── Check interviewer subscription ───────────────────────────────────
        if not handled:
            try:
                interviewer_sub = InterviewerSubscription.objects.get(
                    stripe_subscription_id=stripe_subscription_id
                )
                interviewer_sub.status = InterviewerSubscriptionStatus.CANCELLED
                interviewer_sub.save(update_fields=["status", "updated_at"])
                logger.info(
                    "✅ Interviewer subscription cancelled | sub=%s | interviewer=%s",
                    stripe_subscription_id,
                    interviewer_sub.interviewer_id,
                )
                handled = True
            except InterviewerSubscription.DoesNotExist:
                pass
            except Exception:
                logger.exception(
                    "Interviewer subscription cancel handler failed | sub=%s",
                    stripe_subscription_id,
                )
                return 500

        if not handled:
            logger.warning(
                "customer.subscription.deleted: no subscription found | stripe_subscription_id=%s",
                stripe_subscription_id,
            )

        return 200

    # ──────────────────────────────────────────────────────────────────────────
    # payment_intent.payment_failed
    # ──────────────────────────────────────────────────────────────────────────

    def _handle_failed_payment(self) -> int:
        """
        Logs failed payment intents. Extend this to notify users or update
        payment order status as needed.
        """
        intent = self.obj
        payment_intent_id = intent.get("id")
        customer_email = intent.get("receipt_email") or intent.get("customer")

        logger.warning(
            "⚠️ payment_intent.payment_failed | payment_intent=%s | customer=%s",
            payment_intent_id,
            customer_email,
        )

        # Future: send failure notification, mark PaymentOrder as FAILED, etc.
        return 200
