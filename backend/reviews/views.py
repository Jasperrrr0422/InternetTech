from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from users.models import User
from properties.models import Hotel
from .serializers import ReviewCreateSerializer, HotelReviewsSerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsUserRole
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, OpenApiExample
# Create your views here.


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Create a new review",
        description="Creates a new review for a hotel. Requires authentication and user role.You should provide the hotel_id and the comment.If the review is a reply to a parent review, you should provide the parent_id.",
        request=ReviewCreateSerializer,
        responses={
            201: ReviewCreateSerializer,
            400: OpenApiResponse(description="Bad request, invalid data")
        },
        tags=["Reviews"]
    )
    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data,context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class HotelReviewsView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(
        summary="Get hotel reviews",
        description="Retrieves paginated reviews for a specific hotel",
        parameters=[
            OpenApiParameter(name="hotel_id", location=OpenApiParameter.PATH, description="Hotel ID", required=True, type=int)
        ],
        responses={
            200: HotelReviewsSerializer,
            404: OpenApiResponse(description="Hotel not found")
        },
        tags=["Reviews"]
    )
    def get(self, request, hotel_id):  
        try:  
            hotel = Hotel.objects.get(id=hotel_id)  
            serializer = HotelReviewsSerializer(hotel)
            return Response(serializer.data)
            # pagination = ReviewPagination()
            # paginated_reviews = pagination.paginate_queryset(serializer.data, request)
            # return pagination.get_paginated_response(paginated_reviews, serializer.data)  
        except Hotel.DoesNotExist:  
            return Response(  
                {"error": "找不到该酒店"},  
                status=status.HTTP_404_NOT_FOUND  
            )
    