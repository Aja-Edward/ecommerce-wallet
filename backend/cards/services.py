"""
Cards App — Service Layer
All business logic lives here, keeping views thin and testable.
"""

import uuid
from decimal import Decimal

from django.db import transaction

from .models import Card, CardTransaction


class CardService:

    @staticmethod
    def get_user_cards(user):
        return Card.objects.filter(user=user).order_by("-created_at")

    @staticmethod
    def get_card_stats(user) -> dict:
        """
        Aggregates the 4 stats shown in the frontend stats row:
        Total Limit, Used Credit, Available, Cashback.
        """
        cards = Card.objects.filter(user=user, status="ACTIVE")
        total_limit = sum(c.credit_limit for c in cards)
        used_credit = sum(c.balance for c in cards)
        cashback = sum(c.cashback_balance for c in cards)
        return {
            "total_limit": total_limit,
            "used_credit": used_credit,
            "available": total_limit - used_credit,
            "cashback": cashback,
        }

    @staticmethod
    @transaction.atomic
    def create_card(user, validated_data: dict) -> Card:
        """
        Creates a new card for a user.
        In production you'd call your card issuer API here
        and populate last_four, expiry, etc. from their response.
        For now we set placeholder values that get updated on provisioning.
        """
        # Ensure only one default card
        if validated_data.get("is_default"):
            Card.objects.filter(user=user, is_default=True).update(is_default=False)

        card = Card.objects.create(
            user=user,
            status="PENDING",           # moves to ACTIVE after issuer confirms
            last_four="0000",           # placeholder — updated after provisioning
            expiry_month=12,            # placeholder
            expiry_year=2099,           # placeholder
            **validated_data,
        )
        return card

    @staticmethod
    @transaction.atomic
    def record_transaction(
        card: Card,
        merchant: str,
        amount: Decimal,
        category: str = "OTHER",
        merchant_icon: str = "",
        description: str = "",
        reference: str = None,
        payment_transaction=None,
        metadata: dict = None,
    ) -> CardTransaction:
        """
        Records a debit or credit on a card and updates its balance.
        Always call this instead of manually touching card.balance.
        """
        balance_before = card.balance
        balance_after = balance_before + amount

        if balance_after < Decimal("0.00"):
            raise ValueError("Insufficient card balance.")

        txn = CardTransaction.objects.create(
            card=card,
            merchant=merchant,
            amount=amount,
            category=category,
            merchant_icon=merchant_icon,
            description=description,
            reference=reference or f"CARD-{uuid.uuid4().hex[:12].upper()}",
            balance_before=balance_before,
            balance_after=balance_after,
            status="COMPLETED",
            payment_transaction=payment_transaction,
            metadata=metadata or {},
        )

        card.balance = balance_after
        card.save(update_fields=["balance", "updated_at"])

        return txn

    @staticmethod
    @transaction.atomic
    def set_default_card(user, card: Card) -> Card:
        Card.objects.filter(user=user, is_default=True).update(is_default=False)
        card.is_default = True
        card.save(update_fields=["is_default", "updated_at"])
        return card