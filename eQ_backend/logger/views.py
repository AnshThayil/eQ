
import logging
from collections import Counter

from rest_framework import viewsets, mixins, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction, models

from .models import Gym, Wall, Boulder, Ascent, SavedBoulder, UserSettings
from .serializers import GymSerializer, WallSerializer, BoulderSerializer, AscentSerializer, ActivityAscentSerializer, UserProfileSerializer, SavedBoulderListSerializer, ZoneScheduleSerializer, StaffUserSerializer
from .permissions import IsStaffOrReadOnly
from .scheduling import computed_reset_date, next_occurrence

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)
		token['is_staff'] = user.is_staff
		return token

	def validate(self, attrs):
		data = super().validate(attrs)
		data['is_staff'] = self.user.is_staff
		return data


class CustomTokenObtainPairView(TokenObtainPairView):
	serializer_class = CustomTokenObtainPairSerializer


class GymViewSet(viewsets.ModelViewSet):
	queryset = Gym.objects.all()
	serializer_class = GymSerializer


class WallViewSet(mixins.CreateModelMixin,
				  mixins.UpdateModelMixin,
				  mixins.DestroyModelMixin,
				  viewsets.GenericViewSet):
	serializer_class = WallSerializer
	permission_classes = [IsStaffOrReadOnly]

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
	permission_classes = [IsStaffOrReadOnly]

	def get_queryset(self):
		qs = Boulder.objects.all()
		wall_id = self.request.query_params.get('wall')
		if wall_id:
			qs = qs.filter(wall_id=wall_id)
		active = self.request.query_params.get('is_active')
		if active is not None:
			qs = qs.filter(is_active=active.lower() == 'true')
		return qs

	def perform_create(self, serializer):
		# Default the setter to the staff user creating the route when not
		# explicitly provided.
		if serializer.validated_data.get('setter') is None:
			serializer.save(setter=self.request.user)
		else:
			serializer.save()


class BoulderAscentView(APIView):
	"""Handle POST to create an ascent for the given boulder and
	DELETE to remove the authenticated user's ascent for the boulder.

	POST body should include 'ascent_type' (one of Ascent.ASCENT_TYPES keys).
	The view will create an Ascent and increment Boulder.num_ascents.
	"""
	permission_classes = [permissions.IsAuthenticated]

	def _get_climber(self, request):
		return request.user

	def _normalize_difficulty(self, difficulty):
		if not difficulty:
			return False

		normalized = str(difficulty).strip().lower()
		valid_difficulties = {choice[0] for choice in Boulder.DIFFICULTY_CHOICES}
		if normalized not in valid_difficulties:
			return False

		return normalized

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

		perceived_difficulty = self._normalize_difficulty(request.data.get('difficulty'))
		if perceived_difficulty is False:
			return Response({'detail': 'Missing or invalid difficulty.'}, status=status.HTTP_400_BAD_REQUEST)

		liked = request.data.get('liked')
		if not isinstance(liked, bool):
			return Response({'detail': 'Missing or invalid liked.'}, status=status.HTTP_400_BAD_REQUEST)

		ascent = Ascent(
			climber=climber,
			boulder=boulder,
			ascent_type=ascent_type,
			perceived_difficulty=perceived_difficulty,
			liked=liked,
		)
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
		climber = request.user
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


