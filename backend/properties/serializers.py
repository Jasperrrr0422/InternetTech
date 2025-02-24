from rest_framework import serializers  
from .models import Hotel, Amentity
from drf_spectacular.utils import extend_schema_field

class HotelSerializer(serializers.ModelSerializer):  
    image_url = serializers.SerializerMethodField()  
    owner = serializers.PrimaryKeyRelatedField(read_only=True)  
    amentities = serializers.ListField(  
        child=serializers.CharField(),  
        write_only=True, 
    )  

    class Meta:  
        model = Hotel  
        fields = [  
            'id', 'name', 'description', 'address',  
            'image_url', 'price_per_night', 'total_rooms',  
            'total_beds', 'owner', 'amentities', 'image'  
        ]  
        read_only_fields = ['image_url', 'owner']  

    def validate_amentities(self, value):  
        """  
        验证 amentities 字段，并将名称转换为设施主键 ID。  
        """  
        if not value:  
            raise serializers.ValidationError("The amenities list cannot be empty.")  
        
        # 转换设施名称为主键 ID
        value = value[0].split(',')
        amenities_objects = []  
        for amenity_name in value:  
            amenity = Amentity.objects.filter(name=amenity_name).first()  
            if amenity:  
                amenities_objects.append(amenity)  
            else:  
                raise serializers.ValidationError(  
                    f"Amenity `{amenity_name}` does not exist."  
                )
        return amenities_objects  
    def validate_image(self, value):  
        """  
        校验上传图片的格式和大小。  
        """  
        if value:  
            if not value.content_type.startswith('image/'):  
                raise serializers.ValidationError("File type not supported.")  
            if value.size > 5 * 1024 * 1024:  
                raise serializers.ValidationError("Image size too large. Maximum size is 5MB.")  
        return value
    
    @extend_schema_field(serializers.URLField)
    def get_image_url(self, obj):
        # 获取图片 URL  
        if obj.image:  
            request = self.context.get('request')  
            return request.build_absolute_uri(obj.image.url)  
        return None  

    def create(self, validated_data):  
        # 从 amenities 中取出数据  
        amenities = validated_data.pop('amentities', [])  

        # 创建酒店  
        hotel = Hotel.objects.create(**validated_data)  

        # 绑定设施
        for amenity in amenities:
            hotel.amentities.add(amenity)  

        return hotel


class AmentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amentity
        fields = ['name']