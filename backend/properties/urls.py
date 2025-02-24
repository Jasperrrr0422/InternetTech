from django.urls import path  
from .views import AmentityListCreateAPIView,HotelAPIView,HotelListView

urlpatterns = [  
    path('hotels/', HotelAPIView.as_view(), name='hotel-list-create'),
    path('amentities/', AmentityListCreateAPIView.as_view(), name='amentity-list-create'),
    path('hotels/list/', HotelListView.as_view(), name='hotel-list'),
] 