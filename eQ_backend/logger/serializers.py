from rest_framework import serializers
from .models import Gym, Wall, Boulder, Ascent, SavedBoulder
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
    user_has_saved = serializers.SerializerMethodField()
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
    
    def get_user_has_saved(self, obj):
        """Check if the authenticated user has saved this boulder."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return SavedBoulder.objects.filter(user=request.user, boulder=obj).exists()
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


class UserProfileStatsSerializer(serializers.Serializer):
    total_ascents = serializers.IntegerField()
    highest_grade = serializers.CharField(allow_null=True)
    strongest_climbing_style = serializers.CharField(allow_null=True)
    climbs_by_level = serializers.DictField(child=serializers.IntegerField())
    flashes_by_level = serializers.DictField(child=serializers.IntegerField())
    climbing_style_distribution = serializers.DictField(child=serializers.IntegerField())


class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    stats = UserProfileStatsSerializer()
    saved_climbs = serializers.ListField(child=serializers.DictField(), required=False)


class SavedBoulderListSerializer(serializers.ModelSerializer):
    """Serializer for displaying saved boulders in a list."""
    wall_name = serializers.CharField(source='wall.name', read_only=True)
    gym_name = serializers.CharField(source='wall.gym.name', read_only=True)
    
    class Meta:
        model = Boulder
        fields = [
            'id',
            'setter_grade',
            'color',
            'difficulty',
            'climbing_style',
            'wall_name',
            'gym_name',
            'num_ascents',
        ]
