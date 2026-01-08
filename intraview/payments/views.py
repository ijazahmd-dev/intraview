from django.shortcuts import render
import time
import logging
import stripe

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from wallet.services import TokenService
from wallet.models import TokenTransactionType

from .models import PaymentOrder,PaymentStatus
from .serializers import CreatePaymentSerializer, SubscriptionCheckoutSerializer, InterviewerSubscriptionCheckoutSerializer
from .services.stripe_token_bundle_service import StripeService
from .services.stripe_subscription import StripeSubscriptionService
from .services.stripe_interviewer_subscription import StripeInterviewerSubscriptionService
from authentication.authentication import CookieJWTAuthentication
from subscriptions.services.subscription_service import SubscriptionService
from subscriptions.services.token_grant_service import SubscriptionTokenGrantService
from subscriptions.models import SubscriptionStatus, SubscriptionPlan, UserSubscription
from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer
from interviewer_subscriptions.services.entitlement_service import (
    InterviewerEntitlementService,
)
from interviewer_subscriptions.services.subscription_service import (
    InterviewerSubscriptionService,
)





# Create your views here.



logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateTokenPurchaseAPIView(APIView):
    """
    Creates a Stripe Checkout session for purchasing token packs.
    NO token credit happens here.
    """

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_pack = serializer.validated_data["token_pack_id"]

        try:
            # 🔒 Atomic block: order creation + Stripe session creation
            with transaction.atomic():

                # 1️⃣ Create PaymentOrder (CREATED)
                payment_order = PaymentOrder.objects.create(
                    user=request.user,
                    token_pack=token_pack,
                    amount_inr=token_pack.price_inr,
                    currency="INR",
                    status=PaymentStatus.CREATED,
                    internal_order_id=f"ORD-{request.user.id}-{int(time.time())}",
                )

                # 2️⃣ Prepare redirect URLs
                success_url = (
                    f"{settings.FRONTEND_URL}/payment/success"
                    f"?order_id={payment_order.internal_order_id}"
                )
                cancel_url = (
                    f"{settings.FRONTEND_URL}/payment/cancel"
                    f"?order_id={payment_order.internal_order_id}"
                )

                # 3️⃣ Create Stripe Checkout Session
                session = StripeService.create_checkout_session(
                    payment_order=payment_order,
                    token_pack=token_pack,
                    success_url=success_url,
                    cancel_url=cancel_url,
                )

                # 4️⃣ Update PaymentOrder → PENDING (awaiting webhook)
                payment_order.stripe_checkout_session_id = session.id
                payment_order.status = PaymentStatus.PENDING
                payment_order.save(
                    update_fields=[
                        "stripe_checkout_session_id",
                        "status",
                        "updated_at",
                    ]
                )

            # ✅ Transaction committed successfully here

            logger.info(
                "PaymentOrder %s (%s) created for user %s",
                payment_order.id,
                payment_order.internal_order_id,
                request.user.id,
            )

            return Response(
                {
                    "checkout_url": session.url,
                    "order_id": payment_order.internal_order_id,
                },
                status=status.HTTP_201_CREATED,
            )

        except stripe.error.StripeError as e:
            logger.error(
                "Stripe error while creating checkout session for user %s: %s",
                request.user.id,
                str(e),
            )
            raise ValidationError(
                "Payment setup failed. Please try again later."
            )
        





