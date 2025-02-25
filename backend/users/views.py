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
                    'username': {'type': 'string', 'description': 'username'},  
                    'email': {'type': 'string', 'description': 'email'},  
                },  
                'description': 'Return data after successful user registration',  
            },  
            status.HTTP_400_BAD_REQUEST: {  
                'type': 'object',  
                'properties': {  
                    'username': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': 'error username'  
                    },  
                    'email': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': 'error email'  
                    },  
                    'password': {  
                        'type': 'array',   
                        'items': {'type': 'string'},  
                        'description': 'error password'  
                    },  
                },  
                'description': 'Return data after user registration error',  
            },  
        },  
        description='The API Endpoint for user registration.',
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
                    'access': {'type': 'string', 'description': 'access token'},  
                    'refresh': {'type': 'string', 'description': 'refresh token'},
                    'user_id': {'type': 'integer', 'description': 'user id'},
                    'username': {'type': 'string', 'description': 'username'},
                },  
                'description': 'Return data after successful login',  
            },  
            status.HTTP_401_UNAUTHORIZED: 'Invalid login credentials',  
        },  
        description='The API Endpoint for user login.',
        tags=["Authentication"],
    )
    def post(self, request, *args, **kwargs):  
        return super().post(request, *args, **kwargs)
    

class RefreshTokenView(TokenRefreshView):
    @extend_schema(  
        request={  
            'type': 'object',  
            'properties': {  
                'refresh': {'type': 'string', 'description': 'refresh token'},  
            },  
            'required': ['refresh'],  
        },  
        responses={  
            status.HTTP_200_OK: {  
                'type': 'object',  
                'properties': {  
                    'access': {'type': 'string', 'description': 'new access token'},  
                    'expires_in': {'type': 'integer', 'description': 'new access token expires in (seconds)'},  
                },  
                'description': 'Return data after successful refresh token',  
            },  
            status.HTTP_401_UNAUTHORIZED: {  
                'type': 'object',  
                'properties': {  
                    'error': {'type': 'string', 'description': 'error message'},  
                },  
                'description': 'Invalid refresh token',  
            },  
        },  
        description='The API Endpoint for refreshing access token.',
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
        summary="Logout",
        description="blacklist refresh token",
        request=inline_serializer(
            name='LogoutRequest',
            fields={
                'refresh': serializers.CharField(help_text='refresh token')
            }
        ),examples=[
            OpenApiExample(
                name='Logout Request Example',
                summary="Standard Logout Request",
                description="Logout using refresh token",
                value={
                    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                },
                request_only=True,
            )
        ],
        responses={
            200: OpenApiResponse(
                description="Logout successfully",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "message": "Logout successfully"
                        }
                    )
                ]
            ),400: OpenApiResponse(
                description="Request error",
                examples=[
                    OpenApiExample(
                        "Error Response",
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
                {'message': 'Logout successfully'}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )