"""
Cards App — Custom Exceptions
Centralises all domain-level errors so views stay clean.
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class CardFrozenError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "This card is currently frozen."
    default_code = "card_frozen"


class CardBlockedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "This card has been blocked and cannot be used."
    default_code = "card_blocked"


class CardExpiredError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "This card has expired."
    default_code = "card_expired"


class InsufficientCardBalanceError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = "Insufficient card balance."
    default_code = "insufficient_card_balance"


class CardLimitExceededError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = "This transaction would exceed your card credit limit."
    default_code = "card_limit_exceeded"