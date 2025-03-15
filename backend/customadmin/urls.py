from django.urls import path
from .views import UserStatisticsView, OrderStatisticsView, DailyOrderTrendView, HotelPerformanceView, UserActivityView, CommissionStatisticsView, DailyCommissionStatisticsView

urlpatterns = [
    path('statistics/users/', UserStatisticsView.as_view(), name='user-statistics'),
    path('statistics/orders/', OrderStatisticsView.as_view(), name='order-statistics'),  
    path('statistics/daily-trends/', DailyOrderTrendView.as_view(), name='daily-trends'),  
    path('statistics/hotel-performance/', HotelPerformanceView.as_view(), name='hotel-performance'),  
    path('statistics/user-activity/', UserActivityView.as_view(), name='user-activity'),  
    path('statistics/commissions/', CommissionStatisticsView.as_view(), name='commission-statistics'),  
    path('statistics/daily-commission/', DailyCommissionStatisticsView.as_view(), name='daily-commission'),  
]  
