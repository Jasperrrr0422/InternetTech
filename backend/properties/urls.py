from django.urls import path  
from .views import AmentityListCreateAPIView,HotelUploadByOwner,HotelListView, HotelDetailViewById,HotelDetailViewByOnwer

urlpatterns = [  
    path('hotels/upload', HotelUploadByOwner.as_view(), name='hotel-list-create'),
    path('amentities/', AmentityListCreateAPIView.as_view(), name='amentity-list-create'),
    path('hotels/list/', HotelListView.as_view(), name='hotel-list'),
    path('hotels/detail/<int:pk>/', HotelDetailViewById.as_view(), name='hotel-detail'),
    path('hotels/detail/owner/<int:pk>/', HotelDetailViewByOnwer.as_view(), name='hotel-detail-by-owner'),
] 