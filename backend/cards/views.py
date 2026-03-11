"""
Cards App — Views
All views use DRF generic class-based views / ViewSets.
Authentication is enforced globally via DEFAULT_PERMISSION_CLASSES.
"""

from decimal import Decimal

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import (
    ListModelMixin,
    RetrieveModelMixin,
    CreateModelMixin,
    UpdateModelMixin,
)

from .filters import CardFilter, CardTransactionFilter
from .models import Card, CardTransaction
from .serializers import (
    CardCreateSerializer,
    CardSerializer,
    CardStatsSerializer,
    CardStatusUpdateSerializer,
    CardTransactionSerializer,
    CardUpdateSerializer,
)
from .services import CardService


# ── Cards ViewSet ──────────────────────────────────────────────────────────────

class CardViewSet(
    ListModelMixin,
    RetrieveModelMixin,
    CreateModelMixin,
    UpdateModelMixin,
    GenericViewSet,
):
    """
    Endpoints:
        GET    /api/cards/                  → list user's cards
        POST   /api/cards/                  → request a new card
        GET    /api/cards/{id}/             → card detail
        PATCH  /api/cards/{id}/             → update cosmetic fields
        POST   /api/cards/{id}/freeze/      → freeze card
        POST   /api/cards/{id}/unfreeze/    → unfreeze card
        POST   /api/cards/{id}/block/       → block card (irreversible)
        POST   /api/cards/{id}/set-default/ → make this the default card
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CardFilter
    search_fields = ["last_four", "holder_name"]
    ordering_fields = ["created_at", "balance"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return CardCreateSerializer
        if self.action in ("update", "partial_update"):
            return CardUpdateSerializer
        if self.action == "status_action":
            return CardStatusUpdateSerializer
        return CardSerializer

    def perform_create(self, serializer):
        CardService.create_card(
            user=self.request.user,
            validated_data=serializer.validated_data,
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True    # always treat as PATCH
        return super().update(request, *args, **kwargs)

    # ── Custom actions ─────────────────────────────────────────────────────────

    @action(detail=True, methods=["post"], url_path="freeze")
    def freeze(self, request, pk=None):
        card = self.get_object()
        if card.status != "ACTIVE":
            return Response(
                {"detail": f"Cannot freeze a card with status '{card.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        card.freeze()
        return Response(CardSerializer(card).data)

    @action(detail=True, methods=["post"], url_path="unfreeze")
    def unfreeze(self, request, pk=None):
        card = self.get_object()
        if card.status != "FROZEN":
            return Response(
                {"detail": "Only frozen cards can be unfrozen."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        card.unfreeze()
        return Response(CardSerializer(card).data)

    @action(detail=True, methods=["post"], url_path="block")
    def block(self, request, pk=None):
        card = self.get_object()
        if card.status == "BLOCKED":
            return Response(
                {"detail": "Card is already blocked."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        card.block()
        return Response(CardSerializer(card).data)

    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        card = self.get_object()
        updated = CardService.set_default_card(user=request.user, card=card)
        return Response(CardSerializer(updated).data)


# ── Card Stats View ────────────────────────────────────────────────────────────

class CardStatsView(APIView):
    """
    GET /api/cards/stats/
    Returns the aggregated stats row shown above the cards grid:
    total_limit, used_credit, available, cashback.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = CardService.get_card_stats(user=request.user)
        serializer = CardStatsSerializer(stats)
        return Response(serializer.data)


# ── Card Transactions ──────────────────────────────────────────────────────────

class CardTransactionListView(generics.ListAPIView):
    """
    GET /api/cards/transactions/
    Lists all card transactions for the authenticated user.
    Supports filtering by card, category, direction, date range, etc.

    Mirrors the "Recent Card Activity" section in the frontend, including
    the "All Cards / **** XXXX" dropdown filter.
    """

    serializer_class = CardTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CardTransactionFilter
    search_fields = ["merchant", "reference"]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return CardTransaction.objects.filter(
            card__user=self.request.user
        ).select_related("card")


class CardTransactionDetailView(generics.RetrieveAPIView):
    """
    GET /api/cards/transactions/{id}/
    """

    serializer_class = CardTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CardTransaction.objects.filter(card__user=self.request.user)