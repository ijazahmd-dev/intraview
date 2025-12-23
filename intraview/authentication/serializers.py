from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.contrib.auth import authenticate

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value
    



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email").lower().strip()
        password = attrs.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_email_verified:
            raise serializers.ValidationError("Email not verified")

        attrs["user"] = user
        return attrs
        




class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()






class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email").lower().strip()
        password = attrs.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if user.role != "admin":
            raise serializers.ValidationError("Access denied. Admins only.")

        if not user.is_active:
            raise serializers.ValidationError("This account is blocked.")

        attrs["user"] = user
        return attrs






class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Lightweight list view for the admin user table.
    """
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_email_verified",
            "date_joined",
            "last_login",
        ]
        read_only_fields = fields


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed view + editable fields for admin.
    Email & auth_provider are read-only (safer).
    """
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_email_verified",
            "first_name",
            "last_name",
            "profile_picture_url",
            "auth_provider",
            "date_joined",
            "last_login",
        ]
        read_only_fields = (
            "id",
            "email",
            "auth_provider",
            "date_joined",
            "last_login",
        )

    def validate_role(self, value):
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role.")
        return value
    



class InterviewerLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)