class BoulderSaveView(APIView):
	"""Handle POST to save a boulder for the authenticated user and
	DELETE to unsave a boulder.
	
	POST creates a SavedBoulder entry, DELETE removes it.
	"""
	permission_classes = [permissions.IsAuthenticated]

	@transaction.atomic
	def post(self, request, pk):
		boulder = get_object_or_404(Boulder, pk=pk)
		user = request.user

		# Check if already saved
		if SavedBoulder.objects.filter(user=user, boulder=boulder).exists():
			return Response({'detail': 'Boulder already saved.'}, status=status.HTTP_400_BAD_REQUEST)

		saved = SavedBoulder.objects.create(user=user, boulder=boulder)
		boulder_serializer = BoulderSerializer(boulder, context={'request': request})
		
		return Response({
			'detail': 'Boulder saved successfully.',
			'boulder': boulder_serializer.data
		}, status=status.HTTP_201_CREATED)

	@transaction.atomic
	def delete(self, request, pk):
		boulder = get_object_or_404(Boulder, pk=pk)
		user = request.user
		
		saved_qs = SavedBoulder.objects.filter(user=user, boulder=boulder)
		saved = saved_qs.first()
		
		if not saved:
			return Response({'detail': 'Boulder not saved.'}, status=status.HTTP_404_NOT_FOUND)

		saved.delete()
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
			leaderboard = User.objects.filter(
				Q(settings__leaderboard_opt_in=True) | Q(settings__isnull=True)
			).annotate(
				total_points=Sum('ascents__points', filter=filters),
				most_recent_ascent=Max('ascents__date_climbed', filter=filters)
			).filter(
				total_points__isnull=False
			).order_by('-total_points', '-most_recent_ascent').values(
				'id', 'username', 'first_name', 'last_name', 'total_points', 'most_recent_ascent'
			)
		else:
			leaderboard = User.objects.filter(
				Q(settings__leaderboard_opt_in=True) | Q(settings__isnull=True)
			).annotate(
				total_points=Sum('ascents__points'),
				most_recent_ascent=Max('ascents__date_climbed')
			).filter(
				total_points__isnull=False
			).order_by('-total_points', '-most_recent_ascent').values(
				'id', 'username', 'first_name', 'last_name', 'total_points', 'most_recent_ascent'
			)
		
		# Add index and rank (rank handles ties)
		leaderboard_list = list(leaderboard)
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


class LatestAscentsView(APIView):
	"""Returns the latest 50 ascents across all climbers."""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		ascents = Ascent.objects.select_related(
			'climber',
			'boulder',
			'boulder__wall',
			'boulder__wall__gym',
		).order_by('-date_climbed', '-id')[:50]

		serializer = ActivityAscentSerializer(ascents, many=True)
		return Response({'ascents': serializer.data})


class MyAscentsView(APIView):
	"""Returns all ascents for the authenticated user, ordered by date descending."""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		ascents = Ascent.objects.filter(climber=request.user).select_related(
			'climber',
			'boulder',
			'boulder__wall',
			'boulder__wall__gym',
		).order_by('-date_climbed', '-id')

		serializer = ActivityAscentSerializer(ascents, many=True)
		return Response({'ascents': serializer.data})


class UserProfileView(APIView):
	"""Returns the authenticated user's basic profile and ascent summary stats."""

	permission_classes = [permissions.IsAuthenticated]
	
	def get(self, request):
		user = request.user
		profile_grade_levels = [grade for grade, _label in Boulder.GRADE_CHOICES if grade in {"L1", "L2", "L3", "L4", "L5", "L6", "L7"}]
		ascents = list(
			Ascent.objects.filter(climber=user).select_related('boulder')
		)

		grade_rank = {
			grade: points for grade, points in Ascent.GRADE_POINTS.items()
		}
		grade_values = [
			ascent.boulder.setter_grade
			for ascent in ascents
			if ascent.boulder and ascent.boulder.setter_grade
		]
		highest_grade = (
			max(grade_values, key=lambda grade: grade_rank.get(grade, -1))
			if grade_values
			else None
		)

		style_counts = Counter(
			ascent.boulder.climbing_style
			for ascent in ascents
			if ascent.boulder and ascent.boulder.climbing_style
		)
		strongest_style_key = None
		if style_counts:
			strongest_style_key = sorted(
				style_counts.items(),
				key=lambda item: (-item[1], item[0]),
			)[0][0]

		style_labels = dict(Boulder.STYLE_CHOICES)
		climbing_style_distribution = {
			label: style_counts.get(style_key, 0)
			for style_key, label in Boulder.STYLE_CHOICES
		}
		climbs_by_level = {
			grade: 0 for grade in profile_grade_levels
		}
		climbs_by_level.update(
			Counter(
				ascent.boulder.setter_grade
				for ascent in ascents
				if ascent.boulder and ascent.boulder.setter_grade in climbs_by_level
			)
		)
		flashes_by_level = {
			grade: 0 for grade in profile_grade_levels
		}
		flashes_by_level.update(
			Counter(
				ascent.boulder.setter_grade
				for ascent in ascents
				if (
					ascent.boulder
					and ascent.ascent_type == 'flash'
					and ascent.boulder.setter_grade in flashes_by_level
				)
			)
		)
		
		# Get saved climbs
		saved_boulders = SavedBoulder.objects.filter(user=user).select_related('boulder', 'boulder__wall', 'boulder__wall__gym').order_by('-saved_at')
		saved_climbs_data = SavedBoulderListSerializer([sb.boulder for sb in saved_boulders], many=True).data
		
		profile_data = {
			'id': user.id,
			'username': user.username,
			'first_name': user.first_name,
			'last_name': user.last_name,
			'stats': {
				'total_ascents': len(ascents),
				'highest_grade': highest_grade,
				'strongest_climbing_style': style_labels.get(strongest_style_key, None),
				'climbs_by_level': climbs_by_level,
				'flashes_by_level': flashes_by_level,
				'climbing_style_distribution': climbing_style_distribution,
			},
			'saved_climbs': saved_climbs_data,
		}

		serializer = UserProfileSerializer(profile_data)
		return Response(serializer.data)


class PersonalInfoView(APIView):
	"""Returns the authenticated user's personal information sourced from YoActiv."""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		from eQ_backend.yoactiv_service import get_yoactiv_user

		user = request.user
		phone = getattr(getattr(user, 'profile', None), 'phone_number', None) or ''

		yoactiv_data = {}
		if phone:
			try:
				gym = Gym.objects.filter(branch_id__isnull=False).exclude(branch_id='').first()
				if gym:
					raw = get_yoactiv_user(phone, gym, timeout=10)
					if isinstance(raw, dict):
						yoactiv_data = raw
			except Exception as exc:
				logger.warning("YoActiv fetch_user failed for user %s: %s", user.username, exc)

		# Extract emergency contact from Family_Member list (first entry)
		family_members = yoactiv_data.get('Family_Member') or []
		emergency_contact_name = None
		emergency_contact_number = None
		if family_members:
			first = family_members[0]
			emergency_contact_name = first.get('Name') or None
			raw_mobile = first.get('Mobile') or ''
			# YoActiv appends ~N suffixes for family members — strip it
			emergency_contact_number = raw_mobile.split('~')[0] or None

		# Extract DOB from Additional_Details if present
		dob = None
		additional_details = yoactiv_data.get('Additional_Details') or []
		for detail in additional_details:
			if isinstance(detail, dict):
				key = str(detail.get('Field') or detail.get('field') or '').lower()
				if 'dob' in key or 'birth' in key or 'date of birth' in key:
					dob = detail.get('Value') or detail.get('value') or None
					break

		data = {
			'name': yoactiv_data.get('Name') or f"{user.first_name} {user.last_name}".strip() or user.username,
			'email': yoactiv_data.get('Mail') or user.email or None,
			'phone': phone or yoactiv_data.get('Mobile') or None,
			'image': yoactiv_data.get('Image') or None,
			'dob': dob,
			'emergency_contact_name': emergency_contact_name,
			'emergency_contact_number': emergency_contact_number,
		}
		return Response(data)


class LogoutView(APIView):
	"""Blacklists the submitted refresh token, invalidating it server-side."""
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		from rest_framework_simplejwt.tokens import RefreshToken
		from rest_framework_simplejwt.exceptions import TokenError

		refresh_token = request.data.get('refresh')
		if not refresh_token:
			return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			token = RefreshToken(refresh_token)
			token.blacklist()
		except TokenError:
			return Response({'detail': 'Token is invalid or already blacklisted.'}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)


class UserSettingsView(APIView):
	"""GET or PATCH the authenticated user's settings."""
	permission_classes = [permissions.IsAuthenticated]

	def _get_or_create_settings(self, user):
		settings, _ = UserSettings.objects.get_or_create(user=user)
		return settings

	def get(self, request):
		user_settings = self._get_or_create_settings(request.user)
		return Response({
			'leaderboard_opt_in': user_settings.leaderboard_opt_in,
			'sends_visibility': user_settings.sends_visibility,
		})

	def patch(self, request):
		user_settings = self._get_or_create_settings(request.user)

		leaderboard_opt_in = request.data.get('leaderboard_opt_in')
		if leaderboard_opt_in is not None:
			if not isinstance(leaderboard_opt_in, bool):
				return Response({'detail': 'leaderboard_opt_in must be a boolean.'}, status=status.HTTP_400_BAD_REQUEST)
			user_settings.leaderboard_opt_in = leaderboard_opt_in

		sends_visibility = request.data.get('sends_visibility')
		if sends_visibility is not None:
			valid_choices = {choice[0] for choice in UserSettings.SENDS_VISIBILITY_CHOICES}
			if sends_visibility not in valid_choices:
				return Response({'detail': f'sends_visibility must be one of: {", ".join(valid_choices)}.'}, status=status.HTTP_400_BAD_REQUEST)
			user_settings.sends_visibility = sends_visibility

		user_settings.save()
		return Response({
			'leaderboard_opt_in': user_settings.leaderboard_opt_in,
			'sends_visibility': user_settings.sends_visibility,
		})


