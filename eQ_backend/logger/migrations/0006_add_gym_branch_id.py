from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0005_populate_ascent_points'),
    ]

    operations = [
        migrations.AddField(
            model_name='gym',
            name='branch_id',
            field=models.CharField(
                blank=True,
                help_text='YoActiv branch ID for this gym',
                max_length=50,
                null=True,
                unique=True,
            ),
        ),
    ]
