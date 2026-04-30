
from django.urls import path, include
from .views import GymViewSet, WallViewSet, BoulderViewSet, BoulderAscentView, LeaderboardView, UserProfileView, LogoutView
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'gyms', GymViewSet, basename='gyms')
router.register(r'boulders', BoulderViewSet, basename='boulders')
gyms_router = routers.NestedDefaultRouter(router, r'gyms', lookup='gym')
gyms_router.register(r'walls', WallViewSet, basename='gym-walls')





urlpatterns = [
    path('', include(router.urls)),
    path('', include(gyms_router.urls)),
    path('boulders/<int:pk>/ascent/', BoulderAscentView.as_view(), name='boulder-ascent'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]
