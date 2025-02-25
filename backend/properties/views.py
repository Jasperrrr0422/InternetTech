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
from .pagination import HotelPagination
from django.db.models import Q  
from django.core.cache import cache   
from django.utils.decorators import method_decorator  
from django.views.decorators.cache import cache_page  

class HotelUploadByOwner(APIView):  
    permission_classes = [IsAuthenticated, IsOwnerRole]  

    @extend_schema(  
        summary="获取酒店列表(owner可以使用)",  
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
    pagination_class = HotelPagination  

    @extend_schema(  
        summary="获取所有酒店列表(user可以使用)",  
        description="返回所有酒店信息列表，支持分页、搜索、排序和价格筛选",  
        tags=["酒店管理"],  
        parameters=[  
            OpenApiParameter(  
                name='page',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='页码(默认:1)'  
            ),  
            OpenApiParameter(  
                name='page_size',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='每页数量(默认:12'  
            ),  
            OpenApiParameter(  
                name='search',  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='搜索关键词（搜索名称、描述和地址）'  
            ),  
            OpenApiParameter(  
                name='min_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='最低价格'  
            ),  
            OpenApiParameter(  
                name='max_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='最高价格'  
            ),  
            OpenApiParameter(  
                name='ordering',  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='排序字段(例如:price_per_night, -price_per_night, total_rooms, -total_rooms, created_at, -created_at)'  
            ),  
        ],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer(many=True),  
                description="成功获取酒店列表"  
            ),  
            400: OpenApiResponse(  
                description="请求参数错误",  
                examples=[  
                    OpenApiExample(  
                        "参数错误",  
                        value={  
                            "code": 400,  
                            "message": "参数错误",  
                            "data": {"error": "Invalid price range"}  
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
                            "code": 401,  
                            "message": "Authentication credentials were not provided.",  
                            "data": None  
                        }  
                    )  
                ]  
            )  
        }  
    )  
    @method_decorator(cache_page(60 * 5))  # 缓存5分钟  
    def get(self, request):  
        try:  
            search = request.query_params.get('search', '')
            min_price = request.query_params.get('min_price')  
            max_price = request.query_params.get('max_price')  
            ordering = request.query_params.get('ordering', '-created_at')  
  
            queryset = Hotel.objects.all().select_related('owner')  

            if search and search.strip():  
                queryset = queryset.filter(  
                    Q(name__icontains=search) |  
                    Q(description__icontains=search) |  
                    Q(address__icontains=search)  
                )  
  
            if min_price:  
                try:  
                    queryset = queryset.filter(price_per_night__gte=float(min_price))  
                except ValueError:  
                    return Response({  
                        'code': 400,  
                        'message': '最低价格参数无效',  
                        'data': None  
                    }, status=status.HTTP_400_BAD_REQUEST)  

            if max_price:  
                try:  
                    queryset = queryset.filter(price_per_night__lte=float(max_price))  
                except ValueError:  
                    return Response({  
                        'code': 400,  
                        'message': '最高价格参数无效',  
                        'data': None  
                    }, status=status.HTTP_400_BAD_REQUEST)  

            # 排序  
            if ordering:  
                valid_ordering_fields = ['price_per_night', '-price_per_night',   
                                       'total_rooms', '-total_rooms',  
                                       'created_at', '-created_at']  
                if ordering in valid_ordering_fields:  
                    queryset = queryset.order_by(ordering)  

            # 分页  
            paginator = self.pagination_class()  
            page_data = paginator.paginate_queryset(queryset, request)  
            
            serializer = HotelSerializer(  
                page_data,  
                many=True,  
                context={'request': request}  
            )  

            return paginator.get_paginated_response(serializer.data) 
                
            

        except Exception as e:  
            return Response({  
                'code': 500,  
                'message': 'server error',  
                'data': {'error': str(e)}  
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class HotelDetailViewById(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]  

    @extend_schema(  
        summary="获取酒店详情(user可以使用)",  
        description="返回指定酒店的详细信息",  
        tags=["酒店管理"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer,  
                description="成功获取酒店详情"  
            ),  
            404: OpenApiResponse(  
                description="酒店不存在",  
                examples=[  
                    OpenApiExample(  
                        "酒店不存在",  
                        value={  
                            "code": 404,  
                            "message": "酒店不存在",  
                            "data": {"error": "Hotel not found"}  
                        }  
                    )  
                ]  
            )  
        }  
    )  
    def get(self, request, pk):  
        hotel = get_object_or_404(Hotel, pk=pk)  
        serializer = HotelSerializer(hotel, context={'request': request})  
        return Response(serializer.data)
    

class HotelDetailViewByOnwer(APIView):
    permission_classes = [IsAuthenticated, IsOwnerRole]  

    @extend_schema(  
        summary="获取酒店详情(owner可以使用)",  
        description="返回指定酒店的详细信息",  
        tags=["酒店管理"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer,  
                description="成功获取酒店详情"  
            ),  
            404: OpenApiResponse(  
                description="酒店不存在",  
                examples=[  
                    OpenApiExample(  
                        "酒店不存在",  
                        value={  
                            "code": 404,  
                            "message": "酒店不存在",  
                            "data": {"error": "Hotel not found"}  
                        }  
                    )  
                ]  
            )  
        }  
    )  
    def get(self, request, pk):
        if pk:
            hotel = get_object_or_404(Hotel, pk=pk, owner=request.user)
        hotel = get_object_or_404(Hotel, owner=request.user)  
        serializer = HotelSerializer(hotel, context={'request': request})  
        return Response(serializer.data)
    @extend_schema(
        summary="更新酒店信息(owner可以使用)",
        description="更新指定酒店的信息",
        tags=["酒店管理"],
        request=HotelSerializer,
        responses={
            200: OpenApiResponse(
                response=HotelSerializer,
                description="酒店信息更新成功"
            ),
            400: OpenApiResponse(
                description="请求数据验证失败",
                examples=[
                    OpenApiExample(
                        "验证错误",
                        value={
                            "name": ["该字段是必填项。"],
                            "address": ["该字段是必填项。"]
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description="酒店不存在",
                examples=[
                    OpenApiExample(
                        "酒店不存在",
                        value={
                            "code": 404,
                            "message": "酒店不存在",
                            "data": {"error": "Hotel not found"}
                        }
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                "请求示例",
                value={
                    "name": "豪华大酒店",
                    "description": "五星级酒店",
                    "address": "市中心地段",
                    "price_per_night": "888.00",
                    "total_rooms": 100
                }
            )])
    def put(self, request, pk):  
        hotel = get_object_or_404(Hotel, pk=pk, owner=request.user)  
        serializer = HotelSerializer(hotel, data=request.data, context={'request': request})  
        if serializer.is_valid():  
            serializer.save()  
            return Response(serializer.data)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="删除酒店(owner可以使用)",
        description="删除指定酒店",
        tags=["酒店管理"],
        responses={
            204: OpenApiResponse(
                description="酒店删除成功"
            ),
            404: OpenApiResponse(
                description="酒店不存在",
                examples=[
                    OpenApiExample(
                        "酒店不存在",
                        value={
                            "code": 404,
                            "message": "酒店不存在",
                            "data": {"error": "Hotel not found"}
                        }
                    )
                ]
            )
        }
    )
    def delete(self, request, pk):
        hotel = get_object_or_404(Hotel, pk=pk, owner=request.user)
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    