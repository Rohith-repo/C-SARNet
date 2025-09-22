# C-SARNet Backend

A Django REST Framework backend for the C-SARNet project with JWT authentication and social login support.

## Features

- **Django 4.2+** with Django REST Framework
- **JWT Authentication** using SimpleJWT
- **Social Authentication** (Google & GitHub OAuth)
- **Custom User Model** with email-based authentication
- **Comprehensive API** for all database entities
- **Admin Interface** with custom configurations
- **CORS Support** for frontend integration
- **PostgreSQL Database** with full configuration support

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. PostgreSQL Setup

Make sure PostgreSQL is installed and running on your system. Create a database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE sarnet_db;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE sarnet_db TO your_db_user;
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database
DB_NAME=sarnet_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# OAuth Credentials
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run the Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token pair
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/token/verify/` - Verify JWT token
- `POST /api/auth/login/` - Login with email/password
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/registration/` - User registration
- `GET/POST /api/auth/social/google/` - Google OAuth
- `GET/POST /api/auth/social/github/` - GitHub OAuth

### Core API Endpoints
- `GET/POST /api/users/` - User management
- `GET /api/users/me/` - Current user profile
- `PUT/PATCH /api/users/update_profile/` - Update profile
- `GET/POST /api/sessions/` - Chat sessions
- `GET/POST /api/notifications/` - User notifications
- `GET /api/notifications/unread/` - Unread notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read
- `GET/POST /api/patterns/` - Behavioral patterns
- `GET/POST /api/processing-jobs/` - Background jobs
- `GET/POST /api/events/` - System events
- `GET/POST /api/images/` - Session images
- `GET/POST /api/processing-outputs/` - Processing results
- `GET/POST /api/user-settings/` - User preferences

## Models Overview

### CustomUser
Extended Django user model with email authentication and verification status.

### Sessions
Chat sessions with metadata, status tracking, and analysis timestamps.

### Notifications
User notification system with read/unread status and multiple channels.

### Patterns
Behavioral pattern detection with confidence scores.

### ProcessingJobs
Background job queue with priority and status tracking.

### Events
System event logging with timestamps and user association.

### Images
Image storage and metadata for sessions.

### UserSettings
User preferences and configuration options.

## Authentication Flow

### JWT Authentication
1. **Login**: `POST /api/token/` with email/password
2. **Use Token**: Include `Authorization: Bearer <access_token>` in headers
3. **Refresh**: `POST /api/token/refresh/` with refresh token

### Social Authentication
1. **Google**: `POST /api/auth/social/google/` with Google OAuth code
2. **GitHub**: `POST /api/auth/social/github/` with GitHub OAuth code

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` with your superuser credentials.

All models are registered with custom admin configurations including:
- List displays with relevant fields
- Search functionality
- Filtering options
- Custom actions (mark as read, cancel jobs, etc.)

## Testing

Run the test suite:

```bash
python manage.py test
```

## Development

### Adding New Models
1. Define model in `core/models.py`
2. Create serializer in `core/serializers.py`
3. Create viewset in `core/views.py`
4. Add URL routing in `core/urls.py`
5. Register in admin in `core/admin.py`
6. Run migrations: `python manage.py makemigrations && python manage.py migrate`

### Custom Permissions
Custom permission classes are available in `core/permissions.py`:
- `IsOwnerOrReadOnly` - Owner can edit, others read-only
- `IsOwner` - Only owner can access
- `IsVerifiedUser` - Only verified users

## Production Deployment

1. Set `DEBUG=False` in environment
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure email backend for notifications
5. Set secure `SECRET_KEY`
6. Configure CORS for your frontend domain

## API Documentation

The API follows REST conventions with standard HTTP methods:
- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT/PATCH` - Update resources
- `DELETE` - Delete resources

All endpoints return JSON responses and support pagination where applicable.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.