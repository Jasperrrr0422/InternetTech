# Generated by Django 5.1.7 on 2025-03-12 01:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0005_alter_order_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'pending'), ('paid', 'paid'), ('completed', 'completed'), ('canceled', 'canceled')], default='pending', max_length=10),
        ),
    ]
