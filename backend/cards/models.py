"""
Cards App — Models
Manages virtual/physical cards, their limits, balances, and per-card transactions.
"""

import uuid
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from authentication.models import User


class Card(models.Model):

    CARD_TYPES = [
        ("VISA", "Visa"),
        ("MASTERCARD", "Mastercard"),
        ("VERVE", "Verve"),
    ]

    CARD_STATUS = [
        ("ACTIVE", "Active"),
        ("FROZEN", "Frozen"),      # user-initiated temporary block
        ("BLOCKED", "Blocked"),    # admin/system hard block
        ("EXPIRED", "Expired"),
        ("PENDING", "Pending"),    # card requested, not yet issued
    ]

    CARD_CATEGORY = [
        ("VIRTUAL", "Virtual"),
        ("PHYSICAL", "Physical"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cards",
    )

    # ── Card identity ─────────────────────────────────────────────────────────
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    card_category = models.CharField(max_length=20, choices=CARD_CATEGORY, default="VIRTUAL")
    last_four = models.CharField(max_length=4)
    holder_name = models.CharField(max_length=100)
    expiry_month = models.PositiveSmallIntegerField()   # 1-12
    expiry_year = models.PositiveSmallIntegerField()    # 4-digit e.g. 2027

    # ── Financial ─────────────────────────────────────────────────────────────
    balance = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    credit_limit = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=Decimal("0.00"),
    )
    cashback_balance = models.DecimalField(
        max_digits=12, decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # ── UI preferences (stored so frontend stays consistent) ──────────────────
    color_gradient = models.CharField(
        max_length=120, blank=True,
        default="from-blue-600 to-blue-800",
        help_text="Tailwind gradient classes e.g. 'from-blue-600 to-blue-800'",
    )
    accent_color = models.CharField(
        max_length=7, blank=True, default="#3b82f6",
        help_text="Hex accent colour for the card e.g. '#3b82f6'",
    )

    # ── Status ────────────────────────────────────────────────────────────────
    status = models.CharField(max_length=20, choices=CARD_STATUS, default="ACTIVE")
    is_default = models.BooleanField(default=False)

    # ── External reference (from card issuer / gateway) ───────────────────────
    external_card_id = models.CharField(
        max_length=200, null=True, blank=True, db_index=True,
        help_text="Card ID returned by issuer API (Flutterwave, etc.)",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cards"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.card_type} **** {self.last_four} — {self.user.email}"

    # ── Computed helpers ──────────────────────────────────────────────────────
    @property
    def expiry_display(self) -> str:
        """Returns 'MM/YY' string used in the frontend card display."""
        return f"{self.expiry_month:02d}/{str(self.expiry_year)[-2:]}"

    @property
    def available_credit(self) -> Decimal:
        return max(self.credit_limit - self.balance, Decimal("0.00"))

    @property
    def is_expired(self) -> bool:
        now = timezone.now()
        return (self.expiry_year, self.expiry_month) < (now.year, now.month)

    # ── Status helpers ────────────────────────────────────────────────────────
    def freeze(self):
        self.status = "FROZEN"
        self.save(update_fields=["status", "updated_at"])

    def unfreeze(self):
        self.status = "ACTIVE"
        self.save(update_fields=["status", "updated_at"])

    def block(self):
        self.status = "BLOCKED"
        self.save(update_fields=["status", "updated_at"])


class CardTransaction(models.Model):

    CATEGORY_CHOICES = [
        ("SHOPPING", "Shopping"),
        ("FOOD_DINING", "Food & Dining"),
        ("ENTERTAINMENT", "Entertainment"),
        ("UTILITIES", "Utilities"),
        ("TRAVEL", "Travel"),
        ("HEALTH", "Health"),
        ("INCOME", "Income"),
        ("TRANSFER", "Transfer"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
        ("REVERSED", "Reversed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    card = models.ForeignKey(
        Card,
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    # ── Transaction detail ────────────────────────────────────────────────────
    merchant = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="OTHER")
    merchant_icon = models.CharField(
        max_length=10, blank=True,
        help_text="Emoji or icon identifier shown in the frontend",
    )

    # Positive = credit (income/refund), Negative = debit (spend)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NGN")

    balance_before = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    reference = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)

    # ── Cross-app links ───────────────────────────────────────────────────────
    # Nullable: not every card transaction comes from a tracked payment gateway event
    payment_transaction = models.OneToOneField(
        "payments.PaymentTransaction",
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="card_transaction",
    )

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "card_transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["card", "-created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["reference"]),
        ]

    def __str__(self):
        direction = "+" if self.amount >= 0 else "-"
        return f"{self.card} | {self.merchant} | {direction}₦{abs(self.amount)}"