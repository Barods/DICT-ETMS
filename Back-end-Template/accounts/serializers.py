from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from offices.models import Office

User = get_user_model()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    office = serializers.PrimaryKeyRelatedField(queryset=Office.objects.all(), required=False, allow_null=True)
    username = serializers.CharField(required=False, allow_blank=False)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'office',
            'position',
            'acc_lvl',
            'is_active',
            'is_staff',
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        password = attrs.get('password')
        if password:
            username_value = attrs.get('username') or attrs.get('email', '').split('@', 1)[0]
            user_data = {field: value for field, value in attrs.items() if field != 'password'}
            user_data.setdefault('username', username_value)
            temp_user = User(**user_data)
            try:
                validate_password(password, temp_user)
            except ValidationError as exc:
                raise serializers.ValidationError({'password': list(exc.messages)}) from exc
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        username = validated_data.get('username') or validated_data.get('email', '').split('@', 1)[0]
        validated_data['username'] = username
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance
