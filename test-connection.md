# Frontend-Backend Connection Test

## Setup Instructions

### 1. Start the Django Backend
```bash
cd backend
python manage.py runserver 8000
```

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```

### 3. Test the Connection

1. Open your browser to `http://localhost:3000`
2. Click the "Test API" button in the bottom left corner
3. If successful, you should see "API: OK (ok)" 
4. If failed, you'll see an error message

## API Endpoints Available

- **Health Check**: `GET /api/health/` (public, no auth required)
- **User Registration**: `POST /api/auth/registration/`
- **User Login**: `POST /api/auth/login/`
- **JWT Token**: `POST /api/token/`
- **All other endpoints**: Require authentication

## Current Status

✅ Backend health check endpoint created  
✅ Frontend API client created  
✅ CORS configured for localhost:3000  
✅ Test API button added to frontend (bottom left corner)  
✅ **Authentication integration completed**  
✅ **User registration and login working**  
✅ **Session persistence implemented**  
✅ **JWT token management**  
✅ **File upload integration**  
✅ **Image processing workflow**  
✅ **Real-time job status polling**  
✅ **Proper error handling and loading states**  

## Features Implemented

### Authentication System
- ✅ User registration with email validation
- ✅ User login with email/password
- ✅ JWT token storage and refresh
- ✅ Session persistence across browser refreshes
- ✅ Secure logout with token cleanup

### Image Processing Pipeline
- ✅ File upload with drag & drop support
- ✅ File type validation (PNG, JPEG, TIFF)
- ✅ Real-time upload progress
- ✅ Processing job creation
- ✅ Job status polling with progress updates
- ✅ Result image display

### User Experience
- ✅ Loading states and progress indicators
- ✅ Toast notifications for feedback
- ✅ Error handling with user-friendly messages
- ✅ Responsive design
- ✅ Dark mode support

## Testing the Complete Integration

1. **Start Backend**: `cd backend && python manage.py runserver 8000`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Test Registration**: Create a new account
4. **Test Login**: Login with your credentials
5. **Test Image Upload**: Upload a SAR image
6. **Test Processing**: Click "Colorize Image" and watch real-time progress
7. **Test Session**: Refresh browser - should stay logged in

## API Endpoints Used

- `POST /api/auth/registration/` - User registration
- `POST /api/auth/login/` - User login  
- `POST /api/auth/logout/` - User logout
- `GET /api/users/me/` - Get current user info
- `POST /api/images/` - Upload image
- `POST /api/processing-jobs/` - Create processing job
- `GET /api/processing-jobs/{id}/` - Get job status
- `GET /api/health/` - Health check

The frontend and backend are now **fully integrated** with working authentication and image processing functionality!