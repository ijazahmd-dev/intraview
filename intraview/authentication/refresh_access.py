from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .utils import set_access_cookie


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

        response = Response({"detail": "Token refreshed"})
        return set_access_cookie(response, "access_token", access)




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

        response = Response({"detail": "Admin token refreshed"})
        return set_access_cookie(response, "admin_access_token", access)
    




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

        response = Response({"detail": "Interviewer token refreshed"})
        return set_access_cookie(response, "interviewer_access_token", access)