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
from watson import search as watson

class HotelUploadByOwner(APIView):  
    permission_classes = [IsAuthenticated, IsOwnerRole]  

    @extend_schema(  
        summary="get all owner uploaded hotels",  
        description="return all hotels list",
        tags=["hotel management"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer(many=True),  
                description="success get all hotels list"  
            )  
        },  
        examples=[  
            OpenApiExample(  
                "success response example",  
                value=[{  
                    "id": 1,  
                    "name": "luxury hotel",  
                    "description": "five-star hotel",  
                    "address": "downtown",  
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
                    'amentities': {'type': 'string', 'description': '设施列表'},
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
        summary="create all amentities(owner can use)",  
        description="return all available hotel amentities list",  
        tags=["hotel management"],  
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
                        "description": "free wifi"  
                    },  
                    {  
                        "id": 2,  
                        "name": "parking",  
                        "description": "free parking"  
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
        summary="get all hotels(user can use)",  
        description="return all hotels list, support pagination, search, sorting and price filter",  
        tags=["hotel management"],  
        parameters=[  
            OpenApiParameter(  
                name='page',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='page number(default:1)'  
            ),  
            OpenApiParameter(  
                name='page_size',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='the number of hotels per page(default:12)'  
            ),  
            OpenApiParameter(  
                name='q',  # 改为 q 参数  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='search keywords(search name, description, address, etc.)'  
            ),  
            OpenApiParameter(  
                name='min_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='minimum price(default:0)'  
            ),  
            OpenApiParameter(  
                name='max_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='maximum price(default:1000000)'  
            ),  
            OpenApiParameter(  
                name='ordering',  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='sorting(default:-created_at)'  
            ),  
        ],  
    )  
    @method_decorator(cache_page(60 * 5))  
    def get(self, request):  
        try:  
            q = request.query_params.get('q', '')  
            min_price = request.query_params.get('min_price')  
            max_price = request.query_params.get('max_price')  
            ordering = request.query_params.get('ordering', '-created_at')  
  
            # 使用 watson 进行全文搜索  
            if q and q.strip():
                search_results = watson.search(q, models = (Hotel,))
                hotel_ids = [result.object_id_int for result in search_results]
                queryset = Hotel.objects.filter(id__in=hotel_ids).select_related('owner')

            else:  
                queryset = Hotel.objects.all().select_related('owner')  

            # 价格筛选部分不变  
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

            # 排序和分页部分不变  
            if ordering:  
                valid_ordering_fields = ['price_per_night', '-price_per_night',   
                                       'total_rooms', '-total_rooms',  
                                       'created_at', '-created_at']  
                if ordering in valid_ordering_fields:  
                    queryset = queryset.order_by(ordering)  

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
        summary="get hotel detail(user can use)",  
        description="return the detail of the specified hotel",  
        tags=["hotel management"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer,  
                description="success get the detail of the specified hotel"  
            ),  
            404: OpenApiResponse(  
                description="hotel not found",  
                examples=[  
                    OpenApiExample(  
                        "hotel not found",  
                        value={  
                            "code": 404,  
                            "message": "hotel not found",  
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
        summary="get hotel detail(owner can use)",  
        description="return the detail of the specified hotel",  
        tags=["hotel management"],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer,  
                description="success get the detail of the specified hotel"  
            ),  
            404: OpenApiResponse(  
                description="酒店不存在",  
                examples=[  
                    OpenApiExample(  
                        "hotel not found",  
                        value={  
                            "code": 404,  
                            "message": "hotel not found",  
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
                    "total_rooms": 100,
                    "amentities": "'WiFi', 'parking'"
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
    
    