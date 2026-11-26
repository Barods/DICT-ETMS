from rest_framework import serializers

from .models import Notification, Task, TaskAssignee


class TaskAssigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignee
        fields = ['id', 'name', 'department', 'is_active']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'created_by',
            'priority', 'status', 'start_date', 'due_date', 'category',
            'attachments', 'remarks', 'progress', 'created_at',
            'completed_at', 'subtasks', 'people', 'activity'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('start_date') is not None:
            data['start_date'] = instance.start_date.isoformat()
        if data.get('due_date') is not None:
            data['due_date'] = instance.due_date.isoformat()
        if data.get('created_at') is not None:
            data['created_at'] = instance.created_at.isoformat()
        if data.get('completed_at') is not None:
            data['completed_at'] = instance.completed_at.isoformat()
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'task_id', 'at', 'read']
        read_only_fields = ['id', 'at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('at') is not None:
            data['at'] = instance.at.isoformat()
        return data
