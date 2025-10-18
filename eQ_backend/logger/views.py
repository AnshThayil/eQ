
from rest_framework import viewsets, mixins
from .models import Gym, Wall, Boulder
from .serializers import GymSerializer, WallSerializer, BoulderSerializer

class GymViewSet(viewsets.ModelViewSet):
	queryset = Gym.objects.all()
	serializer_class = GymSerializer


class WallViewSet(mixins.CreateModelMixin,
				  mixins.UpdateModelMixin,
				  mixins.DestroyModelMixin,
				  viewsets.GenericViewSet):
	serializer_class = WallSerializer

	def get_queryset(self):
		gym_id = self.kwargs.get('gym_pk')
		return Wall.objects.filter(gym_id=gym_id)

	def perform_create(self, serializer):
		gym_id = self.kwargs.get('gym_pk')
		serializer.save(gym_id=gym_id)


class BoulderViewSet(mixins.RetrieveModelMixin,
					 mixins.CreateModelMixin,
					 mixins.UpdateModelMixin,
					 mixins.DestroyModelMixin,
					 viewsets.GenericViewSet):
	queryset = Boulder.objects.all()
	serializer_class = BoulderSerializer
