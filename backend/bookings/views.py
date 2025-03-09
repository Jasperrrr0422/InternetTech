from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from properties.models import Hotel
from payments.models import Commission
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .serializers import OrderSerializer, OrderCreateSerializer, OrderRatingSerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsUserRole
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db.models import Avg
from django.db import transaction
from .tasks import update_hotel_rating

# Create your views here.
class OrderListView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]

    @extend_schema(
        responses={200: OrderSerializer(many=True)},
        description="List all orders for the authenticated user",
        tags=['Orders']
    )
    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    
    
class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]

    @extend_schema(
        request=OrderCreateSerializer,
        responses={201: OrderSerializer},
        description="Create a new order",
        tags=['Orders']
    )
    def post(self, request):
        hotel = get_object_or_404(Hotel, id=request.data.get('hotel'))
        guests = request.data.get('guests')
        if guests <= 0:
            return Response({"error": "Invalid number of guests"}, status=status.HTTP_400_BAD_REQUEST)
        
        if guests % hotel.total_beds != 0:
            minimum_rooms = guests // hotel.total_beds + 1
        else:
            minimum_rooms = guests // hotel.total_beds

        if hotel.total_rooms < minimum_rooms:
            return Response({"error": "Not enough rooms available"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=request.user,hotel=hotel,room_count=minimum_rooms)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class OrderRatingView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]
    @extend_schema(
        summary="Rate a completed order",
        description="Allow users to rate their completed orders",
        request=OrderRatingSerializer,
        responses={
            200: OpenApiResponse(description="Rating submitted successfully"),
            400: OpenApiResponse(description="Invalid rating or order not completed"),
            404: OpenApiResponse(description="Order not found")
        }
    )
    def post(self, request, order_id):
        try:
            with transaction.atomic():
                # 获取订单并检查状态
                order = Order.objects.get(
                    id=order_id, 
                    user=request.user,  # 确保是用户自己的订单
                    status='completed'  # 只能评价已完成的订单
                )
                
                rating = request.data.get('rating')
                if not rating or not (1 <= int(rating) <= 5):
                    return Response({
                        'error': 'Invalid rating. Must be between 1 and 5'
                    }, status=status.HTTP_400_BAD_REQUEST)

                order.rating = rating
                order.save()

                update_hotel_rating.delay(order.hotel.id)

                return Response({
                    'message': 'Rating submitted successfully',
                    'new_hotel_rating': order.hotel.rating
                })

        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found or not completed'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        


class OrderCompletedView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]
    @extend_schema(
        summary="Complete an order",
        description="Complete an order",
        tags=['Orders']
    )
    def post(self, request, order_id):
        try:
            with transaction.atomic():  
                order = get_object_or_404(Order, id=order_id, user=request.user,status='paid')
                order.status = 'completed'
                order.save()
                commission = Commission.objects.create(order=order,commission_rate=0.1)
                owner_commission = order.total_price * 0.9
                owner = order.hotel.owner
                owner.balance += owner_commission
                owner.save()
                commission.save()
                return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        
