import logging

from django.db.models import Prefetch
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status

from logger.models import Gym
from eQ_backend.yoactiv_service import YoActivClient, YoActivAPIError
from .models import Service, ServiceGroup
from .serializers import ServiceSerializer, ServiceGroupDetailSerializer, ServiceGroupListSerializer
from .yoactiv_admin_integration import fetch_yoactiv_variations

logger = logging.getLogger(__name__)


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
		).prefetch_related(
			Prefetch('variations', queryset=Service.objects.filter(is_active=True).order_by('price'))
		)
		services_data = ServiceGroupDetailSerializer(service_groups, many=True).data
		return Response({self.response_key: services_data})


class ExploreActiveView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		services_by_variation_id = {
			str(service.yoactiv_service_variation_id): service
			for service in Service.objects.select_related('service_group').exclude(yoactiv_service_variation_id='')
			if service.yoactiv_service_variation_id
		}

		user = request.user
		phone_number = getattr(getattr(user, 'profile', None), 'phone_number', None)
		if not phone_number:
			return Response({'detail': 'Authenticated user must have a phone_number in profile.'}, status=status.HTTP_400_BAD_REQUEST)

		gyms = Gym.objects.exclude(branch_id__isnull=True).exclude(branch_id__exact='')
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
					combined_results.extend(results)

		active_plans = []
		for result in combined_results:
			if not isinstance(result, dict) or result.get('Status') != 'Active':
				continue

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

			service = services_by_variation_id.get(service_variation_id)
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


@csrf_exempt
@require_http_methods(["GET"])
def get_service_variations_json(request):
	"""
	API endpoint for admin form to fetch service variations dynamically.
	Used by admin JavaScript to populate variation dropdowns and auto-fill fields.
	
	Query params:
	- service_group_id: ID of the ServiceGroup
	- branch_id (optional): YoActiv branch ID, defaults to YOACTIV_BRANCH_ID env var
	
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
	try:
		service_group_id = request.GET.get('service_group_id')
		
		if not service_group_id:
			return JsonResponse({
				'success': False,
				'error': 'service_group_id is required'
			}, status=400)
		
		# Get the service group
		try:
			service_group = ServiceGroup.objects.get(id=service_group_id)
		except ServiceGroup.DoesNotExist:
			return JsonResponse({
				'success': False,
				'error': f'ServiceGroup with id {service_group_id} not found'
			}, status=404)
		
		# Get the yoactiv service ID
		yoactiv_service_id = service_group.yoactiv_service_id
		if not yoactiv_service_id:
			return JsonResponse({
				'success': False,
				'error': f'ServiceGroup {service_group.name} does not have a YoActiv service ID'
			}, status=400)
		
		# Fetch variations from YoActiv
		branch_id = request.GET.get('branch_id')
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
		logger.error(f'Error fetching variations: {str(e)}')
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
	queryset = ServiceGroup.objects.filter(is_active=True).prefetch_related('variations')
	permission_classes = [permissions.IsAuthenticated]
	
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
	queryset = Service.objects.filter(is_active=True).select_related('service_group')
	serializer_class = ServiceSerializer
	permission_classes = [permissions.IsAuthenticated]
	filterset_fields = ['service_group', 'access_type']
	ordering_fields = ['price', 'created_at']
	ordering = ['price']
