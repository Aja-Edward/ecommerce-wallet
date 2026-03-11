"""
Cards App — Signals

Signals handle cross-app side effects without coupling models together.
Connect them in CardConfig.ready() inside apps.py.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Card, CardTransaction


@receiver(post_save, sender=CardTransaction)
def update_card_balance_on_transaction(sender, instance: CardTransaction, created: bool, **kwargs):
    """
    Safety net: if a CardTransaction is saved with a balance_after value that
    differs from the card's current balance, sync the card.

    In normal flow CardService.record_transaction() already updates the balance
    atomically, so this signal fires but makes no change. It only matters if
    a transaction is saved outside the service (e.g. admin, data migrations).
    """
    if created and instance.card.balance != instance.balance_after:
        Card.objects.filter(pk=instance.card_id).update(balance=instance.balance_after)


@receiver(post_save, sender=CardTransaction)
def award_cashback_on_debit(sender, instance: CardTransaction, created: bool, **kwargs):
    """
    Awards 0.5% cashback on completed debit transactions.
    Adjust the rate and eligible categories as needed.
    """
    if not created:
        return
    if instance.status != "COMPLETED":
        return
    if instance.amount >= 0:
        return  # only debits earn cashback
    if instance.category in ("TRANSFER", "INCOME"):
        return  # no cashback on transfers

    cashback_rate = 0.005   # 0.5%
    cashback_amount = abs(instance.amount) * cashback_rate

    Card.objects.filter(pk=instance.card_id).update(
        cashback_balance=instance.card.cashback_balance + cashback_amount
    )


@receiver(post_save, sender=Card)
def auto_set_first_card_as_default(sender, instance: Card, created: bool, **kwargs):
    """
    When a user's very first card is created, automatically make it the default.
    """
    if not created:
        return
    user_card_count = Card.objects.filter(user=instance.user).count()
    if user_card_count == 1 and not instance.is_default:
        Card.objects.filter(pk=instance.pk).update(is_default=True)