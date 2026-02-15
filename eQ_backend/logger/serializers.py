from rest_framework import serializers
from .models import Gym, Wall, Boulder, Ascent
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

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
            boulders_qs = Boulder.objects.filter(wall__gym=instance, is_active=True)
            rep['boulders'] = BoulderSerializer(boulders_qs, many=True, context=self.context).data
        return rep

class WallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wall
        exclude = ('gym',)

class BoulderSerializer(serializers.ModelSerializer):
    user_has_sent = serializers.SerializerMethodField()
    wall_details = serializers.SerializerMethodField()

    class Meta:
        model = Boulder
        fields = '__all__'

    def get_user_has_sent(self, obj):
        """Check if the authenticated user has sent this boulder."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return Ascent.objects.filter(climber=request.user, boulder=obj).exists()
        return False
    
    def get_wall_details(self, obj):
        """Include wall details with id and name."""
        if obj.wall:
            return {'id': obj.wall.id, 'name': obj.wall.name}
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        #Only include ascents for detail view
        if request and request.parser_context and request.parser_context.get('kwargs', {}).get('pk'):
            from .serializers import AscentSerializerWithoutBoulder
            rep['ascents'] = AscentSerializerWithoutBoulder(instance.ascents.all(), many=True).data
        return rep

class AscentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ascent
        fields = '__all__'


class AscentSerializerWithoutBoulder(serializers.ModelSerializer):
    climber_details = UserSerializer(source='climber', read_only=True)
    
    class Meta:
        model = Ascent
        # include all fields except `boulder`
        exclude = ('boulder',)
