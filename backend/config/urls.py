from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.router")),
    path("api/auth/", include("authentication.urls")),
    path("api/wallet/", include("wallet.urls")),
    path("api/payment/", include("payments.urls")),  # Add this
    path("api/cards/", include("cards.urls")),
]
