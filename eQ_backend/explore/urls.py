from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExploreActiveView, ExploreClassesView, ExploreMembershipsView, ServiceGroupViewSet, ServiceViewSet, get_service_variations_json

router = DefaultRouter()
router.register(r'service-groups', ServiceGroupViewSet, basename='service-group')
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = [
    path('explore-classes/', ExploreClassesView.as_view(), name='explore-classes'),
    path('explore-memberships/', ExploreMembershipsView.as_view(), name='explore-memberships'),
    path('explore-active/', ExploreActiveView.as_view(), name='explore-active'),
    path('api/variations/', get_service_variations_json, name='get-variations-json'),
    path('', include(router.urls)),
]
