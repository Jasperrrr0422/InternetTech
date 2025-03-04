from django.db import models

# Create your models here.
class Review(models.Model):  
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviews')  
    hotel = models.ForeignKey('properties.Hotel', on_delete=models.CASCADE, related_name='reviews')  
    # rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])  
    comment = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        if self.parent:
            return f"reply to {self.parent.user} under {self.hotel}"
        else:
            return f"review for {self.hotel}"