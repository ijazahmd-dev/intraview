from channels.generic.websocket import AsyncWebsocketConsumer


class TestConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Accept WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Nothing to clean up for now
        pass

    async def receive(self, text_data=None, bytes_data=None):
        # Just echo back whatever client sends (optional)
        if text_data:
            await self.send(text_data=text_data)