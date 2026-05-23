from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.authentication import CookieJWTAuthentication

from bookings.models import InterviewBooking
from .models import SessionIssue
from .serializers import (
    IssueCreateSerializer,
    IssueDetailSerializer,
    IssueListSerializer,
)
from .services import IssueService


class CandidateRaiseIssueAPIView(APIView):
    """
    POST /api/issues/candidate/bookings/<booking_id>/raise/

    Candidate raises an issue against the interviewer for a completed booking.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, booking_id: int):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            candidate=request.user,
        )

        serializer = IssueCreateSerializer(
            data=request.data,
            context={
                "request": request,
                "booking": booking,
            },
        )
        serializer.is_valid(raise_exception=True)
        issue = serializer.save()

        return Response(
            IssueDetailSerializer(issue).data,
            status=status.HTTP_201_CREATED,
        )


class CandidateIssueListAPIView(generics.ListAPIView):
    """
    GET /api/issues/candidate/my/

    List all issues raised by the candidate.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = IssueListSerializer

    def get_queryset(self):
        return (
            SessionIssue.objects.select_related("booking")
            .filter(raised_by=self.request.user)
        )


class CandidateIssueDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/issues/candidate/<issue_id>/

    Retrieve details of a specific issue raised by the candidate.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = IssueDetailSerializer
    lookup_url_kwarg = "issue_id"

    def get_queryset(self):
        return SessionIssue.objects.select_related(
            "booking", "raised_by", "against_user"
        ).filter(raised_by=self.request.user)