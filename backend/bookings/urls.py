from django.urls import path
from .views import OrderListView, OrderCreateView, OrderRatingView, OrderCompletedView

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/rating/<int:order_id>/', OrderRatingView.as_view(), name='order-rating'),
    path('orders/completed/<int:order_id>/', OrderCompletedView.as_view(), name='order-completed'),
]