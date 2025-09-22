from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re


def validate_username(value):
    """Validate username format"""
    if not re.match(r'^[a-zA-Z0-9_]+$', value):
        raise ValidationError(
            _('Username can only contain letters, numbers, and underscores.'),
            code='invalid_username'
        )


def validate_session_id(value):
    """Validate session ID format"""
    if not re.match(r'^[a-zA-Z0-9-_]+$', value):
        raise ValidationError(
            _('Session ID can only contain letters, numbers, hyphens, and underscores.'),
            code='invalid_session_id'
        )


def validate_confidence_score(value):
    """Validate confidence score is between 0 and 1"""
    if not (0.0 <= value <= 1.0):
        raise ValidationError(
            _('Confidence score must be between 0.0 and 1.0.'),
            code='invalid_confidence'
        )


def validate_priority(value):
    """Validate priority is non-negative"""
    if value < 0:
        raise ValidationError(
            _('Priority must be a non-negative integer.'),
            code='invalid_priority'
        )


def validate_json_data(value):
    """Validate that the value is valid JSON"""
    import json
    try:
        json.loads(value) if isinstance(value, str) else value
    except (ValueError, TypeError):
        raise ValidationError(
            _('Invalid JSON data.'),
            code='invalid_json'
        )