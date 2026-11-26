from django.urls import path

from .views import NotificationViewSet, TaskAssigneeListView, TaskViewSet

urlpatterns = [
    path('assignees/', TaskAssigneeListView.as_view(), name='task-assignee-list'),
    path('', TaskViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-list-create'),
    path('<int:pk>/', TaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='task-detail'),
    path('notifications/', NotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name='notification-list-create'),
    path('notifications/<int:pk>/', NotificationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='notification-detail'),
]
