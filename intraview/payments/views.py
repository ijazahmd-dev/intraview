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
from .serializers import CreatePaymentSerializer
from .services.stripe_service import StripeService
from authentication.authentication import CookieJWTAuthentication




# Create your views here.



logger = logging.getLogger(__name__)


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
    
    
                        

                