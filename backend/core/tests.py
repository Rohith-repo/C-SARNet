from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Sessions, Notifications, Patterns

User = get_user_model()


class CustomUserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.first_name, 'Test')
        self.assertEqual(self.user.last_name, 'User')
        self.assertFalse(self.user.is_verified)

    def test_user_str_method(self):
        expected = "Test User (test@example.com)"
        self.assertEqual(str(self.user), expected)


class AuthenticationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_user_registration(self):
        url = reverse('customuser-list')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_jwt_token_obtain(self):
        url = reverse('token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class SessionsAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_session(self):
        url = reverse('sessions-list')
        data = {
            'session_id': 'test-session-123',
            'username': 'testuser',
            'text': 'Test session text',
            'type': 'chat',
            'date': '2023-01-01T12:00:00Z',
            'user_status': 'active'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Sessions.objects.count(), 1)

    def test_list_user_sessions(self):
        Sessions.objects.create(
            user=self.user,
            session_id='test-session-123',
            username='testuser',
            text='Test session text',
            type='chat',
            date='2023-01-01T12:00:00Z',
            user_status='active'
        )
        url = reverse('sessions-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class NotificationsAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_notification(self):
        url = reverse('notifications-list')
        data = {
            'user_id': str(self.user.id),
            'notification_type': 'info',
            'notification_channel': 'email',
            'title': 'Test Notification',
            'message': 'This is a test notification'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notifications.objects.count(), 1)

    def test_mark_notification_read(self):
        notification = Notifications.objects.create(
            user=self.user,
            user_id=str(self.user.id),
            notification_type='info',
            notification_channel='email',
            title='Test Notification',
            message='This is a test notification'
        )
        url = reverse('notifications-mark-read', kwargs={'pk': notification.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)