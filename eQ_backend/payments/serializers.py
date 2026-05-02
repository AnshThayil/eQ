from rest_framework import serializers
from django.conf import settings
from .models import Order


class CreateOrderSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()


class OrderResponseSerializer(serializers.ModelSerializer):
    razorpay_key_id = serializers.SerializerMethodField()
    prefill_name = serializers.SerializerMethodField()
    prefill_email = serializers.SerializerMethodField()
    prefill_contact = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'razorpay_order_id',
            'amount_paise',
            'currency',
            'razorpay_key_id',
            'prefill_name',
            'prefill_email',
            'prefill_contact',
        ]

    def get_razorpay_key_id(self, obj):
        return settings.RAZORPAY_KEY_ID

    def get_prefill_name(self, obj):
        user = obj.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or user.username

    def get_prefill_email(self, obj):
        return obj.user.email or ''

    def get_prefill_contact(self, obj):
        try:
            return obj.user.profile.phone_number or ''
        except Exception:
            return ''


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()


class OrderListSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_type = serializers.CharField(source='service.service_group.service_type', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'razorpay_order_id',
            'service_name',
            'service_type',
            'amount_paise',
            'currency',
            'status',
            'created_at',
        ]
