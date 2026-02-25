"""
Payment Service Layer
Business logic for payment operations
"""
from decimal import Decimal
from typing import Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone

from .models import PaymentTransaction, PaymentWebhookLog
from .gateways import get_payment_gateway

User = get_user_model()


class PaymentService:
    """Service for payment operations"""
    
    @staticmethod
    def generate_reference(prefix: str = 'PAY') -> str:
        """Generate unique payment reference"""
        import uuid
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"{prefix}-{timestamp}-{unique_id}"
    
    @staticmethod
    def initiate_payment(
        user: User,
        amount: Decimal,
        gateway: str,
        transaction_type: str = 'WALLET_FUNDING',
        description: str = None,
        metadata: Dict[str, Any] = None
    ) -> PaymentTransaction:
        """
        Initiate a payment transaction
        
        Args:
            user: User making the payment
            amount: Amount to pay
            gateway: Payment gateway ('paystack' or 'flutterwave')
            transaction_type: Type of transaction
            description: Optional description
            metadata: Additional metadata
            
        Returns:
            PaymentTransaction object with payment_url
        """
        # Generate unique reference
        reference = PaymentService.generate_reference()
        
        # Create payment transaction record
        payment = PaymentTransaction.objects.create(
            user=user,
            gateway=gateway.upper(),
            transaction_type=transaction_type,
            amount=amount,
            currency='NGN',
            reference=reference,
            description=description or f"{transaction_type.replace('_', ' ').title()} - ₦{amount}",
            metadata=metadata or {},
            status='INITIATED'
        )
        
        try:
            # Initialize with payment gateway
            gateway_instance = get_payment_gateway(gateway)
            
            callback_url = f"{settings.FRONTEND_URL}/payment/callback"
            
            initialization_data = gateway_instance.initialize_transaction(
                email=user.email,
                amount=amount,
                reference=reference,
                callback_url=callback_url,
                metadata={
                    'user_id': str(user.id),
                    'transaction_type': transaction_type,
                    **(metadata or {})
                }
            )
            
            # Update payment record with gateway response
            payment.payment_url = initialization_data['payment_url']
            payment.access_code = initialization_data.get('access_code')
            payment.initialization_response = initialization_data.get('raw_response')
            payment.status = 'PENDING'
            payment.save()
            
            return payment
            
        except Exception as e:
            payment.mark_as_failed(str(e))
            raise
    
    @staticmethod
    def verify_payment(reference: str) -> PaymentTransaction:
        """
        Verify payment status with gateway
        
        Args:
            reference: Payment reference
            
        Returns:
            Updated PaymentTransaction
        """
        try:
            payment = PaymentTransaction.objects.get(reference=reference)
            
            if payment.status in ['SUCCESS', 'FAILED', 'CANCELLED']:
                return payment  # Already finalized
            
            # Verify with gateway
            gateway_instance = get_payment_gateway(payment.gateway.lower())
            verification_data = gateway_instance.verify_transaction(reference)
            
            # Update payment record
            payment.gateway_reference = verification_data.get('gateway_reference')
            payment.verification_response = verification_data.get('raw_response')
            
            if verification_data['success']:
                payment.mark_as_success(
                    gateway_reference=verification_data.get('gateway_reference'),
                    verification_data=verification_data
                )
            else:
                payment.mark_as_failed('Payment verification failed')
            
            return payment
            
        except PaymentTransaction.DoesNotExist:
            raise Exception(f"Payment transaction not found: {reference}")
        except Exception as e:
            if 'payment' in locals():
                payment.mark_as_failed(str(e))
            raise
    
    @staticmethod
    def process_webhook(
        gateway: str,
        payload: Dict[str, Any],
        headers: Dict[str, str],
        raw_body: bytes
    ) -> Optional[PaymentTransaction]:
        """
        Process payment webhook
        
        Args:
            gateway: Payment gateway name
            payload: Webhook payload
            headers: Request headers
            raw_body: Raw request body for signature verification
            
        Returns:
            PaymentTransaction if processed successfully
        """
        # Get signature from headers
        if gateway.lower() == 'paystack':
            signature = headers.get('x-paystack-signature', '')
        else:  # flutterwave
            signature = headers.get('verif-hash', '')
        
        # Create webhook log
        webhook_log = PaymentWebhookLog.objects.create(
            gateway=gateway.upper(),
            event_type=payload.get('event', 'unknown'),
            payload=payload,
            headers=dict(headers)
        )
        
        try:
            # Verify signature
            gateway_instance = get_payment_gateway(gateway)
            
            if gateway.lower() == 'paystack':
                signature_valid = gateway_instance.verify_webhook_signature(raw_body, signature)
            else:
                signature_valid = gateway_instance.verify_webhook_signature(
                    raw_body.decode('utf-8'), 
                    signature
                )
            
            webhook_log.signature_valid = signature_valid
            webhook_log.save()
            
            if not signature_valid:
                webhook_log.error = "Invalid signature"
                webhook_log.save()
                return None
            
            # Parse webhook data
            parsed_data = gateway_instance.parse_webhook_data(payload)
            
            # Find payment transaction
            reference = parsed_data['reference']
            payment = PaymentTransaction.objects.filter(reference=reference).first()
            
            if not payment:
                webhook_log.error = f"Payment not found: {reference}"
                webhook_log.save()
                return None
            
            webhook_log.payment_transaction = payment
            webhook_log.save()
            
            # Update payment status
            payment.mark_webhook_received(parsed_data)
            
            if parsed_data['status'] in ['success', 'successful']:
                if payment.status != 'SUCCESS':
                    payment.mark_as_success(
                        gateway_reference=parsed_data.get('gateway_reference'),
                        verification_data=parsed_data
                    )
            elif parsed_data['status'] == 'failed':
                payment.mark_as_failed('Payment failed at gateway')
            
            webhook_log.processed = True
            webhook_log.processed_at = timezone.now()
            webhook_log.save()
            
            return payment
            
        except Exception as e:
            webhook_log.error = str(e)
            webhook_log.save()
            raise
    
    @staticmethod
    def get_user_payment_history(user: User, limit: Optional[int] = None):
        """Get user's payment history"""
        queryset = PaymentTransaction.objects.filter(user=user)
        
        if limit:
            queryset = queryset[:limit]
        
        return queryset