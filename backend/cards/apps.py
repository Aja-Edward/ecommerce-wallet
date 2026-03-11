"""
Cards App — AppConfig
Connects signals when the app is ready.
"""

from django.apps import AppConfig


class CardsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "cards"
    verbose_name = "Cards"

    def ready(self):
        import cards.signals  # noqa: F401 — registers all signal handlers