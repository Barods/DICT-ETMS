from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class UserApiPermissionTests(TestCase):
	def test_public_signup_cannot_create_staff_user(self):
		response = self.client.post('/api/v1/users/all/', {
			'username': 'public-user',
			'email': 'public-user@example.com',
			'first_name': 'Public',
			'last_name': 'User',
			'password': 'SecureSignup!2026',
			'is_active': True,
			'is_staff': True,
		})

		self.assertEqual(response.status_code, 201)
		user = get_user_model().objects.get(username='public-user')
		self.assertFalse(user.is_staff)
		self.assertFalse(user.is_superuser)

	def test_user_list_requires_authentication_and_is_self_scoped(self):
		User = get_user_model()
		own_user = User.objects.create_user(
			username='api-own-user', email='api-own@example.com', password='SecureOwn!2026'
		)
		User.objects.create_user(
			username='api-other-user', email='api-other@example.com', password='SecureOther!2026'
		)

		self.assertEqual(self.client.get('/api/v1/users/all/').status_code, 401)
		client = APIClient()
		client.force_authenticate(user=own_user)
		response = client.get('/api/v1/users/all/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual([user['id'] for user in response.data], [own_user.pk])
