from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, UserCredentials, UserSettings, Sessions, Images,
    Notifications, Events, Patterns, ProcessingJobs, JobResults,
    ViaEvents, ProcessingOutputs, SourceDownloads
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-date_joined']


@admin.register(UserCredentials)
class UserCredentialsAdmin(admin.ModelAdmin):
    list_display = ['user', 'username', 'hash_algorithm', 'created_at']
    list_filter = ['hash_algorithm', 'created_at']
    search_fields = ['user__email', 'username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'meta_analysis_after_days', 'meta_analysis_after_count', 'created_at']
    list_filter = ['meta_analysis_after_days', 'meta_analysis_after_count']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Sessions)
class SessionsAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'type', 'date', 'user_status', 'total_cnt']
    list_filter = ['type', 'user_status', 'date', 'created_at']
    search_fields = ['session_id', 'user__email', 'username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(Images)
class ImagesAdmin(admin.ModelAdmin):
    list_display = ['image_id', 'session', 'user_id', 'storage_path', 'created_at']
    list_filter = ['created_at']
    search_fields = ['image_id', 'session__session_id', 'user_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notifications)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'notification_channel', 'is_read', 'created_at']
    list_filter = ['notification_type', 'notification_channel', 'is_read', 'created_at']
    search_fields = ['title', 'user__email', 'message']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected notifications as read"

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Mark selected notifications as unread"


@admin.register(Events)
class EventsAdmin(admin.ModelAdmin):
    list_display = ['event_id', 'event_type', 'user', 'chat_session', 'timestamp']
    list_filter = ['event_type', 'timestamp', 'created_at']
    search_fields = ['event_id', 'event_type', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'timestamp'


@admin.register(Patterns)
class PatternsAdmin(admin.ModelAdmin):
    list_display = ['pattern_name', 'user', 'confidence', 'created_at']
    list_filter = ['confidence', 'created_at']
    search_fields = ['pattern_name', 'user__email', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProcessingJobs)
class ProcessingJobsAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'job_type', 'user', 'status', 'priority', 'schedule']
    list_filter = ['job_type', 'status', 'priority', 'schedule', 'created_at']
    search_fields = ['job_id', 'job_type', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['mark_as_completed', 'mark_as_failed']

    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected jobs as completed"

    def mark_as_failed(self, request, queryset):
        queryset.update(status='failed')
    mark_as_failed.short_description = "Mark selected jobs as failed"


@admin.register(JobResults)
class JobResultsAdmin(admin.ModelAdmin):
    list_display = ['result_id', 'job', 'created_at']
    list_filter = ['created_at']
    search_fields = ['result_id', 'job__job_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ViaEvents)
class ViaEventsAdmin(admin.ModelAdmin):
    list_display = ['event_id', 'via_id', 'user', 'stage_status', 'created_at']
    list_filter = ['stage_status', 'created_at']
    search_fields = ['event_id', 'via_id', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProcessingOutputs)
class ProcessingOutputsAdmin(admin.ModelAdmin):
    list_display = ['output_id', 'user', 'source_format', 'storage_path', 'created_at']
    list_filter = ['source_format', 'created_at']
    search_fields = ['output_id', 'user__email', 'text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SourceDownloads)
class SourceDownloadsAdmin(admin.ModelAdmin):
    list_display = ['source_id', 'user', 'user_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['source_id', 'user__email', 'user_id']
    readonly_fields = ['created_at', 'updated_at']