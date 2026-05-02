from django.db import migrations, models


def backfill_perceived_difficulty(apps, schema_editor):
    Ascent = apps.get_model('logger', 'Ascent')
    Ascent.objects.filter(perceived_difficulty__isnull=True).update(perceived_difficulty='easy')
    Ascent.objects.filter(perceived_difficulty='').update(perceived_difficulty='easy')


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0008_ascent_perceived_difficulty'),
    ]

    operations = [
        migrations.RunPython(backfill_perceived_difficulty, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='ascent',
            name='perceived_difficulty',
            field=models.CharField(
                choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
                max_length=20,
            ),
        ),
    ]