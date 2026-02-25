"""
Payment Serializers
"""
from rest_framework import serializers
from decimal import Decimal

from .models import PaymentTransaction, PaymentWebhookLog


class PaymentInitiationSerializer(serializers.Serializer):
    """Serializer for payment initiation request"""
    amount = serializers.DecimalField(
    max_digits=12, 
    decimal_places=2, 
    min_value=Decimal('100.00')  # Make sure Decimal is imported
)
    gateway = serializers.ChoiceField(choices=['paystack', 'flutterwave'])
    transaction_type = serializers.ChoiceField(
        choices=['WALLET_FUNDING', 'ORDER_PAYMENT', 'SUBSCRIPTION'],
        default='WALLET_FUNDING'
    )
    description = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transaction"""
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'gateway',
            'transaction_type',
            'amount',
            'currency',
            'reference',
            'gateway_reference',
            'status',
            'payment_url',
            'description',
            'metadata',
            'created_at',
            'updated_at',
            'completed_at',
            'webhook_received',
        ]
        read_only_fields = fields


class PaymentWebhookLogSerializer(serializers.ModelSerializer):
    """Serializer for webhook log"""
    
    class Meta:
        model = PaymentWebhookLog
        fields = '__all__'
        read_only_fields = fields