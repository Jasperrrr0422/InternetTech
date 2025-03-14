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
    amentities = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    amentities_detail = AmentitySerializer(
        source='amentities',
        many=True,
        read_only=True
    )
    owner_name = serializers.SerializerMethodField()
    class Meta:  
        model = Hotel  
        fields = [  
            'id', 'name', 'description', 'address',  
            'image_url', 'price_per_night', 'total_rooms',  
            'total_beds', 'owner', 'owner_name', 
            'amentities', 'amentities_detail',
            'image', 'rating'
        ]  
        read_only_fields = ['image_url', 'owner']  

    def to_internal_value(self, data):
        data = data.copy()
        
        # 处理 amentities 字段
        if 'amentities' in data:
            # 获取字符串并分割
            amentities_string = data.get('amentities')
            # 转换为列表
            data.setlist('amentities', amentities_string.split(','))
        
        return super().to_internal_value(data)

    def get_owner_name(self, obj):
        return obj.owner.username
    
    def validate_amentities(self, value):
        if not value:
            return []

        amentities_objects = []
        for name in value:
            amenity = Amentity.objects.filter(name=name.strip()).first()
            if amenity:
                amentities_objects.append(amenity)
            else:
                raise serializers.ValidationError(
                    f"Amenity `{name.strip()}` does not exist."
                )
        return amentities_objects
    
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
        print("create 方法收到的数据:", validated_data)  # 添加调试信息
        amentities = validated_data.pop('amentities', [])
        hotel = Hotel.objects.create(**validated_data)
        if amentities:
            hotel.amentities.set(amentities)
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




