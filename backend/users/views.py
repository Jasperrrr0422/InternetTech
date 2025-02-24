# Create your views here.
from rest_framework.views import APIView  
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions, status  
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserRegisterSerializer, UserLoginSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse


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
    
class TokenVerifyView(APIView):  
    permission_classes = [IsAuthenticated]  

    @extend_schema(  
        summary="Verify User's Access Token",  
        description=(  
            "This API endpoint is used to verify the validity of the user's access token. "  
            "If the token is valid, the endpoint returns the user's information, including "  
            "user ID, username, email, and a success message. "  
            "This endpoint requires the user to include the `Authorization` header in the format: Bearer <access_token>."  
        ),  
        responses={  
            status.HTTP_200_OK: {  
                "type": "object",  
                "properties": {  
                    "user_id": {"type": "integer", "description": "The unique ID of the user."},  
                    "username": {"type": "string", "description": "The username of the user."},  
                    "email": {"type": "string", "description": "The email address of the user."},  
                    "message": {"type": "string", "description": "A success message indicating the token is valid."},  
                },  
                "description": "If the token is valid, the API returns the user's information and a success message.",  
            },  
            status.HTTP_401_UNAUTHORIZED: {  
                "type": "string",  
                "description": "The access token is either invalid, expired, or missing.",  
            },  
        },  
        tags=["Authentication"],  
    )  
    def get(self, request):  
        user = request.user  
        return Response({  
            "user_id": user.id,  
            "username": user.username,  
            "email": user.email,  
            "message": "Token is valid."  
        }, status=status.HTTP_200_OK)  