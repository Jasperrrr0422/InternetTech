from rest_framework.views import APIView
from rest_framework.response import Response
from bookings.models import Order
from django.conf import settings
import paypalrestsdk
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsUserRole
from django.shortcuts import get_object_or_404
from decimal import Decimal 
from django.db import transaction
from payments.tasks import send_order_confirmation_email

paypalrestsdk.configure({
    "mode": "sandbox",
    "client_id": "AT2CWuH6c2URfyHAFcpFDpMwM-N78CrVrcI82yw6XGu3Gkj0HYzQnDI7CqEXKXaElTBhgn5Qzp-YYZ8D",
    "client_secret": "EDWrROzoxgoZkzuMnhiUE-Pg31B9jcbVxtVHDHveIe5meCsQsxMfb5EJE-g9s-XzSaXQpOaZ-0xcZXy5"
})

class PayPalCreateView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]
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
                        "return_url": f"{settings.FRONTEND_URL}/payment/success?order_id={order.id}",
                        "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel?order_id={order.id}"
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
    def get(self, request):
        try:
            with transaction.atomic():
                order_id = request.query_params.get('order_id')
                payment_id = request.query_params.get('paymentId')
                payer_id = request.query_params.get('PayerID')
                
                # 获取订单
                order = Order.objects.get(id=order_id, user=request.user)
            
                # 执行支付
                payment = paypalrestsdk.Payment.find(payment_id)
                if payment.execute({"payer_id": payer_id}):
                    # 更新订单状态
                    order.status = 'paid'
                    order.save()

                    

                    send_order_confirmation_email.delay(order.id, order.user.email)

                    return Response({
                        'message': 'Payment completed successfully',
                        'order_id': order.id
                    })
                else:
                    return Response({'error': payment.error}, status=400)
                
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        