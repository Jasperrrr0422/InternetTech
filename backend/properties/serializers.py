from rest_framework import serializers  
from .models import Hotel, Amentity
from drf_spectacular.utils import extend_schema_field


class AmentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amentity
        fields = ['name']


class HotelSerializer(serializers.ModelSerializer):  
    image_url = serializers.SerializerMethodField()  
    owner = serializers.PrimaryKeyRelatedField(read_only=True)   
    amentities = AmentitySerializer(many=True, required=False)
    owner_name = serializers.SerializerMethodField()
    class Meta:  
        model = Hotel  
        fields = [  
            'id', 'name', 'description', 'address',  
            'image_url', 'price_per_night', 'total_rooms',  
            'total_beds', 'owner','owner_name', 'amentities', 'image', 'rating'
        ]  
        read_only_fields = ['image_url', 'owner']  

    def to_internal_value(self, data):
        """
        重写to_internal_value方法来处理amenities的写入
        """
        amenities_data = data.get('amentities')
        if amenities_data and isinstance(amenities_data, str):
            # 如果是字符串，按逗号分割
            amenities_names = amenities_data.split(',')
            # 转换为序列化器期望的格式
            data = data.copy()
            data['amentities'] = [{'name': name.strip()} for name in amenities_names]
        
        return super().to_internal_value(data)

    def get_owner_name(self, obj):
        return obj.owner.username
    
    def validate_amenities(self, value):
        if not value:
            return []

        amenities_objects = []
        for item in value:
            if isinstance(item, dict):
                amenity_name = item.get('name')
            else:
                amenity_name = item  # 直接使用字符串

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
        amenities = validated_data.pop('amentities', [])
        hotel = Hotel.objects.create(**validated_data)
        if amenities:
            hotel.amentities.set(amenities)
        return hotel

    def update(self, instance, validated_data):
        amentities = validated_data.pop('amentities', None)
        # 更新其他字段
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了amenities，更新关系
        if amentities is not None:
            instance.amentities.set(amentities)
        
        return instance




