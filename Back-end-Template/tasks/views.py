from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Notification, Task, TaskAssignee
from .serializers import NotificationSerializer, TaskAssigneeSerializer, TaskSerializer


class TaskAssigneeListView(ListAPIView):
    queryset = TaskAssignee.objects.filter(is_active=True)
    serializer_class = TaskAssigneeSerializer
    permission_classes = [IsAuthenticated]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Task.objects.all()

        user_id = str(user.pk)
        return Task.objects.filter(
            Q(created_by=user_id)
            | Q(assigned_to=user_id)
            | Q(people__contains=[user_id])
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=str(self.request.user.pk))


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Notification.objects.all()

        user_id = str(user.pk)
        visible_task_ids = Task.objects.filter(
            Q(created_by=user_id)
            | Q(assigned_to=user_id)
            | Q(people__contains=[user_id])
        ).values_list("pk", flat=True)
        return Notification.objects.filter(task_id__in=visible_task_ids)

    def perform_create(self, serializer):
        user = self.request.user
        task_id = serializer.validated_data.get("task_id")
        if not user.is_staff:
            try:
                task_pk = int(task_id)
            except (TypeError, ValueError):
                raise PermissionDenied("A notification must belong to one of your tasks.")

            user_id = str(user.pk)
            task_is_visible = Task.objects.filter(pk=task_pk).filter(
                Q(created_by=user_id)
                | Q(assigned_to=user_id)
                | Q(people__contains=[user_id])
            ).exists()
            if not task_is_visible:
                raise PermissionDenied("You cannot create a notification for another user's task.")

        serializer.save()
