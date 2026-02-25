"""
Payment Models
Tracks payment transactions across all gateways
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class PaymentTransaction(models.Model):
    """
    Records all payment attempts and their status
    Separate from WalletTransaction for clear separation of concerns
    """

    GATEWAY_CHOICES = [
        ("PAYSTACK", "Paystack"),
        ("FLUTTERWAVE", "Flutterwave"),
    ]

    STATUS_CHOICES = [
        ("INITIATED", "Initiated"),
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
    ]

    TRANSACTION_TYPE_CHOICES = [
        ("WALLET_FUNDING", "Wallet Funding"),
        ("ORDER_PAYMENT", "Order Payment"),
        ("SUBSCRIPTION", "Subscription"),
        ("REFUND", "Refund"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payment_transactions"
    )

    # Payment details
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NGN")

    # References
    reference = models.CharField(max_length=100, unique=True, db_index=True)
    gateway_reference = models.CharField(
        max_length=100, null=True, blank=True, db_index=True
    )

    # Status tracking
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="INITIATED"
    )

    # Gateway response data
    payment_url = models.URLField(null=True, blank=True)
    access_code = models.CharField(max_length=100, null=True, blank=True)

    # Additional info
    description = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Gateway response storage
    initialization_response = models.JSONField(null=True, blank=True)
    verification_response = models.JSONField(null=True, blank=True)
    webhook_data = models.JSONField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Webhook tracking
    webhook_received = models.BooleanField(default=False)
    webhook_received_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payment_transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["reference"]),
            models.Index(fields=["gateway_reference"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.gateway} - {self.reference} - {self.status}"

    def mark_as_success(self, gateway_reference=None, verification_data=None):
        """Mark payment as successful"""
        self.status = "SUCCESS"
        self.completed_at = timezone.now()
        if gateway_reference:
            self.gateway_reference = gateway_reference
        if verification_data:
            self.verification_response = verification_data
        self.save()

    def mark_as_failed(self, reason=None):
        """Mark payment as failed"""
        self.status = "FAILED"
        if reason:
            if not self.metadata:
                self.metadata = {}
            self.metadata["failure_reason"] = reason
        self.save()

    def mark_webhook_received(self, webhook_data=None):
        """Mark that webhook was received"""
        self.webhook_received = True
        self.webhook_received_at = timezone.now()
        if webhook_data:
            self.webhook_data = webhook_data
        self.save()


class PaymentWebhookLog(models.Model):
    """
    Logs all webhook calls for debugging and audit
    """

    GATEWAY_CHOICES = [
        ("PAYSTACK", "Paystack"),
        ("FLUTTERWAVE", "Flutterwave"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)

    # Webhook data
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    headers = models.JSONField(default=dict)

    # Processing
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)

    # Verification
    signature_valid = models.BooleanField(default=False)

    # Related transaction
    payment_transaction = models.ForeignKey(
        PaymentTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="webhook_logs",
    )

    # Error tracking
    error = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payment_webhook_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["gateway", "event_type"]),
        ]

    def __str__(self):
        return f"{self.gateway} - {self.event_type} - {self.created_at}"
