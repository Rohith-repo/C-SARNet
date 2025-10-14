from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile
from model.inference import SARColorizer
import uuid
from .models import (
    CustomUser, UserCredentials, UserSettings, Sessions, Images,
    Notifications, Events, Patterns, ProcessingJobs, JobResults,
    ViaEvents, ProcessingOutputs, SourceDownloads
)
from .serializers import (
    CustomUserSerializer, UserCredentialsSerializer, UserSettingsSerializer,
    SessionsSerializer, ImagesSerializer, NotificationsSerializer,
    EventsSerializer, PatternsSerializer, ProcessingJobsSerializer,
    JobResultsSerializer, ViaEventsSerializer, ProcessingOutputsSerializer,
    SourceDownloadsSerializer
)
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.base import ContentFile
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import os


User = get_user_model()
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        user = request.user
        if request.method == 'PATCH':
            serializer = CustomUserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)


    @action(detail=False, methods=['patch', 'put'])
    def update_profile(self, request):
        """Update current user profile (partial allowed)"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='avatar', parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request):
        """
        Upload or replace avatar. Expects multipart/form-data with key 'avatar'.
        Returns serialized user (so frontend gets avatar URL).
        """
        if 'avatar' not in request.FILES:
            return Response({'error': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        avatar_file = request.FILES['avatar']
        # Build filename: avatars/<user_id>_<original_name>
        filename = f"avatars/{user.id}_{avatar_file.name}"

        # delete old avatar file if it exists (safe attempt)
        try:
            if user.avatar:
                # default_storage.delete can accept the field value
                user.avatar.delete(save=False)
        except Exception:
            pass

        # Save new file into the ImageField properly
        user.avatar.save(filename, avatar_file, save=True)

        # Serialize and return the user so frontend gets new avatar URL (serializer should expose avatar.url)
        serializer = self.get_serializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserCredentialsViewSet(viewsets.ModelViewSet):
    serializer_class = UserCredentialsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCredentials.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_settings(self, request):
        """Get current user settings"""
        settings, created = UserSettings.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class SessionsViewSet(viewsets.ModelViewSet):
    serializer_class = SessionsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Sessions.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_analyzed(self, request, pk=None):
        """Mark session as analyzed"""
        session = self.get_object()
        session.post_analysis_at = timezone.now()
        session.save()
        return Response({'status': 'Session marked as analyzed'})

    @action(detail=False, methods=['delete'])
    def clear_history(self, request):
        """Delete all sessions (and related images) for current user"""
        deleted, _ = Sessions.objects.filter(user=request.user).delete()
        return Response({'status': 'cleared', 'deleted': deleted})


from django.core.files.storage import default_storage
from django.conf import settings
import os

class ImagesViewSet(viewsets.ModelViewSet):
    queryset = Images.objects.all()
    serializer_class = ImagesSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('image')
        storage_path = request.data.get('storage_path')
        session_id = request.data.get('session_id')
        image_id = request.data.get('image_id') or str(uuid.uuid4())

        if not file_obj and not storage_path:
            return Response({'detail': 'Provide image file or storage_path'}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj and not storage_path:
            # Save file and set storage_path to relative path (ImageField uses storage)
            fname = f"uploads/{image_id}_{file_obj.name}"
            saved_path = default_storage.save(fname, file_obj)  # returns relative path
            # Provide URL for frontend
            storage_path = request.build_absolute_uri(settings.MEDIA_URL + saved_path)

        # Find or create session
        if session_id:
            try:
                session = Sessions.objects.get(user=request.user, session_id=session_id)
            except Sessions.DoesNotExist:
                return Response({'detail': 'session_id not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = Sessions.objects.create(
                user=request.user,
                session_id=str(uuid.uuid4()),
                username=(request.user.get_username() or request.user.email or request.user.username),
                text='Image uploaded',
                type='image',
                date=timezone.now(),
                total_cnt=1,
                user_status='active',
                user_status_date=timezone.now(),
            )

        # Create image entry
        Images.objects.create(
            session=session,
            user_id=str(request.user.id),
            image_id=image_id,
            storage_path=storage_path,
        )

        # IMPORTANT: increment session.total_cnt and save
        session.total_cnt = (session.total_cnt or 0) + 1
        session.save()

        serializer = SessionsSerializer(session, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        # similar to create above but using JSON payload (storage_path required)
        image_id = request.data.get('image_id') or str(uuid.uuid4())
        storage_path = request.data.get('storage_path')
        session_id = request.data.get('session_id')

        if not storage_path:
            return Response({'error': 'storage_path is required'}, status=status.HTTP_400_BAD_REQUEST)

        if session_id:
            try:
                session = Sessions.objects.get(user=request.user, session_id=session_id)
            except Sessions.DoesNotExist:
                return Response({'error': 'session_id not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = Sessions.objects.create(
                user=request.user,
                session_id=str(uuid.uuid4()),
                username=(request.user.get_username() or request.user.email or request.user.username),
                text='Image uploaded',
                type='image',
                date=timezone.now(),
                total_cnt=1,
                user_status='active',
                user_status_date=timezone.now(),
            )

        Images.objects.create(
            session=session,
            user_id=str(request.user.id),
            image_id=image_id,
            storage_path=storage_path,
        )

        session.total_cnt = (session.total_cnt or 0) + 1
        session.save()

        serializer = SessionsSerializer(session, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotificationsViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notifications.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})


class EventsViewSet(viewsets.ModelViewSet):
    serializer_class = EventsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Events.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PatternsViewSet(viewsets.ModelViewSet):
    serializer_class = PatternsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Patterns.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def high_confidence(self, request):
        """Get patterns with high confidence (>0.8)"""
        patterns = self.get_queryset().filter(confidence__gt=0.8)
        serializer = self.get_serializer(patterns, many=True)
        return Response(serializer.data)


class ProcessingJobsViewSet(viewsets.ModelViewSet):
    serializer_class = ProcessingJobsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProcessingJobs.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending jobs"""
        jobs = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a job"""
        job = self.get_object()
        if job.status == 'pending':
            job.status = 'failed'
            job.message = 'Cancelled by user'
            job.save()
            return Response({'status': 'Job cancelled'})
        return Response({'error': 'Cannot cancel running or completed job'}, 
                       status=status.HTTP_400_BAD_REQUEST)


class JobResultsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobResultsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobResults.objects.filter(job__user=self.request.user)


class ViaEventsViewSet(viewsets.ModelViewSet):
    serializer_class = ViaEventsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ViaEvents.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProcessingOutputsViewSet(viewsets.ModelViewSet):
    serializer_class = ProcessingOutputsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProcessingOutputs.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_format(self, request):
        """Get outputs by source format"""
        source_format = request.query_params.get('format')
        if source_format:
            outputs = self.get_queryset().filter(source_format=source_format)
            serializer = self.get_serializer(outputs, many=True)
            return Response(serializer.data)
        return Response({'error': 'Format parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)


class SourceDownloadsViewSet(viewsets.ModelViewSet):
    serializer_class = SourceDownloadsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SourceDownloads.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})

# Initialize colorizer as a singleton
_colorizer = None

def get_colorizer():
    global _colorizer
    if _colorizer is None:
        _colorizer = SARColorizer(checkpoint_path="model/checkpoint_epoch_200.pth")
    return _colorizer

@api_view(['POST'])
@permission_classes([AllowAny])
def predict(request):
    """Endpoint to colorize SAR images"""
    if 'image' not in request.FILES:
        return Response(
            {'error': 'No image provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    image_file = request.FILES['image']
    if not isinstance(image_file, InMemoryUploadedFile):
        return Response(
            {'error': 'Invalid file format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        colorizer = get_colorizer()
        # ✅ Change 'sar_colorizer' to 'colorizer'
        result = colorizer.colorize(image_file)
        
        # ✅ Your colorize method returns a base64 string, not a dict
        # So we need to adjust the response
        return Response({
            'colorized_image': result
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print full traceback for debugging
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )