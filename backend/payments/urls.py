"""
Payment URLs
"""

from django.urls import path
from .views import (
    InitiatePaymentView,
    VerifyPaymentView,
    PaymentWebhookView,
    PaymentHistoryView,
    PaymentDetailView,
)

app_name = "payments"

urlpatterns = [
    path("initiate/", InitiatePaymentView.as_view(), name="initiate"),
    path("verify/<str:reference>/", VerifyPaymentView.as_view(), name="verify"),
    path("webhook/", PaymentWebhookView.as_view(), name="webhook"),
    path("history/", PaymentHistoryView.as_view(), name="history"),
    path("<str:reference>/", PaymentDetailView.as_view(), name="detail"),
]
