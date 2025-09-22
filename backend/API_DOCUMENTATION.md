# C-SARNet API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication

### JWT Token Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Obtain Token
```http
POST /api/token/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Refresh Token
```http
POST /api/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## User Management

### Register User
```http
POST /api/users/
Content-Type: application/json

{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
}
```

### Get Current User Profile
```http
GET /api/users/me/
Authorization: Bearer <token>
```

### Update Profile
```http
PATCH /api/users/update_profile/
Authorization: Bearer <token>
Content-Type: application/json

{
    "first_name": "Updated Name",
    "last_name": "Updated Last"
}
```

## Sessions

### Create Session
```http
POST /api/sessions/
Authorization: Bearer <token>
Content-Type: application/json

{
    "session_id": "unique-session-123",
    "username": "user123",
    "text": "Session content text",
    "type": "chat",
    "date": "2023-12-01T10:00:00Z",
    "user_status": "active"
}
```

### List User Sessions
```http
GET /api/sessions/
Authorization: Bearer <token>
```

### Mark Session as Analyzed
```http
POST /api/sessions/{id}/mark_analyzed/
Authorization: Bearer <token>
```

## Notifications

### Create Notification
```http
POST /api/notifications/
Authorization: Bearer <token>
Content-Type: application/json

{
    "user_id": "123",
    "notification_type": "info",
    "notification_channel": "email",
    "title": "New Notification",
    "message": "This is a notification message"
}
```

### Get Unread Notifications
```http
GET /api/notifications/unread/
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
POST /api/notifications/{id}/mark_read/
Authorization: Bearer <token>
```

### Mark All Notifications as Read
```http
POST /api/notifications/mark_all_read/
Authorization: Bearer <token>
```

## Patterns

### Create Pattern
```http
POST /api/patterns/
Authorization: Bearer <token>
Content-Type: application/json

{
    "pattern_id": "pattern-123",
    "pattern_name": "Behavioral Pattern",
    "description": "Description of the pattern",
    "confidence": 0.85
}
```

### Get High Confidence Patterns
```http
GET /api/patterns/high_confidence/
Authorization: Bearer <token>
```

## Processing Jobs

### Create Processing Job
```http
POST /api/processing-jobs/
Authorization: Bearer <token>
Content-Type: application/json

{
    "job_id": "job-123",
    "job_type": "analysis",
    "priority": 1,
    "schedule": "2023-12-01T15:00:00Z",
    "message": "Job description"
}
```

### Get Pending Jobs
```http
GET /api/processing-jobs/pending/
Authorization: Bearer <token>
```

### Cancel Job
```http
POST /api/processing-jobs/{id}/cancel/
Authorization: Bearer <token>
```

## Events

### Create Event
```http
POST /api/events/
Authorization: Bearer <token>
Content-Type: application/json

{
    "event_id": "event-123",
    "event_type": "user_action",
    "timestamp": "2023-12-01T12:00:00Z"
}
```

## User Settings

### Get User Settings
```http
GET /api/user-settings/my_settings/
Authorization: Bearer <token>
```

### Update User Settings
```http
PATCH /api/user-settings/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
    "meta_analysis_after_days": 14,
    "meta_analysis_after_count": 20
}
```

## Processing Outputs

### Create Processing Output
```http
POST /api/processing-outputs/
Authorization: Bearer <token>
Content-Type: application/json

{
    "output_id": "output-123",
    "source_format": "json",
    "text": "Processed text content",
    "storage_path": "/path/to/output",
    "meta_data": {"key": "value"}
}
```

### Get Outputs by Format
```http
GET /api/processing-outputs/by_format/?format=json
Authorization: Bearer <token>
```

## Social Authentication

### Google OAuth
```http
POST /api/auth/social/google/
Content-Type: application/json

{
    "access_token": "google_access_token_here"
}
```

### GitHub OAuth
```http
POST /api/auth/social/github/
Content-Type: application/json

{
    "access_token": "github_access_token_here"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "field_name": ["Error message for this field"],
    "non_field_errors": ["General error message"]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

## Pagination

List endpoints support pagination:

```json
{
    "count": 100,
    "next": "http://localhost:8000/api/sessions/?page=2",
    "previous": null,
    "results": [...]
}
```

Query parameters:
- `page`: Page number
- `page_size`: Items per page (max 100)

## Filtering and Search

Many endpoints support filtering:
- `?search=query` - Search across relevant fields
- `?ordering=field_name` - Order by field (prefix with `-` for descending)
- `?field_name=value` - Filter by field value

Example:
```http
GET /api/sessions/?search=chat&ordering=-created_at&type=analysis
```