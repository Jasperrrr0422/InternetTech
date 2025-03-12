from rest_framework.views import APIView
from rest_framework.response import Response
from bookings.models import Order
from django.conf import settings
import paypalrestsdk
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsUserRole
from django.db import transaction
from payments.tasks import send_order_confirmation_email
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample

paypalrestsdk.configure({
    "mode": "sandbox",
    "client_id": "AT2CWuH6c2URfyHAFcpFDpMwM-N78CrVrcI82yw6XGu3Gkj0HYzQnDI7CqEXKXaElTBhgn5Qzp-YYZ8D",
    "client_secret": "EDWrROzoxgoZkzuMnhiUE-Pg31B9jcbVxtVHDHveIe5meCsQsxMfb5EJE-g9s-XzSaXQpOaZ-0xcZXy5"
})

class PayPalCreateView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]

    @extend_schema(
        summary="Create PayPal Payment",
        description="Create a PayPal payment for a pending order",
        tags=["Payments"],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'order_id': {'type': 'integer', 'description': 'Order ID'}
                },
                'required': ['order_id']
            }
        },
        responses={
            200: OpenApiResponse(
                description="Payment created successfully",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            'approval_url': 'https://www.sandbox.paypal.com/...'
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid request or payment creation failed",
                examples=[
                    OpenApiExample(
                        "Error Response",
                        value={
                            'error': 'Payment creation failed'
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description="Order not found",
                examples=[
                    OpenApiExample(
                        "Not Found Error",
                        value={
                            'error': 'Order not found'
                        }
                    )
                ]
            )
        }
    )
    def post(self, request):
        try:
            with transaction.atomic():
                order_id = request.data.get('order_id')
                order = Order.objects.get(id=order_id, user=request.user,status='pending')

                payment = paypalrestsdk.Payment({
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": f"{settings.FRONTEND_URL}/userpage?success=true&order_id={order.id}",
                        "cancel_url": f"{settings.FRONTEND_URL}/userpage?success=false&order_id={order.id}"
                    },
                    "transactions": [{
                        "amount": {
                            "total": str(order.total_price),
                            "currency": "GBP"
                        },
                        "description": f"Payment for Order #{order.id}"
                    }]
                })

                if payment.create():
                    approval_url = next(link.href for link in payment.links if link.rel == 'approval_url')
                    return Response({'approval_url': approval_url})
                else:
                    return Response({'error': payment.error}, status=400)

        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class PayPalExecuteView(APIView):
    @extend_schema(
        summary="Execute PayPal Payment",
        description="Execute a PayPal payment after user approval",
        tags=["Payments"],
        parameters=[
            OpenApiParameter(
                name='order_id',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Order ID'
            ),
            OpenApiParameter(
                name='paymentId',
                type=str,
                location=OpenApiParameter.QUERY,
                description='PayPal Payment ID'
            ),
            OpenApiParameter(
                name='PayerID',
                type=str,
                location=OpenApiParameter.QUERY,
                description='PayPal Payer ID'
            ),
        ],
        responses={
            200: OpenApiResponse(
                description="Payment executed successfully",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            'message': 'Payment completed successfully',
                            'order_id': 1
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid request or payment execution failed",
                examples=[
                    OpenApiExample(
                        "Error Response",
                        value={
                            'error': 'Payment execution failed'
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description="Order not found",
                examples=[
                    OpenApiExample(
                        "Not Found Error",
                        value={
                            'error': 'Order not found'
                        }
                    )
                ]
            )
        }
    )
    def get(self, request):
        try:
            with transaction.atomic():
                order_id = request.query_params.get('order_id')
                payment_id = request.query_params.get('paymentId')
                payer_id = request.query_params.get('PayerID')
                
                # 获取订单
                order = Order.objects.get(id=order_id, user=request.user)


                if order.status == "paid":
                    return Response({  
                    'message': 'Payment already processed',  
                    'order_id': order_id  
                }) 
                
                # 执行支付
                payment = paypalrestsdk.Payment.find(payment_id)
                if payment.execute({"payer_id": payer_id}):
                    # 更新订单状态
                    order.status = 'paid'
                    order.save()

                    
                    send_order_confirmation_email.delay(order_id)
                    return Response({
                        'message': 'Payment completed successfully',
                        'order_id': order_id
                    })
                else:
                    return Response({'error': payment.error}, status=400)
                
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        