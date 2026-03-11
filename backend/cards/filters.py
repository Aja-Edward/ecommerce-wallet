"""
Cards App — Filters
Uses django-filter to support query-param filtering on list endpoints.

Install:  pip install django-filter
Add to INSTALLED_APPS: 'django_filters'
Add to REST_FRAMEWORK settings:
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
"""

import django_filters
from django.db.models import QuerySet

from .models import Card, CardTransaction


class CardFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Card.CARD_STATUS)
    card_type = django_filters.ChoiceFilter(choices=Card.CARD_TYPES)
    card_category = django_filters.ChoiceFilter(choices=Card.CARD_CATEGORY)
    is_default = django_filters.BooleanFilter()

    class Meta:
        model = Card
        fields = ["status", "card_type", "card_category", "is_default"]


class CardTransactionFilter(django_filters.FilterSet):
    # Filter by card's last four digits — useful for the dropdown in the frontend
    card_last_four = django_filters.CharFilter(
        field_name="card__last_four",
        lookup_expr="exact",
        label="Card last 4 digits",
    )
    card = django_filters.UUIDFilter(field_name="card__id")

    category = django_filters.ChoiceFilter(choices=CardTransaction.CATEGORY_CHOICES)
    status = django_filters.ChoiceFilter(choices=CardTransaction.STATUS_CHOICES)

    # Amount range
    min_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="gte")
    max_amount = django_filters.NumberFilter(field_name="amount", lookup_expr="lte")

    # Date range
    from_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    to_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    # Only credits or only debits
    transaction_direction = django_filters.CharFilter(method="filter_direction")

    class Meta:
        model = CardTransaction
        fields = [
            "card",
            "card_last_four",
            "category",
            "status",
            "min_amount",
            "max_amount",
            "from_date",
            "to_date",
            "transaction_direction",
        ]

    def filter_direction(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        """
        ?transaction_direction=credit  → amount >= 0
        ?transaction_direction=debit   → amount < 0
        """
        value = value.lower()
        if value == "credit":
            return queryset.filter(amount__gte=0)
        if value == "debit":
            return queryset.filter(amount__lt=0)
        return queryset