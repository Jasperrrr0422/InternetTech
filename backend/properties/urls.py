from django.urls import path  
from .views import AmentityListAPIView,HotelListAPIView,HotelDetailAPIView

urlpatterns = [  
    path('amentities/', AmentityListAPIView.as_view(), name='amentity-list-create'),
    path('hotels/list/', HotelListAPIView.as_view(), name='hotel-list'),
    path('hotels/detail/<int:pk>/', HotelDetailAPIView.as_view(), name='hotel-detail'),
] 