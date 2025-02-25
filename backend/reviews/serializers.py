from rest_framework import serializers  
from .models import Review
from users.serializers import UserSerializer
from properties.models import Hotel
class ReviewCreateSerializer(serializers.ModelSerializer):  
    parent = serializers.PrimaryKeyRelatedField(  
        queryset=Review.objects.all(),  
        required=False,  
        allow_null=True  
    ) 
    class Meta:  
        model = Review  
        fields = ['id', 'hotel', 'comment', 'parent', 'created_at']  
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
    

# 递归评论序列化器  
class RecursiveReviewSerializer(serializers.Serializer):  
    def to_representation(self, value):  
        serializer = ReviewDetailSerializer(value, context=self.context)  
        return serializer.data  

# 评论详情序列化器  
class ReviewDetailSerializer(serializers.ModelSerializer):  
    user = UserSerializer(read_only=True)  
    children = RecursiveReviewSerializer(many=True, read_only=True)  
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)  
    
    class Meta:  
        model = Review  
        fields = ['user', 'comment', 'created_at', 'children']  


# 酒店评论列表序列化器  
class HotelReviewsSerializer(serializers.ModelSerializer):  
    reviews = serializers.SerializerMethodField()
    review_id = serializers.IntegerField(source='id', read_only=True)

    class Meta:  
        model = Hotel  
        fields = ['review_id', 'name', 'reviews']  
    
    def get_reviews(self, obj):  
        # 只获取直接评论酒店的评论（没有父评论的）  
        top_level_reviews = obj.reviews.filter(parent=None).select_related('user')  
        return ReviewDetailSerializer(top_level_reviews, many=True, context=self.context).data  



    
    