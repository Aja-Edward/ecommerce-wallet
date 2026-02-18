"""
User and UserProfile Models
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model - Core authentication fields
    """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    # Basic info
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Return full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    @property
    def initials(self):
        """Return user initials"""
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        return self.username[:2].upper()


class UserProfile(models.Model):
    """
    Extended User Profile - Additional information
    One-to-one relationship with User
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile", primary_key=True
    )

    # Personal information
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    # Address information
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True, default="Nigeria")
    postal_code = models.CharField(max_length=20, blank=True)

    # Preferences
    notifications_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    newsletter_subscribed = models.BooleanField(default=True)

    # Localization
    currency = models.CharField(max_length=3, default="NGN")
    language = models.CharField(max_length=10, default="en")
    theme = models.CharField(
        max_length=10,
        choices=[("light", "Light"), ("dark", "Dark"), ("system", "System")],
        default="system",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_profiles"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.email} - Profile"

    @property
    def full_address(self):
        """Return formatted full address"""
        address_parts = [
            self.street_address,
            self.city,
            self.state,
            self.country,
            self.postal_code,
        ]
        return ", ".join(filter(None, address_parts))

    @property
    def is_complete(self):
        """Check if profile is complete"""
        required_fields = [
            self.user.first_name,
            self.user.last_name,
            self.user.phone_number,
            self.street_address,
            self.city,
            self.state,
        ]
        return all(required_fields)
