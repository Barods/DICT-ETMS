from django.db import models


class Task(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Overdue", "Overdue"),
        ("Cancelled", "Cancelled"),
    ]
    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Urgent", "Urgent"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=64, blank=True)
    created_by = models.CharField(max_length=64, blank=True)
    priority = models.CharField(max_length=16, choices=PRIORITY_CHOICES, default="Medium")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="Pending")
    start_date = models.DateTimeField()
    due_date = models.DateTimeField()
    category = models.CharField(max_length=64, blank=True)
    remarks = models.TextField(blank=True)
    progress = models.PositiveSmallIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    people = models.JSONField(default=list, blank=True)
    subtasks = models.JSONField(default=list, blank=True)
    activity = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Notification(models.Model):
    TYPE_CHOICES = [
        ("assigned", "Assigned"),
        ("deadline", "Deadline"),
        ("overdue", "Overdue"),
        ("completed", "Completed"),
    ]

    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    at = models.DateTimeField()
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-at"]