@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(View):
    """
    Stripe webhook endpoint.
    Confirms payment and credits tokens.
    Server-to-server only.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        # 1️⃣ Verify Stripe signature
        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError as e:
            logger.warning("Invalid Stripe webhook payload: %s", e)
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            logger.warning("Invalid Stripe webhook signature: %s", e)
            return HttpResponse(status=400)
        except Exception as e:
            logger.error("Unexpected webhook error: %s", e)
            return HttpResponse(status=400)

        # 2️⃣ Handle checkout completion
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            stripe_session_id = session.get("id")

            if not stripe_session_id:
                logger.warning("Stripe webhook missing session ID")
                return HttpResponse(status=400)

            try:
                with transaction.atomic():
                    payment_order = (
                        PaymentOrder.objects
                        .select_for_update()
                        .get(stripe_checkout_session_id=stripe_session_id)
                    )

                    # Idempotency check
                    if not payment_order.can_process_webhook():
                        logger.info(
                            "Webhook already processed for PaymentOrder %s",
                            payment_order.id,
                        )
                        return HttpResponse(status=200)

                    # 3️⃣ Mark payment as PAID
                    payment_order.status = PaymentStatus.SUCCEEDED
                    payment_order.save(update_fields=["status", "updated_at"])

                    # 4️⃣ Credit tokens
                    wallet = TokenService.get_or_create_wallet(payment_order.user)

                    TokenService.credit_tokens(
                        wallet=wallet,
                        amount=payment_order.token_pack.tokens,
                        transaction_type=TokenTransactionType.TOKEN_PURCHASE,
                        reference_id=f"payment_{payment_order.id}",
                        note=f"Stripe checkout session {stripe_session_id}",
                    )

                    logger.info(
                        "✅ PaymentOrder %s PAID → Credited %s tokens to user %s",
                        payment_order.id,
                        payment_order.token_pack.tokens,
                        payment_order.user.id,
                    )

            except PaymentOrder.DoesNotExist:
                logger.error(
                    "PaymentOrder not found for Stripe session %s",
                    stripe_session_id,
                )
                return HttpResponse(status=404)
            except Exception as e:
                logger.error("Webhook transaction failed: %s", e)
                return HttpResponse(status=500)

        # Stripe requires 200 OK for handled events
        return HttpResponse(status=200)
    
    
                        






class CreateSubscriptionCheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = SubscriptionCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)


        user = request.user
        plan = serializer.validated_data["plan_id"]

        try:
            success_url = (
                f"{settings.FRONTEND_URL}/subscriptions/success"
                f"?plan_id={plan.id}"
            )

            cancel_url = (
                f"{settings.FRONTEND_URL}/subscriptions/cancel"
                f"?plan_id={plan.id}"
            )


            session = StripeSubscriptionService.create_checkout_session(
                user=user,
                plan=plan,
                success_url=success_url,
                cancel_url=cancel_url
            )

            logger.info(
                "Subscription checkout created | user=%s | plan=%s | session=%s",
                user.id,
                plan.id,
                session.id,
            )

            return Response({
                "checkout_url": session.url,
                "session_id": session.id,
            },
            status=status.HTTP_201_CREATED
            )
        
        except stripe.error.StripeError as e:
            logger.error(
                "Stripe error during subscription checkout | user=%s | error=%s",
                user.id,
                str(e),
            )
            raise ValidationError(
                "Unable to initiate subscription checkout."
            )
        





@method_decorator(csrf_exempt, name="dispatch")
class StripeSubscriptionWebhookView(View):
    """
    Stripe webhook for subscription lifecycle.
    Stripe is the source of truth.
    """

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            logger.warning("Stripe webhook: invalid payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe webhook: invalid signature")
            return HttpResponse(status=400)

        event_type = event["type"]

        # -----------------------------
        # Subscription checkout success
        # -----------------------------
        if event_type == "checkout.session.completed":
            session = event["data"]["object"]
            metadata = session.get("metadata", {})

            try:
                user_id = int(metadata["user_id"])
                plan_id = int(metadata["plan_id"])
            except (KeyError, ValueError):
                logger.error("Webhook missing metadata: %s", metadata)
                return HttpResponse(status=400)

            # Prefer Stripe subscription ID, fallback to session ID
            subscription_id = (
                session.get("subscription") or session.get("id")
            )

            logger.info(
                "Stripe webhook received | type=%s | user=%s | plan=%s | sub=%s",
                event_type,
                user_id,
                plan_id,
                subscription_id,
            )

            try:
                subscription = SubscriptionService.activate_subscription(
                    user_id=user_id,
                    plan_id=plan_id,
                    stripe_subscription_id=str(subscription_id),
                )

                SubscriptionTokenGrantService.grant_monthly_tokens(
                    subscription=subscription
                )

            except SubscriptionPlan.DoesNotExist:
                logger.error(
                    "Subscription activation failed: plan not found | plan_id=%s",
                    plan_id,
                )
                return HttpResponse(status=400)

            except Exception:
                # IMPORTANT: Do not crash webhook
                logger.exception("Subscription activation failed")
                return HttpResponse(status=500)

        # --------------------------------
        # Future events (handled later)
        # --------------------------------
        elif event_type == "customer.subscription.deleted":
            # TODO (Phase 3.x): mark UserSubscription CANCELLED
            logger.info("Subscription deleted event received")
            pass

        elif event["type"] == "invoice.payment_succeeded":
            invoice = event["data"]["object"]
            subscription_id = invoice.get("subscription")

            if not subscription_id:
                return HttpResponse(status=200)

            try:
                subscription = UserSubscription.objects.select_related(
                    "plan", "user"
                ).get(stripe_subscription_id=subscription_id)

                SubscriptionTokenGrantService.grant_monthly_tokens(
                    subscription=subscription
                )

            except UserSubscription.DoesNotExist:
                logger.warning(
                    "Invoice for unknown subscription: %s",
                    subscription_id,
                )    

        # Stripe expects 200 for all handled events
        return HttpResponse(status=200)
  









class CreateInterviewerSubscriptionCheckoutAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def post(self, request):
        interviewer = request.user

        # 1️⃣ Prevent duplicate active subscriptions
        if InterviewerEntitlementService.has_active_subscription(interviewer):
            raise ValidationError(
                "You already have an active interviewer subscription."
            )

        # 2️⃣ Validate plan
        serializer = InterviewerSubscriptionCheckoutSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data["plan_id"]  # ✅ This IS a Plan instance

        # 3️⃣ URLs
        success_url = (
            f"{settings.FRONTEND_URL}/interviewer/subscription/success"
        )
        cancel_url = (
            f"{settings.FRONTEND_URL}/interviewer/subscription/cancel"
        )

        # 4️⃣ Stripe checkout
        session = StripeInterviewerSubscriptionService.create_checkout_session(
            interviewer=interviewer,
            plan=plan,
            success_url=success_url,
            cancel_url=cancel_url,
        )

        logger.info(
            "Interviewer subscription checkout created | interviewer=%s | plan=%s",
            interviewer.id,
            plan.id,
        )

        return Response(
            {"checkout_url": session.url},
            status=status.HTTP_201_CREATED,
        )
    





@method_decorator(csrf_exempt, name="dispatch")
class StripeInterviewerSubscriptionWebhookView(View):
    """
    Stripe webhook for interviewer subscription lifecycle.
    Stripe is the source of truth.
    """

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            logger.warning("Interviewer webhook: invalid payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logger.warning("Interviewer webhook: invalid signature")
            return HttpResponse(status=400)

        event_type = event["type"]

        # -----------------------------------------
        # Subscription checkout completed
        # -----------------------------------------
        if event_type == "checkout.session.completed":
            session = event["data"]["object"]
            metadata = session.get("metadata", {})

            if metadata.get("subscription_type") != "INTERVIEWER":
                return HttpResponse(status=200)

            try:
                interviewer_id = int(metadata["interviewer_id"])
                plan_id = int(metadata["plan_id"])
            except (KeyError, ValueError):
                logger.error("Interviewer webhook missing metadata: %s", metadata)
                return HttpResponse(status=400)

            stripe_subscription_id = (
                session.get("subscription") or session.get("id")
            )

            logger.info(
                "Interviewer subscription webhook | interviewer=%s | plan=%s | stripe_sub=%s",
                interviewer_id,
                plan_id,
                stripe_subscription_id,
            )

            try:
                InterviewerSubscriptionService.activate_subscription(
                    interviewer_id=interviewer_id,
                    plan_id=plan_id,
                    stripe_subscription_id=str(stripe_subscription_id),
                )
            except Exception:
                # Never fail Stripe webhook
                logger.exception("Failed to activate interviewer subscription")
                return HttpResponse(status=500)

        return HttpResponse(status=200)