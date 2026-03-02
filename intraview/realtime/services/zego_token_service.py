# import time
# import hmac
# import base64
# import hashlib
# import json
# import struct

# from django.conf import settings

# class ZegoTokenService:
#     """
#     Production-grade Zego Token generator
#     Compatible with Token04 specification
#     """

#     VERSION = "04"

#     @classmethod
#     def generate_token(cls, user_id: str, room_id: str) -> str:

#         app_id = settings.ZEGO_APP_ID
#         secret = settings.ZEGO_SERVER_SECRET
#         effective_time = settings.ZEGO_TOKEN_EXPIRY_SECONDS

#         now = int(time.time())
#         expire = now + effective_time
#         nonce = now

#         payload = {

#             "room_id": room_id,

#             "privilege": {

#                 "1": 1,  # login
#                 "2": 1,  # publish

#             },

#             "stream_id_list": None,

#         }

#         payload_str = json.dumps(payload, separators=(",", ":"))

#         # Step 1 — create body

#         body = struct.pack(">I", app_id)
#         body += struct.pack(">I", expire)
#         body += struct.pack(">I", nonce)
#         body += struct.pack(">H", len(user_id))
#         body += user_id.encode()
#         body += struct.pack(">H", len(payload_str))
#         body += payload_str.encode()

#         # Step 2 — signature

#         signature = hmac.new(

#             secret.encode(),
#             body,
#             hashlib.sha256

#         ).digest()

#         # Step 3 — combine

#         token = (

#             cls.VERSION.encode()
#             + base64.b64encode(signature + body)

#         ).decode()

#         return token
        









import json
from django.conf import settings

from realtime.zego_token_lib import token04


class ZegoTokenService:
    """
    Production-grade ZEGOCLOUD Token generator.
    Uses official Token04 implementation.
    """

    @staticmethod
    def generate_token(user_id: str, room_id: str) -> str:

        app_id = settings.ZEGO_APP_ID
        secret = settings.ZEGO_SERVER_SECRET
        expiry = settings.ZEGO_TOKEN_EXPIRY_SECONDS

        payload = {
            "room_id": room_id,
            "privilege": {
                1: 1,  # login
                2: 1,  # publish
            },
            "stream_id_list": None,
        }

        payload_str = json.dumps(
            payload,
            separators=(",", ":")
        )

        token_info = token04.generate_token04(
            app_id=app_id,
            user_id=user_id,
            secret=secret,
            effective_time_in_seconds=expiry,
            payload=payload_str
        )

        if token_info.error_code != token04.ERROR_CODE_SUCCESS:

            raise Exception(
                f"Zego Token Error: "
                f"{token_info.error_code} "
                f"{token_info.error_message}"
            )

        return token_info.token