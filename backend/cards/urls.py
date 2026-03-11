"""
Cards App — URL Configuration

Include in your root urls.py:
    path("api/cards/", include("cards.urls")),
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CardViewSet,
    CardStatsView,
    CardTransactionListView,
    CardTransactionDetailView,
)

router = DefaultRouter()
router.register(r"", CardViewSet, basename="card")

urlpatterns = [
    # ── Aggregated stats ────────────────────────────────────────────────────
    # GET /api/cards/stats/
    path("stats/", CardStatsView.as_view(), name="card-stats"),

    # ── Transactions ────────────────────────────────────────────────────────
    # GET /api/cards/transactions/
    # GET /api/cards/transactions/{id}/
    path("transactions/", CardTransactionListView.as_view(), name="card-transaction-list"),
    path("transactions/<uuid:pk>/", CardTransactionDetailView.as_view(), name="card-transaction-detail"),

    # ── Card CRUD + custom actions (router handles these) ───────────────────
    # GET    /api/cards/
    # POST   /api/cards/
    # GET    /api/cards/{id}/
    # PATCH  /api/cards/{id}/
    # POST   /api/cards/{id}/freeze/
    # POST   /api/cards/{id}/unfreeze/
    # POST   /api/cards/{id}/block/
    # POST   /api/cards/{id}/set-default/
    path("", include(router.urls)),
]