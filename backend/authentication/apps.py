"""
Authentication App Configuration
"""

from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "authentication"
    verbose_name = "Authentication & User Management"

    def ready(self):
        """Import signals when app is ready"""
        import authentication.signals
