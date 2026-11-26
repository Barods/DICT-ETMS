from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Notification, Task


class TaskApiPermissionTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='task-owner', email='task-owner@example.com', password='SecureOwner!2026'
        )
        self.other_user = User.objects.create_user(
            username='task-other', email='task-other@example.com', password='SecureOther!2026'
        )
        self.created_task = Task.objects.create(title='Created by user', created_by=str(self.user.pk))
        self.assigned_task = Task.objects.create(title='Assigned to user', created_by=str(self.other_user.pk), assigned_to=str(self.user.pk))
        self.shared_task = Task.objects.create(title='Shared with user', created_by=str(self.other_user.pk), people=[str(self.user.pk)])
        self.other_task = Task.objects.create(title='Private task', created_by=str(self.other_user.pk))

    def test_private_data_endpoints_require_authentication(self):
        for url in (
            '/api/v1/tasks/',
            '/api/v1/tasks/assignees/',
            '/api/v1/notifications/',
            '/api/v1/users/all/',
        ):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 401)

    def test_regular_user_only_sees_created_assigned_or_shared_tasks(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/api/v1/tasks/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {task['id'] for task in response.data},
            {self.created_task.pk, self.assigned_task.pk, self.shared_task.pk},
        )

    def test_regular_user_only_sees_notifications_for_visible_tasks(self):
        own_notification = Notification.objects.create(title='Own task', task_id=str(self.created_task.pk))
        Notification.objects.create(title='Other task', task_id=str(self.other_task.pk))
        client = APIClient()
        client.force_authenticate(user=self.user)

        response = client.get('/api/v1/notifications/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [own_notification.pk])

    def test_task_creation_uses_authenticated_user_as_creator(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post('/api/v1/tasks/', {
            'title': 'New task',
            'created_by': str(self.other_user.pk),
            'assigned_to': str(self.user.pk),
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['created_by'], str(self.user.pk))