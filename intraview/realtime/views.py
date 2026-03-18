






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
from realtime.models import InterviewerNote
from realtime.serializers import InterviewerNoteSerializer
from realtime.services.zego_token_service import ZegoTokenService
from realtime.services.session_service import SessionService
from authentication.permissions import IsInterviewParticipant
from authentication.authentication import MultiRoleJWTAuthentication
from .models import InterviewSession


# class ZegoTokenAPIView(APIView):
 
#     permission_classes = [IsAuthenticated, IsInterviewParticipant]
#     authentication_classes = [MultiRoleJWTAuthentication]
 
#     EARLY_JOIN_MINUTES = 10
#     LATE_JOIN_MINUTES  = 15
 
#     def get(self, request, booking_id):
#         user    = request.user
#         booking = get_object_or_404(InterviewBooking, id=booking_id)
 
#         if user.id not in [booking.candidate_id, booking.interviewer_id]:
#             return Response(
#                 {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
#                 status=status.HTTP_403_FORBIDDEN,
#             )
 
#         now   = timezone.now()
#         start = booking.start_datetime
#         end   = booking.end_datetime
 
#         # ── Too early ──────────────────────────────────────────────────────────
#         if now < start - timedelta(minutes=self.EARLY_JOIN_MINUTES):
#             return Response(
#                 {
#                     "code": "INTERVIEW_TOO_EARLY",
#                     "detail": (
#                         "This interview has not started yet. "
#                         f"You can join from "
#                         f"{(start - timedelta(minutes=self.EARLY_JOIN_MINUTES)).isoformat()}."
#                     ),
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
 
#         # ── Too late ──────────────────────────────────────────────────────────
#         if now > end + timedelta(minutes=self.LATE_JOIN_MINUTES):
#             return Response(
#                 {
#                     "code": "INTERVIEW_ENDED",
#                     "detail": "This interview time window has passed.",
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
 
#         # ── Already ended / no-show ────────────────────────────────────────────
#         # FIX: InterviewBooking.Status has no plain NO_SHOW.
#         #      Use CANDIDATE_NO_SHOW and INTERVIEWER_NO_SHOW.
#         if booking.status in [
#             InterviewBooking.Status.COMPLETED,
#             InterviewBooking.Status.CANDIDATE_NO_SHOW,
#             InterviewBooking.Status.INTERVIEWER_NO_SHOW,
#         ]:
#             return Response(
#                 {
#                     "code": "INTERVIEW_ENDED",
#                     "detail": "This interview has already ended.",
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
 
#         # ── Cancelled ─────────────────────────────────────────────────────────
#         if booking.status in [
#             InterviewBooking.Status.CANCELLED,
#             InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
#             InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
#         ]:
#             return Response(
#                 {
#                     "code": "INTERVIEW_CANCELLED",
#                     "detail": "This interview has been cancelled.",
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
 
#         room_id = f"interview_{booking_id}"
#         token   = ZegoTokenService.generate_token(
#             user_id=str(user.id),
#             room_id=room_id,
#         )
#         role = "candidate" if user.id == booking.candidate_id else "interviewer"
 
#         SessionService.handle_connect(booking, role)
 
#         return Response(
#             {
#                 "app_id":  settings.ZEGO_APP_ID,
#                 "token":   token,
#                 "room_id": room_id,
#                 "user_id": str(user.id),
#                 "role":    role,
#             }
#         )
 
 
# class ZegoDisconnectAPIView(APIView):
#     """
#     Called when a participant leaves the interview (or closes the tab).
#     Records the disconnection timestamp in InterviewSession.
 
#     Does NOT end the session — reconnects are allowed freely until the
#     scheduled end time. The Celery cleanup job handles time-based ending.
#     """
 
#     permission_classes = [IsAuthenticated, IsInterviewParticipant]
#     authentication_classes = [MultiRoleJWTAuthentication]
 
#     def post(self, request, booking_id):
#         user    = request.user
#         booking = get_object_or_404(InterviewBooking, id=booking_id)
 
#         if user.id not in [booking.candidate_id, booking.interviewer_id]:
#             return Response(
#                 {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
#                 status=status.HTTP_403_FORBIDDEN,
#             )
 
#         role    = "candidate" if user.id == booking.candidate_id else "interviewer"
#         session = SessionService.handle_disconnect(booking, role)
 
