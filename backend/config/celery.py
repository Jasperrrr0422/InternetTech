import os  
from celery import Celery  

# 设置Django设置模块  
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  

app = Celery('config')  

# 使用Django的settings.py配置Celery  
app.config_from_object('django.conf:settings', namespace='CELERY')  

# 自动发现任务  
app.autodiscover_tasks()  

@app.task(bind=True)  
def debug_task(self):  
    print(f'Request: {self.request!r}')