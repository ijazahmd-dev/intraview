# # interviewers/consumers.py

# import json
# import logging
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from bookings.models import InterviewBooking

# logger = logging.getLogger(__name__)


# class InterviewConsumer(AsyncWebsocketConsumer):

#     async def connect(self):
#         self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
#         self.user = self.scope["user"]
#         self.room_group_name = f"interview_{self.booking_id}"

#         if not self.user.is_authenticated:
#             await self.close(code=4001)
#             return

#         try:
#             self.booking = await self.get_booking()
#         except InterviewBooking.DoesNotExist:
#             await self.close(code=4004)
#             return

#         if self.user.id not in [
#             self.booking.candidate_id,
#             self.booking.interviewer_id,
#         ]:
#             await self.close(code=4003)
#             return

#         if self.booking.status not in [
#             InterviewBooking.Status.CONFIRMED,
#             InterviewBooking.Status.PENDING,
#         ]:
#             await self.close(code=4009)
#             return

#         self.role = (
#             "candidate"
#             if self.user.id == self.booking.candidate_id
#             else "interviewer"
#         )

#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name,
#         )

#         await self.accept()

#         # Notify peer
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "peer_joined",
#                 "user_id": self.user.id,
#                 "role": self.role,
#             }
#         )

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name,
#         )

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "peer_left",
#                 "user_id": self.user.id,
#                 "role": getattr(self, "role", None),
#             }
#         )

#     async def receive(self, text_data):
#         try:
#             data = json.loads(text_data)
#         except json.JSONDecodeError:
#             await self.send(json.dumps({"error": "Invalid JSON"}))
#             return

#         message_type = data.get("type")

#         allowed_types = ["offer", "answer", "ice-candidate", "chat"]

#         if message_type not in allowed_types:
#             return

#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 "type": "signal_message",
#                 "message": data,
#                 "sender_id": self.user.id,
#             }
#         )

#     async def signal_message(self, event):
#         if event["sender_id"] == self.user.id:
#             return

#         await self.send(text_data=json.dumps(event["message"]))

#     async def peer_joined(self, event):
#         if event["user_id"] == self.user.id:
#             return

#         await self.send(json.dumps({
#             "type": "peer-joined",
#             "role": event["role"],
#         }))

#     async def peer_left(self, event):
#         if event["user_id"] == self.user.id:
#             return

#         await self.send(json.dumps({
#             "type": "peer-left",
#             "role": event["role"],
#         }))

#     @database_sync_to_async
#     def get_booking(self):
#         return InterviewBooking.objects.select_related(
#             "candidate",
#             "interviewer"
#         ).get(id=self.booking_id)





