#         if not session:
#             return Response(status=status.HTTP_204_NO_CONTENT)
 
#         stats = SessionService.get_session_stats(session)
#         return Response(
#             {
#                 "status":           session.status,
#                 "booking_status":   booking.status,
#                 "ended_at":         session.ended_at,
#                 "duration_seconds": stats["duration_seconds"],
#                 "reconnect_count":  stats["reconnect_count"],
#             }
#         )









class ZegoTokenAPIView(APIView):
    """
    GET /api/interview/token/<booking_id>/
 
    Returns a Zego token plus:
      - end_datetime   : ISO string — frontend uses this for the countdown timer
      - has_participated: bool — whether this user has ever connected to this session
                          If True, the lobby shows a "Finish Interview" button
    """
 
    permission_classes  = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]
 
    EARLY_JOIN_MINUTES = 10
    LATE_JOIN_MINUTES  = 15
 
    def get(self, request, booking_id):
        user    = request.user
        booking = get_object_or_404(InterviewBooking, id=booking_id)
 
        if user.id not in [booking.candidate_id, booking.interviewer_id]:
            return Response(
                {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
                status=status.HTTP_403_FORBIDDEN,
            )
 
        now   = timezone.now()
        start = booking.start_datetime
        end   = booking.end_datetime
 
        # ── Too early ──────────────────────────────────────────────────────
        if now < start - timedelta(minutes=self.EARLY_JOIN_MINUTES):
            return Response(
                {
                    "code": "INTERVIEW_TOO_EARLY",
                    "detail": (
                        "This interview has not started yet. "
                        f"You can join from "
                        f"{(start - timedelta(minutes=self.EARLY_JOIN_MINUTES)).isoformat()}."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Too late ───────────────────────────────────────────────────────
        if now > end + timedelta(minutes=self.LATE_JOIN_MINUTES):
            return Response(
                {
                    "code": "INTERVIEW_ENDED",
                    "detail": "This interview time window has passed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Already ended / no-show ────────────────────────────────────────
        if booking.status in [
            InterviewBooking.Status.COMPLETED,
            InterviewBooking.Status.CANDIDATE_NO_SHOW,
            InterviewBooking.Status.INTERVIEWER_NO_SHOW,
        ]:
            return Response(
                {"code": "INTERVIEW_ENDED", "detail": "This interview has already ended."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Cancelled ─────────────────────────────────────────────────────
        if booking.status in [
            InterviewBooking.Status.CANCELLED,
            InterviewBooking.Status.CANCELLED_BY_CANDIDATE,
            InterviewBooking.Status.CANCELLED_BY_INTERVIEWER,
        ]:
            return Response(
                {"code": "INTERVIEW_CANCELLED", "detail": "This interview has been cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── Check if this user has already participated ────────────────────
        # Used by the frontend to decide whether to show "Finish Interview"
        # in the lobby before they rejoin.
        has_participated = False
        try:
            session = InterviewSession.objects.get(booking=booking)
            role_check = "candidate" if user.id == booking.candidate_id else "interviewer"
            if role_check == "candidate":
                has_participated = session.candidate_connected_at is not None
            else:
                has_participated = session.interviewer_connected_at is not None
        except InterviewSession.DoesNotExist:
            pass
 
        # ── Generate token and record connect ─────────────────────────────
        room_id = f"interview_{booking_id}"
        token   = ZegoTokenService.generate_token(
            user_id=str(user.id),
            room_id=room_id,
        )
        role = "candidate" if user.id == booking.candidate_id else "interviewer"
        SessionService.handle_connect(booking, role)
 
        # ── Duration in seconds (for the frontend countdown) ──────────────
        duration_seconds = int((end - start).total_seconds())
 
        return Response({
            "app_id":           settings.ZEGO_APP_ID,
            "token":            token,
            "room_id":          room_id,
            "user_id":          str(user.id),
            "role":             role,
            "end_datetime":     end.isoformat(),          # ← timer end point
            "duration_seconds": duration_seconds,          # ← total session length
            "has_participated": has_participated,          # ← show Finish button?
        })
 
 
class ZegoDisconnectAPIView(APIView):
    """
    POST /api/interview/disconnect/<booking_id>/
 
    Records a participant leaving. Does NOT end the session.
    Time-based ending is handled by the Celery cleanup job.
    """
 
    permission_classes  = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]
 
    def post(self, request, booking_id):
        user    = request.user
        booking = get_object_or_404(InterviewBooking, id=booking_id)
 
        if user.id not in [booking.candidate_id, booking.interviewer_id]:
            return Response(
                {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
                status=status.HTTP_403_FORBIDDEN,
            )
 
        role    = "candidate" if user.id == booking.candidate_id else "interviewer"
        session = SessionService.handle_disconnect(booking, role)
 
        if not session:
            return Response(status=status.HTTP_204_NO_CONTENT)
 
        stats = SessionService.get_session_stats(session)
        return Response({
            "status":           session.status,
            "booking_status":   booking.status,
            "ended_at":         session.ended_at,
            "duration_seconds": stats["duration_seconds"],
            "reconnect_count":  stats["reconnect_count"],
        })
 
 
class FinishInterviewAPIView(APIView):
    """
    POST /api/interview/finish/<booking_id>/
 
    Called when a participant explicitly presses "Finish Interview".
    Sets candidate_finished or interviewer_finished on the session.
 
    This flag unlocks feedback submission for that participant,
    even if the booking is still LIVE (they left early).
    The session itself remains active until scheduled end time.
    """
 
    permission_classes  = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]
 
    def post(self, request, booking_id):
        user    = request.user
        booking = get_object_or_404(InterviewBooking, id=booking_id)
 
        if user.id not in [booking.candidate_id, booking.interviewer_id]:
            return Response(
                {"code": "NO_PERMISSION", "detail": "You are not part of this interview."},
                status=status.HTTP_403_FORBIDDEN,
            )
 
        role    = "candidate" if user.id == booking.candidate_id else "interviewer"
        session = SessionService.handle_finish(booking, role)
 
        if not session:
            return Response(
                {"error": "No active session found for this booking."},
                status=status.HTTP_404_NOT_FOUND,
            )
 
        return Response({
            "message":              "Interview finished successfully.",
            "role":                 role,
            "candidate_finished":  session.candidate_finished,
            "interviewer_finished": session.interviewer_finished,
        })









class InterviewerNoteAPIView(APIView):
    """
    GET:    Retrieve interviewer note for a booking (interviewer only).
    PUT/PATCH: Create or update note content.
    """

    permission_classes = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]

    def get_booking_and_check_interviewer(self, request, booking_id):
        """
        Helper: fetch booking and ensure current user is the interviewer.
        Raises Response with 403 if not allowed.
        """
        user = request.user

        booking = get_object_or_404(
            InterviewBooking,
            id=booking_id,
        )

        if user.id != booking.interviewer_id:
            # Candidate or unrelated user trying to access notes.
            return None, Response(
                {
                    "detail": "Only the interviewer can access notes for this interview.",
                    "code": "NOTES_FORBIDDEN",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return booking, None

    def get(self, request, booking_id):
        booking, error_response = self.get_booking_and_check_interviewer(
            request, booking_id
        )
        if error_response:
            return error_response

        try:
            note = booking.interviewer_note
        except InterviewerNote.DoesNotExist:
            # Return empty note instead of 404 so frontend can treat it as blank.
            return Response(
                {
                    "booking": booking.id,
                    "interviewer": request.user.id,
                    "content": "",
                    "updated_at": None,
                },
                status=status.HTTP_200_OK,
            )

        serializer = InterviewerNoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, booking_id):
        """
        Full update: expects { "content": "..." }.
        Creates note if missing.
        """
        return self._create_or_update(request, booking_id, partial=False)

    def patch(self, request, booking_id):
        """
        Partial update: also accepts { "content": "..." }.
        Creates note if missing.
        """
        return self._create_or_update(request, booking_id, partial=True)

    def _create_or_update(self, request, booking_id, partial=False):
        booking, error_response = self.get_booking_and_check_interviewer(
            request, booking_id
        )
        if error_response:
            return error_response

        # Get or create note
        note, created = InterviewerNote.objects.get_or_create(
            booking=booking,
            defaults={
                "interviewer": request.user,
                "content": request.data.get("content", "") or "",
            },
        )

        if not created:
            # Update existing note
            serializer = InterviewerNoteSerializer(
                note,
                data=request.data,
                partial=partial,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = InterviewerNoteSerializer(note)

        return Response(serializer.data, status=status.HTTP_200_OK)