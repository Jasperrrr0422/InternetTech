from django.urls import path
from .views import ReviewCreateView, HotelReviewsView

urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='review-create'),
    path('hotel/<int:hotel_id>/', HotelReviewsView.as_view(), name='hotel-reviews'),
]
