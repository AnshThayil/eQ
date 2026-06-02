from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExploreActiveView, ExploreClassesView, ExploreMembershipsView, ExploreEventsView, ServiceGroupViewSet, ServiceViewSet, get_service_variations_json, get_gym_services_json, MemberSearchView

router = DefaultRouter()
router.register(r'service-groups', ServiceGroupViewSet, basename='service-group')
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = [
    path('explore-classes/', ExploreClassesView.as_view(), name='explore-classes'),
    path('explore-memberships/', ExploreMembershipsView.as_view(), name='explore-memberships'),
    path('explore-events/', ExploreEventsView.as_view(), name='explore-events'),
    path('explore-active/', ExploreActiveView.as_view(), name='explore-active'),
    path('members/', MemberSearchView.as_view(), name='member-search'),
    path('api/variations/', get_service_variations_json, name='get-variations-json'),
    path('api/gym-services/', get_gym_services_json, name='get-gym-services-json'),
    path('', include(router.urls)),
]
