from django.shortcuts import render, HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework.exceptions import NotFound



from .serializers import UserSubscriptionSerializer, SubscriptionPlanSerializer
from .models import SubscriptionPlan, SubscriptionPaymentOrder, PaymentStatus
from authentication.authentication import CookieJWTAuthentication
from .utils import generate_subscription_invoice_pdf

# Create your views here.




class UserCurrentSubscriptionAPIView(APIView):
    """
    Returns the user's current active subscription.
    """

    permission_classes = [IsAuthenticated]


    def get(self, request):
        user = request.user
        subscription = user.current_subscription

        if not subscription:
            return Response({
                "has_subscription": False,
                "plan": None,
            })

        plan = subscription.plan

        now = timezone.now()
        end_date = subscription.end_date

        days_remaining = max(
            0,
            (end_date.date() - now.date()).days
        )

        is_expired = (
            subscription.status != "ACTIVE"
            or end_date <= now
        )

        data = {
            "has_subscription": True,
            "plan_name": plan.name,
            "price_inr": plan.price_inr,
            "status": subscription.status,
            "start_date": subscription.start_date,
            "end_date": end_date,
            "renewal_date": subscription.renewal_date,

            "is_expired": is_expired,
            "days_remaining": days_remaining,

            # Entitlements
            "monthly_free_tokens": plan.monthly_free_tokens,
            "ai_interviews_per_month": plan.ai_interviews_per_month,
            "has_priority_booking": plan.has_priority_booking,
            "has_advanced_ai_feedback": plan.has_advanced_ai_feedback,
        }

        serializer = UserSubscriptionSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)
    







class SubscriptionPlanListAPIView(APIView):
    """
    Returns all active subscription plans (Free/Starter/Pro).
    Public endpoint (no auth required).
    """

    def get(self, request):
        qs = SubscriptionPlan.objects.filter(is_active=True).order_by("price_inr")
        serializer = SubscriptionPlanSerializer(qs, many=True)
        return Response(serializer.data)
    




class SubscriptionInvoiceDownloadAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, internal_order_id):
        try:
            payment_order = SubscriptionPaymentOrder.objects.select_related(
                'user', 'subscription__plan'
            ).get(
                internal_order_id=internal_order_id,
                user=request.user,
                status=PaymentStatus.SUCCEEDED
            )

            pdf_buffer = generate_subscription_invoice_pdf(payment_order)
            
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Intraview_Subscription_Invoice_{payment_order.internal_order_id}.pdf"'
            
            return response
            
        except SubscriptionPaymentOrder.DoesNotExist:
            raise NotFound("Subscription invoice not found.")
    


