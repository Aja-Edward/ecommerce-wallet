"""
Cards App — Serializers
"""

from rest_framework import serializers

from .models import Card, CardTransaction


# ── Card Serializers ───────────────────────────────────────────────────────────

class CardSerializer(serializers.ModelSerializer):
    """
    Full card serializer.
    Returns all fields needed by the CardsPage frontend including
    computed helpers (expiry_display, available_credit).
    """
    expiry_display = serializers.ReadOnlyField()
    available_credit = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Card
        fields = [
            "id",
            "card_type",
            "card_category",
            "last_four",
            "holder_name",
            "expiry_month",
            "expiry_year",
            "expiry_display",       # "MM/YY"
            "balance",
            "credit_limit",
            "available_credit",     # computed
            "cashback_balance",
            "color_gradient",
            "accent_color",
            "status",
            "is_default",
            "is_expired",           # computed
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "balance", "cashback_balance"]


class CardCreateSerializer(serializers.ModelSerializer):
    """
    Used when a user requests a new card.
    The user only provides basic preferences; sensitive fields are
    set by the system / card issuer after provisioning.
    """
    class Meta:
        model = Card
        fields = [
            "card_type",
            "card_category",
            "holder_name",
            "color_gradient",
            "accent_color",
        ]

    def validate_holder_name(self, value: str) -> str:
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Holder name is too short.")
        return value.upper()


class CardStatusUpdateSerializer(serializers.Serializer):
    """For freeze / unfreeze / block actions."""
    ACTION_CHOICES = ["freeze", "unfreeze", "block"]
    action = serializers.ChoiceField(choices=ACTION_CHOICES)


class CardUpdateSerializer(serializers.ModelSerializer):
    """Allows user to update only cosmetic / preference fields."""
    class Meta:
        model = Card
        fields = ["holder_name", "color_gradient", "accent_color", "is_default"]


# ── Card Stats Serializer (for the 4-box stats row in the frontend) ────────────

class CardStatsSerializer(serializers.Serializer):
    total_limit = serializers.DecimalField(max_digits=12, decimal_places=2)
    used_credit = serializers.DecimalField(max_digits=12, decimal_places=2)
    available = serializers.DecimalField(max_digits=12, decimal_places=2)
    cashback = serializers.DecimalField(max_digits=12, decimal_places=2)


# ── Card Transaction Serializers ───────────────────────────────────────────────

class CardTransactionSerializer(serializers.ModelSerializer):
    """
    Full read serializer for a card transaction.
    Mirrors the shape expected by RECENT_CARD_TRANSACTIONS in the frontend.
    """
    card_last_four = serializers.CharField(source="card.last_four", read_only=True)
    is_credit = serializers.SerializerMethodField()

    class Meta:
        model = CardTransaction
        fields = [
            "id",
            "card",
            "card_last_four",
            "merchant",
            "category",
            "merchant_icon",
            "amount",
            "currency",
            "balance_before",
            "balance_after",
            "status",
            "reference",
            "description",
            "is_credit",
            "created_at",
        ]
        read_only_fields = fields  # transactions are system-created only

    def get_is_credit(self, obj: CardTransaction) -> bool:
        return obj.amount >= 0


class CardTransactionCreateSerializer(serializers.ModelSerializer):
    """
    Internal / admin serializer for recording a new card transaction.
    Not exposed directly to end-users via the public API.
    """
    class Meta:
        model = CardTransaction
        fields = [
            "card",
            "merchant",
            "category",
            "merchant_icon",
            "amount",
            "currency",
            "reference",
            "description",
            "payment_transaction",
            "metadata",
        ]

    def validate_amount(self, value):
        if value == 0:
            raise serializers.ValidationError("Transaction amount cannot be zero.")
        return value

    def validate(self, data):
        card = data.get("card")
        if card and card.status != "ACTIVE":
            raise serializers.ValidationError(
                {"card": f"Cannot transact on a card with status '{card.status}'."}
            )
        return data