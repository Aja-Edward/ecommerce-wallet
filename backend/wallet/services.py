"""
Wallet Services
Business logic for wallet operations (credit, debit, transactions)
"""
from django.db import transaction, DatabaseError
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid
from .models import Wallet, WalletTransaction


class WalletService:
    """
    Core wallet operations service
    Handles all wallet credit and debit logic with proper transaction management
    """

    @staticmethod
    def get_or_create_wallet(user):
        """
        Get or create a wallet for a user
        """
        wallet, created = Wallet.objects.get_or_create(user=user)
        return wallet

    @staticmethod
    def generate_transaction_reference(prefix='TXN'):
        """Generate unique transaction reference"""
        return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"

    @staticmethod
    @transaction.atomic
    def credit_wallet(
        user,
        amount,
        source='FUNDING',
        description='',
        reference=None,
        metadata=None
    ):
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
            wallet = Wallet.objects.select_for_update().get(user=user)
            
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
            
        except Wallet.DoesNotExist:
            raise ValidationError("Wallet not found for this user")
        except DatabaseError as e:
            raise DatabaseError(f"Database error during credit operation: {str(e)}")

    @staticmethod
    @transaction.atomic
    def debit_wallet(
        user,
        amount,
        source='ORDER_PAYMENT',
        description='',
        reference=None,
        metadata=None
    ):
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

            # Get wallet with row-level lock
            wallet = Wallet.objects.select_for_update().get(user=user)
            
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
            
        except Wallet.DoesNotExist:
            raise ValidationError("Wallet not found for this user")
        except DatabaseError as e:
            raise DatabaseError(f"Database error during debit operation: {str(e)}")

    @staticmethod
    def get_wallet_balance(user):
        """Get current wallet balance for a user"""
        try:
            wallet = Wallet.objects.get(user=user)
            return wallet.balance
        except Wallet.DoesNotExist:
            return Decimal('0.00')

    @staticmethod
    def get_transaction_history(user, limit=None):
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
            return WalletTransaction.objects.none()

    @staticmethod
    def get_transaction_by_reference(reference):
        """Get a specific transaction by reference"""
        try:
            return WalletTransaction.objects.get(reference=reference)
        except WalletTransaction.DoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def reverse_transaction(transaction_reference, reason=''):
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
            
            if original_txn.status == 'REVERSED':
                raise ValidationError("Transaction already reversed")
            
            wallet = Wallet.objects.select_for_update().get(pk=original_txn.wallet_id)
            
            # Determine reversal operation (opposite of original)
            if original_txn.transaction_type == 'CREDIT':
                # Original was credit, so reverse is debit
                reversal_type = 'DEBIT'
                new_balance = wallet.balance - original_txn.amount
                
                if new_balance < 0:
                    raise ValidationError("Insufficient balance to reverse credit transaction")
                    
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
                status='COMPLETED',
                source='REVERSAL',
                reference=WalletService.generate_transaction_reference('REV'),
                description=f"Reversal of {transaction_reference}. Reason: {reason}",
                metadata={
                    'original_reference': transaction_reference,
                    'reversal_reason': reason
                }
            )
            
            # Update original transaction status
            original_txn.status = 'REVERSED'
            original_txn.save(update_fields=['status', 'updated_at'])
            
            # Update wallet balance
            wallet.balance = new_balance
            wallet.save(update_fields=['balance', 'updated_at'])
            
            return reversal_txn
            
        except WalletTransaction.DoesNotExist:
            raise ValidationError(f"Transaction {transaction_reference} not found")
        except Wallet.DoesNotExist:
            raise ValidationError("Wallet not found")