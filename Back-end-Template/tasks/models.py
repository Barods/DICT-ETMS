from django.db import models


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    assigned_to = models.CharField(max_length=255, blank=True, default='')
    created_by = models.CharField(max_length=255, blank=True, default='')
    priority = models.CharField(max_length=20, default='Medium')
    status = models.CharField(max_length=20, default='Pending')
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=100, default='Project')
    attachments = models.JSONField(default=list, blank=True)
    remarks = models.TextField(blank=True, default='')
    progress = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    subtasks = models.JSONField(default=list, blank=True)
    people = models.JSONField(default=list, blank=True)
    activity = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Notification(models.Model):
    type = models.CharField(max_length=30, default='assigned')
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True, default='')
    task_id = models.CharField(max_length=255, blank=True, default='')
    at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-at']

    def __str__(self):
        return self.title


class TaskAssignee(models.Model):
    name = models.CharField(max_length=255, unique=True)
    department = models.CharField(max_length=100, default='Operations')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
