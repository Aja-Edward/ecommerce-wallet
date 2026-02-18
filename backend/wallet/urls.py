"""
Wallet URL Configuration
"""
from django.urls import path
from .views import (
    WalletDetailView,
    WalletBalanceView,
    WalletTransactionListView,
    WalletTransactionDetailView,
    InitiateFundingView,
    DebitWalletView
)

app_name = 'wallet'

urlpatterns = [
    # Wallet endpoints
    path('', WalletDetailView.as_view(), name='wallet-detail'),
    path('balance/', WalletBalanceView.as_view(), name='wallet-balance'),
    
    # Transaction endpoints
    path('transactions/', WalletTransactionListView.as_view(), name='transaction-list'),
    path('transactions/<str:reference>/', WalletTransactionDetailView.as_view(), name='transaction-detail'),
    
    # Funding endpoints
    path('fund/', InitiateFundingView.as_view(), name='initiate-funding'),
    
    # Debit endpoint (internal use)
    path('debit/', DebitWalletView.as_view(), name='debit-wallet'),
]