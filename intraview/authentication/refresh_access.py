from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .utils import set_access_cookie


def _set_refresh_cookie(response, cookie_name, refresh_token):
    """Set the (rotated) refresh token as an HttpOnly cookie."""
    response.set_cookie(
        cookie_name,
        refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    return response


class UserCookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return Response(
                {"detail": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        # ROTATE_REFRESH_TOKENS=True: a new refresh token is issued; update the cookie
        new_refresh = serializer.validated_data.get("refresh")

        response = Response({"detail": "Token refreshed"})
        set_access_cookie(response, "access_token", access)
        if new_refresh:
            _set_refresh_cookie(response, "refresh_token", new_refresh)
        return response


class AdminCookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.COOKIES.get("admin_refresh_token")
        if not refresh:
            return Response(
                {"detail": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        new_refresh = serializer.validated_data.get("refresh")

        response = Response({"detail": "Admin token refreshed"})
        set_access_cookie(response, "admin_access_token", access)
        if new_refresh:
            _set_refresh_cookie(response, "admin_refresh_token", new_refresh)
        return response


class InterviewerCookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh = request.COOKIES.get("interviewer_refresh_token")
        if not refresh:
            return Response(
                {"detail": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data["access"]
        new_refresh = serializer.validated_data.get("refresh")

        response = Response({"detail": "Interviewer token refreshed"})
        set_access_cookie(response, "interviewer_access_token", access)
        if new_refresh:
            _set_refresh_cookie(response, "interviewer_refresh_token", new_refresh)
        return response