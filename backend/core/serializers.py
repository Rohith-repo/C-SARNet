from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomUser, UserCredentials, UserSettings, Sessions, Images,
    Notifications, Events, Patterns, ProcessingJobs, JobResults,
    ViaEvents, ProcessingOutputs, SourceDownloads
)

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_verified', 'password', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserCredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCredentials
        fields = ['id', 'user', 'user_id', 'username', 'password_hash', 
                 'salt', 'hash_algorithm', 'created_at', 'updated_at']
        extra_kwargs = {
            'password_hash': {'write_only': True},
            'salt': {'write_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['id', 'user', 'user_id', 'meta_analysis_after_days', 
                 'meta_analysis_after_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
        fields = ['id', 'session', 'user_id', 'image_id', 'storage_path', 
                 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class SessionsSerializer(serializers.ModelSerializer):
    images = ImagesSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sessions
        fields = ['id', 'user', 'session_id', 'username', 'text', 'type', 
                 'date', 'total_cnt', 'user_status', 'user_status_date', 
                 'post_analysis_at', 'images', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = ['id', 'user', 'user_id', 'notification_type', 
                 'notification_channel', 'title', 'message', 'is_read', 
                 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class EventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = ['id', 'user', 'chat_session', 'event_id', 'event_type', 
                 'timestamp', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class PatternsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patterns
        fields = ['id', 'user', 'pattern_id', 'pattern_name', 'description', 
                 'confidence', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class JobResultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobResults
        fields = ['id', 'job', 'result_id', 'result_data', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ProcessingJobsSerializer(serializers.ModelSerializer):
    result = JobResultsSerializer(read_only=True)
    
    class Meta:
        model = ProcessingJobs
        fields = ['id', 'user', 'job_id', 'job_type', 'status', 'priority', 
                 'schedule', 'message', 'result', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ViaEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViaEvents
        fields = ['id', 'user', 'event_id', 'via_id', 'image', 'stage_status', 
                 'stage_data', 'message', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class ProcessingOutputsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingOutputs
        fields = ['id', 'user', 'output_id', 'source_format', 'text', 
                 'storage_path', 'meta_data', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }


class SourceDownloadsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceDownloads
        fields = ['id', 'user', 'source_id', 'user_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }