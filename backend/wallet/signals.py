"""
Wallet Signals
Automatically create wallet when a new user is created
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from authentication.models import User
from .models import Wallet


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """
    Signal to automatically create a wallet when a new user is created
    """
    if created:
        Wallet.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_wallet(sender, instance, **kwargs):
    """
    Signal to save wallet when user is saved
    """
    if hasattr(instance, 'wallet'):
        instance.wallet.save()