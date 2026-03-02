from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from bookings.models import InterviewBooking
from realtime.services.zego_token_service import ZegoTokenService
from realtime.services.session_service import SessionService
from authentication.permissions import IsInterviewParticipant
from authentication.authentication import MultiRoleJWTAuthentication


class ZegoTokenAPIView(APIView):

    permission_classes = [IsAuthenticated, IsInterviewParticipant]
    authentication_classes = [MultiRoleJWTAuthentication]

    def get(self, request, booking_id):

        user = request.user

        booking = get_object_or_404(

            InterviewBooking,
            id=booking_id

        )

        if user.id not in [

            booking.candidate_id,
            booking.interviewer_id,

        ]:

            return Response(

                {"error": "Unauthorized"},
                status=403

            )

        room_id = f"interview_{booking_id}"

        token = ZegoTokenService.generate_token(

            user_id=str(user.id),
            room_id=room_id,

        )

        role = (

            "candidate"
            if user.id == booking.candidate_id
            else "interviewer"

        )

        SessionService.handle_connect(

            booking,
            role

        )

        return Response({

            "app_id": settings.ZEGO_APP_ID,

            "token": token,

            "room_id": room_id,

            "user_id": str(user.id),

        })