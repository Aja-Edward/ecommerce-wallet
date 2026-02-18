"""
Wallet Serializers
DRF serializers for Wallet and WalletTransaction models
"""
from rest_framework import serializers
from .models import Wallet, WalletTransaction


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for Wallet model"""
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'user',
            'email',
            'username',
            'balance',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'balance', 'created_at', 'updated_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Serializer for WalletTransaction model"""
    user_email = serializers.EmailField(source='wallet.user.email', read_only=True)
    
    class Meta:
        model = WalletTransaction
        fields = [
            'id',
            'wallet',
            'user_email',
            'transaction_type',
            'amount',
            'balance_before',
            'balance_after',
            'status',
            'source',
            'reference',
            'description',
            'metadata',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'wallet',
            'balance_before',
            'balance_after',
            'created_at',
            'updated_at'
        ]


class WalletFundingRequestSerializer(serializers.Serializer):
    """Serializer for wallet funding requests"""
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=100.00,  # Minimum funding amount
        error_messages={
            'min_value': 'Minimum funding amount is ₦100.00'
        }
    )
    payment_method = serializers.ChoiceField(
        choices=['paystack', 'flutterwave'],
        default='paystack'
    )


class WalletDebitRequestSerializer(serializers.Serializer):
    """Serializer for wallet debit requests (internal use)"""
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0.01
    )
    description = serializers.CharField(max_length=255, required=False)
    metadata = serializers.JSONField(required=False, default=dict)