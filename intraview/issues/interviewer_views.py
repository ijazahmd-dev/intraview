from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.authentication import InterviewerCookieJWTAuthentication

from bookings.models import InterviewBooking
from .models import SessionIssue
from .serializers import (
    IssueCreateSerializer,
    IssueDetailSerializer,
    IssueListSerializer,
)
from .services import IssueService

# If you have custom interviewer auth/permissions, you can replace
# IsAuthenticated with [IsAuthenticated, IsActiveInterviewer] and
# set authentication_classes here.


class InterviewerRaiseIssueAPIView(APIView):
    """
    POST /api/issues/interviewer/bookings/<booking_id>/raise/

    Interviewer raises an issue against the candidate for a completed booking.
    """

    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id: int):
        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
            interviewer=request.user,
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


class InterviewerIssueListAPIView(generics.ListAPIView):
    """
    GET /api/issues/interviewer/my/

    List all issues raised by this interviewer.
    """

    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = IssueListSerializer

    def get_queryset(self):
        return (
            SessionIssue.objects.select_related("booking")
            .filter(raised_by=self.request.user)
        )


class InterviewerIssueDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/issues/interviewer/<issue_id>/

    Retrieve details of a specific issue raised by this interviewer.
    """

    authentication_classes = [InterviewerCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = IssueDetailSerializer
    lookup_url_kwarg = "issue_id"

    def get_queryset(self):
        return SessionIssue.objects.select_related(
            "booking", "raised_by", "against_user"
        ).filter(raised_by=self.request.user)