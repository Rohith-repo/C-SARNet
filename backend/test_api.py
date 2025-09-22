#!/usr/bin/env python
"""
Simple API test script for C-SARNet Backend
Run this after setting up the backend to verify everything works.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_api_endpoints():
    """Test basic API endpoints"""
    print("🧪 Testing C-SARNet API Endpoints")
    print("=" * 50)
    
    # Test 1: Check if server is running
    print("\n1. Testing server connectivity...")
    try:
        response = requests.get(f"{BASE_URL}/users/", timeout=5)
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("✅ Server is running")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not accessible: {e}")
        print("Make sure to run: python manage.py runserver")
        return False
    
    # Test 2: User registration
    print("\n2. Testing user registration...")
    user_data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        if response.status_code == 201:
            print("✅ User registration successful")
            user_id = response.json().get('id')
        elif response.status_code == 400:
            error_data = response.json()
            if 'email' in error_data and 'already exists' in str(error_data['email']):
                print("ℹ️  User already exists (this is fine for testing)")
                user_id = None
            else:
                print(f"❌ Registration failed: {error_data}")
                return False
        else:
            print(f"❌ Registration failed with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Registration request failed: {e}")
        return False
    
    # Test 3: JWT Token authentication
    print("\n3. Testing JWT authentication...")
    auth_data = {
        "email": "testuser123@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token/", json=auth_data)
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('access')
            print("✅ JWT authentication successful")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(response.text)
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication request failed: {e}")
        return False
    
    # Test 4: Authenticated request
    print("\n4. Testing authenticated request...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Authenticated request successful")
            print(f"   User: {user_data.get('first_name')} {user_data.get('last_name')}")
        else:
            print(f"❌ Authenticated request failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Authenticated request failed: {e}")
        return False
    
    # Test 5: Create a session
    print("\n5. Testing session creation...")
    session_data = {
        "session_id": "test-session-123",
        "username": "testuser123",
        "text": "This is a test session",
        "type": "chat",
        "date": "2023-12-01T12:00:00Z",
        "user_status": "active"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sessions/", json=session_data, headers=headers)
        if response.status_code == 201:
            print("✅ Session creation successful")
        else:
            print(f"❌ Session creation failed: {response.status_code}")
            print(response.text)
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Session creation request failed: {e}")
        return False
    
    # Test 6: List sessions
    print("\n6. Testing session listing...")
    try:
        response = requests.get(f"{BASE_URL}/sessions/", headers=headers)
        if response.status_code == 200:
            sessions = response.json()
            session_count = sessions.get('count', len(sessions.get('results', [])))
            print(f"✅ Session listing successful ({session_count} sessions)")
        else:
            print(f"❌ Session listing failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Session listing request failed: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    success = test_api_endpoints()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All API tests passed!")
        print("\nYour C-SARNet backend is ready to use!")
        print(f"API Base URL: {BASE_URL}")
        print("Admin Interface: http://localhost:8000/admin/")
    else:
        print("❌ Some tests failed. Please check the setup.")
        sys.exit(1)

if __name__ == '__main__':
    main()