def _annotate_zone_schedule(walls, gym):
	"""Attach computed reset dates and active route counts to ordered walls.

	``walls`` must already be ordered by their queue ``order``.
	"""
	from datetime import date, timedelta

	setting_day = gym.setting_day if gym else None
	batch_size = max(1, getattr(gym, 'zones_per_reset', 2) or 1) if gym else 1
	# Counts of active routes per wall in one query.
	counts = {
		row['wall_id']: row['c']
		for row in Boulder.objects.filter(
			wall__in=walls, is_active=True
		).values('wall_id').annotate(c=models.Count('id'))
	}
	for position, wall in enumerate(walls):
		wall.active_route_count = counts.get(wall.id, 0)
		# If the wall was already reset today, schedule from tomorrow so it
		# doesn't show today as its next reset.
		from_date = date.today()
		if wall.last_set == date.today():
			from_date = date.today() + timedelta(days=1)
		# Zones roll in batches of ``batch_size`` (default 2): positions
		# 0..batch_size-1 reset on the next setting day, the next batch one
		# week later, and so on.
		queue_week = position // batch_size
		wall.computed_reset = computed_reset_date(setting_day, queue_week, from_date=from_date)
	return walls


class ZoneViewSet(viewsets.GenericViewSet):
	"""Setting-schedule management for walls ("zones").

	- ``GET /zones/``            ordered queue with reset dates + route counts
	- ``PATCH /zones/{id}/``     override next_reset and/or mark up next
	- ``POST /zones/reorder/``   persist a new drag-and-drop order
	- ``POST /zones/{id}/reset/``deactivate active routes and roll the schedule
	- ``GET /zones/{id}/routes/``active routes in the zone
	"""
	queryset = Wall.objects.all()
	serializer_class = ZoneScheduleSerializer
	permission_classes = [IsStaffOrReadOnly]

	def _ordered_walls(self, gym):
		return list(Wall.objects.filter(gym=gym).order_by('order', 'id'))

	def list(self, request):
		gym_id = request.query_params.get('gym_id')
		if gym_id:
			gym = get_object_or_404(Gym, pk=gym_id)
		else:
			gym = Gym.objects.first()
		if gym is None:
			return Response({'zones': []})

		walls = _annotate_zone_schedule(self._ordered_walls(gym), gym)
		serializer = self.get_serializer(walls, many=True)
		return Response({
			'gym_id': gym.id,
			'setting_day': gym.setting_day,
			'zones_per_reset': gym.zones_per_reset,
			'zones': serializer.data,
		})

	def partial_update(self, request, pk=None):
		wall = get_object_or_404(Wall, pk=pk)

		# Manual reset-date override (null clears it to fall back to computed).
		if 'next_reset' in request.data:
			wall.next_reset = request.data.get('next_reset') or None

		# "Mark as up next" — move this wall to the front of the queue.
		if request.data.get('mark_up_next') is True:
			others = Wall.objects.filter(gym=wall.gym).exclude(pk=wall.pk).order_by('order', 'id')
			wall.order = 0
			wall.save()
			for idx, other in enumerate(others, start=1):
				if other.order != idx:
					other.order = idx
					other.save(update_fields=['order'])
		else:
			wall.save()

		walls = _annotate_zone_schedule(self._ordered_walls(wall.gym), wall.gym)
		serializer = self.get_serializer(walls, many=True)
		return Response({
			'gym_id': wall.gym_id,
			'setting_day': wall.gym.setting_day,
			'zones_per_reset': wall.gym.zones_per_reset,
			'zones': serializer.data,
		})

	@action(detail=False, methods=['post'])
	def reorder(self, request):
		"""Persist a new queue order. Body: {"order": [wall_id, ...]}"""
		order = request.data.get('order')
		if not isinstance(order, list) or not order:
			return Response({'detail': 'order must be a non-empty list of wall ids.'}, status=status.HTTP_400_BAD_REQUEST)

		walls = {w.id: w for w in Wall.objects.filter(id__in=order)}
		missing = [wid for wid in order if wid not in walls]
		if missing:
			return Response({'detail': f'Unknown wall ids: {missing}.'}, status=status.HTTP_400_BAD_REQUEST)

		gym_ids = {w.gym_id for w in walls.values()}
		if len(gym_ids) > 1:
			return Response({'detail': 'All walls must belong to the same gym.'}, status=status.HTTP_400_BAD_REQUEST)

		with transaction.atomic():
			for position, wall_id in enumerate(order):
				wall = walls[wall_id]
				if wall.order != position:
					wall.order = position
					wall.save(update_fields=['order'])

		gym = next(iter(walls.values())).gym
		result = _annotate_zone_schedule(self._ordered_walls(gym), gym)
		serializer = self.get_serializer(result, many=True)
		return Response({
			'gym_id': gym.id,
			'setting_day': gym.setting_day,
			'zones_per_reset': gym.zones_per_reset,
			'zones': serializer.data,
		})

	@action(detail=True, methods=['post'])
	def reset(self, request, pk=None):
		"""Reset a wall: deactivate its active routes, mark it set today,
		and roll its next reset date forward one cycle."""
		from datetime import date, timedelta

		wall = get_object_or_404(Wall, pk=pk)
		with transaction.atomic():
			deactivated = Boulder.objects.filter(wall=wall, is_active=True).update(is_active=False)
			wall.last_set = date.today()
			# Roll the manual override (if any) forward so it points to a
			# future date; otherwise leave it null to recompute from order.
			position = list(
				Wall.objects.filter(gym=wall.gym).order_by('order', 'id').values_list('id', flat=True)
			).index(wall.id)
			batch_size = max(1, wall.gym.zones_per_reset or 1)
			queue_week = position // batch_size
			wall.next_reset = computed_reset_date(
				wall.gym.setting_day, queue_week, from_date=date.today() + timedelta(days=1)
			)
			wall.save(update_fields=['last_set', 'next_reset'])

		return Response({'detail': f'Reset complete. {deactivated} routes deactivated.', 'wall_id': wall.id})

	@action(detail=True, methods=['get'])
	def routes(self, request, pk=None):
		"""List the active routes in this zone."""
		wall = get_object_or_404(Wall, pk=pk)
		boulders = Boulder.objects.filter(wall=wall, is_active=True).order_by('-date_set', '-id')
		serializer = BoulderSerializer(boulders, many=True, context={'request': request})
		return Response({'wall_id': wall.id, 'wall_name': wall.name, 'routes': serializer.data})


