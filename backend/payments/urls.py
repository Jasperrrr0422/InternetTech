from django.urls import path
from .views import PayPalExecuteView,PayPalCreateView

urlpatterns = [
    path('paypal/execute/', PayPalExecuteView.as_view(), name='paypal-execute'),
    path('paypal/create/', PayPalCreateView.as_view(), name='paypal-create'),
]
