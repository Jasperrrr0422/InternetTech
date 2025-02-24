from django.core.management.base import BaseCommand
from django.core.files import File
from pathlib import Path
from users.models import User
from properties.models import Hotel, Amentity
from faker import Faker
import random
from pathlib import Path

def get_images_pathlib():
    image_dir = Path('config/static/imgs')
    # 支持的图片格式
    image_patterns = ('*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp')
    
    image_files = []
    for pattern in image_patterns:
        # 递归搜索所有匹配的文件
        image_files.extend(image_dir.rglob(pattern))
    
    return image_files

class Command(BaseCommand):
    help = 'Create hotels with images and assign to owners'

    def handle(self, *args, **options):
        fake = Faker()
        images = get_images_pathlib()
        if not images:
            self.stdout.write(self.style.WARNING('No images found!'))
            return
        
        # 获取所有amenities用于随机分配
        amenities = list(Amentity.objects.all())
        if not amenities:
            self.stdout.write(self.style.WARNING('No amenities found!'))
        owner = User.objects.filter(role='owner')
        print(len(owner))
        if not owner:
            self.stdout.write(self.style.WARNING('No owner found!'))
            return
        owners = list(owner)[4:]
        # 为每张图片创建酒店
        for i, image_path in enumerate(images):
            # 选择owner (均匀分配)
            owner = owners[i % len(owners)]
            
            # 创建酒店
            with open(image_path, 'rb') as img_file:
                hotel = Hotel.objects.create(
                    name=fake.company(),
                    description=fake.text(),
                    address=fake.address(),
                    price_per_night=random.randint(100, 1000),
                    total_rooms=random.randint(2, 10),
                    total_beds=random.randint(1, 7),
                    owner=owner,
                    image=File(img_file, name=image_path.name)
                )
                
                # 随机添加2-5个amenities
                if amenities:
                    selected_amenities = random.sample(
                        amenities, 
                        k=min(random.randint(2, 10), len(amenities))
                    )
                    for amentity in selected_amenities:
                        hotel.amentities.add(amentity)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created hotel: {hotel.name} (Owner: {owner.username})'
                    )
                )
