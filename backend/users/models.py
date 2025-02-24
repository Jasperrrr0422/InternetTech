from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'user'),
        ('owner', 'owner'),
        ('admin', 'admin'),
    )
    role = models.CharField(max_length=5,choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20,blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
