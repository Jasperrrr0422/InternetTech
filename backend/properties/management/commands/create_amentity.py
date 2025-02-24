from django.core.management.base import BaseCommand
from properties.models import Amentity

class Command(BaseCommand):
    help = 'Create common hotel amenities'

    def handle(self, *args, **options):
        # 常见酒店设施列表
        amenities = [
            # 基础设施
            'WiFi', 'Air Conditioning', 'Heating', 'Elevator', 
            'Parking', '24/7 Front Desk',
            
            # 房间设施
            'TV', 'Mini Bar', 'Safe', 'Hair Dryer', 
            'Coffee Machine', 'Iron',
            
            # 娱乐设施
            'Swimming Pool', 'Gym', 'Spa', 'Sauna', 
            'Game Room', 'Kids Club',
            
            # 餐饮设施
            'Restaurant', 'Bar', 'Room Service', 'Breakfast', 
            'Coffee Shop', 'Mini Kitchen',
            
            # 商务设施
            'Business Center', 'Meeting Rooms', 'Conference Room',
            'Printing Service',
            
            # 其他服务
            'Laundry Service', 'Dry Cleaning', 'Luggage Storage',
            'Airport Shuttle', 'Concierge Service'
        ]

        # 创建设施
        created_count = 0
        for amenity_name in amenities:
            amenity, created = Amentity.objects.get_or_create(
                name=amenity_name
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created amenity: {amenity_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Amenity already exists: {amenity_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new amenities'
            )
        )