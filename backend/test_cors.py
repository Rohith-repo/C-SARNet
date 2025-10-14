# backend/test_cors.py
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sarnet.settings')
django.setup()

from django.conf import settings

print("INSTALLED_APPS:", settings.INSTALLED_APPS)
print("\nMIDDLEWARE:", settings.MIDDLEWARE)
print("\nCORS_ALLOW_ALL_ORIGINS:", getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'Not set'))
print("CORS_ALLOW_CREDENTIALS:", getattr(settings, 'CORS_ALLOW_CREDENTIALS', 'Not set'))