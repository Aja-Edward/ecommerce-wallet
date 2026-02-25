"""
Paystack Payment Gateway Integration
"""
import hmac
import hashlib
from typing import Dict, Any
from decimal import Decimal

import requests
from django.conf import settings

from .base import PaymentGateway


class PaystackGateway(PaymentGateway):
    """Paystack payment gateway implementation"""
    
    BASE_URL = "https://api.paystack.co"
    
    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
    
    def initialize_transaction(
        self,
        email: str,
        amount: Decimal,
        reference: str,
        callback_url: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Initialize Paystack transaction"""
        url = f"{self.BASE_URL}/transaction/initialize"
        
        # Convert Naira to kobo
        amount_in_kobo = int(amount * 100)
        
        payload = {
            "email": email,
            "amount": amount_in_kobo,
            "reference": reference,
            "callback_url": callback_url,
            "metadata": metadata or {}
        }
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('status'):
            raise Exception(f"Paystack initialization failed: {data.get('message')}")
        
        result = data['data']
        
        return {
            'payment_url': result['authorization_url'],
            'access_code': result['access_code'],
            'reference': result['reference'],
            'raw_response': data
        }
    
    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """Verify Paystack transaction"""
        url = f"{self.BASE_URL}/transaction/verify/{reference}"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}"
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('status'):
            raise Exception(f"Paystack verification failed: {data.get('message')}")
        
        result = data['data']
        
        return {
            'success': result['status'] == 'success',
            'reference': result['reference'],
            'amount': Decimal(result['amount']) / 100,  # Convert from kobo
            'gateway_reference': result['id'],
            'status': result['status'],
            'paid_at': result.get('paid_at'),
            'raw_response': data
        }
    
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Paystack webhook signature"""
        hash_object = hmac.new(
            self.secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        )
        expected_signature = hash_object.hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def parse_webhook_data(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Paystack webhook payload"""
        event = payload.get('event')
        data = payload.get('data', {})
        
        return {
            'event_type': event,
            'reference': data.get('reference'),
            'status': data.get('status'),
            'amount': Decimal(data.get('amount', 0)) / 100,
            'gateway_reference': data.get('id'),
            'paid_at': data.get('paid_at'),
            'customer_email': data.get('customer', {}).get('email'),
            'raw_data': payload
        }