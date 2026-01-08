import time
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeInterviewerSubscriptionService:
    @staticmethod
    def create_checkout_session(*, interviewer, plan, success_url, cancel_url):
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=interviewer.email,
            client_reference_id=f"interviewer_{interviewer.id}_{int(time.time())}",  # ✅ idempotency hint
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "recurring": {"interval": "month"},
                        "unit_amount": plan.price_inr * 100,
                        "product_data": {
                            "name": plan.name,
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "interviewer_id": str(interviewer.id),
                "plan_id": str(plan.id),
                "subscription_type": "INTERVIEWER",
            },
            success_url=success_url,
            cancel_url=cancel_url,
        )

        return session