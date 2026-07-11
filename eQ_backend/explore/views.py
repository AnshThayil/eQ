import logging
from zoneinfo import ZoneInfo

from django.db.models import Prefetch
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status

from logger.models import Gym
from eQ_backend.yoactiv_service import YoActivClient, YoActivAPIError
from .models import Service, ServiceGroup
from .serializers import ServiceSerializer, ServiceGroupDetailSerializer, ServiceGroupListSerializer
from .yoactiv_admin_integration import fetch_yoactiv_services, fetch_yoactiv_variations

logger = logging.getLogger(__name__)
IST = ZoneInfo('Asia/Kolkata')


def get_result_value(result, *keys):
	for key in keys:
		value = result.get(key)
		if value not in (None, ''):
			return value
	return None


class BaseExploreServicesView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	service_type = None
	response_key = None

	def get(self, request):
		if not self.service_type or not self.response_key:
			return Response({'detail': 'Explore service view is not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		service_groups = ServiceGroup.objects.filter(
			is_active=True,
			service_type=self.service_type,
		)
		gym_id = request.query_params.get('gym_id')
		if gym_id:
			service_groups = service_groups.filter(gym_id=gym_id)

		service_groups = service_groups.prefetch_related(
			Prefetch('variations', queryset=Service.objects.filter(is_active=True).order_by('price'))
		)
		services_data = ServiceGroupDetailSerializer(service_groups, many=True).data
		return Response({self.response_key: services_data})


class ExploreActiveView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		services_by_gym_and_variation_id = {
			(service.service_group.gym_id, str(service.yoactiv_service_variation_id)): service
			for service in Service.objects.select_related('service_group', 'service_group__gym').exclude(yoactiv_service_variation_id='')
			if service.yoactiv_service_variation_id
		}

		user = request.user
		phone_number = getattr(getattr(user, 'profile', None), 'phone_number', None)
		if not phone_number:
			return Response({'detail': 'Authenticated user must have a phone_number in profile.'}, status=status.HTTP_400_BAD_REQUEST)

		gyms = Gym.objects.exclude(branch_id__isnull=True).exclude(branch_id__exact='')
		gym_id = request.query_params.get('gym_id')
		if gym_id:
			gyms = gyms.filter(id=gym_id)
		combined_results = []

		for gym in gyms:
			client = YoActivClient.from_gym(gym)
			try:
				response = client.fetch_user(phone_number)
			except YoActivAPIError as exc:
				logger.error('YoActiv request failed for gym %s branch %s: %s', gym.id, gym.branch_id, exc)
				return Response({'detail': 'YoActiv request failed.', 'error': str(exc), 'gym_id': gym.id, 'branch_id': gym.branch_id}, status=status.HTTP_502_BAD_GATEWAY)

			if isinstance(response, dict):
				results = response.get('Results', [])
				if isinstance(results, list):
					for result in results:
						if isinstance(result, dict):
							result_with_gym = dict(result)
							result_with_gym['_gym_id'] = gym.id
							combined_results.append(result_with_gym)

		active_plans = []
		for result in combined_results:
			if not isinstance(result, dict) or result.get('Status') != 'Active':
				continue
			result_gym_id = result.get('_gym_id')

			upgrade_details = result.get('upgradeDetails') if isinstance(result.get('upgradeDetails'), dict) else {}
			raw_variation_id = get_result_value(
				result,
				'service_variation_id',
				'Service_Variation_Id',
			)
			if raw_variation_id is None:
				raw_variation_id = get_result_value(
					upgrade_details,
					'service_variation_id',
					'Service_Variation_Id',
				)
			service_variation_id = str(raw_variation_id) if raw_variation_id is not None else None

			service = services_by_gym_and_variation_id.get((result_gym_id, service_variation_id))
			if not service:
				continue

			total_sessions = get_result_value(
				result,
				'total_num_sessions',
				'total_sessions',
				'Total_Num_Sessions',
				'TotalSessions',
			)
			if total_sessions is None:
				sessions_value = get_result_value(result, 'Sessions')
				if sessions_value not in (None, '', 'Not Applicable'):
					total_sessions = sessions_value
			if total_sessions is None:
				total_sessions = service.num_sessions

			active_plans.append({
				'service_id': service.id,
				'service_group_id': service.service_group_id,
				'gym_id': service.service_group.gym_id,
				'gym_name': service.service_group.gym.name,
				'service_group_name': service.service_group.name,
				'service_type': service.service_group.service_type,
				'name': service.name,
				'expiry_date': get_result_value(result, 'Expiry_date', 'expiry_date', 'Expiry_Date', 'ExpiryDate', 'end_date', 'EndDate'),
				'purchase_date': get_result_value(result, 'Start_Date', 'purchase_date', 'Purchase_Date', 'PurchaseDate', 'start_date', 'StartDate'),
				'sessions_completed': get_result_value(result, 'Used_Sessions'),
				'total_num_sessions': total_sessions,
			})

		return Response({'active_plans': active_plans})


class ExploreClassesView(BaseExploreServicesView):
	service_type = 'class'
	response_key = 'classes'


class ExploreMembershipsView(BaseExploreServicesView):
	service_type = 'membership'
	response_key = 'memberships'


class ExploreEventsView(BaseExploreServicesView):
	service_type = 'event'
	response_key = 'events'


@require_http_methods(["GET"])
def get_gym_services_json(request):
	"""
	API endpoint for admin form to fetch YoActiv services for a specific gym.
	Uses the gym's stored branch_id instead of the env-var default.

	Query params:
	- gym_id: ID of the Gym model instance

	Returns JSON:
	{
		"success": true,
		"services": [
			{"id": "service_id", "name": "Service Name", "display": "Service Name"}
		]
	}
	"""
	if not request.user.is_staff:
		return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
	try:
		gym_id = request.GET.get('gym_id')
		if not gym_id:
			return JsonResponse({'success': False, 'error': 'gym_id is required'}, status=400)

		try:
			gym = Gym.objects.get(id=gym_id)
		except Gym.DoesNotExist:
			return JsonResponse({'success': False, 'error': f'Gym with id {gym_id} not found'}, status=404)

		if not gym.branch_id:
			return JsonResponse(
				{'success': False, 'error': f'Gym "{gym.name}" does not have a branch_id configured'},
				status=400,
			)

		services = fetch_yoactiv_services(branch_id=gym.branch_id)
		formatted = [
			{'id': s['serviceId'], 'name': s['serviceName'], 'display': s['serviceName']}
			for s in services
		]
		return JsonResponse({'success': True, 'services': formatted})

	except Exception as e:
		logger.error('Error fetching gym services: %s', str(e))
		return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_service_variations_json(request):
	"""
	API endpoint for admin form to fetch service variations dynamically.
	Used by admin JavaScript to populate variation dropdowns and auto-fill fields.
	Uses the branch_id from the service group's gym (DB-stored), not the env var.

	Query params:
	- service_group_id: ID of the ServiceGroup

	Returns JSON:
	{
		"success": true,
		"variations": [
			{
				"id": "unique_variation_id",
				"serviceId": "service_id",
				"name": "1 Month",
				"amount": 5000,
				"display": "1 Month (₹5000)"
			},
			...
		]
	}
	"""
	if not request.user.is_staff:
		return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
	try:
		service_group_id = request.GET.get('service_group_id')
		
		if not service_group_id:
			logger.warning('[variations] Missing service_group_id query param')
			return JsonResponse({
				'success': False,
				'error': 'service_group_id is required'
			}, status=400)
		
		# Get the service group with its gym
		try:
			service_group = ServiceGroup.objects.select_related('gym').get(id=service_group_id)
		except ServiceGroup.DoesNotExist:
			logger.warning('[variations] ServiceGroup id=%s not found', service_group_id)
			return JsonResponse({
				'success': False,
				'error': f'ServiceGroup with id {service_group_id} not found'
			}, status=404)

		# Get the yoactiv service ID
		yoactiv_service_id = service_group.yoactiv_service_id
		if not yoactiv_service_id:
			logger.warning('[variations] ServiceGroup id=%s (%s) has no yoactiv_service_id', service_group_id, service_group.name)
			return JsonResponse({
				'success': False,
				'error': f'ServiceGroup {service_group.name} does not have a YoActiv service ID'
			}, status=400)

		# Use the gym's DB-stored branch_id — never fall back to the env var
		branch_id = service_group.gym.branch_id
		if not branch_id:
			logger.warning('[variations] Gym id=%s (%s) has no branch_id', service_group.gym.id, service_group.gym.name)
			return JsonResponse({
				'success': False,
				'error': f'Gym "{service_group.gym.name}" does not have a branch_id configured'
			}, status=400)

		logger.info('[variations] Fetching from YoActiv: service_group=%s yoactiv_service_id=%s branch_id=%s', service_group.name, yoactiv_service_id, branch_id)
		variations = fetch_yoactiv_variations(yoactiv_service_id, branch_id)
		
		# Format for admin form
		formatted_variations = [
			{
				'id': variation['id'],
				'serviceId': variation['serviceId'],
				'name': variation['ServiceVariation'],
				'amount': variation['amount'],
				'display': f"{variation['ServiceVariation']} (₹{variation['amount']})"
			}
			for variation in variations
		]
		
		return JsonResponse({
			'success': True,
			'variations': formatted_variations
		})
	
	except Exception as e:
		logger.error('[variations] Unexpected error for service_group_id=%s: %s', request.GET.get('service_group_id'), str(e), exc_info=True)
		return JsonResponse({
			'success': False,
			'error': str(e)
		}, status=500)


class ServiceGroupViewSet(ReadOnlyModelViewSet):
	"""
	ViewSet for listing and retrieving service groups with their variations.
	
	List endpoint: GET /service-groups/ - Returns all service groups
	Detail endpoint: GET /service-groups/{id}/ - Returns a single service group with all variations
	"""
	queryset = ServiceGroup.objects.filter(is_active=True).select_related('gym').prefetch_related('variations')
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		queryset = super().get_queryset()
		gym_id = self.request.query_params.get('gym_id')
		if gym_id:
			queryset = queryset.filter(gym_id=gym_id)
		return queryset
	
	def get_serializer_class(self):
		if self.action == 'retrieve':
			return ServiceGroupDetailSerializer
		return ServiceGroupListSerializer


class ServiceViewSet(ReadOnlyModelViewSet):
	"""
	ViewSet for listing and retrieving individual service variations.
	
	Supports filtering by:
	- service_group: Filter by service group ID
	- access_type: Filter by access type
	"""
	queryset = Service.objects.filter(is_active=True).select_related('service_group', 'service_group__gym')
	serializer_class = ServiceSerializer
	permission_classes = [permissions.IsAuthenticated]
	filterset_fields = ['service_group', 'service_group__gym', 'access_type']
	ordering_fields = ['price', 'created_at']
	ordering = ['price']


class MemberSearchView(APIView):
	"""
	Frontdesk staff endpoint to look up members via YoActiv.

	GET /api/members/?gym_id=<id>&mobile=<mobile>
	  Proxies Users/Fetch — returns the matching YoActiv user record.

	GET /api/members/?gym_id=<id>
	  Proxies Users/GetUserList — returns all members for the branch.

	Requires: authenticated staff user (is_staff=True).
	"""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		gym_id = request.query_params.get('gym_id')
		if not gym_id:
			return Response({'detail': 'gym_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			gym = Gym.objects.get(id=gym_id)
		except Gym.DoesNotExist:
			return Response({'detail': f'Gym with id {gym_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

		if not gym.branch_id:
			return Response(
				{'detail': f'Gym "{gym.name}" does not have a branch_id configured.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		try:
			client = YoActivClient.from_gym(gym)
			mobile = request.query_params.get('mobile')
			if mobile:
				data = client.fetch_user(mobile)
			else:
				data = client.get_user_list()
		except ValueError as exc:
			logger.error('YoActiv misconfiguration for gym %s: %s', gym_id, exc)
			return Response(
				{'detail': 'YoActiv is not configured correctly on this server.', 'error': str(exc)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except YoActivAPIError as exc:
			logger.error('YoActiv member search failed for gym %s: %s', gym_id, exc)
			return Response(
				{'detail': 'YoActiv request failed.', 'error': str(exc)},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		return Response(data)


class ClassScheduleView(APIView):
	"""
	Frontdesk endpoint for today's YoActiv class schedule.

	GET /api/class-schedule/?gym_id=<id>
	  Proxies Classes/Schedule for the gym's branch using today's date (IST).
	"""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		gym_id = request.query_params.get('gym_id')
		if not gym_id:
			return Response({'detail': 'gym_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			gym = Gym.objects.get(id=gym_id)
		except Gym.DoesNotExist:
			return Response({'detail': f'Gym with id {gym_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

		if not gym.branch_id:
			return Response(
				{'detail': f'Gym "{gym.name}" does not have a branch_id configured.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		today = timezone.now().astimezone(IST).date().isoformat()

		try:
			client = YoActivClient.from_gym(gym)
			data = client.get_class_schedule(today)
		except ValueError as exc:
			logger.error('YoActiv misconfiguration for gym %s: %s', gym_id, exc)
			return Response(
				{'detail': 'YoActiv is not configured correctly on this server.', 'error': str(exc)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except YoActivAPIError as exc:
			logger.error('YoActiv class schedule failed for gym %s: %s', gym_id, exc)
			return Response(
				{'detail': 'YoActiv request failed.', 'error': str(exc)},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		raw_results = []
		if isinstance(data, dict):
			raw_results = data.get('Results') or []
			# YoActiv returns an Error payload (no Results) when nothing is scheduled.
			if not raw_results and data.get('Error'):
				raw_results = []
		elif isinstance(data, list):
			raw_results = data

		classes = []
		for item in raw_results:
			if not isinstance(item, dict):
				continue
			try:
				capacity = int(item.get('Total_availability') or 0)
			except (TypeError, ValueError):
				capacity = 0
			try:
				bookings = int(item.get('numberOfBookings') or 0)
			except (TypeError, ValueError):
				bookings = 0
			classes.append({
				'class_id': str(item.get('Class_Id') or ''),
				'class_list_id': str(item.get('ClassListID') or ''),
				'name': item.get('Class_Name') or '',
				'staff_name': item.get('Staff_Name') or '',
				'start_time': item.get('Start_Time') or '',
				'end_time': item.get('End_Time') or '',
				'capacity': capacity,
				'bookings': bookings,
				'allow_book': bool(item.get('AllowBook')),
				'allow_cancel': bool(item.get('AllowCancel')),
				'online_booking': bool(item.get('Online_Booking')),
			})

		classes.sort(key=lambda c: (c.get('start_time') or '', c.get('name') or ''))
		return Response({'date': today, 'classes': classes})


def _yoactiv_results(data):
	"""Extract a Results list from a YoActiv payload, treating empty/error as []."""
	if isinstance(data, list):
		return data
	if not isinstance(data, dict):
		return []
	raw = data.get('Results')
	if raw is None:
		raw = data.get('results')
	if not raw:
		return []
	return raw if isinstance(raw, list) else []


def _normalize_enrollment(item):
	"""Map a YoActiv enrollment row to a stable frontdesk shape."""
	if not isinstance(item, dict):
		return None

	first = get_result_value(item, 'First_Name', 'FirstName', 'first_name') or ''
	last = get_result_value(item, 'Last_Name', 'LastName', 'last_name') or ''
	combined = f'{first} {last}'.strip()
	name = get_result_value(
		item,
		'Name',
		'Member_Name',
		'MemberName',
		'FullName',
		'User_Name',
		'Customer_Name',
		'Client_Name',
	) or combined or 'Member'

	user_id = get_result_value(
		item,
		'MemberId',
		'Member_Id',
		'MemberID',
		'User_Id',
		'UserID',
		'UserId',
		'Customer_Id',
		'CustomerId',
	)
	mobile = get_result_value(item, 'Mobile_No', 'Mobile', 'Phone', 'phone') or ''

	checked_raw = get_result_value(
		item,
		'IsCheckedIn',
		'CheckedIn',
		'CheckIn',
		'Check_In',
		'Attendance',
		'IsAttend',
		'Attended',
	)
	if isinstance(checked_raw, bool):
		checked_in = checked_raw
	elif checked_raw is None:
		checked_in = False
	else:
		checked_in = str(checked_raw).strip().lower() in ('1', 'true', 'yes', 'y', 'checkedin', 'checked_in', 'present', 'attended')

	class_book_id = get_result_value(
		item,
		'ClassBook_Id',
		'ClassBookId',
		'Class_Book_Id',
		'Booking_Id',
		'BookingId',
		'Book_Id',
	)

	return {
		'user_id': str(user_id) if user_id not in (None, '') else '',
		'class_book_id': str(class_book_id) if class_book_id not in (None, '') else '',
		'name': str(name).strip(),
		'mobile': str(mobile).strip(),
		'checked_in': checked_in,
	}


class ClassEnrollmentsView(APIView):
	"""
	Frontdesk endpoint for today's YoActiv class roster.

	GET /api/class-enrollments/?gym_id=<id>&class_id=<yoactiv_class_id>
	  Proxies Classes/Enrollments for the gym's branch using today's date (IST).
	"""

	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		gym_id = request.query_params.get('gym_id')
		class_id = request.query_params.get('class_id')
		if not gym_id:
			return Response({'detail': 'gym_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
		if not class_id:
			return Response({'detail': 'class_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			gym = Gym.objects.get(id=gym_id)
		except Gym.DoesNotExist:
			return Response({'detail': f'Gym with id {gym_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

		if not gym.branch_id:
			return Response(
				{'detail': f'Gym "{gym.name}" does not have a branch_id configured.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		today = timezone.now().astimezone(IST).date().isoformat()

		try:
			client = YoActivClient.from_gym(gym)
			data = client.get_class_enrollments(today, class_id)
		except ValueError as exc:
			logger.error('YoActiv misconfiguration for gym %s: %s', gym_id, exc)
			return Response(
				{'detail': 'YoActiv is not configured correctly on this server.', 'error': str(exc)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except YoActivAPIError as exc:
			logger.error('YoActiv class enrollments failed for gym %s class %s: %s', gym_id, class_id, exc)
			return Response(
				{'detail': 'YoActiv request failed.', 'error': str(exc)},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		enrollments = []
		for item in _yoactiv_results(data):
			normalized = _normalize_enrollment(item)
			if normalized:
				enrollments.append(normalized)

		return Response({
			'date': today,
			'class_id': str(class_id),
			'enrollments': enrollments,
		})


def _resolve_gym_for_yoactiv(gym_id):
	"""Return (gym, error_response). error_response is None on success."""
	if not gym_id:
		return None, Response({'detail': 'gym_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
	try:
		gym = Gym.objects.get(id=gym_id)
	except Gym.DoesNotExist:
		return None, Response({'detail': f'Gym with id {gym_id} not found.'}, status=status.HTTP_404_NOT_FOUND)
	if not gym.branch_id:
		return None, Response(
			{'detail': f'Gym "{gym.name}" does not have a branch_id configured.'},
			status=status.HTTP_400_BAD_REQUEST,
		)
	return gym, None


class ClassReserveView(APIView):
	"""
	Frontdesk endpoint to book a member into YoActiv class(es).

	POST /api/class-reserve/
	  Body: { gym_id, member_id, reserves: [{ class_date, class_id }, ...] }
	  Proxies Classes/Reserve.
	"""

	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		gym, err = _resolve_gym_for_yoactiv(request.data.get('gym_id'))
		if err:
			return err

		member_id = request.data.get('member_id')
		if member_id in (None, ''):
			return Response({'detail': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			member_id_int = int(member_id)
		except (TypeError, ValueError):
			return Response(
				{'detail': 'member_id must be a YoActiv MemberId integer, not a phone number.'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		# YoActiv converts Member_Id with VB ToInteger (Int32). Phone numbers overflow.
		if member_id_int < 1 or member_id_int > 2147483647:
			return Response(
				{'detail': 'member_id is out of range for YoActiv MemberId (got a phone number?).'},
				status=status.HTTP_400_BAD_REQUEST,
			)
		member_id = member_id_int

		reserves = request.data.get('reserves')
		if not isinstance(reserves, list) or not reserves:
			return Response(
				{'detail': 'reserves must be a non-empty list of {class_date, class_id}.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		normalized = []
		for item in reserves:
			if not isinstance(item, dict):
				continue
			class_id = item.get('class_id', item.get('Class_Id'))
			class_date = item.get('class_date', item.get('Class_Date'))
			if class_id in (None, '') or not class_date:
				continue
			# Date only — strip any time component before proxying to YoActiv.
			date_only = str(class_date).strip()
			if 'T' in date_only:
				date_only = date_only.split('T', 1)[0]
			elif ' ' in date_only:
				date_only = date_only.split(' ', 1)[0]
			normalized.append({'class_id': class_id, 'class_date': date_only})

		if not normalized:
			return Response(
				{'detail': 'No valid reserve entries. Each needs class_date and class_id.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		try:
			client = YoActivClient.from_gym(gym)
			data = client.reserve_classes(member_id, normalized)
		except ValueError as exc:
			logger.error('YoActiv misconfiguration for gym %s: %s', gym.id, exc)
			return Response(
				{'detail': 'YoActiv is not configured correctly on this server.', 'error': str(exc)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except YoActivAPIError as exc:
			logger.error('YoActiv class reserve failed for gym %s member %s: %s', gym.id, member_id, exc)
			raw = str(exc)
			detail = 'YoActiv request failed.'
			# Prefer the short Error1 / exception type over the HTML SOAP dump.
			if 'ProtocolException' in raw:
				detail = (
					'YoActiv ClassReserve failed internally (ProtocolException). '
					'Payload was accepted by their HTTP API but their SOAP backend returned HTML. '
					'Often means the class is not bookable right now (AllowBook=false) or YoActiv service issue.'
				)
			elif 'OverflowException' in raw:
				detail = 'YoActiv rejected Member_Id (overflow) — use MemberId, not phone number.'
			return Response(
				{'detail': detail, 'error': raw},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		return Response(data if data is not None else {'ok': True})


class ClassReserveCancelView(APIView):
	"""
	Frontdesk endpoint to cancel a YoActiv class booking.

	POST /api/class-reserve-cancel/
	  Body: { gym_id, member_id, class_book_id }
	  Proxies Classes/ReserveCancel.
	"""

	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		gym, err = _resolve_gym_for_yoactiv(request.data.get('gym_id'))
		if err:
			return err

		member_id = request.data.get('member_id')
		class_book_id = request.data.get('class_book_id')
		if member_id in (None, ''):
			return Response({'detail': 'member_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
		if class_book_id in (None, ''):
			return Response({'detail': 'class_book_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			client = YoActivClient.from_gym(gym)
			data = client.cancel_reservation(member_id, class_book_id)
		except ValueError as exc:
			logger.error('YoActiv misconfiguration for gym %s: %s', gym.id, exc)
			return Response(
				{'detail': 'YoActiv is not configured correctly on this server.', 'error': str(exc)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except YoActivAPIError as exc:
			logger.error(
				'YoActiv reserve cancel failed for gym %s member %s book %s: %s',
				gym.id, member_id, class_book_id, exc,
			)
			return Response(
				{'detail': 'YoActiv request failed.', 'error': str(exc)},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		return Response(data if data is not None else {'ok': True})
