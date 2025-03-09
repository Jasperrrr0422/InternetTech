from django.db import models
from django.db.models import Avg

# Create your models here.
class Order(models.Model):  
    STATUS_CHOICES = (
        ('pending', 'pending'),
        ('paid', 'paid'),  
        ('completed', 'completed'),  
        ('cancelled', 'cancelled'),  
    )
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='orders')  
    hotel = models.ForeignKey('properties.Hotel', on_delete=models.CASCADE, related_name='orders')  
    check_in_date = models.DateField()  
    check_out_date = models.DateField()  
    room_count = models.IntegerField( default=1)  
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')  
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])

