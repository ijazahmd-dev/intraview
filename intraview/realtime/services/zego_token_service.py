

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