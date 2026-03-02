import time
import hmac
import base64
import hashlib
import json
import struct

from django.conf import settings

class ZegoTokenService:
    """
    Production-grade Zego Token generator
    Compatible with Token04 specification
    """

    VERSION = "04"

    @classmethod
    def generate_token(cls, user_id: str, room_id: str) -> str:

        app_id = settings.ZEGO_APP_ID
        secret = settings.ZEGO_SERVER_SECRET
        effective_time = settings.ZEGO_TOKEN_EXPIRY_SECONDS

        now = int(time.time())
        expire = now + effective_time
        nonce = now

        payload = {

            "room_id": room_id,

            "privilege": {

                "1": 1,  # login
                "2": 1,  # publish

            },

            "stream_id_list": None,

        }

        payload_str = json.dumps(payload, separators=(",", ":"))

        # Step 1 — create body

        body = struct.pack(">I", app_id)
        body += struct.pack(">I", expire)
        body += struct.pack(">I", nonce)
        body += struct.pack(">H", len(user_id))
        body += user_id.encode()
        body += struct.pack(">H", len(payload_str))
        body += payload_str.encode()

        # Step 2 — signature

        signature = hmac.new(

            secret.encode(),
            body,
            hashlib.sha256

        ).digest()

        # Step 3 — combine

        token = (

            cls.VERSION.encode()
            + base64.b64encode(signature + body)

        ).decode()

        return token
        

        


