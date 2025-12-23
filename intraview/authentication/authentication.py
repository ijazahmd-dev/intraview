from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

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
