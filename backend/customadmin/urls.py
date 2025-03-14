from django.urls import path
from .views import UserStatisticsView, OrderStatisticsView, HotelMostPopularView

urlpatterns = [
    path('user-statistics/', UserStatisticsView.as_view(), name='user-statistics'),
    path('order-status-statistics/', OrderStatisticsView.as_view(), name='order-statistics'),
    path('hotel-most-popular/', HotelMostPopularView.as_view(), name='hotel-most-popular'),
]