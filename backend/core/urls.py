from django.urls import path, include
from .views import health_check
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    CustomUserViewSet, UserCredentialsViewSet, UserSettingsViewSet,
    SessionsViewSet, ImagesViewSet, NotificationsViewSet, EventsViewSet,
    PatternsViewSet, ProcessingJobsViewSet, JobResultsViewSet,
    ViaEventsViewSet, ProcessingOutputsViewSet, SourceDownloadsViewSet
)

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'user-credentials', UserCredentialsViewSet, basename='usercredentials')
router.register(r'user-settings', UserSettingsViewSet, basename='usersettings')
router.register(r'sessions', SessionsViewSet, basename='sessions')
router.register(r'images', ImagesViewSet, basename='images')
router.register(r'notifications', NotificationsViewSet, basename='notifications')
router.register(r'events', EventsViewSet, basename='events')
router.register(r'patterns', PatternsViewSet, basename='patterns')
router.register(r'processing-jobs', ProcessingJobsViewSet, basename='processingjobs')
router.register(r'job-results', JobResultsViewSet, basename='jobresults')
router.register(r'via-events', ViaEventsViewSet, basename='viaevents')
router.register(r'processing-outputs', ProcessingOutputsViewSet, basename='processingoutputs')
router.register(r'source-downloads', SourceDownloadsViewSet, basename='sourcedownloads')

urlpatterns = [
    # Health check (public)
    path('health/', health_check, name='health_check'),

    # JWT Token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API endpoints
    path('', include(router.urls)),
]