from rest_framework import serializers
from .models import Gym, Wall, Boulder, Ascent

class GymSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gym
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        # Only include walls for detail view
        if request and request.parser_context and request.parser_context.get('kwargs', {}).get('pk'):
            from .serializers import WallSerializer
            rep['walls'] = WallSerializer(instance.walls.all(), many=True).data
        return rep

class WallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wall
        exclude = ('gym',)

class BoulderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Boulder
        fields = '__all__'

class AscentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ascent
        fields = '__all__'
