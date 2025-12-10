from django.core.cache import cache
import json

class TempSignupService:

    @staticmethod
    def store_temp_user(email, username, password):
        data = {
            "email": email,
            "username": username,
            "password": password,
        }
        cache_key = f"temp_signup:{email}"
        cache.set(cache_key, json.dumps(data), timeout=600)  # expires in 10 min

    @staticmethod
    def get_temp_user(email):
        cache_key = f"temp_signup:{email}"
        raw = cache.get(cache_key)
        return json.loads(raw) if raw else None

    @staticmethod
    def delete_temp_user(email):
        cache.delete(f"temp_signup:{email}")
