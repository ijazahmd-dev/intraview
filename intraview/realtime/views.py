# from django.conf import settings
# from django.shortcuts import get_object_or_404
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from bookings.models import InterviewBooking
# from realtime.services.zego_token_service import ZegoTokenService
# from realtime.services.session_service import SessionService
# from authentication.permissions import IsInterviewParticipant
# from authentication.authentication import MultiRoleJWTAuthentication


# class ZegoTokenAPIView(APIView):

#     permission_classes = [IsAuthenticated, IsInterviewParticipant]
#     authentication_classes = [MultiRoleJWTAuthentication]

#     def get(self, request, booking_id):

#         user = request.user

#         booking = get_object_or_404(

#             InterviewBooking,
#             id=booking_id

#         )

#         if user.id not in [

#             booking.candidate_id,
#             booking.interviewer_id,

#         ]:

#             return Response(

#                 {"error": "Unauthorized"},
#                 status=403

#             )

#         room_id = f"interview_{booking_id}"

#         token = ZegoTokenService.generate_token(

#             user_id=str(user.id),
#             room_id=room_id,

#         )

#         role = (

#             "candidate"
#             if user.id == booking.candidate_id
#             else "interviewer"

#         )

#         SessionService.handle_connect(

#             booking,
#             role

#         )

#         return Response({

#             "app_id": settings.ZEGO_APP_ID,

#             "token": token,

#             "room_id": room_id,

#             "user_id": str(user.id),

#         })












# realtime/views.py

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from bookings.models import InterviewBooking
from realtime.services.zego_token_service import ZegoTokenService
from realtime.services.session_service import SessionService
from authentication.permissions import IsInterviewParticipant
from authentication.authentication import MultiRoleJWTAuthentication


class ZegoTokenAPIView(APIView):

    permission_classes = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]

    # How early/late users may join around the scheduled time
    EARLY_JOIN_MINUTES = 10
    LATE_JOIN_MINUTES = 15

    def get(self, request, booking_id):
        user = request.user

        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
        )

        if user.id not in [booking.candidate_id, booking.interviewer_id]:
            # “No permission” case
            return Response(
                {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ---- Time / status guards: too early / ended / cancelled ----
        now = timezone.now()
        start = booking.start_datetime
        # Adjust how you compute end; this assumes a duration_minutes field or 60m default
        end = booking.end_datetime

        print("NOW:", now)
        print("START:", start)
        print("END:", end)

        # Too early
        if now < start - timedelta(minutes=self.EARLY_JOIN_MINUTES):
            return Response(
                {
                    "code": "INTERVIEW_TOO_EARLY",
                    "detail": "This interview has not started yet. "
                              f"You can join from { (start - timedelta(minutes=self.EARLY_JOIN_MINUTES)).isoformat() }.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Too late / already ended in time
        if now > end + timedelta(minutes=self.LATE_JOIN_MINUTES):
            return Response(
                {
                    "code": "INTERVIEW_ENDED",
                    "detail": "This interview time window has passed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Status-based ended / cancelled checks (tweak to your status enum)
        if booking.status in [
            InterviewBooking.Status.COMPLETED,
            InterviewBooking.Status.NO_SHOW,
        ]:
            return Response(
                {
                    "code": "INTERVIEW_ENDED",
                    "detail": "This interview has already ended.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.status in [
            InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
            InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
        ]:
            return Response(
                {
                    "code": "INTERVIEW_CANCELLED",
                    "detail": "This interview has been cancelled.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        room_id = f"interview_{booking_id}"

        token = ZegoTokenService.generate_token(
            user_id=str(user.id),
            room_id=room_id,
        )

        role = "candidate" if user.id == booking.candidate_id else "interviewer"

        SessionService.handle_connect(booking, role)

        return Response(
            {
                "app_id": settings.ZEGO_APP_ID,
                "token": token,
                "room_id": room_id,
                "user_id": str(user.id),
                "role": role,
            }
        )


class ZegoDisconnectAPIView(APIView):
    """
    Called when user leaves the interview (or closes tab, best-effort).
    Records disconnect in InterviewSession and may transition to ENDED.
    """

    permission_classes = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]

    def post(self, request, booking_id):
        user = request.user

        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
        )

        if user.id not in [booking.candidate_id, booking.interviewer_id]:
            return Response(
                {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
                status=status.HTTP_403_FORBIDDEN,
            )

        role = "candidate" if user.id == booking.candidate_id else "interviewer"

        session = SessionService.handle_disconnect(booking, role)
        if not session:
            # No active session – nothing to do
            return Response(status=status.HTTP_204_NO_CONTENT)

        stats = SessionService.get_session_stats(session)
        return Response(
            {
                "status": session.status,
                "booking_status": booking.status,
                "ended_at": session.ended_at,
                "duration_seconds": stats["duration_seconds"],
                "reconnect_count": stats["reconnect_count"],
            }
        )
