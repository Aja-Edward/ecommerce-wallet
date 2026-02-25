"""
Base Payment Gateway Interface
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from decimal import Decimal


class PaymentGateway(ABC):
    """Abstract base class for payment gateways"""
    
    @abstractmethod
    def initialize_transaction(
        self,
        email: str,
        amount: Decimal,
        reference: str,
        callback_url: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Initialize a payment transaction
        
        Returns:
            Dict containing payment_url and other gateway-specific data
        """
        pass
    
    @abstractmethod
    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """
        Verify a transaction status
        
        Returns:
            Dict containing transaction details and status
        """
        pass
    
    @abstractmethod
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify webhook signature for security
        
        Returns:
            True if signature is valid
        """
        pass
    
    @abstractmethod
    def parse_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse webhook payload into standardized format
        
        Returns:
            Dict with standardized fields: reference, status, amount, etc.
        """
        pass