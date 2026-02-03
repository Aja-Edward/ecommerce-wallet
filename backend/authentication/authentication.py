import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,  # FIXED: use the JWT secret, not the anon key
                algorithms=["HS256"],
                options={"verify_aud": False}  # Supabase tokens have an audience claim; skip if not needed
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        from .models import User
        try:
            user = User.objects.get(email=payload["email"])
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        return (user, token)