database migrations:
python manage.py makemigrations
python manage.py migrate

django server:python manage.py runserver

celery task command:celery -A config worker --loglevel=info

redis server start: brew services start redis

redis server stop: brew services stop redis

admin-account:
    username:alyssa92
    password:123456