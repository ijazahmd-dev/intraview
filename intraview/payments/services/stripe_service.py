
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    @staticmethod
    def create_checkout_session(*, payment_order, token_pack, success_url, cancel_url):
        return stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            customer_email=payment_order.user.email,
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "unit_amount": token_pack.price_inr * 100,
                    "product_data": {
                        "name": f"{token_pack.name} ({token_pack.tokens} tokens)",
                    },
                },
                "quantity": 1,
            }],
            metadata={
                "payment_order_id": str(payment_order.id),
                "internal_order_id": payment_order.internal_order_id,
            },
            success_url=success_url,
            cancel_url=cancel_url,
        )