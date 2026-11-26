from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserCreateSerializer
from .permissions import IsAccLevelAdmin

User = get_user_model()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = (request.data.get('email') or request.data.get('username') or '').strip().lower()
        password = request.data.get('password') or ''

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active or not check_password(password, user.password):
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': getattr(user, 'username', user.email),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': bool(user.is_staff),
                'is_superuser': bool(user.is_superuser),
            },
        }, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    """
    View to get a user's details in the system using their ID.

    * This view is accessible to anyone.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None, format=None):
        """
        Return the details of a user.
        """
        try:
            user = User.objects.get(id=id)
            if not request.user.is_staff and user.pk != request.user.pk:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserCreateSerializer(user)
            user_data = serializer.data
            office_name = getattr(getattr(user, 'office', None), 'name', 'Database User')
            position = getattr(user, 'position', '')
            full_name = f"{user_data.get('first_name', '').capitalize()} {user_data.get('last_name', '').capitalize()}".strip()
            response_data = f"{full_name or user_data.get('username', 'User')} | {position or 'User'} | {office_name}"
            return Response({"detail": response_data})
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class ListUsersView(APIView):
    """
    List/create users (no id in the URL, see accounts/urls.py `all/`) and
    update/delete a specific user (id in the URL, see `update/<id>/`).

    Public read access is allowed so the frontend can load users from the DB.
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get(self, request, format=None):
        """
        Return a list of all users from the live database table used by the
        project.
        """
        users = User.objects.all().order_by('id') if request.user.is_staff else User.objects.filter(pk=request.user.pk)
        return Response([
            {
                'id': user.id,
                'username': getattr(user, 'username', user.email),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': bool(user.is_active),
                'is_staff': bool(user.is_staff),
                'is_superuser': bool(user.is_superuser),
                'acc_lvl': getattr(user, 'acc_lvl', None),
                'position': getattr(user, 'position', ''),
                'office': getattr(getattr(user, 'office', None), 'id', None),
                'office_name': getattr(getattr(user, 'office', None), 'name', ''),
            }
            for user in users
        ])

    def post(self, request, format=None):
        """
        Create a new user. Password strength is validated on the raw
        password by the serializer; djoser's UserCreateSerializer hashes it
        via create_user() when saving.
        """
        user_data = request.data.copy()
        if not request.user.is_authenticated or not request.user.is_staff:
            user_data['is_staff'] = False
        serializer = UserCreateSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id=None, format=None):
        """
        Update a user.
        """
        user = get_object_or_404(User, id=id)
        serializer = UserCreateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            # Validate the raw password above, then hash it before saving —
            # ModelSerializer.update() doesn't call set_password() on its own.
            password = serializer.validated_data.get('password')
            if password:
                serializer.validated_data['password'] = make_password(password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None, format=None):
        """
        Delete a user.
        """
        if request.user.id == id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = get_object_or_404(User, id=id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
