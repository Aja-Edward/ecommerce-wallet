"""
Wallet Services
Business logic for wallet operations (credit, debit, transactions)
"""
from django.db import transaction, DatabaseError
from django.core.exceptions import ValidationError
from decimal import Decimal
from typing import Optional, Dict, Any
import uuid
from .models import Wallet, WalletTransaction


class WalletService:
    """
    Core wallet operations service
    Handles all wallet credit and debit logic with proper transaction management
    """

    @staticmethod
    def get_or_create_wallet(user) -> Wallet:
        """
        Get or create a wallet for a user

        Args:
            user: User object

        Returns:
            Wallet object
        """
        wallet, created = Wallet.objects.get_or_create(user=user)
        return wallet

    @staticmethod
    def generate_transaction_reference(prefix: str = "TXN") -> str:
        """
        Generate unique transaction reference

        Args:
            prefix: Prefix for the reference (default: 'TXN')

        Returns:
            Unique transaction reference string
        """
        return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    @transaction.atomic
    def credit_wallet(
        user,
        amount: Decimal,
        source: str = "FUNDING",
        description: str = "",
        reference: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> WalletTransaction:
        """
        Credit a user's wallet
        
        Args:
            user: User object
            amount: Decimal amount to credit
            source: Transaction source (FUNDING, REFUND, etc.)
            description: Transaction description
            reference: Optional custom reference
            metadata: Additional transaction data
            
        Returns:
            WalletTransaction object
            
        Raises:
            ValidationError: If validation fails
            DatabaseError: If database operation fails
        """
        try:
            amount = Decimal(str(amount))

            if amount <= 0:
                raise ValidationError("Credit amount must be positive")

            # Get or create wallet with row-level lock
            # FIX: Use get_or_create first, then lock
            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

            # Generate reference if not provided
            if not reference:
                reference = WalletService.generate_transaction_reference('CREDIT')

            # Check if reference already exists
            if WalletTransaction.objects.filter(reference=reference).exists():
                raise ValidationError(f"Transaction reference {reference} already exists")

            # Record balance before transaction
            balance_before = wallet.balance
            balance_after = balance_before + amount

            # Create transaction record
            wallet_transaction = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='CREDIT',
                amount=amount,
                balance_before=balance_before,
                balance_after=balance_after,
                status='COMPLETED',
                source=source,
                reference=reference,
                description=description or f"Wallet credited with ₦{amount}",
                metadata=metadata or {}
            )

            # Update wallet balance
            wallet.balance = balance_after
            wallet.save(update_fields=['balance', 'updated_at'])

            return wallet_transaction

        except DatabaseError as e:
            raise DatabaseError(f"Database error during credit operation: {str(e)}")
        except Exception as e:
            raise ValidationError(f"Error during credit operation: {str(e)}")

    @staticmethod
    @transaction.atomic
    def debit_wallet(
        user,
        amount: Decimal,
        source: str = "ORDER_PAYMENT",
        description: str = "",
        reference: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> WalletTransaction:
        """
        Debit a user's wallet
        
        Args:
            user: User object
            amount: Decimal amount to debit
            source: Transaction source (ORDER_PAYMENT, etc.)
            description: Transaction description
            reference: Optional custom reference
            metadata: Additional transaction data
            
        Returns:
            WalletTransaction object
            
        Raises:
            ValidationError: If validation fails or insufficient balance
            DatabaseError: If database operation fails
        """
        try:
            amount = Decimal(str(amount))

            if amount <= 0:
                raise ValidationError("Debit amount must be positive")

            # Get or create wallet with row-level lock
            # FIX: Use get_or_create first, then lock
            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

            # Check sufficient balance
            if wallet.balance < amount:
                raise ValidationError(
                    f"Insufficient balance. Available: ₦{wallet.balance}, Required: ₦{amount}"
                )

            # Generate reference if not provided
            if not reference:
                reference = WalletService.generate_transaction_reference('DEBIT')

            # Check if reference already exists
            if WalletTransaction.objects.filter(reference=reference).exists():
                raise ValidationError(f"Transaction reference {reference} already exists")

            # Record balance before transaction
            balance_before = wallet.balance
            balance_after = balance_before - amount

            # Create transaction record
            wallet_transaction = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='DEBIT',
                amount=amount,
                balance_before=balance_before,
                balance_after=balance_after,
                status='COMPLETED',
                source=source,
                reference=reference,
                description=description or f"Wallet debited with ₦{amount}",
                metadata=metadata or {}
            )

            # Update wallet balance
            wallet.balance = balance_after
            wallet.save(update_fields=['balance', 'updated_at'])

            return wallet_transaction

        except DatabaseError as e:
            raise DatabaseError(f"Database error during debit operation: {str(e)}")
        except Exception as e:
            raise ValidationError(f"Error during debit operation: {str(e)}")

    @staticmethod
    def get_wallet_balance(user) -> Decimal:
        """
        Get current wallet balance for a user

        Args:
            user: User object

        Returns:
            Decimal balance amount
        """
        try:
            wallet = Wallet.objects.get(user=user)
            return wallet.balance
        except Wallet.DoesNotExist:
            # Auto-create wallet if it doesn't exist
            wallet = WalletService.get_or_create_wallet(user)
            return wallet.balance

    @staticmethod
    def get_transaction_history(user, limit: Optional[int] = None):
        """
        Get transaction history for a user
        
        Args:
            user: User object
            limit: Optional limit on number of transactions
            
        Returns:
            QuerySet of WalletTransaction objects
        """
        try:
            wallet = Wallet.objects.get(user=user)
            transactions = wallet.transactions.all()

            if limit:
                transactions = transactions[:limit]

            return transactions
        except Wallet.DoesNotExist:
            # Return empty queryset if wallet doesn't exist
            return WalletTransaction.objects.none()

    @staticmethod
    def get_transaction_by_reference(reference: str) -> Optional[WalletTransaction]:
        """
        Get a specific transaction by reference

        Args:
            reference: Transaction reference

        Returns:
            WalletTransaction object or None
        """
        try:
            return WalletTransaction.objects.get(reference=reference)
        except WalletTransaction.DoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def reverse_transaction(
        transaction_reference: str, reason: str = ""
    ) -> WalletTransaction:
        """
        Reverse a completed transaction
        
        Args:
            transaction_reference: Original transaction reference
            reason: Reason for reversal
            
        Returns:
            New WalletTransaction object (reversal)
            
        Raises:
            ValidationError: If transaction cannot be reversed
        """
        try:
            # Get original transaction
            original_txn = WalletTransaction.objects.select_for_update().get(
                reference=transaction_reference
            )

            # Validate transaction can be reversed
            if original_txn.status != 'COMPLETED':
                raise ValidationError("Only completed transactions can be reversed")

            # Check if already reversed (check metadata too)
            if original_txn.status == 'REVERSED':
                raise ValidationError("Transaction already reversed")

            # Check if a reversal already exists for this transaction
            if WalletTransaction.objects.filter(
                source="REVERSAL", metadata__original_reference=transaction_reference
            ).exists():
                raise ValidationError("A reversal already exists for this transaction")

            wallet = Wallet.objects.select_for_update().get(pk=original_txn.wallet_id)

            # Determine reversal operation (opposite of original)
            if original_txn.transaction_type == 'CREDIT':
                # Original was credit, so reverse is debit
                reversal_type = 'DEBIT'
                new_balance = wallet.balance - original_txn.amount

                if new_balance < 0:
                    raise ValidationError(
                        f"Insufficient balance to reverse credit transaction. "
                        f"Current balance: ₦{wallet.balance}, Required: ₦{original_txn.amount}"
                    )

            else:
                # Original was debit, so reverse is credit
                reversal_type = 'CREDIT'
                new_balance = wallet.balance + original_txn.amount

            balance_before = wallet.balance

            # Create reversal transaction
            reversal_txn = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type=reversal_type,
                amount=original_txn.amount,
                balance_before=balance_before,
                balance_after=new_balance,
                status="COMPLETED",
                source="REVERSAL",
                reference=WalletService.generate_transaction_reference("REV"),
                description=f"Reversal of {transaction_reference}. Reason: {reason or 'No reason provided'}",
                metadata={
                    "original_reference": transaction_reference,
                    "original_transaction_id": str(original_txn.id),
                    "reversal_reason": reason,
                    "original_amount": str(original_txn.amount),
                    "original_type": original_txn.transaction_type,
                },
            )

            # Update original transaction status and add reversal reference
            original_txn.status = 'REVERSED'
            if not original_txn.metadata:
                original_txn.metadata = {}
            original_txn.metadata["reversed_by"] = reversal_txn.reference
            original_txn.metadata["reversed_at"] = str(reversal_txn.created_at)
            original_txn.save(update_fields=["status", "metadata", "updated_at"])

            # Update wallet balance
            wallet.balance = new_balance
            wallet.save(update_fields=['balance', 'updated_at'])

            return reversal_txn

        except WalletTransaction.DoesNotExist:
            raise ValidationError(f"Transaction {transaction_reference} not found")
        except Wallet.DoesNotExist:
            raise ValidationError("Wallet not found")
        except DatabaseError as e:
            raise DatabaseError(f"Database error during reversal: {str(e)}")
