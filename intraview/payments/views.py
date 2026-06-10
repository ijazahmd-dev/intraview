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
from .services.stripe_webhook_router import StripeWebhookRouter
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
    Single, centralized Stripe webhook endpoint.

    Receives ALL Stripe events for token purchases, user subscriptions,
    and interviewer subscriptions. Delegates routing to StripeWebhookRouter
    which inspects event type and checkout session metadata to call the
    correct business-logic handler.

    Only ONE stripe listen command is needed:
        stripe listen --forward-to localhost:8000/api/payments/webhook/stripe/
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        payload = request.body.decode("utf-8")
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        # 1️⃣ Verify Stripe signature (security gate — must come first)
        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError as e:
            logger.warning("Stripe webhook: invalid payload | %s", e)
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            logger.warning("Stripe webhook: invalid signature | %s", e)
            return HttpResponse(status=400)
        except Exception as e:
            logger.error("Stripe webhook: unexpected verification error | %s", e)
            return HttpResponse(status=400)

        # 2️⃣ Route event to the correct business-logic handler
        http_status = StripeWebhookRouter(event).route_event()
        return HttpResponse(status=http_status)







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
        







# ──────────────────────────────────────────────────────────────────────────────
# NOTE: StripeSubscriptionWebhookView and StripeInterviewerSubscriptionWebhookView
# have been removed. All webhook handling is now done by StripeWebhookView above,
# which delegates to StripeWebhookRouter in payments/services/stripe_webhook_router.py.
# The old URL routes for these views have also been removed from urls.py.
# ──────────────────────────────────────────────────────────────────────────────





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
    











################################################ Stripe views end  ################################################
