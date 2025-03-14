from users.models import User
from django.core.management.base import BaseCommand
from faker import Faker

class Command(BaseCommand):
    help = 'Create a new admin'
    def add_arguments(self, parser):
        parser.add_argument('--nums', default=1, type=int, help='How many admins to create')
    
    def handle(self, *args, **kwargs):
        fake = Faker()
        nums = kwargs['nums']
        for i in range(nums):
            username = fake.user_name()
            email = fake.email()
            first_name = fake.first_name()
            last_name = fake.last_name()
            user = User.objects.create_user(username=username, email=email, first_name=first_name, last_name=last_name, role='admin')
            password = "123456"
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'User {username} has been created successfully'))
        self.stdout.write(self.style.SUCCESS(f'{nums} admins have been created successfully'))