class SettingHistoryView(APIView):
	"""Setting history grouped by the date routes were set.

	``GET /setting-history/``          → list of {date, zones, setter_names, route_count}
	``GET /setting-history/{date}/``   → routes set on that date (YYYY-MM-DD)
	"""
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, date=None):
		if date:
			boulders = Boulder.objects.filter(date_set=date).select_related(
				'wall', 'wall__gym', 'setter', 'tester'
			).order_by('wall__order', 'id')
			serializer = BoulderSerializer(boulders, many=True, context={'request': request})
			return Response({'date': date, 'routes': serializer.data})

		# Group by date_set.
		rows = (
			Boulder.objects.values('date_set')
			.annotate(route_count=models.Count('id'))
			.order_by('-date_set')
		)
		history = []
		for row in rows:
			d = row['date_set']
			day_boulders = Boulder.objects.filter(date_set=d).select_related('wall', 'setter')
			zones = sorted({b.wall.name for b in day_boulders if b.wall})
			setters = sorted({
				(f"{b.setter.first_name} {b.setter.last_name}".strip() or b.setter.username)
				for b in day_boulders if b.setter
			})
			history.append({
				'date': d,
				'zones': zones,
				'setters': setters,
				'route_count': row['route_count'],
			})
		return Response({'history': history})


class StaffUsersView(APIView):
	"""List staff users for setter/tester dropdowns."""
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		from django.contrib.auth.models import User

		staff = User.objects.filter(is_staff=True).order_by('first_name', 'last_name', 'username')
		serializer = StaffUserSerializer(staff, many=True)
		return Response({'staff_users': serializer.data})

