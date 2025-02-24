from rest_framework.views import APIView  
from rest_framework import status  
from rest_framework.response import Response  
from rest_framework.permissions import IsAuthenticated  
from django.shortcuts import get_object_or_404  
from .models import Hotel, Amentity
from users.permissions import IsOwnerRole, IsAdminRole, IsUserRole
from .serializers import HotelSerializer, AmentitySerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse  
from drf_spectacular.types import OpenApiTypes  
from rest_framework import status  
from rest_framework.views import APIView  
from rest_framework.response import Response  
from rest_framework.permissions import IsAuthenticated  
from django.core.exceptions import ValidationError  

class HotelAPIView(APIView):  
    permission_classes = [IsAuthenticated, IsOwnerRole]  
    
    @extend_schema(  
        summary="获取酒店列表",  
        description="返回所有酒店信息列表",  
        tags=["酒店管理"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer(many=True),  
                description="成功获取酒店列表"  
            )  
        },  
        examples=[  
            OpenApiExample(  
                "成功响应示例",  
                value=[{  
                    "id": 1,  
                    "name": "豪华大酒店",  
                    "description": "五星级酒店",  
                    "address": "市中心地段",  
                    "image_url": "http://example.com/media/hotels/image.jpg",  
                    "price_per_night": "888.00",  
                    "total_rooms": 100,  
                    "owner": 1  
                }]  
            )  
        ]  
    )  
    def get(self, request):  
        hotels = Hotel.objects.filter(owner=request.user)  
        serializer = HotelSerializer(  
            hotels,  
            many=True,  
            context={'request': request}  
        )  
        return Response(serializer.data)  

    @extend_schema(  
        summary="创建新酒店（含图片上传）",  
        description="创建新酒店信息，同时上传酒店图片。所有者将自动设置为当前认证用户。",  
        tags=["酒店管理"],  
        request={  
            'multipart/form-data': {  
                'type': 'object',  
                'properties': {  
                    'name': {'type': 'string', 'description': '酒店名称'},  
                    'description': {'type': 'string', 'description': '酒店描述'},  
                    'address': {'type': 'string', 'description': '酒店地址'},  
                    'price_per_night': {'type': 'number', 'description': '每晚价格'},  
                    'total_rooms': {'type': 'integer', 'description': '房间总数'},  
                    'total_beds': {'type': 'integer', 'description': '床位总数'},
                    'amentities': {'type': 'array', 'items': {'type': 'string'}, 'description': '设施列表'},
                    'image': {'type': 'string', 'format': 'binary', 'description': '酒店图片'}  
                },  
                'required': ['name', 'address', 'price_per_night', 'total_rooms']  
            }  
        },  
        responses={  
            201: OpenApiResponse(  
                response=HotelSerializer,  
                description="酒店创建成功",  
                examples=[  
                    OpenApiExample(  
                        "创建成功",  
                        value={  
                            "id": 1,  
                            "name": "豪华大酒店",  
                            "description": "五星级酒店",  
                            "address": "市中心地段",  
                            "image_url": "http://example.com/media/hotels/image.jpg",  
                            "price_per_night": "888.00",  
                            "total_rooms": 100,  
                            "owner": 1  
                        }  
                    )  
                ]  
            ),  
            400: OpenApiResponse(  
                description="请求数据验证失败",  
                examples=[  
                    OpenApiExample(  
                        "验证错误 - 缺少必填字段",  
                        value={  
                            "name": ["This field is required."],  
                            "address": ["This field is required."]  
                        }  
                    ),  
                    OpenApiExample(  
                        "验证错误 - 图片相关",  
                        value={  
                            "error": "Image size too large. Maximum size is 5MB"  
                        }  
                    )  
                ]  
            ),  
            401: OpenApiResponse(  
                description="未认证",  
                examples=[  
                    OpenApiExample(  
                        "认证错误",  
                        value={  
                            "detail": "Authentication credentials were not provided."  
                        }  
                    )  
                ]  
            )  
        }  
    )  
    def post(self, request):
        try:
            serializer = HotelSerializer(data=request.data, context={'request': request}) 
            if serializer.is_valid():  
                hotel = serializer.save(owner=request.user) 
                return Response(HotelSerializer(hotel, context={'request': request}).data, status=status.HTTP_201_CREATED)  

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

        except Exception as e:  
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)  


    
class AmentityListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(  
        summary="获取所有设施列表",  
        description="返回所有可用的酒店设施列表",  
        tags=["设施管理"],  
        responses={  
            200: AmentitySerializer(many=True),  
        },  
        examples=[  
            OpenApiExample(  
                "成功响应",  
                value=[  
                    {  
                        "id": 1,  
                        "name": "WiFi",  
                        "description": "免费无线网络"  
                    },  
                    {  
                        "id": 2,  
                        "name": "停车场",  
                        "description": "免费停车场"  
                    }  
                ]  
            )  
        ]  
    )  
    def get(self, request):
        amentities = Amentity.objects.all()
        serializer = AmentitySerializer(
            amentities,
            many=True
        )
        return Response(serializer.data)
    @extend_schema(  
        summary="创建新设施",  
        description="创建一个新的酒店设施",  
        tags=["设施管理"],  
        request=AmentitySerializer,  
        responses={  
            201: OpenApiResponse(  
                response=AmentitySerializer,  
                description="设施创建成功"  
            ),  
            400: OpenApiResponse(  
                description="请求数据验证失败",  
                examples=[  
                    OpenApiExample(  
                        "验证错误",  
                        value={  
                            "name": ["该字段是必填项。"],  
                            "description": ["描述长度不能超过200个字符。"]  
                        }  
                    )  
                ]  
            )  
        },  
        examples=[  
            OpenApiExample(  
                "请求示例",  
                value={   
                    "name": "室外恒温游泳池"  
                }  
            )  
        ]  
    )  
    def post(self, request):
        serializer = AmentitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    

class HotelListView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]
    @extend_schema(  
        summary="获取所有酒店列表",  
        description="返回所有酒店信息列表",  
        tags=["酒店管理"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer(many=True),  
                description="成功获取酒店列表"  
            )  
        },  
        examples=[  
            OpenApiExample(  
                "成功响应示例",  
                value=[{  
                    "id": 1,  
                    "name": "豪华大酒店",  
                    "description": "五星级酒店",  
                    "address": "市中心地段",  
                    "image_url": "http://example.com/media/hotels/image.jpg",  
                    "price_per_night": "888.00",  
                    "total_rooms": 100,  
                    "owner": 1  
                }]  
            )  
        ]  
    )
    def get(self, request):
        hotels = Hotel.objects.all()
        serializer = HotelSerializer(hotels, many=True, context={'request': request})
        return Response(serializer.data)