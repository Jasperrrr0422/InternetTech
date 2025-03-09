from celery import shared_task
from django.db.models import Avg
from .models import Order

@shared_task
def update_hotel_rating(hotel_id):
    from properties.models import Hotel  # 避免循环导入
    
    # 计算平均评分
    avg_rating = Order.objects.filter(
        hotel_id=hotel_id,
        rating__isnull=False
    ).aggregate(Avg('rating'))['rating__avg']
    
    if avg_rating is not None:
        # 更新酒店评分
        Hotel.objects.filter(id=hotel_id).update(
            rating=round(avg_rating)
        )
        
    return {
        'hotel_id': hotel_id,
        'new_rating': round(avg_rating) if avg_rating else None
    }