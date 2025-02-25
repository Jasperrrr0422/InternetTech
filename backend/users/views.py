# Create your views here.
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions, status  
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ParseError
from .serializers import UserRegisterSerializer, UserLoginSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse, inline_serializer


class Registerview(APIView):
    permission_classes = [permissions.AllowAny]
    @extend_schema(  
        request=UserRegisterSerializer,  
        responses={  
            status.HTTP_201_CREATED: {  
                'type': 'object',  
                'properties': {  
                    'username': {'type': 'string', 'description': '用户的用户名'},  
                    'email': {'type': 'string', 'description': '用户的邮箱地址'},  
                },  
                'description': '用户注册成功后的返回数据',  
            },  
            status.HTTP_400_BAD_REQUEST: {  
                'type': 'object',  
                'properties': {  
                    'username': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': '用户名的错误信息'  
                    },  
                    'email': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': '邮箱的错误信息'  
                    },  
                    'password': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': '密码的错误信息'  
                    },  
                },  
                'description': '用户注册时发生错误的返回数据',  
            },  
        },  
        description='用户注册接口，接受用户名、邮箱和密码',
        tags=["Authentication"],
    )  
    def post(self, request):  
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():  
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_201_CREATED)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer  
    @extend_schema(  
        request=UserLoginSerializer,  
        responses={  
            status.HTTP_200_OK: {  
                'type': 'object',  
                'properties': {  
                    'access': {'type': 'string', 'description': '访问令牌'},  
                    'refresh': {'type': 'string', 'description': '刷新令牌'},
                    'user_id': {'type': 'integer', 'description': '用户ID'},
                    'username': {'type': 'string', 'description': '用户名'},
                },  
                'description': '成功登录后返回的JWT令牌',  
            },  
            status.HTTP_401_UNAUTHORIZED: '无效的登录凭证',  
        },  
        description='用户登录并返回JWT令牌',
        tags=["Authentication"],
    )
    def post(self, request, *args, **kwargs):  
        return super().post(request, *args, **kwargs)
    

class RefreshTokenView(TokenRefreshView):
    @extend_schema(  
        request={  
            'type': 'object',  
            'properties': {  
                'refresh': {'type': 'string', 'description': '刷新令牌'},  
            },  
            'required': ['refresh'],  
        },  
        responses={  
            status.HTTP_200_OK: {  
                'type': 'object',  
                'properties': {  
                    'access': {'type': 'string', 'description': '新的访问令牌'},  
                    'expires_in': {'type': 'integer', 'description': '新的访问令牌有效时间（秒）'},  
                },  
                'description': '成功刷新令牌后返回的新的JWT访问令牌',  
            },  
            status.HTTP_401_UNAUTHORIZED: {  
                'type': 'object',  
                'properties': {  
                    'error': {'type': 'string', 'description': '错误信息'},  
                },  
                'description': '无效的刷新令牌',  
            },  
        },  
        description='使用刷新令牌获取新的访问令牌',
        tags=["Authentication"],
    )  
    def post(self, request, *args, **kwargs):  
        serializer = self.get_serializer(data=request.data)  
        try:  
            serializer.is_valid(raise_exception=True)  
        except Exception as e:  
            return Response(  
                {"error": "无效的刷新令牌"},  
                status=status.HTTP_401_UNAUTHORIZED  
            )  

        return Response({  
            "access": serializer.validated_data["access"],  
            "expires_in": 300  # 设置access token有效期（秒）  
        })
    
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        summary="用户登出",
        description="使用 refresh token 登出用户并将其加入黑名单",
        request=inline_serializer(
            name='LogoutRequest',
            fields={
                'refresh': serializers.CharField(help_text='刷新令牌')
            }
        ),examples=[
            OpenApiExample(
                name='登出请求示例',
                summary="标准登出请求",
                description="使用 refresh token 登出",
                value={
                    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                },
                request_only=True,
            )
        ],
        responses={
            200: OpenApiResponse(
                description="登出成功",
                examples=[
                    OpenApiExample(
                        "成功响应",
                        value={
                            "message": "成功登出"
                        }
                    )
                ]
            ),400: OpenApiResponse(
                description="请求错误",
                examples=[
                    OpenApiExample(
                        "错误响应",
                        value={
                            "error": "Refresh token is required"
                        }
                    )
                ]
            )
        },
        tags=["Authentication"],
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                raise ParseError('Refresh token is required')
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            if token.blacklisted:
                return Response({'message': 'Token already blacklisted'})
            
            return Response(
                {'message': '成功登出'}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )