# Generated by Django 5.1.6 on 2025-02-18 20:50

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Amentity',
            fields=[
                ('name', models.CharField(max_length=100, primary_key=True, serialize=False, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Hotel',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=30)),
                ('description', models.TextField()),
                ('address', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='hotels/')),
                ('price_per_night', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_rooms', models.IntegerField()),
                ('total_beds', models.IntegerField()),
                ('amentities', models.ManyToManyField(to='properties.amentity')),
            ],
        ),
    ]
