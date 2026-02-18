"""
User and Profile Serializers
"""
from rest_framework import serializers
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    class Meta:
        model = UserProfile
        fields = [
            'avatar_url',
            'date_of_birth',
            'bio',
            'street_address',
            'city',
            'state',
            'country',
            'postal_code',
            'notifications_enabled',
            'email_notifications',
            'sms_notifications',
            'newsletter_subscribed',
            'currency',
            'language',
            'theme',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    initials = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'phone_number',
            'full_name',
            'initials',
            'is_active',
            'is_verified',
            'email_verified',
            'phone_verified',
            'date_joined',
            'last_login',
            'profile',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_active',
            'is_verified',
            'email_verified',
            'phone_verified',
            'date_joined',
            'last_login',
        ]


class UpdateProfileSerializer(serializers.Serializer):
    """Serializer for updating user profile"""
    # User fields
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    username = serializers.CharField(max_length=150, required=False)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    street_address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_username(self, value):
        """Check if username is unique (excluding current user)"""
        user = self.context.get('user')
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value


class UpdatePreferencesSerializer(serializers.Serializer):
    """Serializer for updating user preferences"""
    notifications_enabled = serializers.BooleanField(required=False)
    email_notifications = serializers.BooleanField(required=False)
    sms_notifications = serializers.BooleanField(required=False)
    newsletter_subscribed = serializers.BooleanField(required=False)
    currency = serializers.CharField(max_length=3, required=False)
    language = serializers.CharField(max_length=10, required=False)
    theme = serializers.ChoiceField(
        choices=['light', 'dark', 'system'],
        required=False
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        """Validate that new passwords match"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        
        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password."
            })
        
        return data