from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .serializers import InterviewerSubscriptionPlanSerializer, InterviewerCurrentSubscriptionSerializer
from .models import InterviewerSubscriptionPlan, InterviewerSubscription, InterviewerSubscriptionStatus
from rest_framework import generics
from authentication.authentication import InterviewerCookieJWTAuthentication
from authentication.permissions import IsActiveInterviewer


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

    