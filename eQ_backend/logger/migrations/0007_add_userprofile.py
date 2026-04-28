from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0006_add_gym_branch_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone_number', models.CharField(blank=True, help_text='Phone number used by the external CRM', max_length=30, null=True)),
                ('user', models.OneToOneField(on_delete=models.CASCADE, related_name='profile', to='auth.user')),
            ],
        ),
    ]
