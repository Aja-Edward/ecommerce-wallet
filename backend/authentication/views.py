from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .supabase_client import supabase
from .authentication import SupabaseJWTAuthentication


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
        from .models import User
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists locally."},
                status=status.HTTP_400_BAD_REQUEST
            )

        User.objects.create(email=email, username=username)

        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)


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

        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "email": response.user.email,
            }
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "email": request.user.email,
            "username": request.user.username
        })