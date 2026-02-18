"""
Wallet Models
- Wallet: Stores user wallet balance
- WalletTransaction: Records all wallet debits and credits
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from authentication.models import User


class Wallet(models.Model):
    """
    User Wallet Model
    One wallet per user, stores current balance
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='wallet',
        primary_key=True
    )
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'

    def __str__(self):
        return f"{self.user.email} - Balance: ₦{self.balance}"


class WalletTransaction(models.Model):
    """
    Wallet Transaction Model
    Records every credit/debit operation on a wallet
    """
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
    )

    TRANSACTION_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REVERSED', 'Reversed'),
    )

    TRANSACTION_SOURCES = (
        ('FUNDING', 'Wallet Funding'),
        ('ORDER_PAYMENT', 'Order Payment'),
        ('REFUND', 'Refund'),
        ('REVERSAL', 'Reversal'),
        ('ADMIN_ADJUSTMENT', 'Admin Adjustment'),
    )

    id = models.AutoField(primary_key=True)
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    balance_before = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    balance_after = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS,
        default='PENDING'
    )
    source = models.CharField(
        max_length=50,
        choices=TRANSACTION_SOURCES
    )
    reference = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique transaction reference"
    )
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional transaction data (payment gateway reference, order ID, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallet_transactions'
        verbose_name = 'Wallet Transaction'
        verbose_name_plural = 'Wallet Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['wallet', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['reference']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - ₦{self.amount} - {self.wallet.user.email}"