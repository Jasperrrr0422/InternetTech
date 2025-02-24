from django.db import models

# Create your models here.

class Amentity(models.Model):
    name = models.CharField(max_length=100, unique=True,primary_key=True)

class Hotel(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)
    description = models.TextField()
    address = models.CharField(max_length=100)
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='hotels')
    amentities = models.ManyToManyField(Amentity)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='hotels/', null=True, blank=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    total_rooms = models.IntegerField()
    total_beds = models.IntegerField()
    rating = models.IntegerField(default=0)


    

