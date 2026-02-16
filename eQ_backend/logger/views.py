
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


class BoulderViewSet(mixins.ListModelMixin,
					 mixins.RetrieveModelMixin,
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
		ascent.points = ascent.calculate_points()
		ascent.save()

		# The `post_save` signal in `logger.signals` will update `num_ascents`.
		ascent_serializer = AscentSerializer(ascent, context={'request': request})
		
		# Refresh boulder from DB to get updated num_ascents
		boulder.refresh_from_db()
		boulder_serializer = BoulderSerializer(boulder, context={'request': request})
		
		return Response({
			'ascent': ascent_serializer.data,
			'boulder': boulder_serializer.data
		}, status=status.HTTP_201_CREATED)

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
		# Refresh boulder from DB to get updated num_ascents
		boulder.refresh_from_db()
		boulder_serializer = BoulderSerializer(boulder, context={'request': request})
		
		return Response({'boulder': boulder_serializer.data}, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
	"""Returns a ranked list of climbers by total points.
	
	Query parameters:
	- only_active: If 'true', only counts ascents of active boulders
	- gym_id: If provided, only counts ascents from boulders in that gym
	"""
	
	def get(self, request):
		from django.contrib.auth.models import User
		from django.db.models import Sum, Q, Max
		
		# Check if we should only count active boulders
		only_active = request.query_params.get('only_active', 'false').lower() == 'true'
		
		# Check if we should filter by gym
		gym_id = request.query_params.get('gym_id')
		
		# Build the filter conditionally
		filters = Q()
		if only_active:
			filters &= Q(ascents__boulder__is_active=True)
		if gym_id:
			filters &= Q(ascents__boulder__wall__gym_id=gym_id)
		
		# Build the annotation with most recent ascent for tie-breaking
		if filters:
			leaderboard = User.objects.annotate(
				total_points=Sum('ascents__points', filter=filters),
				most_recent_ascent=Max('ascents__date_climbed', filter=filters)
			).filter(
				total_points__isnull=False
			).order_by('-total_points', '-most_recent_ascent').values(
				'id', 'username', 'first_name', 'last_name', 'total_points', 'most_recent_ascent'
			)
		else:
			leaderboard = User.objects.annotate(
				total_points=Sum('ascents__points'),
				most_recent_ascent=Max('ascents__date_climbed')
			).filter(
				total_points__isnull=False
			).order_by('-total_points', '-most_recent_ascent').values(
				'id', 'username', 'first_name', 'last_name', 'total_points', 'most_recent_ascent'
			)
		
		# Add index and rank (rank handles ties)
		leaderboard_list = list(leaderboard)
		current_rank = 1
		for idx, entry in enumerate(leaderboard_list, start=1):
			entry['index'] = idx
			
			# If this is not the first entry, check for tie with previous
			if idx > 1 and entry['total_points'] == leaderboard_list[idx - 2]['total_points']:
				# Tie: use same rank as previous entry
				entry['rank'] = leaderboard_list[idx - 2]['rank']
			else:
				# New rank: use current index
				entry['rank'] = idx
			
			# Don't include most_recent_ascent in response (just used for sorting)
			del entry['most_recent_ascent']
		
		# Find the authenticated user's ranking and ID
		your_ranking = None
		your_user_id = None
		if request.user and request.user.is_authenticated:
			your_user_id = request.user.id
			for entry in leaderboard_list:
				if entry['id'] == request.user.id:
					your_ranking = entry['rank']
					break
		
		return Response({
			'leaderboard': leaderboard_list,
			'your_ranking': your_ranking,
			'your_user_id': your_user_id
		})


class UserProfileView(APIView):
	"""Returns the authenticated user's profile with ascent history and stats."""
	
	def get(self, request):
		user = request.user
		if not user.is_authenticated:
			return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
		
		# User basic info
		profile = {
			'id': user.id,
			'username': user.username,
			'email': user.email,
			'first_name': user.first_name,
			'last_name': user.last_name,
		}
		
		# Get user's ascents
		ascents = Ascent.objects.filter(climber=user).select_related('boulder', 'boulder__wall', 'boulder__wall__gym')
		ascent_data = []
		total_points = 0
		flash_count = 0
		send_count = 0
		
		for ascent in ascents:
			ascent_data.append({
				'id': ascent.id,
				'boulder_id': ascent.boulder.id,
				'boulder_grade': ascent.boulder.setter_grade,
				'boulder_color': ascent.boulder.color,
				'wall_name': ascent.boulder.wall.name,
				'gym_name': ascent.boulder.wall.gym.name,
				'ascent_type': ascent.ascent_type,
				'date_climbed': ascent.date_climbed,
				'points': ascent.points,
			})
			total_points += ascent.points
			if ascent.ascent_type == 'flash':
				flash_count += 1
			elif ascent.ascent_type == 'send':
				send_count += 1
		
		profile['ascents'] = ascent_data
		profile['stats'] = {
			'total_ascents': len(ascent_data),
			'total_points': total_points,
			'flash_count': flash_count,
			'send_count': send_count,
		}
		
		return Response(profile)


class LogoutView(APIView):
	"""Logout endpoint for token blacklisting (if using token blacklist) or just client-side token removal."""
	
	def post(self, request):
		# For JWT tokens, logout is typically handled client-side by removing tokens
		# If using djangorestframework-simplejwt with token blacklist, you could blacklist the refresh token here
		# For now, we'll just return a success response
		return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)
