# interviewers/consumers.py

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from bookings.models import InterviewBooking

logger = logging.getLogger(__name__)


class InterviewConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
        self.user = self.scope["user"]
        self.room_group_name = f"interview_{self.booking_id}"

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        try:
            self.booking = await self.get_booking()
        except InterviewBooking.DoesNotExist:
            await self.close(code=4004)
            return

        if self.user.id not in [
            self.booking.candidate_id,
            self.booking.interviewer_id,
        ]:
            await self.close(code=4003)
            return

        if self.booking.status not in [
            InterviewBooking.Status.CONFIRMED,
            InterviewBooking.Status.PENDING,
        ]:
            await self.close(code=4009)
            return

        self.role = (
            "candidate"
            if self.user.id == self.booking.candidate_id
            else "interviewer"
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        # Notify peer
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "peer_joined",
                "user_id": self.user.id,
                "role": self.role,
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "peer_left",
                "user_id": self.user.id,
                "role": getattr(self, "role", None),
            }
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(json.dumps({"error": "Invalid JSON"}))
            return

        message_type = data.get("type")

        allowed_types = ["offer", "answer", "ice-candidate", "chat"]

        if message_type not in allowed_types:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "signal_message",
                "message": data,
                "sender_id": self.user.id,
            }
        )

    async def signal_message(self, event):
        if event["sender_id"] == self.user.id:
            return

        await self.send(text_data=json.dumps(event["message"]))

    async def peer_joined(self, event):
        if event["user_id"] == self.user.id:
            return

        await self.send(json.dumps({
            "type": "peer-joined",
            "role": event["role"],
        }))

    async def peer_left(self, event):
        if event["user_id"] == self.user.id:
            return

        await self.send(json.dumps({
            "type": "peer-left",
            "role": event["role"],
        }))

    @database_sync_to_async
    def get_booking(self):
        return InterviewBooking.objects.select_related(
            "candidate",
            "interviewer"
        ).get(id=self.booking_id)
