# users/urls.py  
from django.urls import path  
from .views import RefreshTokenView, Registerview, LoginView, LogoutView

urlpatterns = [  
    path('register/', Registerview.as_view(), name='register'),  
    path('login/', LoginView.as_view(), name='token_obtain_pair'),  
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),  
    # path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
]  