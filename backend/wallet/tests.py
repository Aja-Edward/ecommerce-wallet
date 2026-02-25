"""
Wallet Service Tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.core.exceptions import ValidationError

from .services import WalletService
from .models import Wallet, WalletTransaction

User = get_user_model()


class WalletServiceTestCase(TestCase):

    def setUp(self):
        """Set up test user"""
        self.user = User.objects.create_user(
            email="test@example.com", username="testuser"
        )

    def test_get_or_create_wallet(self):
        """Test wallet creation"""
        wallet = WalletService.get_or_create_wallet(self.user)
        self.assertIsNotNone(wallet)
        self.assertEqual(wallet.balance, Decimal("0.00"))

    def test_credit_wallet(self):
        """Test crediting wallet"""
        txn = WalletService.credit_wallet(
            user=self.user,
            amount=Decimal("1000.00"),
            source="FUNDING",
            description="Test credit",
        )

        self.assertEqual(txn.transaction_type, "CREDIT")
        self.assertEqual(txn.amount, Decimal("1000.00"))
        self.assertEqual(txn.status, "COMPLETED")

        # Check wallet balance updated
        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("1000.00"))

    def test_debit_wallet_success(self):
        """Test debiting wallet with sufficient balance"""
        # First credit
        WalletService.credit_wallet(self.user, Decimal("1000.00"))

        # Then debit
        txn = WalletService.debit_wallet(
            user=self.user, amount=Decimal("500.00"), source="ORDER_PAYMENT"
        )

        self.assertEqual(txn.transaction_type, "DEBIT")
        self.assertEqual(txn.amount, Decimal("500.00"))

        # Check balance
        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("500.00"))

    def test_debit_wallet_insufficient_balance(self):
        """Test debiting with insufficient balance"""
        WalletService.credit_wallet(self.user, Decimal("100.00"))

        with self.assertRaises(ValidationError) as context:
            WalletService.debit_wallet(self.user, Decimal("200.00"))

        self.assertIn("Insufficient balance", str(context.exception))

    def test_reverse_credit_transaction(self):
        """Test reversing a credit transaction"""
        # Credit wallet
        original_txn = WalletService.credit_wallet(self.user, Decimal("1000.00"))

        # Reverse it
        reversal = WalletService.reverse_transaction(
            original_txn.reference, reason="Test reversal"
        )

        self.assertEqual(reversal.transaction_type, "DEBIT")
        self.assertEqual(reversal.amount, Decimal("1000.00"))

        # Check balance is back to zero
        wallet = Wallet.objects.get(user=self.user)
        self.assertEqual(wallet.balance, Decimal("0.00"))

        # Check original is marked as reversed
        original_txn.refresh_from_db()
        self.assertEqual(original_txn.status, "REVERSED")

    def test_generate_unique_reference(self):
        """Test reference generation is unique"""
        ref1 = WalletService.generate_transaction_reference("TEST")
        ref2 = WalletService.generate_transaction_reference("TEST")

        self.assertNotEqual(ref1, ref2)
        self.assertTrue(ref1.startswith("TEST-"))
