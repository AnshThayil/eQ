from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F
from .models import Ascent, Boulder


@receiver(post_save, sender=Ascent)
def handle_ascent_created(sender, instance, created, **kwargs):
    if created:
        Boulder.objects.filter(pk=instance.boulder_id).update(num_ascents=F('num_ascents') + 1)


@receiver(post_delete, sender=Ascent)
def handle_ascent_deleted(sender, instance, **kwargs):
    boulder_qs = Boulder.objects.filter(pk=instance.boulder_id)
    boulder_qs.update(num_ascents=F('num_ascents') - 1)
    boulder = boulder_qs.first()
    if boulder and boulder.num_ascents < 0:
        boulder.num_ascents = 0
        boulder.save()
