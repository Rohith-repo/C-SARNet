from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class CustomUser(AbstractUser):
    """Extended User model"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class UserCredentials(models.Model):
    """User credentials for different platforms"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='credentials')
    #user_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    salt = models.CharField(max_length=255)
    hash_algorithm = models.CharField(max_length=50, default='pbkdf2_sha256')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'username']

    def __str__(self):
        return f"{self.user.email} - {self.username}"


class UserSettings(models.Model):
    """User settings and preferences"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='settings')
    #user_id = models.CharField(max_length=255)
    meta_analysis_after_days = models.IntegerField(default=7, validators=[MinValueValidator(1)])
    meta_analysis_after_count = models.IntegerField(default=10, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.email}"


class Sessions(models.Model):
    """User sessions"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sessions')
    session_id = models.CharField(max_length=255, unique=True)
    username = models.CharField(max_length=255)
    text = models.TextField()
    type = models.CharField(max_length=50)
    date = models.DateTimeField()
    total_cnt = models.IntegerField(default=0)
    user_status = models.CharField(max_length=50)
    user_status_date = models.DateTimeField(null=True, blank=True)
    post_analysis_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Session {self.session_id} - {self.user.email}"


class Images(models.Model):
    """Images associated with sessions"""
    session = models.ForeignKey(Sessions, on_delete=models.CASCADE, related_name='images')
    user_id = models.CharField(max_length=255)
    image_id = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image {self.image_id} - Session {self.session.session_id}"


class Notifications(models.Model):
    """User notifications"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    #user_id = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=100)
    notification_channel = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class Events(models.Model):
    """System events"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    chat_session = models.ForeignKey(Sessions, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Event {self.event_id} - {self.event_type}"


class Patterns(models.Model):
    """Behavioral patterns detected"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='patterns')
    pattern_id = models.CharField(max_length=255, unique=True)
    pattern_name = models.CharField(max_length=255)
    description = models.TextField()
    confidence = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.pattern_name} - {self.user.email}"


class ProcessingJobs(models.Model):
    """Background processing jobs"""
    JOB_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='processing_jobs')
    job_id = models.CharField(max_length=255, unique=True)
    job_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='pending')
    priority = models.IntegerField(default=0)
    schedule = models.DateTimeField()
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'schedule']

    def __str__(self):
        return f"Job {self.job_id} - {self.job_type} ({self.status})"


class JobResults(models.Model):
    """Results of processing jobs"""
    job = models.OneToOneField(ProcessingJobs, on_delete=models.CASCADE, related_name='result')
    result_id = models.CharField(max_length=255, unique=True)
    result_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Result for Job {self.job.job_id}"


class ViaEvents(models.Model):
    """Via events tracking"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='via_events')
    event_id = models.CharField(max_length=255)
    via_id = models.CharField(max_length=255)
    image = models.CharField(max_length=500)
    stage_status = models.CharField(max_length=50)
    stage_data = models.JSONField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Via Event {self.event_id} - {self.user.email}"


class ProcessingOutputs(models.Model):
    """Processing outputs"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='processing_outputs')
    output_id = models.CharField(max_length=255, unique=True)
    source_format = models.CharField(max_length=100)
    text = models.TextField()
    storage_path = models.CharField(max_length=500)
    meta_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Output {self.output_id} - {self.user.email}"


class SourceDownloads(models.Model):
    """Source downloads tracking"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='source_downloads')
    source_id = models.CharField(max_length=255, unique=True)
    #user_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Download {self.source_id} - {self.user.email}"