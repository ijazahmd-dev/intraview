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
from datetime import timedelta
from datetime import datetime
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound

from wallet.services import TokenService
from wallet.models import TokenTransactionType

from .models import PaymentOrder,PaymentStatus, TokenPack
from subscriptions.models import SubscriptionPaymentOrder
from .serializers import CreatePaymentSerializer, SubscriptionCheckoutSerializer, InterviewerSubscriptionCheckoutSerializer,TokenPackListSerializer, PaymentOrderSerializer
from .services.stripe_token_bundle_service import StripeService
from .services.stripe_subscription import StripeSubscriptionService
from .services.stripe_interviewer_subscription import StripeInterviewerSubscriptionService
from authentication.authentication import CookieJWTAuthentication
from subscriptions.services.subscription_service import SubscriptionService
from subscriptions.services.token_grant_service import SubscriptionTokenGrantService
from subscriptions.models import SubscriptionStatus, SubscriptionPlan, UserSubscription
from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer
from .utils import generate_payment_invoice_pdf
from interviewer_subscriptions.services.entitlement_service import (
    InterviewerEntitlementService,
)
from interviewer_subscriptions.services.subscription_service import (
    InterviewerSubscriptionService,
)
from interviewer_subscriptions.models import InterviewerSubscriptionPlan, InterviewerSubscription, InterviewerSubscriptionStatus, InterviewerPaymentOrder
from django.contrib.auth import get_user_model







# Create your views here.



logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY
User = get_user_model()





class TokenPackListAPIView(APIView):
    """
    Public endpoint.
    Lists active token packs for users to purchase.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        qs = TokenPack.objects.filter(is_active=True).order_by("price_inr")
        serializer = TokenPackListSerializer(qs, many=True)
        return Response(serializer.data)



class PaymentOrderRetrieveAPIView(APIView):
    """
    Retrieve PaymentOrder details by internal_order_id for success page.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, internal_order_id):
        try:
            # Fetch order for authenticated user only
            payment_order = PaymentOrder.objects.select_related(
                'user', 'token_pack'
            ).get(
                internal_order_id=internal_order_id,
                user=request.user,
                status=PaymentStatus.SUCCEEDED  # Only successful payments
            )

            # Serialize response
            serializer = PaymentOrderSerializer(payment_order)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except PaymentOrder.DoesNotExist:
            return Response(
                {'error': 'Payment order not found or access denied.'}, 
                status=status.HTTP_404_NOT_FOUND
            )





