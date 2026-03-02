from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from authentication.permissions import IsActiveInterviewer
from bookings.models import InterviewBooking
from feedbacks.serializers import (
    CandidateEvaluationCreateSerializer,
    CandidateEvaluationDetailSerializer
)
from feedbacks.services.evaluation_service import EvaluationService


class StandardPagination(PageNumberPagination):
    page_size = 10



class SubmitCandidateEvaluationAPIView(APIView):

    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def post(self, request, booking_id):

        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            interviewer=request.user
        )

        serializer = CandidateEvaluationCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():
            try:
                evaluation = EvaluationService.create_evaluation(
                    booking=booking,
                    interviewer=request.user,
                    validated_data=serializer.validated_data
                )

                return Response(
                    {
                        "message": "Evaluation submitted successfully.",
                        "evaluation": CandidateEvaluationDetailSerializer(
                            evaluation
                        ).data
                    },
                    status=status.HTTP_201_CREATED
                )

            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=400)


class InterviewerEvaluationListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request):

        evaluations = request.user.evaluations_given.select_related(
            "candidate", "booking"
        ).order_by("-created_at")

        paginator = StandardPagination()
        page = paginator.paginate_queryset(evaluations, request)

        serializer = CandidateEvaluationDetailSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)
    



class InterviewerEvaluationDetailAPIView(APIView):

    permission_classes = [IsAuthenticated, IsActiveInterviewer]

    def get(self, request, evaluation_id):

        evaluation = get_object_or_404(
            request.user.evaluations_given,
            id=evaluation_id
        )

        serializer = CandidateEvaluationDetailSerializer(evaluation)

        return Response(serializer.data)