import subprocess
import sys
import os
from time import sleep

def run_server():
    subprocess.Popen(["python", "manage.py", "runserver"], cwd="backend")

def run_celery():
    subprocess.Popen(["celery", "-A", "config", "worker", "--loglevel=info"], cwd="backend")
    
def run_redis():
    subprocess.Popen(["brew", "services", "start", "redis"])
    
def run_all():
    print("Starting Redis...")
    run_redis()
    sleep(2)  # 等待Redis启动
    
    print("Starting Celery worker...")
    run_celery()
    sleep(2)  # 等待Celery启动
    
    print("Starting Django server...")
    run_server()
    
    # 保持脚本运行
    try:
        while True:
            sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all services...")
        subprocess.run(["brew", "services", "stop", "redis"])
        sys.exit(0)
    
if __name__ == "__main__":
    run_all()
    