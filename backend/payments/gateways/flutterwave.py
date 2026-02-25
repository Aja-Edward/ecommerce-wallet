"""
Flutterwave Payment Gateway Integration
"""
import hashlib
from typing import Dict, Any
from decimal import Decimal

import requests
from django.conf import settings

from .base import PaymentGateway


class FlutterwaveGateway(PaymentGateway):
    """Flutterwave payment gateway implementation"""
    
    BASE_URL = "https://api.flutterwave.com/v3"
    
    def __init__(self):
        self.secret_key = settings.FLUTTERWAVE_SECRET_KEY
        self.public_key = settings.FLUTTERWAVE_PUBLIC_KEY
    
    def initialize_transaction(
        self,
        email: str,
        amount: Decimal,
        reference: str,
        callback_url: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Initialize Flutterwave transaction"""
        url = f"{self.BASE_URL}/payments"
        
        payload = {
            "tx_ref": reference,
            "amount": str(amount),
            "currency": "NGN",
            "redirect_url": callback_url,
            "payment_options": "card,banktransfer,ussd",
            "customer": {
                "email": email
            },
            "customizations": {
                "title": "Payment",
                "description": metadata.get('description', 'Payment transaction') if metadata else 'Payment transaction'
            },
            "meta": metadata or {}
        }
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('status') != 'success':
            raise Exception(f"Flutterwave initialization failed: {data.get('message')}")
        
        result = data['data']
        
        return {
            'payment_url': result['link'],
            'reference': reference,
            'raw_response': data
        }
    
    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """Verify Flutterwave transaction"""
        # First get transaction ID from reference
        url = f"{self.BASE_URL}/transactions?tx_ref={reference}"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}"
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('status') != 'success' or not data.get('data'):
            raise Exception(f"Flutterwave verification failed: Transaction not found")
        
        result = data['data'][0]
        
        return {
            'success': result['status'] == 'successful',
            'reference': result['tx_ref'],
            'amount': Decimal(result['amount']),
            'gateway_reference': result['id'],
            'status': result['status'],
            'paid_at': result.get('created_at'),
            'raw_response': data
        }
    
    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """Verify Flutterwave webhook signature"""
        # Flutterwave uses secret hash
        expected_signature = self.secret_key
        return signature == expected_signature
    
    def parse_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Flutterwave webhook payload"""
        event = payload.get('event')
        data = payload.get('data', {})
        
        return {
            'event_type': event,
            'reference': data.get('tx_ref'),
            'status': data.get('status'),
            'amount': Decimal(data.get('amount', 0)),
            'gateway_reference': data.get('id'),
            'paid_at': data.get('created_at'),
            'customer_email': data.get('customer', {}).get('email'),
            'raw_data': payload
        }