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








# authentication/middleware.py
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()

        # Extract token from query string
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            try:
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"],
                )
                user = await self.get_user(payload.get("user_id"))
                scope["user"] = user
            except jwt.ExpiredSignatureError:
                pass
            except jwt.InvalidTokenError:
                pass

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
