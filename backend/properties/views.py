from rest_framework.views import APIView  
from rest_framework import status  
from rest_framework.response import Response  
from rest_framework.permissions import IsAuthenticated, AllowAny  
from django.shortcuts import get_object_or_404  
from .models import Hotel, Amentity
from users.permissions import IsOwnerRole, IsAdminRole, IsUserRole
from .serializers import HotelSerializer, AmentitySerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse   
from rest_framework import status  
from rest_framework.views import APIView  
from rest_framework.response import Response  
from rest_framework.permissions import IsAuthenticated,AllowAny  
from .pagination import HotelPagination
from django.core.cache import cache   
from django.utils.decorators import method_decorator  
from django.views.decorators.cache import cache_page
from watson import search as watson

class HotelListAPIView(APIView):  
    permission_classes = [AllowAny]  
    pagination_class = HotelPagination

    @extend_schema(  
        summary="Get Hotel List",  
        description="Get all hotels with pagination, search, sorting and price filtering support",  
        tags=["Hotel Management"],  
        parameters=[  
            OpenApiParameter(  
                name='page',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='Page number (default: 1)'  
            ),  
            OpenApiParameter(  
                name='page_size',  
                type=int,  
                location=OpenApiParameter.QUERY,  
                description='Number of items per page (default: 12)'  
            ),  
            OpenApiParameter(  
                name='q',  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='Search keywords (search in name, description, address)'  
            ),  
            OpenApiParameter(  
                name='min_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='Minimum price filter'  
            ),  
            OpenApiParameter(  
                name='max_price',  
                type=float,  
                location=OpenApiParameter.QUERY,  
                description='Maximum price filter'  
            ),  
            OpenApiParameter(  
                name='ordering',  
                type=str,  
                location=OpenApiParameter.QUERY,  
                description='Sorting field (options: price_per_night, -price_per_night, total_rooms, -total_rooms, created_at, -created_at)'  
            ),  
        ],  
        responses={  
            200: OpenApiResponse(  
                response=HotelSerializer(many=True),  
                description="Successfully retrieved hotel list",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "count": 100,
                            "next": "http://api.example.org/hotels/?page=2",
                            "previous": None,
                            "results": [
                                {
                                    "id": 1,
                                    "name": "Luxury Hotel",
                                    "description": "Five-star hotel in downtown",
                                    "address": "123 Main Street",
                                    "image_url": "http://example.com/media/hotels/image.jpg",
                                    "price_per_night": "888.00",
                                    "total_rooms": 100,
                                    "total_beds": 200,
                                    "owner": 1,
                                    "amentities": [
                                        {"name": "WiFi"},
                                        {"name": "Swimming Pool"}
                                    ],
                                    "rating": 4.5
                                }
                            ]
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Invalid parameters",
                examples=[
                    OpenApiExample(
                        "Parameter Error",
                        value={
                            "code": 400,
                            "message": "Invalid minimum price parameter"
                        }
                    )
                ]
            ),
            500: OpenApiResponse(
                description="Server error",
                examples=[
                    OpenApiExample(
                        "Server Error",
                        value={
                            "code": 500,
                            "message": "Server error",
                            "data": {"error": "Internal server error"}
                        }
                    )
                ]
            )
        }  
    )
    def get(self, request):
        try:
            q = request.query_params.get('q', '')  
            min_price = request.query_params.get('min_price')  
            max_price = request.query_params.get('max_price')  
            ordering = request.query_params.get('ordering', '-created_at')  

            if request.user.is_authenticated and request.user.role == 'owner':
                queryset = Hotel.objects.filter(owner=request.user).select_related('owner')
            else:
                if q and q.strip():
                    search_results = watson.search(q, models=(Hotel,))
                    hotel_ids = [result.object_id_int for result in search_results]
                    queryset = Hotel.objects.filter(id__in=hotel_ids).select_related('owner')
                else:  
                    queryset = Hotel.objects.all().select_related('owner')

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

    @extend_schema(  
        summary="Create New Hotel",  
        description="Create a new hotel with basic information, amenities, and image upload",  
        tags=["Hotel Management"],  
        request={  
            'multipart/form-data': {  
                'type': 'object',  
                'properties': {  
                    'name': {
                        'type': 'string',
                        'description': 'Hotel name',
                        'required': True
                    },  
                    'description': {
                        'type': 'string',
                        'description': 'Hotel description'
                    },  
                    'address': {
                        'type': 'string',
                        'description': 'Hotel address',
                        'required': True
                    },  
                    'price_per_night': {
                        'type': 'number',
                        'description': 'Price per night',
                        'required': True
                    },  
                    'total_rooms': {
                        'type': 'integer',
                        'description': 'Total number of rooms',
                        'required': True
                    },  
                    'total_beds': {
                        'type': 'integer',
                        'description': 'Total number of beds'
                    },
                    'amentities': {
                        'type': 'string',
                        'description': 'Comma-separated list of amenities (e.g., "WiFi,Swimming Pool")'
                    },
                    'image': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Hotel image (max 5MB)'
                    }  
                }
            }  
        },  
        responses={  
            201: OpenApiResponse(  
                response=HotelSerializer,  
                description="Hotel created successfully",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "id": 1,
                            "name": "Luxury Hotel",
                            "description": "Five-star hotel in downtown",
                            "address": "123 Main Street",
                            "image_url": "http://example.com/media/hotels/image.jpg",
                            "price_per_night": "888.00",
                            "total_rooms": 100,
                            "total_beds": 200,
                            "owner": 1,
                            "amentities": [
                                {"name": "WiFi"},
                                {"name": "Swimming Pool"}
                            ],
                            "rating": 0
                        }
                    )
                ]
            ),  
            400: OpenApiResponse(  
                description="Validation error",
                examples=[
                    OpenApiExample(
                        "Validation Error",
                        value={
                            "name": ["This field is required."],
                            "address": ["This field is required."],
                            "image": ["Image size too large. Maximum size is 5MB"]
                        }
                    )
                ]
            ),
            401: OpenApiResponse(
                description="Unauthorized",
                examples=[
                    OpenApiExample(
                        "Unauthorized Error",
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
            user = request.user
            if user.role == 'owner':
                serializer = HotelSerializer(data=request.data, context={'request': request}) 
                if serializer.is_valid():  
                    hotel = serializer.save(owner=request.user) 
                return Response(HotelSerializer(hotel, context={'request': request}).data, status=status.HTTP_201_CREATED)  

            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)  
        except Exception as e:  
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)  


    
class AmentityListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerRole]

    @extend_schema(
        summary="Get All Amenities",
        description="Retrieve a list of all available hotel amenities. Only accessible by hotel owners and admins.",
        tags=["Amentity Management"],
        responses={
            200: OpenApiResponse(
                response=AmentitySerializer(many=True),
                description="Successfully retrieved amenities list",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value=[
                            {
                                "id": 1,
                                "name": "WiFi",
                                "description": "High-speed wireless internet"
                            },
                            {
                                "id": 2,
                                "name": "Swimming Pool",
                                "description": "Outdoor swimming pool"
                            }
                        ]
                    )
                ]
            ),
            401: OpenApiResponse(
                description="Unauthorized",
                examples=[
                    OpenApiExample(
                        "Unauthorized Error",
                        value={
                            "detail": "Authentication credentials were not provided."
                        }
                    )
                ]
            ),
            403: OpenApiResponse(
                description="Permission Denied",
                examples=[
                    OpenApiExample(
                        "Permission Error",
                        value={
                            "detail": "You do not have permission to perform this action."
                        }
                    )
                ]
            )
        }
    )
    def get(self, request):
        amentities = Amentity.objects.all()
        serializer = AmentitySerializer(
            amentities,
            many=True
        )
        return Response(serializer.data)
    @extend_schema(
        summary="Create New Amenity",
        description="Create a new hotel amenity. Only accessible by hotel owners and admins.",
        tags=["Amentity Management"],
        request=AmentitySerializer,
        responses={
            201: OpenApiResponse(
                response=AmentitySerializer,
                description="Amenity created successfully",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "id": 1,
                            "name": "Infinity Pool",
                            "description": "Rooftop infinity pool with city view"
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Validation Error",
                examples=[
                    OpenApiExample(
                        "Validation Error",
                        value={
                            "name": ["This field is required."],
                            "description": ["Description must not exceed 200 characters."]
                        }
                    )
                ]
            ),
            401: OpenApiResponse(
                description="Unauthorized",
                examples=[
                    OpenApiExample(
                        "Unauthorized Error",
                        value={
                            "detail": "Authentication credentials were not provided."
                        }
                    )
                ]
            ),
            403: OpenApiResponse(
                description="Permission Denied",
                examples=[
                    OpenApiExample(
                        "Permission Error",
                        value={
                            "detail": "You do not have permission to perform this action."
                        }
                    )
                ]
            )
        },
        examples=[
            OpenApiExample(
                "Request Example",
                value={
                    "name": "Infinity Pool",
                    "description": "Rooftop infinity pool with city view"
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
    
      

class HotelDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        dynamic permission:PUT and DELETE method need owner permission
        """
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAuthenticated(), IsOwnerRole()]
        return [IsAuthenticated()]

    def get_object(self, pk):
        """
        get hotel object according to user role
        """
        if self.request.user.role == 'owner':
            return get_object_or_404(Hotel, pk=pk, owner=self.request.user)
        return get_object_or_404(Hotel, pk=pk)

    @extend_schema(
        summary="Get Hotel Detail",
        description="Get detailed information about a specific hotel. All authenticated users can access.",
        tags=["Hotel Management"],
        operation_id="hotel-detail",
        parameters=[
            OpenApiParameter(
                name='pk',
                type=int,
                location=OpenApiParameter.PATH,
                description='Hotel ID'
            ),
        ],
        
        responses={
            200: OpenApiResponse(
                response=HotelSerializer,
                description="Successfully retrieved hotel details",
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "id": 1,
                            "name": "Luxury Hotel",
                            "description": "Five-star hotel in downtown",
                            "address": "123 Main Street",
                            "image_url": "http://example.com/media/hotels/image.jpg",
                            "price_per_night": "888.00",
                            "total_rooms": 100,
                            "total_beds": 200,
                            "owner": 1,
                            "amentities": [
                                {"name": "WiFi"},
                                {"name": "Swimming Pool"}
                            ],
                            "rating": 4.5
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description="Hotel not found",
                examples=[
                    OpenApiExample(
                        "Not Found Error",
                        value={
                            "code": 404,
                            "message": "Hotel not found",
                            "data": {"error": "Hotel not found"}
                        }
                    )
                ]
            )
        }
    )
    def get(self, request, pk):
        hotel = self.get_object(pk)
        serializer = HotelSerializer(hotel, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        summary="Update Hotel",
        description="Update an existing hotel. Only available for hotel owners.",
        tags=["Hotel Management"],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'name': {
                        'type': 'string',
                        'description': 'Hotel name'
                    },
                    'description': {
                        'type': 'string',
                        'description': 'Hotel description'
                    },
                    'address': {
                        'type': 'string',
                        'description': 'Hotel address'
                    },
                    'price_per_night': {
                        'type': 'number',
                        'description': 'Price per night'
                    },
                    'total_rooms': {
                        'type': 'integer',
                        'description': 'Total number of rooms'
                    },
                    'total_beds': {
                        'type': 'integer',
                        'description': 'Total number of beds'
                    },
                    'amentities': {
                        'type': 'string',
                        'description': 'Comma-separated list of amenities'
                    },
                    'image': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Hotel image (max 5MB)'
                    }
                }
            }
        },
        responses={
            200: OpenApiResponse(
                response=HotelSerializer,
                description="Hotel updated successfully"
            ),
            400: OpenApiResponse(
                description="Validation error",
                examples=[
                    OpenApiExample(
                        "Validation Error",
                        value={
                            "name": ["This field is required."],
                            "address": ["This field is required."]
                        }
                    )
                ]
            ),
            401: OpenApiResponse(
                description="Unauthorized",
                examples=[
                    OpenApiExample(
                        "Unauthorized Error",
                        value={
                            "detail": "Authentication credentials were not provided."
                        }
                    )
                ]
            ),
            403: OpenApiResponse(
                description="Permission denied",
                examples=[
                    OpenApiExample(
                        "Permission Error",
                        value={
                            "detail": "You do not have permission to perform this action."
                        }
                    )
                ]
            ),
            404: OpenApiResponse(
                description="Hotel not found"
            )
        }
    )
    def put(self, request, pk):
        hotel = self.get_object(pk)
        serializer = HotelSerializer(hotel, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete Hotel",
        description="Delete a specific hotel. Only available for hotel owners.",
        tags=["Hotel Management"],
        responses={
            204: OpenApiResponse(
                description="Hotel deleted successfully"
            ),
            401: OpenApiResponse(
                description="Unauthorized"
            ),
            403: OpenApiResponse(
                description="Permission denied"
            ),
            404: OpenApiResponse(
                description="Hotel not found"
            )
        }
    )
    def delete(self, request, pk):
        hotel = self.get_object(pk)
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




    
    