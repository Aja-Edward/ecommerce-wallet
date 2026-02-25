"""
Payment Admin
"""

from django.contrib import admin
from .models import PaymentTransaction, PaymentWebhookLog


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "user",
        "gateway",
        "transaction_type",
        "amount",
        "status",
        "created_at",
    ]
    list_filter = ["gateway", "status", "transaction_type", "created_at"]
    search_fields = ["reference", "gateway_reference", "user__email"]
    readonly_fields = [
        "id",
        "reference",
        "created_at",
        "updated_at",
        "completed_at",
    ]

    fieldsets = (
        (
            "Basic Info",
            {"fields": ("id", "user", "gateway", "transaction_type", "status")},
        ),
        (
            "Payment Details",
            {
                "fields": (
                    "amount",
                    "currency",
                    "reference",
                    "gateway_reference",
                    "description",
                )
            },
        ),
        (
            "Gateway Data",
            {
                "fields": (
                    "payment_url",
                    "access_code",
                    "initialization_response",
                    "verification_response",
                )
            },
        ),
        (
            "Webhook",
            {"fields": ("webhook_received", "webhook_received_at", "webhook_data")},
        ),
        ("Metadata", {"fields": ("metadata",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at", "completed_at")}),
    )


@admin.register(PaymentWebhookLog)
class PaymentWebhookLogAdmin(admin.ModelAdmin):
    list_display = [
        "gateway",
        "event_type",
        "signature_valid",
        "processed",
        "created_at",
    ]
    list_filter = ["gateway", "signature_valid", "processed", "created_at"]
    search_fields = ["event_type", "payment_transaction__reference"]
    readonly_fields = ["id", "created_at"]
