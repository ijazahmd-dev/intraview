from django.core.cache import cache
import uuid
import json

class PasswordResetService:

    @staticmethod
    def create_reset_session(email):
        """
        Creates a temporary reset token that will be validated after OTP verification.
        """
        reset_token = str(uuid.uuid4())
        cache_key = f"password_reset:{reset_token}"

        cache.set(
            cache_key,
            json.dumps({"email": email}),
            timeout=600  # 10 minutes
        )

        return reset_token

    @staticmethod
    def get_email_from_token(reset_token):
        cache_key = f"password_reset:{reset_token}"
        raw = cache.get(cache_key)
        return json.loads(raw)["email"] if raw else None

    @staticmethod
    def delete_reset_token(reset_token):
        cache.delete(f"password_reset:{reset_token}")
