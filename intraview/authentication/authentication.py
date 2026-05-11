from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)

        # If Authorization header exists → normal behavior
        if header is not None:
            return super().authenticate(request)

        raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        # Validate JWT, but DO NOT raise errors for expired/invalid token.
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except AuthenticationFailed:
            # IMPORTANT: silently fail so AllowAny endpoints still work
            return None
        





class AdminCookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("admin_access_token")
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        if user.role != "admin":
            return None  # block non-admins

        return user, validated_token
    




class InterviewerCookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("interviewer_access_token")
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        if user.role != "interviewer":
            return None

        return user, validated_token









class MultiRoleJWTAuthentication(BaseAuthentication):
    """
    Handles JWT auth for candidate, interviewer, and admin.
    Tries multiple cookie names and authentication classes.
    """
    
    def authenticate(self, request):
        User = get_user_model()
        
        # Try different cookie names
        cookie_names = [
            'access_token',           # Candidate
            'interviewer_access_token',  # Interviewer
            'admin_access_token',     # Admin
        ]
        
        headers = request.META
        
        for cookie_name in cookie_names:
            token_value = request.COOKIES.get(cookie_name)
            if not token_value:
                continue
                
            try:
                # Validate token
                token = AccessToken(token_value)
                user_id = token.payload.get('user_id')
                
                if user_id:
                    user = User.objects.get(id=user_id)
                    return (user, token)
                    
            except Exception as e:
                print(f"Token validation failed for {cookie_name}: {e}")
                continue
        
        return None













# ai_interviews/authentication.py  (or permissions.py — wherever IsAgentWithSharedSecret lives)


from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class AgentTokenAuthentication(BaseAuthentication):
    """
    Authenticates requests from the LiveKit agent using a shared secret
    passed in the X-Agent-Token header.

    Returns a sentinel (None, None) tuple on success so DRF treats the
    request as authenticated without a real User object.
    """

    def authenticate(self, request):
        token = request.META.get("HTTP_X_AGENT_TOKEN", "")
        if not token:
            # No token → not our authenticator, let others try
            return None

        expected = getattr(settings, "BACKEND_AGENT_SHARED_SECRET", "") or ""
        if not expected:
            raise AuthenticationFailed("Server is missing BACKEND_AGENT_SHARED_SECRET config.")

        if token != expected:
            raise AuthenticationFailed("Invalid agent token.")

        # Return (user, auth) — None user is fine for agent-only endpoints
        return (None, token)

    def authenticate_header(self, request):
        return "X-Agent-Token"