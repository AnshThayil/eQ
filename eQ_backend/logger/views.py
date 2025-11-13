
from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Gym, Wall, Boulder, Ascent
from .serializers import GymSerializer, WallSerializer, BoulderSerializer, AscentSerializer

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


class BoulderAscentView(APIView):
	"""Handle POST to create an ascent for the given boulder and
	DELETE to remove the authenticated user's ascent for the boulder.

	POST body should include 'ascent_type' (one of Ascent.ASCENT_TYPES keys).
	The view will create an Ascent and increment Boulder.num_ascents.
	"""

	def _get_climber(self, request):
		# Prefer authenticated user; fall back to explicit climber id in body
		user = getattr(request, 'user', None)
		if user and user.is_authenticated:
			return user
		climber_id = request.data.get('climber') if hasattr(request, 'data') else None
		from django.contrib.auth.models import User
		if climber_id:
			return get_object_or_404(User, pk=climber_id)
		return None

	@transaction.atomic
	def post(self, request, pk):
		boulder = get_object_or_404(Boulder, pk=pk)
		climber = self._get_climber(request)
		if climber is None:
			return Response({'detail': 'Authentication required or provide climber id.'}, status=status.HTTP_401_UNAUTHORIZED)

		# Check if ascent already exists (unique_together)
		if Ascent.objects.filter(climber=climber, boulder=boulder).exists():
			return Response({'detail': 'Ascent already exists for this climber and boulder.'}, status=status.HTTP_400_BAD_REQUEST)

		ascent_type = request.data.get('ascent_type')
		if not ascent_type:
			return Response({'detail': 'Missing ascent_type.'}, status=status.HTTP_400_BAD_REQUEST)

		ascent = Ascent(climber=climber, boulder=boulder, ascent_type=ascent_type)
		ascent.save()

		# The `post_save` signal in `logger.signals` will update `num_ascents`.
		serializer = AscentSerializer(ascent, context={'request': request})
		return Response(serializer.data, status=status.HTTP_201_CREATED)

	@transaction.atomic
	def delete(self, request, pk):
		boulder = get_object_or_404(Boulder, pk=pk)
		climber = getattr(request, 'user', None)
		if climber and climber.is_authenticated:
			ascent_qs = Ascent.objects.filter(climber=climber, boulder=boulder)
		else:
			# Allow passing climber id in body for deletion if unauthenticated
			climber_id = request.data.get('climber') if hasattr(request, 'data') else None
			if not climber_id:
				return Response({'detail': 'Authentication required or provide climber id.'}, status=status.HTTP_401_UNAUTHORIZED)
			from django.contrib.auth.models import User
			climber = get_object_or_404(User, pk=climber_id)
			ascent_qs = Ascent.objects.filter(climber=climber, boulder=boulder)

		ascent = ascent_qs.first()
		if not ascent:
			return Response({'detail': 'Ascent not found.'}, status=status.HTTP_404_NOT_FOUND)

		ascent.delete()

		# `post_delete` signal in `logger.signals` will decrement `num_ascents`.
		return Response(status=status.HTTP_204_NO_CONTENT)
