from rest_framework import serializers
from .models import Notification, Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "message", "task_id", "at", "read"]
