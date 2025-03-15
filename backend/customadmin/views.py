from rest_framework.views import APIView
from users.models import User
from bookings.models import Order
from properties.models import Hotel
from payments.models import Commission
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncDate
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdminRole
from drf_spectacular.utils import extend_schema
from datetime import datetime
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
        description="get total orders, pending orders, completed orders, total revenue",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get overall order statistics  
        """  
        total_orders = Order.objects.count()  
        pending_orders = Order.objects.filter(status='pending').count()  
        completed_orders = Order.objects.filter(status='completed').count()  
        total_revenue = Commission.objects.aggregate(total=Sum('commission_amount'))['total'] or 0  

        return Response({  
            'total_orders': total_orders,  
            'pending_orders': pending_orders,  
            'completed_orders': completed_orders,  
            'total_revenue': float(total_revenue)  
        })  

class DailyOrderTrendView(APIView):  
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get daily order trends",
        description="get daily order trends",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get daily order trends  
        """  
        daily_orders = Order.objects.annotate(
            date=TruncDate('created_at')
        ).values('date') \
         .annotate(
            order_count=Count('id'), 
            total_revenue=Sum('total_price')
         ) \
         .order_by('date')  
        return Response({  
            'daily_trends': [  
                {  
                    'date': item['date'].strftime('%Y-%m-%d'),  
                    'order_count': item['order_count'],  
                    'total_revenue': float(item['total_revenue'] or 0)  
                } for item in daily_orders  
            ]  
        })  

class HotelPerformanceView(APIView):  
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get hotel performance",
        description="get top performing hotels",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get top performing hotels  
        """  
        top_hotels = Hotel.objects.annotate(  
            total_orders=Count('orders'),  
            total_revenue=Sum('orders__total_price')
        ).order_by('-total_revenue')[:10]  

        return Response({  
            'top_hotels': [  
                {  
                    'id': hotel.id,  
                    'name': hotel.name,  
                    'total_orders': hotel.total_orders,  
                    'total_revenue': float(hotel.total_revenue or 0),  
                    'rating': hotel.rating
                } for hotel in top_hotels  
            ]  
        })  

class UserActivityView(APIView):  
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get user activity",
        description="get user activity",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get user activity statistics  
        """  
        total_users = User.objects.count()  
        users_by_role = User.objects.values('role').annotate(count=Count('id'))  
        most_active_users = User.objects.annotate(  
            order_count=Count('orders')  
        ).order_by('-order_count')[:5]  

        return Response({  
            'total_users': total_users,  
            'users_by_role': list(users_by_role),  
            'most_active_users': [  
                {  
                    'username': user.username,  
                    'order_count': user.order_count  
                } for user in most_active_users  
            ]  
        })  

class CommissionStatisticsView(APIView):  
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get commission statistics",
        description="get commission statistics",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get commission-related statistics  
        """  
        total_commission = Commission.objects.aggregate(  
            total_amount=Sum('commission_amount')  
        )['total_amount'] or 0  

        commission_by_month = Commission.objects.annotate(  
            month=TruncMonth('created_at')  
        ).values('month').annotate(  
            total_commission=Sum('commission_amount')  
        ).order_by('month')  

        return Response({  
            'total_commission': float(total_commission),  
            'commission_by_month': [  
                {  
                    'month': item['month'].strftime('%Y-%m'),  
                    'total_commission': float(item['total_commission'])  
                } for item in commission_by_month  
            ]  
        })

class DailyCommissionStatisticsView(APIView):  
    permission_classes = [IsAuthenticated, IsAdminRole]
    @extend_schema(
        summary="get daily commission statistics",
        description="get daily commission statistics",
        tags=['Admin'],
    )
    def get(self, request):  
        """  
        Get daily commission-related statistics  
        """  
        total_commission = Commission.objects.aggregate(  
            total_amount=Sum('commission_amount')  
        )['total_amount'] or 0  

        commission_by_day = Commission.objects.annotate(  
            date=TruncDate('created_at')  # 改用 TruncDate
        ).values('date').annotate(  
            total_commission=Sum('commission_amount'),
            order_count=Count('id')  # 添加每日订单数统计
        ).order_by('date')  

        return Response({  
            'total_commission': float(total_commission),  
            'daily_commission': [  # 改名为 daily_commission
                {  
                    'date': item['date'].strftime('%Y-%m-%d'),  # 改为完整日期
                    'total_commission': float(item['total_commission']),
                    'order_count': item['order_count']
                } for item in commission_by_day  
            ]  
        }) 