from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
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

User = get_user_model()


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            user=request.user,
            defaults={'user_id': str(request.user.id)}
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


class ImagesViewSet(viewsets.ModelViewSet):
    serializer_class = ImagesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Images.objects.filter(session__user=self.request.user)


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