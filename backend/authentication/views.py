"""
Authentication and Profile Views
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .supabase_client import supabase
from .authentication import SupabaseJWTAuthentication
from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    UpdateProfileSerializer,
    UpdatePreferencesSerializer,
    ChangePasswordSerializer,
)


class RegisterUserView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")
        username = data.get("username")

        if not email or not password or not username:
            return Response(
                {"error": "Email, username, and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Register in Supabase Auth
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.user is None:
            return Response(
                {"error": "Supabase sign-up failed.", "detail": str(response)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mirror the user in your local Django DB
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists locally."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user (profile will be auto-created via signal)
        User.objects.create(email=email, username=username)

        return Response(
            {"message": "User created successfully."}, status=status.HTTP_201_CREATED
        )


class LoginUserView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        response = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )

        if response.user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Update last login
        try:
            user = User.objects.get(email=email)
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])
        except User.DoesNotExist:
            pass

        return Response({
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "email": response.user.email,
            }
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """
    GET: Retrieve user profile with all details
    """
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get complete user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """
    PUT/PATCH: Update user profile information
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update user profile"""
        serializer = UpdateProfileSerializer(
            data=request.data, context={"user": request.user}
        )

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        # Update User model fields
        user_fields = ["first_name", "last_name", "username", "phone_number"]
        for field in user_fields:
            if field in validated_data:
                setattr(request.user, field, validated_data[field])
        request.user.save()

        # Update UserProfile fields
        profile_fields = [
            "date_of_birth",
            "bio",
            "street_address",
            "city",
            "state",
            "country",
            "postal_code",
        ]
        profile = request.user.profile
        for field in profile_fields:
            if field in validated_data:
                setattr(profile, field, validated_data[field])
        profile.save()

        # Return updated profile
        user_serializer = UserSerializer(request.user)
        return Response(
            {"message": "Profile updated successfully", "user": user_serializer.data},
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        """Partial update (same as PUT for this case)"""
        return self.put(request)


class UpdatePreferencesView(APIView):
    """
    PUT/PATCH: Update user preferences
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update user preferences"""
        serializer = UpdatePreferencesSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        # Update preferences
        profile = request.user.profile
        for field, value in serializer.validated_data.items():
            setattr(profile, field, value)
        profile.save()

        return Response(
            {
                "message": "Preferences updated successfully",
                "preferences": serializer.validated_data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        """Partial update (same as PUT)"""
        return self.put(request)


class ChangePasswordView(APIView):
    """
    POST: Change user password via Supabase
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Change password"""
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        current_password = serializer.validated_data["current_password"]
        new_password = serializer.validated_data["new_password"]

        try:
            # Verify current password by attempting to sign in
            auth_response = supabase.auth.sign_in_with_password(
                {"email": request.user.email, "password": current_password}
            )

            if auth_response.user is None:
                return Response(
                    {"error": "Current password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update password in Supabase
            # Note: This requires the user's session token
            token = request.headers.get("Authorization", "").split(" ")[1]
            update_response = supabase.auth.update_user(
                {"password": new_password}, jwt=token
            )

            if update_response.user:
                return Response(
                    {"message": "Password changed successfully"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Failed to update password"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except Exception as e:
            return Response(
                {"error": f"Failed to change password: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UploadAvatarView(APIView):
    """
    POST: Upload user avatar
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        """Upload avatar"""
        avatar_file = request.FILES.get("avatar")

        if not avatar_file:
            return Response(
                {"error": "No avatar file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
        if avatar_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and GIF are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {"error": "File too large. Maximum size is 5MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # TODO: Upload to Supabase Storage or your preferred storage service
        # For now, we'll just save the URL
        # In production, you would upload the file and get a URL

        # Example: avatar_url = upload_to_storage(avatar_file)
        # For now, return placeholder

        return Response(
            {
                "message": "Avatar upload endpoint ready",
                "note": "Implement Supabase Storage integration here",
            },
            status=status.HTTP_200_OK,
        )


class DeleteAccountView(APIView):
    """
    DELETE: Delete user account
    """

    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """Delete account (soft delete)"""
        password = request.data.get("password")

        if not password:
            return Response(
                {"error": "Password is required to delete account"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify password
        try:
            auth_response = supabase.auth.sign_in_with_password(
                {"email": request.user.email, "password": password}
            )

            if auth_response.user is None:
                return Response(
                    {"error": "Invalid password"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Soft delete - deactivate account
            request.user.is_active = False
            request.user.save()

            return Response(
                {"message": "Account deactivated successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to delete account: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
