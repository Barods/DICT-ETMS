from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Notification, Task
from .serializers import NotificationSerializer, TaskSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "etms-backend"})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related("task").all()
    serializer_class = NotificationSerializer
