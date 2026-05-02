from rest_framework import serializers
from .models import Gym, Wall, Boulder, Ascent
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number']

    def get_phone_number(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.phone_number if profile else None

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


class ActivityAscentSerializer(serializers.ModelSerializer):
    climber_details = UserSerializer(source='climber', read_only=True)
    perceived_difficulty_display = serializers.CharField(source='get_perceived_difficulty_display', read_only=True)
    boulder_grade = serializers.CharField(source='boulder.setter_grade', read_only=True)
    boulder_color = serializers.CharField(source='boulder.color', read_only=True)
    boulder_difficulty = serializers.CharField(source='boulder.get_difficulty_display', read_only=True)
    boulder_climbing_style = serializers.CharField(source='boulder.get_climbing_style_display', read_only=True)
    wall_name = serializers.CharField(source='boulder.wall.name', read_only=True)
    gym_name = serializers.CharField(source='boulder.wall.gym.name', read_only=True)

    class Meta:
        model = Ascent
        fields = [
            'id',
            'climber',
            'climber_details',
            'boulder',
            'ascent_type',
            'perceived_difficulty',
            'perceived_difficulty_display',
            'liked',
            'date_climbed',
            'points',
            'boulder_grade',
            'boulder_color',
            'boulder_difficulty',
            'boulder_climbing_style',
            'wall_name',
            'gym_name',
        ]


class AscentSerializerWithoutBoulder(serializers.ModelSerializer):
    climber_details = UserSerializer(source='climber', read_only=True)
    
    class Meta:
        model = Ascent
        # include all fields except `boulder`
        exclude = ('boulder',)
