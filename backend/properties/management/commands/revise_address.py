from django.core.management.base import BaseCommand
from properties.models import Hotel
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Update hotel addresses to Glasgow area addresses'

    def handle(self, *args, **options):
        fake = Faker('en_GB')  # 使用英国地区的 Faker
        
        # 格拉斯哥主要区域
        glasgow_areas = [
            'City Centre', 'West End', 'Merchant City', 
            'Finnieston', 'Southside', 'East End',
            'Hillhead', 'Partick', 'Dennistoun', 'Govanhill'
        ]
        
        # 格拉斯哥主要街道
        glasgow_streets = [
            'Buchanan Street', 'Sauchiehall Street', 'Argyle Street',
            'Byres Road', 'Great Western Road', 'Duke Street',
            'High Street', 'George Square', 'Queen Street',
            'Hope Street', 'Bath Street', 'St Vincent Street'
        ]
        
        # 格拉斯哥邮编前缀
        postcodes = ['G1', 'G2', 'G3', 'G4', 'G11', 'G12', 'G20', 'G31', 'G41', 'G42']
        
        hotels = Hotel.objects.all()
        updated_count = 0
        
        for hotel in hotels:
            # 生成格拉斯哥风格的地址
            street_number = random.randint(1, 200)
            street = random.choice(glasgow_streets)
            area = random.choice(glasgow_areas)
            postcode = f"{random.choice(postcodes)} {random.randint(1, 9)}XX"
            
            address = f"{street_number} {street}\n{area}\nGlasgow\n{postcode}\nScotland, UK"
            
            # 更新酒店地址
            hotel.address = address
            hotel.save()
            updated_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated address for hotel: {hotel.name}\n'
                    f'New address: {address}\n'
                    f'----------------------------'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully updated {updated_count} hotel addresses'
            )
        )