class PaymentInvoiceDownloadAPIView(APIView):
    """
    Generates and downloads PDF invoice for successful PaymentOrder.
    """
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, internal_order_id):
        try:
            # 1️⃣ Fetch PaymentOrder by internal_order_id
            payment_order = PaymentOrder.objects.select_related(
                'user', 'token_pack'
            ).get(
                internal_order_id=internal_order_id,
                user=request.user,
                status=PaymentStatus.SUCCEEDED
            )

            # 2️⃣ Generate PDF invoice
            pdf_buffer = generate_payment_invoice_pdf(payment_order)
            
            # 3️⃣ Return as downloadable file
            response = HttpResponse(
                pdf_buffer, 
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename="Intraview_Invoice_{payment_order.internal_order_id}.pdf"'
            
            logger.info(
                f"Invoice downloaded for PaymentOrder {payment_order.id} by user {request.user.id}"
            )
            
            return response
            
        except PaymentOrder.DoesNotExist:
            raise NotFound("Invoice not found or access denied.")
        except Exception as e:
            logger.error(f"Invoice generation failed: {e}")
            raise ValidationError("Failed to generate invoice.")





################################################ Stripe views ################################################




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
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.is_valid(raise_exception=True)


        user = request.user
        plan = serializer.validated_data["plan_id"]

        payment_order = SubscriptionPaymentOrder.objects.create(
            user=user,
            subscription=None,  # Webhook will set this
            plan=plan,
            amount_inr=plan.price_inr,
            status=PaymentStatus.CREATED,  # Pending payment
            stripe_checkout_session_id="",  # Webhook will update
            internal_order_id=f"SUB-ORD-{user.id}-{int(time.time())}",
        )

        try:
            success_url = (
                f"{settings.FRONTEND_URL}/subscriptions/success"
                f"?order_id={payment_order.internal_order_id}"
            )

            cancel_url = (
                f"{settings.FRONTEND_URL}/subscriptions/cancel"
                f"?plan_id={plan.id}"
            )


            session = StripeSubscriptionService.create_checkout_session(
                user=user,
                plan=plan,
                success_url=success_url,
                cancel_url=cancel_url,
                payment_order_id=payment_order.internal_order_id,
            )

            logger.info(
                "Subscription checkout created | user=%s | plan=%s | session=%s",
                user.id,
                plan.id,
                payment_order.internal_order_id,
                session.id,
            )

            payment_order.stripe_checkout_session_id = session.id
            payment_order.status = PaymentStatus.PENDING
            payment_order.save(update_fields=["stripe_checkout_session_id", "status", "updated_at"])

            return Response({
                "checkout_url": session.url,
                "session_id": session.id,
                "order_id": payment_order.internal_order_id,
            },
            status=status.HTTP_201_CREATED
            )
        
        except stripe.error.StripeError as e:
            logger.error(
                "Stripe error during subscription checkout | user=%s | error=%s",
                user.id,
                payment_order.internal_order_id,
                str(e),
            )

            payment_order.status = PaymentStatus.FAILED
            payment_order.save(update_fields=["status", "updated_at"])

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
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            logger.warning("Stripe webhook: invalid payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe webhook: invalid signature")
            return HttpResponse(status=400)

        event_type = event.get("type")
        obj = event["data"]["object"]

        # ======================================================
        # 1) CHECKOUT SUCCESS (First subscription payment)
        # ======================================================
        if event_type == "checkout.session.completed":
            session = obj
            metadata = session.get("metadata", {})

            try:
                user_id = int(metadata["user_id"])
                plan_id = int(metadata["plan_id"])
                payment_order_id = metadata.get("payment_order_id")
            except (KeyError, ValueError):
                logger.error("Webhook missing metadata: %s", metadata)
                return HttpResponse(status=400)

            stripe_subscription_id = session.get("subscription") or session.get("id")

            logger.info(
                "Stripe webhook received | type=%s | user=%s | plan=%s | order=%s | sub=%s",
                event_type,
                user_id,
                plan_id,
                payment_order_id,
                stripe_subscription_id,
            )

            try:
                with transaction.atomic():
                    user = User.objects.select_for_update().get(id=user_id)
                    plan = SubscriptionPlan.objects.get(id=plan_id)

                    # ✅ Activate subscription
                    subscription = SubscriptionService.activate_subscription(
                        user_id=user_id,
                        plan_id=plan_id,
                        stripe_subscription_id=str(stripe_subscription_id),
                    )

                    # ✅ Update payment order if exists
                    if payment_order_id:
                        payment_order = SubscriptionPaymentOrder.objects.select_for_update().get(
                            internal_order_id=payment_order_id,
                            user=user,
                        )

                        payment_order.status = PaymentStatus.SUCCEEDED
                        payment_order.stripe_checkout_session_id = session.get("id")
                        payment_order.stripe_subscription_id = str(stripe_subscription_id)
                        payment_order.subscription = subscription

                        now = timezone.now()
                        payment_order.period_start = now
                        payment_order.period_end = now + timedelta(days=plan.billing_cycle_days)

                        payment_order.save(update_fields=[
                            "status",
                            "stripe_checkout_session_id",
                            "stripe_subscription_id",
                            "subscription",
                            "period_start",
                            "period_end",
                            "updated_at",
                        ])

                    # ✅ Grant monthly free tokens
                    SubscriptionTokenGrantService.grant_monthly_tokens(
                        subscription=subscription
                    )

            except User.DoesNotExist:
                logger.error("Stripe webhook: user not found | user_id=%s", user_id)
                return HttpResponse(status=404)
            except SubscriptionPlan.DoesNotExist:
                logger.error("Stripe webhook: plan not found | plan_id=%s", plan_id)
                return HttpResponse(status=404)
            except SubscriptionPaymentOrder.DoesNotExist:
                # Don't fail checkout just because tracking record missing
                logger.warning(
                    "Stripe webhook: payment order not found | order_id=%s (Continuing anyway)",
                    payment_order_id,
                )
                return HttpResponse(status=200)
            except Exception:
                logger.exception("Stripe subscription webhook failed (checkout.session.completed)")
                return HttpResponse(status=500)

        # ======================================================
        # 2) RENEWAL PAYMENT SUCCESS (Every month)
        # ======================================================
        elif event_type == "invoice.payment_succeeded":
            invoice = obj

            stripe_subscription_id = invoice.get("subscription")
            stripe_invoice_id = invoice.get("id")

            if not stripe_subscription_id or not stripe_invoice_id:
                return HttpResponse(status=200)

            # ✅ Idempotency: if already created, do nothing
            if SubscriptionPaymentOrder.objects.filter(stripe_invoice_id=stripe_invoice_id).exists():
                return HttpResponse(status=200)

            try:
                subscription = UserSubscription.objects.select_related("plan", "user").get(
                    stripe_subscription_id=stripe_subscription_id
                )

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

                # ✅ Grant monthly free tokens again on renewal
                SubscriptionTokenGrantService.grant_monthly_tokens(
                    subscription=subscription
                )

                logger.info("✅ Subscription renewal processed | sub=%s", stripe_subscription_id)

            except UserSubscription.DoesNotExist:
                logger.warning("Invoice for unknown subscription: %s", stripe_subscription_id)

            except Exception:
                logger.exception("Stripe webhook failed (invoice.payment_succeeded)")
                return HttpResponse(status=500)

        # ======================================================
        # 3) SUBSCRIPTION CANCELLED
        # ======================================================
        elif event_type == "customer.subscription.deleted":
            subscription_obj = obj
            stripe_subscription_id = subscription_obj.get("id")

            if not stripe_subscription_id:
                return HttpResponse(status=200)

            try:
                sub = UserSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)
                sub.status = SubscriptionStatus.CANCELLED
                sub.save(update_fields=["status", "updated_at"])
                logger.info("✅ Subscription cancelled | sub=%s", stripe_subscription_id)

            except UserSubscription.DoesNotExist:
                logger.warning("Cancellation for unknown subscription: %s", stripe_subscription_id)

            except Exception:
                logger.exception("Stripe webhook failed (customer.subscription.deleted)")
                return HttpResponse(status=500)

        # ✅ Always return 200 so Stripe doesn't retry repeatedly for unknown events
        return HttpResponse(status=200)









class CreateInterviewerSubscriptionCheckoutAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def post(self, request):
        interviewer = request.user

        # ✅ Prevent duplicate active subscriptions
        if InterviewerEntitlementService.has_active_subscription(interviewer):
            raise ValidationError("You already have an active interviewer subscription.")

        # ✅ Validate plan
        serializer = InterviewerSubscriptionCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data["plan_id"]  # Plan instance

        # ✅ Create payment order FIRST (CREATED)
        payment_order = InterviewerPaymentOrder.objects.create(
            user=interviewer,
            subscription=None,  # webhook will attach
            plan=plan,
            amount_inr=plan.price_inr,
            status=PaymentStatus.CREATED,
            internal_order_id=f"INT-ORD-{interviewer.id}-{int(time.time())}",
        )

        # ✅ URLs
        success_url = (
            f"{settings.FRONTEND_URL}/interviewer/subscription/success"
            f"?order_id={payment_order.internal_order_id}"
        )
        cancel_url = (
            f"{settings.FRONTEND_URL}/interviewer/subscription/cancel"
            f"?order_id={payment_order.internal_order_id}"
        )

        try:
            # ✅ Create Stripe checkout session
            session = StripeInterviewerSubscriptionService.create_checkout_session(
                interviewer=interviewer,
                plan=plan,
                success_url=success_url,
                cancel_url=cancel_url,
                payment_order_id=payment_order.internal_order_id,
            )

            # ✅ IMPORTANT: update order to PENDING (waiting for webhook payment success)
            payment_order.status = PaymentStatus.PENDING
            payment_order.stripe_checkout_session_id = session.id
            payment_order.save(update_fields=["status", "stripe_checkout_session_id", "updated_at"])

            logger.info(
                "Interviewer subscription checkout created | interviewer=%s | plan=%s | order=%s | session=%s",
                interviewer.id,
                plan.id,
                payment_order.internal_order_id,
                session.id,
            )

            return Response(
                {
                    "checkout_url": session.url,
                    "order_id": payment_order.internal_order_id,  # ✅ helpful for frontend
                    "session_id": session.id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            # ✅ If Stripe fails, mark order FAILED
            payment_order.status = PaymentStatus.FAILED
            payment_order.save(update_fields=["status", "updated_at"])

            logger.exception("Stripe interviewer checkout failed | order=%s", payment_order.internal_order_id)
            raise ValidationError("Unable to initiate interviewer subscription checkout.")
    




@method_decorator(csrf_exempt, name="dispatch")
class StripeInterviewerSubscriptionWebhookView(View):
    """
    Handles Stripe webhook events for INTERVIEWER subscriptions only.
    """

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            logger.warning("Interviewer webhook: invalid payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            logger.warning("Interviewer webhook: invalid signature")
            return HttpResponse(status=400)

        event_type = event["type"]
        obj = event["data"]["object"]
        metadata = obj.get("metadata", {}) or {}

        # ✅ Only handle interviewer subscription events
        if metadata.get("subscription_type") != "INTERVIEWER":
            return HttpResponse(status=200)

        # ---------------------------------------------------------
        # ✅ 1) Checkout Completed → Activate subscription + mark paid
        # ---------------------------------------------------------
        if event_type == "checkout.session.completed":
            try:
                interviewer_id = int(metadata["interviewer_id"])
                plan_id = int(metadata["plan_id"])
                payment_order_id = metadata.get("payment_order_id")

                stripe_subscription_id = obj.get("subscription") or obj.get("id")
                stripe_checkout_session_id = obj.get("id")

            except (KeyError, ValueError):
                logger.error("Interviewer webhook missing metadata: %s", metadata)
                return HttpResponse(status=400)

            try:
                with transaction.atomic():
                    interviewer = User.objects.select_for_update().get(id=interviewer_id)
                    plan = InterviewerSubscriptionPlan.objects.get(id=plan_id)

                    # ✅ Activate interviewer subscription
                    subscription = InterviewerSubscriptionService.activate_subscription(
                        interviewer_id=interviewer_id,
                        plan_id=plan_id,
                        stripe_subscription_id=str(stripe_subscription_id),
                    )

                    # ✅ Update InterviewerPaymentOrder
                    if payment_order_id:
                        payment_order = InterviewerPaymentOrder.objects.select_for_update().get(
                            internal_order_id=payment_order_id,
                            user=interviewer,
                        )

                        payment_order.status = PaymentStatus.SUCCEEDED
                        payment_order.stripe_checkout_session_id = stripe_checkout_session_id
                        payment_order.stripe_subscription_id = str(stripe_subscription_id)
                        payment_order.subscription = subscription
                        payment_order.period_start = timezone.now()
                        payment_order.period_end = timezone.now() + timedelta(days=plan.billing_cycle_days)
                        payment_order.save()

                logger.info(
                    "✅ Interviewer subscription activated | interviewer=%s | plan=%s | order=%s | sub=%s",
                    interviewer_id,
                    plan_id,
                    payment_order_id,
                    stripe_subscription_id,
                )

                return HttpResponse(status=200)

            except InterviewerPaymentOrder.DoesNotExist:
                logger.error("InterviewerPaymentOrder not found | order_id=%s", payment_order_id)
                return HttpResponse(status=404)

            except Exception:
                logger.exception("Interviewer checkout.session.completed failed")
                return HttpResponse(status=500)

        # ---------------------------------------------------------
        # ✅ 2) Renewal invoice payment succeeded → create new order row
        # ---------------------------------------------------------
        elif event_type == "invoice.payment_succeeded":
            try:
                stripe_subscription_id = obj.get("subscription")
                stripe_invoice_id = obj.get("id")

                if not stripe_subscription_id:
                    return HttpResponse(status=200)

                subscription = InterviewerSubscription.objects.select_related(
                    "interviewer",
                    "plan",
                ).get(stripe_subscription_id=stripe_subscription_id)

                # ✅ Create a NEW payment order record for renewal (audit trail)
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
                    "✅ Interviewer renewal recorded | sub=%s | invoice=%s",
                    stripe_subscription_id,
                    stripe_invoice_id,
                )

            except InterviewerSubscription.DoesNotExist:
                logger.warning("Interviewer renewal invoice for unknown subscription: %s", stripe_subscription_id)

            except Exception:
                logger.exception("Interviewer invoice.payment_succeeded failed")
                return HttpResponse(status=500)

        # ---------------------------------------------------------
        # ✅ 3) Subscription cancelled on Stripe → mark cancelled locally
        # ---------------------------------------------------------
        elif event_type == "customer.subscription.deleted":
            try:
                stripe_subscription_id = obj.get("id")
                if not stripe_subscription_id:
                    return HttpResponse(status=200)

                sub = InterviewerSubscription.objects.get(stripe_subscription_id=stripe_subscription_id)
                sub.status = InterviewerSubscriptionStatus.CANCELLED
                sub.save(update_fields=["status"])

                logger.info("✅ Interviewer subscription cancelled | sub=%s", stripe_subscription_id)

            except InterviewerSubscription.DoesNotExist:
                logger.warning("Cancellation received for unknown interviewer subscription: %s", stripe_subscription_id)

            except Exception:
                logger.exception("Interviewer subscription cancel handler failed")
                return HttpResponse(status=500)

        return HttpResponse(status=200)







################################################ Stripe views end  ################################################
