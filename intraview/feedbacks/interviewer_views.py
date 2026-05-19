# Interviewer feedback views




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from .models import CandidateEvaluation
from authentication.permissions import IsActiveInterviewer
from authentication.authentication import InterviewerCookieJWTAuthentication
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
    authentication_classes = [InterviewerCookieJWTAuthentication]

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

                from notifications.events import emit_event
                from notifications.constants import EventType
                from django.db import transaction

                def emit_feedback_submitted():
                    emit_event(
                        EventType.FEEDBACK_SUBMITTED,
                        actor_id=request.user.id,
                        payload={
                            "booking_id": booking.id,
                            "candidate_id": booking.candidate_id,
                            "interviewer_id": booking.interviewer_id,
                            "submitted_by": "interviewer",
                            "evaluation_id": evaluation.id,
                        },
                        correlation_id=f"booking:{booking.id}:feedback-submitted:interviewer",
                    )

                transaction.on_commit(emit_feedback_submitted)
                

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
    authentication_classes = [InterviewerCookieJWTAuthentication]

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
    authentication_classes = [InterviewerCookieJWTAuthentication]

    def get(self, request, evaluation_id):

        evaluation = get_object_or_404(
            request.user.evaluations_given,
            id=evaluation_id
        )

        serializer = CandidateEvaluationDetailSerializer(evaluation)

        return Response(serializer.data)
    








class EvaluationStatusAPIView(APIView):
    """
    GET /api/feedback/interviewer/evaluations/bookings/{booking_id}/status/
    Check if interviewer can submit evaluation + get booking details
    """
    permission_classes = [IsAuthenticated, IsActiveInterviewer]
    authentication_classes = [InterviewerCookieJWTAuthentication]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            interviewer=request.user
        )
        
        can_submit, reason = EvaluationService.can_submit_evaluation(booking)
        print(can_submit, reason,'THIS IS THE RESULT OF THE CAN SUBMIT. PAY ATTENTION')
        
        return Response({
            'can_submit': can_submit,
            'reason': reason,
            'booking_status': booking.status,
            'is_evaluation_submitted': CandidateEvaluation.objects.filter(booking=booking).exists(),
            'booking': {
                'id': booking.id,
                'candidate_name': f"{booking.candidate.first_name} {booking.candidate.last_name}".strip(),
                'candidate_email': booking.candidate.email,
                'start_datetime': booking.start_datetime.isoformat() if booking.start_datetime else None,
                'status': booking.status,
                'duration_minutes': (booking.end_datetime - booking.start_datetime).total_seconds() / 60 if booking.end_datetime and booking.start_datetime else None,
            }
        }, status=status.HTTP_200_OK)