"""
WebSocket Consumer for Real-Time Interview Sessions.
Handles WebRTC signaling and session lifecycle integration.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from bookings.models import InterviewBooking
from realtime.services.session_service import SessionService
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class InterviewConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time interview signaling.
    
    Responsibilities:
        - Authenticate users
        - Validate booking access
        - Relay WebRTC signaling messages (offer/answer/ICE)
        - Delegate session lifecycle to SessionService
        - Notify peers of join/leave events
    """

    async def connect(self):
        """
        Handle WebSocket connection.
        
        Flow:
            1. Extract booking_id from URL
            2. Authenticate user
            3. Validate booking access
            4. Join room group
            5. Notify SessionService of connection
            6. Notify peer of join
        """
        self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
        self.user = self.scope["user"]
        self.room_group_name = f"interview_{self.booking_id}"

        # 🔐 Step 1: Authentication check
        if not self.user.is_authenticated:
            logger.warning(
                f"Unauthenticated connection attempt for booking {self.booking_id}"
            )
            await self.close(code=4001)  # Unauthorized
            return

        # 🔐 Step 2: Fetch and validate booking
        try:
            self.booking = await self.get_booking()
        except InterviewBooking.DoesNotExist:
            logger.error(
                f"Booking {self.booking_id} not found - User {self.user.id}"
            )
            await self.close(code=4004)  # Not Found
            return

        # 🔐 Step 3: Authorization check (candidate or interviewer only)
        if self.user.id not in [
            self.booking.candidate_id,
            self.booking.interviewer_id,
        ]:
            logger.warning(
                f"Unauthorized access - User {self.user.id} "
                f"attempted to join booking {self.booking_id}"
            )
            await self.close(code=4003)  # Forbidden
            return

        # 🔐 Step 4: Booking status validation
        allowed_statuses = [
            InterviewBooking.Status.CONFIRMED,
            # InterviewBooking.Status.PENDING,
            InterviewBooking.Status.LIVE,  # Allow rejoin if already live
        ]

        now = timezone.now()

        early_join_window = timedelta(minutes=10)
        late_join_tolerance = timedelta(minutes=30)

        if not (
            self.booking.start_datetime - early_join_window
            <= now
            <= self.booking.end_datetime + late_join_tolerance
        ):
            logger.warning(
                f"User {self.user.id} attempted to join booking {self.booking_id} "
                f"outside allowed time window"
            )
            await self.close(code=4010)  # Join window violation
            return

        if self.booking.status not in allowed_statuses:
            logger.info(
                f"Booking {self.booking_id} status '{self.booking.status}' "
                f"not allowed for connection"
            )
            await self.close(code=4009)  # Invalid State
            return

        # 🎭 Determine user role
        self.role = (
            "candidate"
            if self.user.id == self.booking.candidate_id
            else "interviewer"
        )

        # 🌐 Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        # ✅ Accept WebSocket connection
        await self.accept()

        logger.info(
            f"User {self.user.id} ({self.role}) connected to booking {self.booking_id}"
        )

        # 🔥 Delegate session lifecycle to service layer
        await self.handle_session_connect()

        # 📢 Notify peer that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "peer_joined",
                "user_id": self.user.id,
                "role": self.role,
            }
        )

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        
        Flow:
            1. Notify SessionService of disconnect
            2. Notify peer of leave
            3. Leave room group
        """
        # ✅ FIX: Safe access to user (may not exist if auth failed early)
        user_id = getattr(self.scope.get("user"), "id", None)
        role = getattr(self, "role", "unknown")

        logger.info(
            f"User {user_id} ({role}) disconnected from booking "
            f"{getattr(self, 'booking_id', 'unknown')} (code: {close_code})"
        )

        # 🔥 Delegate session lifecycle to service layer (only if booking exists)
        if hasattr(self, "booking") and hasattr(self, "role"):
            await self.handle_session_disconnect()

            # 📢 Notify peer that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "peer_left",
                    "user_id": user_id,
                    "role": role,
                }
            )

        # 🚪 Leave room group (safe even if not added)
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        """
        Receive and relay signaling messages.
        
        Handles:
            - WebRTC offer/answer
            - ICE candidates
            - Optional chat messages
            
        Security:
            - Validates JSON
            - Whitelists message types
            - Prevents message injection
        """
        # 🔒 Parse JSON safely
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.error(
                f"Invalid JSON from user {self.user.id}: {text_data[:100]}"
            )
            await self.send(json.dumps({"error": "Invalid JSON"}))
            return

        # 🔒 Validate message type
        message_type = data.get("type")
        allowed_types = ["offer", "answer", "ice-candidate", "chat"]

        if message_type not in allowed_types:
            logger.warning(
                f"Invalid message type '{message_type}' from user {self.user.id}"
            )
            return

        # 📡 Relay to other peer
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "signal_message",
                "message": data,
                "sender_id": self.user.id,
                "sender_role": self.role,
            }
        )

    # ========================================
    # Group Message Handlers
    # ========================================

    async def signal_message(self, event):
        """
        Relay WebRTC signaling to peer (don't echo back to sender).
        """
        if event["sender_id"] == self.user.id:
            return  # Don't send back to sender

        await self.send(text_data=json.dumps({
            "type": event["message"]["type"],
            "data": event["message"].get("data"),
            "sender_role": event["sender_role"],
        }))

    async def peer_joined(self, event):
        """
        Notify client that peer joined the room.
        """
        if event["user_id"] == self.user.id:
            return  # Don't notify self

        await self.send(text_data=json.dumps({
            "type": "peer-joined",
            "role": event["role"],
        }))

    async def peer_left(self, event):
        """
        Notify client that peer left the room.
        """
        if event["user_id"] == self.user.id:
            return  # Don't notify self

        await self.send(text_data=json.dumps({
            "type": "peer-left",
            "role": event["role"],
        }))

    # ========================================
    # Session Service Integration
    # ========================================

    @database_sync_to_async
    def handle_session_connect(self):
        """
        Delegate connection handling to SessionService.
        Wrapped in database_sync_to_async for safe DB access.
        """
        try:
            SessionService.handle_connect(self.booking, self.role)
        except Exception as e:
            logger.exception(
                f"Error handling session connect for booking {self.booking_id}: {e}"
            )

    @database_sync_to_async
    def handle_session_disconnect(self):
        """
        Delegate disconnection handling to SessionService.
        Wrapped in database_sync_to_async for safe DB access.
        """
        try:
            SessionService.handle_disconnect(self.booking, self.role)
        except Exception as e:
            logger.exception(
                f"Error handling session disconnect for booking {self.booking_id}: {e}"
            )

    # ========================================
    # Database Helpers
    # ========================================

    @database_sync_to_async
    def get_booking(self):
        """
        Fetch booking with related users (optimized query).
        """
        return InterviewBooking.objects.select_related(
            "candidate",
            "interviewer"
        ).get(id=self.booking_id)
