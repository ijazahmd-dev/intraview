from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

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
