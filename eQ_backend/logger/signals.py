from django.db.models.signals import post_save, post_delete, pre_save
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


@receiver(pre_save, sender=Boulder)
def handle_boulder_grade_change(sender, instance, **kwargs):
    """When a boulder's grade changes, update points for all associated ascents."""
    if instance.pk:  # Only for existing boulders, not new ones
        try:
            old_boulder = Boulder.objects.get(pk=instance.pk)
            # Check if setter_grade has changed
            if old_boulder.setter_grade != instance.setter_grade:
                # Update points for all ascents of this boulder
                ascents = Ascent.objects.filter(boulder=instance)
                for ascent in ascents:
                    ascent.points = ascent.calculate_points()
                    ascent.save(update_fields=['points'])
        except Boulder.DoesNotExist:
            pass
