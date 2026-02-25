"""
Payment Signals
Handles post-payment actions like crediting wallet
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps

from .models import PaymentTransaction


@receiver(post_save, sender=PaymentTransaction)
def handle_payment_success(sender, instance, created, **kwargs):
    """
    Handle successful payment
    Credit wallet or process order based on transaction type
    """
    # Only process if status just changed to SUCCESS
    if not created and instance.status == 'SUCCESS':
        
        # Check if already processed (avoid duplicate processing)
        if instance.metadata.get('processed'):
            return
        
        try:
            if instance.transaction_type == 'WALLET_FUNDING':
                # Credit user's wallet
                WalletService = apps.get_model('wallet', 'WalletService')
                
                # Import here to avoid circular imports
                from wallet.services import WalletService
                
                WalletService.credit_wallet(
                    user=instance.user,
                    amount=instance.amount,
                    source='FUNDING',
                    description=f"Wallet funding via {instance.gateway}",
                    reference=instance.reference,
                    metadata={
                        'payment_id': str(instance.id),
                        'gateway': instance.gateway,
                        'gateway_reference': instance.gateway_reference
                    }
                )
                
            elif instance.transaction_type == 'ORDER_PAYMENT':
                # Process order
                # TODO: Implement order processing
                pass
            
            elif instance.transaction_type == 'SUBSCRIPTION':
                # Activate subscription
                # TODO: Implement subscription activation
                pass
            
            # Mark as processed
            instance.metadata['processed'] = True
            instance.metadata['processed_at'] = str(instance.completed_at)
            instance.save(update_fields=['metadata'])
            
        except Exception as e:
            # Log error but don't raise to avoid webhook retry loops
            instance.metadata['processing_error'] = str(e)
            instance.save(update_fields=['metadata'])