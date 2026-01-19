from django.shortcuts import render, HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .serializers import InterviewerSubscriptionPlanSerializer, InterviewerCurrentSubscriptionSerializer
from .models import InterviewerSubscriptionPlan, InterviewerSubscription, InterviewerPaymentOrder, PaymentStatus
from rest_framework import generics
from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer
from .utils import generate_interviewer_invoice_pdf
from rest_framework.exceptions import NotFound



# Create your views here.




class InterviewerSubscriptionPlanListAPIView(APIView):
    """
    Public endpoint.
    Shows active subscription plans for interviewers.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        qs = InterviewerSubscriptionPlan.objects.filter(is_active=True).order_by("price_inr")
        serializer = InterviewerSubscriptionPlanSerializer(qs, many=True)
        return Response(serializer.data)



class InterviewerCurrentSubscriptionAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviewer = request.user
        
        subscription = (
            InterviewerSubscription.objects
            .filter(interviewer=interviewer)
            .select_related("plan")
            .order_by('-start_date')
            .first()
        )
        
        # 🔥 EXACT SERIALIZER CALL - NO VALIDATION
        data = InterviewerCurrentSubscriptionSerializer.build(subscription)
        return Response(data)

    



class InterviewerSubscriptionInvoiceDownloadAPIView(APIView):
    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, internal_order_id):
        try:
            payment_order = InterviewerPaymentOrder.objects.select_related(
                'user', 'subscription__plan'
            ).get(
                internal_order_id=internal_order_id,
                user=request.user,
                status=PaymentStatus.SUCCEEDED
            )

            pdf_buffer = generate_interviewer_invoice_pdf(payment_order)
            
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Intraview_Interviewer_Invoice_{payment_order.internal_order_id}.pdf"'
            return response
            
        except InterviewerPaymentOrder.DoesNotExist:
            raise NotFound("Interviewer invoice not found.")
