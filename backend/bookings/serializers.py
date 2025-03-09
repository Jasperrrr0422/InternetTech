from rest_framework import serializers
from .models import Order
from properties.models import Hotel
from django.shortcuts import get_object_or_404

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class OrderCreateSerializer(serializers.ModelSerializer):
    guests = serializers.IntegerField(write_only=True)
    class Meta:
        model = Order
        fields = ['hotel', 'check_in_date', 'check_out_date', 'guests']

    def create(self, validated_data):
        hotel = validated_data.pop('hotel')
        room_count = validated_data.get('room_count')
        check_in_date = validated_data.get('check_in_date')
        check_out_date = validated_data.get('check_out_date')
        guests = validated_data.pop('guests')
        total_price = hotel.price_per_night * (check_out_date - check_in_date).days * room_count
        hotel.total_rooms -= room_count
        hotel.save()
        return Order.objects.create(**validated_data, hotel=hotel, total_price=total_price)


class OrderRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'rating']

    def create(self, validated_data):
        order = get_object_or_404(Order, id=validated_data.get('id'))
        order.rating = validated_data.get('rating')
        order.save()
        return order


    class Meta:
        model = Order
        fields = ['id']

    def create(self, validated_data):
        order = get_object_or_404(Order, id=validated_data.get('id'))
        order.status = 'completed'
        order.save()
        return order
