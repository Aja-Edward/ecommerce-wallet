# authentication/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .supabase_client import supabase


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            # Use Supabase's built-in token verification
            user_response = supabase.auth.get_user(token)

            if not user_response or not user_response.user:
                raise AuthenticationFailed("Invalid token.")

            email = user_response.user.email

            # Get the Django user
            from .models import User

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise AuthenticationFailed("User not found in local database.")

            return (user, token)

        except Exception as e:
            raise AuthenticationFailed(f"Token verification failed: {str(e)}")
