from rest_framework.views import APIView
from users.models import User
from bookings.models import Order
from payments.models import Commission
from django.db.models import Sum, Count, Avg
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdminRole
from drf_spectacular.utils import extend_schema
# Create your views here.
class UserStatisticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get user statistics",
        description="get total users, total owners, total fee",
        tags=['Admin'],
    )
    def get(self, request):
        total_users = User.objects.filter(role='user').count()
        total_owners = User.objects.filter(role='owner').count()
        total_fee = Commission.objects.aggregate(total_fee=Sum('commission_amount'))['total_fee']
        return Response({'total_users': total_users, 'total_owners': total_owners, 'total_fee': total_fee})


class OrderStatisticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get order statistics",
        description="get order status statistics",
        tags=['Admin'],
    )
    def get(self, request):
        status_stats = Order.objects.values('status').annotate(count=Count('id')).order_by('status')
        return Response(status_stats)

class HotelMostPopularView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get hotel most popular",
        description="get hotel top 10 most popular",
        tags=['Admin'],
    )
    def get(self, request):
        hotel_stats = Order.objects.values('hotel__name').annotate(count=Count('id'),avg_rating=Avg('rating')).order_by('-count').limit(10)
        return Response(hotel_stats)
