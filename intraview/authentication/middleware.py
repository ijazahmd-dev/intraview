from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken, TokenError

class ClearExpiredJWTCookiesMiddleware(MiddlewareMixin):
    def process_request(self, request):
        access = request.COOKIES.get("access_token")
        refresh = request.COOKIES.get("refresh_token")

        # If no tokens → nothing to do
        if not access and not refresh:
            return None

        # Validate access token
        if access:
            try:
                AccessToken(access)  # Just validates; raises error if expired
            except TokenError:
                request._delete_access_token = True

        # Validate refresh token
        if refresh:
            try:
                AccessToken(refresh)  # Using AccessToken class to check expiration
            except TokenError:
                request._delete_refresh_token = True

        return None

    def process_response(self, request, response):
        # Delete tokens flagged during process_request
        if getattr(request, "_delete_access_token", False):
            response.delete_cookie("access_token")

        if getattr(request, "_delete_refresh_token", False):
            response.delete_cookie("refresh_token")

        return response
