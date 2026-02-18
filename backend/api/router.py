"""
Central API Router
Combines all app-level URLs into a single API endpoint structure
"""
from django.urls import path, include

app_name = 'api'

urlpatterns = [
    # Authentication endpoints - /api/auth/
    path('auth/', include('authentication.urls')),
    
    # Wallet endpoints - /api/wallet/
    path('wallet/', include('wallet.urls')),
    
    # Orders endpoints - /api/orders/
    path('orders/', include('orders.urls')),
    
    # Payments endpoints - /api/payments/
    path('payments/', include('payments.urls')),
]