import random
import hashlib
from django.core.cache import cache

class OTPService:

    @staticmethod
    def generate_otp():
        return random.randint(100000, 999999)

    @staticmethod
    def _hash_otp(otp):
        return hashlib.sha256(str(otp).encode()).hexdigest()

    @staticmethod
    def store_otp(email, otp):
        hashed_otp = OTPService._hash_otp(otp)
        cache_key = f"otp:{email}"
        cache.set(cache_key, hashed_otp, timeout=300)  # 5 minutes



    @staticmethod
    def _attempts_key(email):
        return f"otp_attempts:{email.lower()}"


    @staticmethod
    def can_attempt_verification(email):
        attempts_key = OTPService._attempts_key(email)
        attempts = cache.get(attempts_key, 0)
        return attempts < 50


    @staticmethod
    def increment_failed_attempt(email):
        attempts_key = OTPService._attempts_key(email)
        current = cache.get(attempts_key, 0)
        cache.set(attempts_key, current + 1, timeout=900)  # 15 minutes lockout



    @staticmethod
    def reset_attempts(email):
        cache.delete(OTPService._attempts_key(email))   


    @staticmethod
    def can_send_otp(email):
        rate_key = f"otp_rate_limit:{email.lower()}"
        count = cache.get(rate_key)

        if count is None:
            # First OTP request
            cache.set(rate_key, 1, timeout=3600)
            return True
        
        if count >= 50:
            return False

        # Increment safely
        cache.incr(rate_key)
        return True



    @staticmethod
    def verify_otp(email, otp):
        email = email.lower()

        # Check if too many wrong attempts
        if not OTPService.can_attempt_verification(email):
            return False

        cache_key = f"otp:{email}"
        saved_hashed_otp = cache.get(cache_key)

        if saved_hashed_otp is None:
            return False

        # Compare hashed otp
        if saved_hashed_otp == OTPService._hash_otp(otp):
            # Success → reset attempts
            OTPService.reset_attempts(email)
            cache.delete(cache_key)
            return True

        # Wrong OTP → increment attempts
        OTPService.increment_failed_attempt(email)
        return False 