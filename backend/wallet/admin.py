"""
Wallet Admin Configuration
Django admin interface for wallet management
"""
from django.contrib import admin
from .models import Wallet, WalletTransaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """Admin interface for Wallet model"""
    list_display = ['user', 'balance', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Balance', {
            'fields': ('balance',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        """Prevent manual wallet creation - should be auto-created via signals"""
        return False


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    """Admin interface for WalletTransaction model"""
    list_display = [
        'reference',
        'get_user_email',
        'transaction_type',
        'amount',
        'status',
        'source',
        'created_at'
    ]
    list_filter = [
        'transaction_type',
        'status',
        'source',
        'created_at'
    ]
    search_fields = [
        'reference',
        'wallet__user__email',
        'wallet__user__username',
        'description'
    ]
    readonly_fields = [
        'wallet',
        'transaction_type',
        'amount',
        'balance_before',
        'balance_after',
        'reference',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'wallet',
                'reference',
                'transaction_type',
                'amount',
                'status',
                'source'
            )
        }),
        ('Balance Information', {
            'fields': (
                'balance_before',
                'balance_after'
            )
        }),
        ('Additional Details', {
            'fields': (
                'description',
                'metadata'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_user_email(self, obj):
        """Display user email in list view"""
        return obj.wallet.user.email
    get_user_email.short_description = 'User Email'
    get_user_email.admin_order_field = 'wallet__user__email'

    def has_add_permission(self, request):
        """Prevent manual transaction creation - should use WalletService"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Prevent transaction deletion"""
        return False