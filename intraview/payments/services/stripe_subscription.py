import stripe
from django.conf import settings


stripe.api_key = settings.STRIPE_SECRET_KEY



class StripeSubscriptionService:
    @staticmethod
    def create_checkout_session(*, user, plan, success_url, cancel_url, payment_order_id=None):

        metadata = {
            "user_id": str(user.id),
            "plan_id": str(plan.id),
        }
        
        #  ADD payment_order_id if provided (CRITICAL for webhook!)
        if payment_order_id:
            metadata["payment_order_id"] = payment_order_id
        return stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=user.email,
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "recurring": {"interval": "month"},
                        "unit_amount": plan.price_inr * 100,
                        "product_data": {
                            "name": f"{plan.name} Plan",
                            "description": plan.description or "",
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata=metadata,
            success_url=success_url,
            cancel_url=cancel_url,
        )