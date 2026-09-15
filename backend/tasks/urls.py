from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, TaskViewSet, health

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("health/", health, name="health"),
    path("", include(router.urls)),
]
