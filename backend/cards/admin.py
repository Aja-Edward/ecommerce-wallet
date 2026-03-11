"""
Cards App — Admin
"""

from django.contrib import admin

from .models import Card, CardTransaction


class CardTransactionInline(admin.TabularInline):
    model = CardTransaction
    extra = 0
    readonly_fields = ["id", "merchant", "amount", "balance_before", "balance_after", "status", "reference", "created_at"]
    can_delete = False
    show_change_link = True
    ordering = ["-created_at"]
    fields = ["merchant", "category", "amount", "balance_before", "balance_after", "status", "reference", "created_at"]


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ["__str__", "card_type", "card_category", "status", "balance", "credit_limit", "is_default", "created_at"]
    list_filter = ["status", "card_type", "card_category", "is_default"]
    search_fields = ["user__email", "last_four", "holder_name"]
    readonly_fields = ["id", "created_at", "updated_at", "available_credit", "is_expired", "expiry_display"]
    ordering = ["-created_at"]
    inlines = [CardTransactionInline]

    fieldsets = (
        ("Identity", {
            "fields": ("id", "user", "card_type", "card_category", "last_four", "holder_name", "expiry_month", "expiry_year", "expiry_display")
        }),
        ("Financial", {
            "fields": ("balance", "credit_limit", "available_credit", "cashback_balance")
        }),
        ("Status", {
            "fields": ("status", "is_default", "is_expired", "external_card_id")
        }),
        ("UI Preferences", {
            "fields": ("color_gradient", "accent_color"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    actions = ["freeze_cards", "block_cards"]

    def freeze_cards(self, request, queryset):
        updated = queryset.filter(status="ACTIVE").update(status="FROZEN")
        self.message_user(request, f"{updated} card(s) frozen.")
    freeze_cards.short_description = "Freeze selected active cards"

    def block_cards(self, request, queryset):
        updated = queryset.exclude(status="BLOCKED").update(status="BLOCKED")
        self.message_user(request, f"{updated} card(s) blocked.")
    block_cards.short_description = "Block selected cards"


@admin.register(CardTransaction)
class CardTransactionAdmin(admin.ModelAdmin):
    list_display = ["merchant", "card", "amount", "category", "status", "reference", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["merchant", "reference", "card__last_four", "card__user__email"]
    readonly_fields = [f.name for f in CardTransaction._meta.get_fields() if hasattr(f, "name")]
    ordering = ["-created_at"]