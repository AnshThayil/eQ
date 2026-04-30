from rest_framework import serializers
from .models import Service, ServiceGroup


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for individual service variations."""
    
    service_group_name = serializers.CharField(source='service_group.name', read_only=True)
    service_type = serializers.CharField(source='service_group.service_type', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id',
            'service_group',
            'service_group_name',
            'service_type',
            'name',
            'access_type',
            'num_sessions',
            'price',
            'duration_days',
            'yoactiv_service_variation_id',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ServiceGroupDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for service groups with all variations."""
    
    variations = ServiceSerializer(many=True, read_only=True)
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    
    class Meta:
        model = ServiceGroup
        fields = [
            'id',
            'gym',
            'gym_name',
            'name',
            'description',
            'service_type',
            'yoactiv_service_id',
            'is_active',
            'variations',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ServiceGroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for service group listings."""
    
    variation_count = serializers.SerializerMethodField()
    gym_name = serializers.CharField(source='gym.name', read_only=True)
    
    class Meta:
        model = ServiceGroup
        fields = [
            'id',
            'gym',
            'gym_name',
            'name',
            'service_type',
            'variation_count',
            'is_active',
        ]
    
    def get_variation_count(self, obj):
        return obj.variations.filter(is_active=True).count()
