from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.contrib.auth import authenticate

User = get_user_model()


import re

class SignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    agree_terms = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password", "agree_terms"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_username(self, value):
        value = value.strip()
        
        if len(value) < 3 or len(value) > 30:
            raise serializers.ValidationError("Username must be between 3 and 30 characters.")
        
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
            
        if value[0].isdigit():
            raise serializers.ValidationError("Username cannot start with a number.")
            
        if value.isdigit():
            raise serializers.ValidationError("Username cannot consist only of numbers.")
            
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists.")
            
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        
        # Robust email regex
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
            
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
            
        return value

    def validate_password(self, value):
        if len(value) < 8 or len(value) > 128:
            raise serializers.ValidationError("Password must be between 8 and 128 characters.")
            
        if ' ' in value:
            raise serializers.ValidationError("Password cannot contain spaces.")
            
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
            
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
            
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
            
        special_chars = r"""!@#$%^&*()_+-=[]{};:'"\|,.<>/?"""
        if not any(char in special_chars for char in value):
            raise serializers.ValidationError("Password must contain at least one special character.")
            
        return value

    def validate_agree_terms(self, value):
        if not value:
            raise serializers.ValidationError("Please accept the Terms and Conditions.")
        return value

    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        if password and username and password.lower() == username.lower():
            raise serializers.ValidationError({"password": "Password cannot be equal to username."})

        if password and email:
            email_prefix = email.split('@')[0].lower()
            if email_prefix in password.lower():
                raise serializers.ValidationError({"password": "Password cannot contain part of your email address."})

        return attrs
    



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