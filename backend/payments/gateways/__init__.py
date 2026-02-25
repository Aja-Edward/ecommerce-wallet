"""
Payment Gateway Factory
"""
from .paystack import PaystackGateway
from .flutterwave import FlutterwaveGateway


def get_payment_gateway(gateway_name: str):
    """
    Factory function to get payment gateway instance
    
    Args:
        gateway_name: 'paystack' or 'flutterwave'
        
    Returns:
        PaymentGateway instance
    """
    gateways = {
        'paystack': PaystackGateway,
        'flutterwave': FlutterwaveGateway,
    }
    
    gateway_class = gateways.get(gateway_name.lower())
    
    if not gateway_class:
        raise ValueError(f"Unknown payment gateway: {gateway_name}")
    
    return gateway_class()


__all__ = ['get_payment_gateway', 'PaystackGateway', 'FlutterwaveGateway']