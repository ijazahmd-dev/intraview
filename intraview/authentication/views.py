
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import logging
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .serializers import SignupSerializer,LoginSerializer,GoogleLoginSerializer
from .services.otp_service import OTPService
from .tasks import send_otp_task
from .services.temp_signup_service import TempSignupService
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny
from authentication.services.password_reset_service import PasswordResetService
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport.requests import Request
from django.core.cache import cache

User = get_user_model()







##############################################        SignUp View        #######################################################



logger = logging.getLogger(__name__)

class SignupView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email'].lower().strip()
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            if not OTPService.can_send_otp(email):
                return Response(
                    {"error": "OTP request limit exceeded. Please try again later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            try:
                TempSignupService.store_temp_user(
                    email=email,
                    username=username,
                    password=password
                )

                otp = OTPService.generate_otp()
                OTPService.store_otp(email, otp)

                send_otp_task.delay(email, otp)
            
                return Response(
                    {"message": "Signup successful. OTP sent to email."},
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                logger.error(f"Error during signup process: {e}")
                return Response(
                    {"error": "Internal server error. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class VerifyOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")


        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=400)
        
        email = email.lower().strip()

       
        if not OTPService.verify_otp(email,otp):
            return Response(
                {"error": "Invalid or expired OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        temp_user = TempSignupService.get_temp_user(email)
        if not temp_user:
            return Response(
                {"error": "Signup session expired. Please sign up again."},
                status=400
            )
        
        user = User.objects.create_user(
            username=temp_user['username'],
            email=temp_user["email"],
            password=temp_user["password"],
            role="user",
            is_email_verified=True,
            auth_provider="email"
        )

        TempSignupService.delete_temp_user(email)

        return Response(
            {"message": "Email verified. Account created successfully!"},
            status=200
        )


        
    
class ResendOtpView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "No such user"}, status=status.HTTP_400_BAD_REQUEST)
        
        email = email.lower().strip()

        if not TempSignupService.get_temp_user(email):
            return Response(
                {"error": "No active signup session found. Please start again."},
                status=400
            )


        if not OTPService.can_send_otp(email):  # Make sure rate limit applies
            return Response({"error": "OTP resend limit reached, try later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        otp = OTPService.generate_otp()
        OTPService.store_otp(email, otp)
        send_otp_task.delay(email, otp)
        return Response({"message": "OTP resent to email."}, status=status.HTTP_200_OK)




##############################################        Login View        #######################################################



class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response({
            "message": "Login successful",
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        })

        # Set cookies
        response.set_cookie(
            key="access_token",
            value=str(access),
            httponly=True,
            secure=False,  # True in production
            samesite="Lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response
    



class LogoutView(APIView):

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response({"message": "Logged out successfully"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
    



##############################################        Forgot password View        #######################################################



class RequestPasswordResetView(APIView):
    def post(self, request):
        email = request.data.get("email", "").lower().strip()

        # Do NOT reveal if user exists (security best practice)
        user_exists = User.objects.filter(email=email).exists()

        if not user_exists:
            return Response({"message": "If this email exists, OTP has been sent."})

        if not OTPService.can_send_otp(email):
            return Response(
                {"error": "OTP request limit exceeded. Try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        otp = OTPService.generate_otp()
        OTPService.store_otp(email, otp)
        send_otp_task.delay(email, otp)

        return Response({"message": "OTP sent to email."})



class VerifyResetOTPView(APIView):
    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        otp = request.data.get("otp", "")

        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=400)

        if not OTPService.verify_otp(email, otp):
            return Response(
                {"error": "Invalid or expired OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create secure temporary password reset token
        reset_token = PasswordResetService.create_reset_session(email)

        return Response({
            "message": "OTP verified successfully.",
            "reset_token": reset_token,
        })
    



class ResendResetOTPView(APIView):
    def post(self, request):
        email = request.data.get("email", "").lower().strip()

        if not email:
            return Response({"error": "Email is required."}, status=400)

        # Check if an OTP already exists for this email
        cache_key = f"otp:{email}"
        if cache.get(cache_key) is None:
            return Response(
                {"error": "No active reset request found. Please start again."},
                status=400
            )

        # Rate limit protection
        if not OTPService.can_send_otp(email):
            return Response(
                {"error": "OTP request limit exceeded. Try again later."},
                status=429
            )

        # Generate and store new OTP
        otp = OTPService.generate_otp()
        OTPService.store_otp(email, otp)
        send_otp_task.delay(email, otp)

        return Response({"message": "OTP resent successfully."})

    



class ResetPasswordView(APIView):
    def post(self, request):
        reset_token = request.data.get("reset_token")
        new_password = request.data.get("new_password")

        if not reset_token or not new_password:
            return Response(
                {"error": "Reset token and new password are required."},
                status=400
            )

        # Verify token
        email = PasswordResetService.get_email_from_token(reset_token)

        if not email:
            return Response(
                {"error": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            if len(new_password) < 8:
                return Response(
                    {"error": "Password must be at least 8 characters"},
                    status=400
                )

            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response(
                    {"error": list(e.messages)},
                    status=400
                )


            user.set_password(new_password)
            user.save()

            # delete token after success
            PasswordResetService.delete_reset_token(reset_token)

            return Response({"message": "Password reset successfully."})

        except User.DoesNotExist:
            return Response(
                {"error": "Something went wrong. Try again."},
                status=400
            )
        



##############################################        Google login View        #######################################################



class GoogleLoginView(APIView):
    authentication_classes = []   # allow anonymous
    permission_classes = []       # allow anonymous

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["id_token"]

        try:
            # Verify Google identity token
            id_info = id_token.verify_oauth2_token(
                token,
                Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Security checks 
            if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                return Response({"error": "Invalid issuer"}, status=400)

            if id_info["aud"] != settings.GOOGLE_CLIENT_ID:
                return Response({"error": "Invalid audience"}, status=400)

            email = id_info["email"]
            google_id = id_info["sub"]
            name = id_info.get("name", "")

        except Exception:
            return Response({"error": "Invalid or expired Google token"}, status=400)



        # 1. Check if user already linked by Google ID
        try:
            user = User.objects.get(social_auth_id=google_id)

        except User.DoesNotExist:
            # 2. Check if email exists (link Google with existing account)
            try:
                user = User.objects.get(email=email)
                user.social_auth_id = google_id
                user.auth_provider = "google"
                user.is_email_verified = True
                user.save()

            except User.DoesNotExist:
                # 3. Create new Google user
                username = (
                    name.replace(" ", "_").lower()
                    if name else email.split("@")[0]
                )[:150]

                user = User.objects.create(
                    username=username,
                    email=email,
                    social_auth_id=google_id,
                    auth_provider="google",
                    is_email_verified=True,
                    role="user",
                )


        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        secure_cookie = not settings.DEBUG  # True in production

        response = Response({
            "message": "Google login successful",
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        })

        # Set HttpOnly cookies
        response.set_cookie(
            "access_token",
            str(access),
            httponly=True,
            secure=secure_cookie,
            samesite="Lax",
        )

        response.set_cookie(
            "refresh_token",
            str(refresh),
            httponly=True,
            secure=secure_cookie,
            samesite="Lax",
        )

        return response
    



##############################################        Home View        #######################################################






class MeView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role
        })