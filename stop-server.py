# 停止所有服务
import subprocess
import sys
import os
import signal
import psutil

def find_process_by_name(name):
    """查找指定名称的进程"""
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            # 检查进程名和命令行参数
            if name in str(proc.info['cmdline']):
                processes.append(proc)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return processes

def stop_django():
    print("Stopping Django server...")
    processes = find_process_by_name("manage.py runserver")
    for proc in processes:
        try:
            proc.terminate()
            print(f"Django server (PID: {proc.pid}) stopped")
        except:
            print(f"Failed to stop Django server process {proc.pid}")

def stop_celery():
    print("Stopping Celery worker...")
    processes = find_process_by_name("celery -A config worker")
    for proc in processes:
        try:
            proc.terminate()
            print(f"Celery worker (PID: {proc.pid}) stopped")
        except:
            print(f"Failed to stop Celery worker process {proc.pid}")

def stop_redis():
    print("Stopping Redis service...")
    try:
        subprocess.run(["brew", "services", "stop", "redis"], check=True)
        print("Redis service stopped")
    except subprocess.CalledProcessError:
        print("Failed to stop Redis service")

def stop_all():
    print("=== Stopping all services ===\n")
    
    # 1. 停止Django
    stop_django()
    
    # 2. 停止Celery
    stop_celery()
    
    # 3. 停止Redis
    stop_redis()
    
    print("\n=== All services stopped ===")

if __name__ == "__main__":
    stop_all()