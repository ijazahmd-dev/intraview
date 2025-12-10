from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets, status, decorators
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from .serializers import AdminUserListSerializer, AdminUserDetailSerializer, AdminLoginSerializer
from .permissions import IsAdminRole
from authentication.authentication import AdminCookieJWTAuthentication

User = get_user_model()


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    /auth/admin/users/      -> list, create? (we won't use POST for now)
    /auth/admin/users/{id}/ -> retrieve, update, delete (soft delete)
    /auth/admin/users/{id}/block/   -> POST: block user
    /auth/admin/users/{id}/unblock/ -> POST: unblock user
    """

    queryset = User.objects.all().order_by("-date_joined")
    authentication_classes = [AdminCookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminRole]

    filter_backends = [OrderingFilter]
    ordering_fields = ["date_joined", "last_login", "email", "username"]
    ordering = ["-date_joined"]

    def get_serializer_class(self):
        if self.action == "list":
            return AdminUserListSerializer
        return AdminUserDetailSerializer

    # --------- FILTERING & SEARCHING ----------

    def get_queryset(self):
        qs = super().get_queryset().filter(is_superuser=False)

        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")

        if role:
            qs = qs.filter(role=role)

        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))

        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        return qs

    # --------- SAFETY: DON'T LET ADMIN MESS THEMSELVES UP ----------

    def update(self, request, *args, **kwargs):
        """
        Prevent an admin from changing their own role away from 'admin'.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        new_role = request.data.get("role")

        if instance == request.user and new_role and new_role != instance.role:
            return Response(
                {"error": "You cannot change your own role."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if instance.role == "admin" and new_role and new_role != "admin":
            admins_count = User.objects.filter(role="admin", is_active=True).count()
            if admins_count <= 1:
                return Response(
                    {"error": "There must be at least one active admin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return super().update(request, *args, partial=partial, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: set is_active = False instead of actually deleting.
        """
        instance = self.get_object()

        if instance == request.user:
            return Response(
                {"error": "You cannot delete (deactivate) yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return Response(
            {"message": "User deactivated (soft delete)."},
            status=status.HTTP_200_OK,
        )

    # --------- CUSTOM ACTIONS: BLOCK / UNBLOCK ----------

    @decorators.action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        user = self.get_object()

        if user == request.user:
            return Response(
                {"error": "You cannot block yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"message": "User blocked."})

    @decorators.action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"message": "User unblocked."})









class AdminLoginView(APIView):
    permission_classes = []  # Allow anyone to attempt login

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        secure_flag = not settings.DEBUG  # secure=True in production

        response = Response({
            "message": "Admin login successful",
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        })

        # Store tokens in cookies
        response.set_cookie(
            key="admin_access_token",
            value=str(access),
            httponly=True,
            secure=secure_flag,
            samesite="Lax",
        )
        response.set_cookie(
            key="admin_refresh_token",
            value=str(refresh),
            httponly=True,
            secure=secure_flag,
            samesite="Lax",
        )

        return response





class AdminLogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("admin_refresh_token")

        # Try blacklist
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        response = Response({"message": "Admin logged out successfully"})

        response.delete_cookie("admin_access_token")
        response.delete_cookie("admin_refresh_token")

        return response
