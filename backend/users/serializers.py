from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model  

User = get_user_model()  

class UserRegisterSerializer(serializers.ModelSerializer):  
    password = serializers.CharField(write_only=True)  

    class Meta:  
        model = User  
        fields = ['username', 'email', 'password', 'first_name', 'last_name','role']  

    def create(self, validated_data):  
        user = User(  
            username=validated_data['username'],  
            email=validated_data['email'],  
            first_name=validated_data['first_name'],  
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )  
        user.set_password(validated_data['password'])
        user.save()  
        return user   

class UserLoginSerializer(TokenObtainPairSerializer):  
    # 继承自JWT基础序列化器  
    def validate(self, attrs):  
        # 调用父类验证逻辑生成Token  
        data = super().validate(attrs)  
        
        # 添加自定义响应字段  
        data.update({  
            "user_id": self.user.id,  
            "username": self.user.username  
        })  
        return data 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
