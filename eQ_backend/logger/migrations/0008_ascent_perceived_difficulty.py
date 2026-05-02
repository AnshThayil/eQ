from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0007_add_userprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='ascent',
            name='perceived_difficulty',
            field=models.CharField(
                blank=True,
                choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
                max_length=20,
                null=True,
            ),
        ),
    ]