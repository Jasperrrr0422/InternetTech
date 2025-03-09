from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

@shared_task
def send_order_confirmation_email(order_id):
    try:
        from bookings.models import Order  # 避免循环导入
        
        # 获取订单信息
        order = Order.objects.select_related('user', 'hotel').get(id=order_id)
        
        # 准备模板上下文
        context = {
            'order': order,
            'frontend_url': settings.FRONTEND_URL
        }
        
        # 渲染HTML邮件内容
        html_message = render_to_string('emails/order_confirmation.html', context)
        plain_message = strip_tags(html_message)  # 创建纯文本版本
        
        # 发送邮件
        send_mail(
            subject=f'Order Confirmation - #{order.id}',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email]
        )
        
        return f"Order confirmation email sent to {order.user.email}"
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise