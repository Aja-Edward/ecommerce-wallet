"""
Authentication and Profile URL Configuration
"""

from django.urls import path
from .views import (
    RegisterUserView,
    LoginUserView,
    ProfileView,
    UpdateProfileView,
    UpdatePreferencesView,
    ChangePasswordView,
    UploadAvatarView,
    DeleteAccountView,
)

app_name = "authentication"

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterUserView.as_view(), name="register"),
    path("login/", LoginUserView.as_view(), name="login"),
    # Profile endpoints
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", UpdateProfileView.as_view(), name="update-profile"),
    path(
        "profile/preferences/",
        UpdatePreferencesView.as_view(),
        name="update-preferences",
    ),
    path("profile/avatar/", UploadAvatarView.as_view(), name="upload-avatar"),
    # Security endpoints
    path("password/change/", ChangePasswordView.as_view(), name="change-password"),
    path("account/delete/", DeleteAccountView.as_view(), name="delete-account"),
]
