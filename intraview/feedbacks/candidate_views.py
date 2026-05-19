# candidate views for feedback





from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from bookings.models import InterviewBooking
from feedbacks.serializers import (
    InterviewerReviewCreateSerializer,
    InterviewerReviewDetailSerializer,
    CandidateEvaluationListSerializer,
    CandidateEvaluationDetailSerializer,
)
from feedbacks.services.review_service import ReviewService




# ============================================
# SUBMIT REVIEW
# ============================================

class SubmitInterviewerReviewAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def post(self, request, booking_id):

        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id
        )


        serializer = InterviewerReviewCreateSerializer(

            data=request.data,

            context={

                "request": request,

                "booking": booking,

            }

        )


        if serializer.is_valid():

            review = ReviewService.create_review(

                booking=booking,

                candidate=request.user,

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
                        "submitted_by": "candidate",
                        "evaluation_id": review.id,
                    },
                    correlation_id=f"booking:{booking.id}:feedback-submitted:candidate",
                )

            transaction.on_commit(emit_feedback_submitted)


            return Response({

                "message": "Review submitted successfully",

                "review": InterviewerReviewDetailSerializer(review).data

            },
            status=status.HTTP_201_CREATED)


        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    




class CandidateEvaluationListAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        evaluations = request.user.evaluations_received.select_related(
            "interviewer"
        ).order_by("-created_at")


        serializer = CandidateEvaluationListSerializer(
            evaluations,
            many=True
        )


        return Response(serializer.data)






class CandidateEvaluationDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request, evaluation_id):

        evaluation = get_object_or_404(

            request.user.evaluations_received.select_related(
                "interviewer"
            ),

            id=evaluation_id

        )


        serializer = CandidateEvaluationDetailSerializer(evaluation)


        return Response(serializer.data)
    


class CandidateReviewDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request, review_id):

        review = get_object_or_404(

            request.user.reviews_given.select_related(
                "interviewer"
            ),

            id=review_id

        )


        serializer = InterviewerReviewDetailSerializer(review)


        return Response(serializer.data)
    
    
