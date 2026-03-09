"""
Wallet URLs - UPDATED with transfer endpoint
"""

from django.urls import path

from .views import (
    WalletDetailView,
    WalletBalanceView,
    WalletTransactionListView,
    WalletTransactionDetailView,
    InitiateFundingView,
    DebitWalletView,
    VerifyWalletFundingView,
    WalletUserLookupView,
    WalletTransferView,  # ← ADD THIS IMPORT
)

urlpatterns = [
    path("", WalletDetailView.as_view(), name="wallet-detail"),
    path("balance/", WalletBalanceView.as_view(), name="wallet-balance"),
    path(
        "transactions/", WalletTransactionListView.as_view(), name="wallet-transactions"
    ),
    path(
        "transactions/<str:reference>/",
        WalletTransactionDetailView.as_view(),
        name="wallet-transaction-detail",
    ),
    path("fund/", InitiateFundingView.as_view(), name="wallet-fund"),
    path("debit/", DebitWalletView.as_view(), name="wallet-debit"),
    path(
        "verify/<str:reference>/",
        VerifyWalletFundingView.as_view(),
        name="verify-funding",
    ),
    path("lookup-user/", WalletUserLookupView.as_view(), name="wallet-user-lookup"),
    # ← ADD THIS LINE
    path("transfer/", WalletTransferView.as_view(), name="wallet-transfer"),
]
