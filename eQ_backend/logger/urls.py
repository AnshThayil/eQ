
from django.urls import path, include
from .views import GymViewSet, WallViewSet, BoulderViewSet, BoulderAscentView
from rest_framework_nested import routers

router = routers.DefaultRouter()
router.register(r'gyms', GymViewSet, basename='gyms')
router.register(r'boulders', BoulderViewSet, basename='boulders')
gyms_router = routers.NestedDefaultRouter(router, r'gyms', lookup='gym')
gyms_router.register(r'walls', WallViewSet, basename='gym-walls')





urlpatterns = [
    path('', include(router.urls)),
    path('', include(gyms_router.urls)),
    path('boulders/<int:pk>/ascent', BoulderAscentView.as_view(), name='boulder-ascent'),
]
