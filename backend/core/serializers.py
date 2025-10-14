from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomUser, UserCredentials, UserSettings, Sessions, Images,
    Notifications, Events, Patterns, ProcessingJobs, JobResults,
    ViaEvents, ProcessingOutputs, SourceDownloads
)

User = get_user_model()



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

from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers

class CustomLoginSerializer(LoginSerializer):
    username = None  # disable default username handling
    email = serializers.CharField(required=True)

    def validate(self, attrs):
        identifier = attrs.get("email")  # may be email or username from frontend "User ID" field
        password = attrs.get("password")

        if identifier and password:
            ident_for_auth = identifier
            # If identifier looks like a username (no @), resolve to email since USERNAME_FIELD = 'email'
            if '@' not in identifier:
                UserModel = get_user_model()
                try:
                    ident_for_auth = UserModel.objects.get(username=identifier).email
                except UserModel.DoesNotExist:
                    ident_for_auth = identifier  # try as-is
            user = authenticate(self.context.get('request'), username=ident_for_auth, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Email/username and password are required")
        
        attrs['user'] = user
        return attrs


class CustomRegisterSerializer(RegisterSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    def _ensure_username(self, base: str) -> str:
        base = base or 'user'
        unique = base
        UserModel = get_user_model()
        i = 1
        while UserModel.objects.filter(username=unique).exists():
            unique = f"{base}{i}"
            i += 1
        return unique

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        email = self.validated_data.get('email', '')
        provided_username = self.validated_data.get('username', '')
        base = provided_username or (email.split('@')[0] if email else '')
        data['username'] = self._ensure_username(base)
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['date_of_birth'] = self.validated_data.get('date_of_birth', None)
        return data

    def save(self, request):
        user = super().save(request)
        user.username = self.cleaned_data.get('username') or user.username
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        dob = self.cleaned_data.get('date_of_birth', None)
        if dob:
            user.date_of_birth = dob
        user.save()
        return user

class CustomUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    processing_jobs = ProcessingJobsSerializer(many=True, read_only=True)
    images = ImagesSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'date_of_birth',
            'avatar', 'date_joined', 'is_active', 'password',
            'processing_jobs', 'images'
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {'password': {'write_only': True}}


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

