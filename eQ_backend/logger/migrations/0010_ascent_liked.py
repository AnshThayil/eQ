from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0009_backfill_and_require_ascent_perceived_difficulty'),
    ]

    operations = [
        migrations.AddField(
            model_name='ascent',
            name='liked',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]