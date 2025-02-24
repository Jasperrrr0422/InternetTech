from django.db import models

# Create your models here.
class Commission(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.OneToOneField('bookings.Order', on_delete=models.CASCADE)  
    commission_rate = models.DecimalField('佣金率', max_digits=4, decimal_places=2)  
    commission_amount = models.DecimalField('佣金金额', max_digits=10, decimal_places=2)  
    created_at = models.DateTimeField(auto_now_add=True)  
    
    def save(self, *args, **kwargs):  
        # 自动计算佣金金额  
        self.commission_amount = self.order.total_price * self.commission_rate  
        super().save(*args, **kwargs)  