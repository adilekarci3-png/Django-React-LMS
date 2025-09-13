from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from userauths.models import User
from api import models as api_models

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username

        base_roles, sub_roles = [], []

        try:
            if hasattr(user, "teacher"):
                base_roles.append("Teacher")
                sub_roles += list(user.teacher.roles.values_list("name", flat=True))
                token['teacher_id'] = user.teacher.id
        except Exception:
            token['teacher_id'] = 0

        try:
            if hasattr(user, "koordinator"):
                base_roles.append("Koordinator")
                sub_roles += list(user.koordinator.roles.values_list("name", flat=True))
        except Exception:
            pass

        try:
            if hasattr(user, "ogrenci"):
                base_roles.append("Ogrenci")
                sub_roles += list(user.ogrenci.roles.values_list("name", flat=True))
        except Exception:
            pass

        try:
            if hasattr(user, "stajer"):
                base_roles.append("Stajer")
                sub_roles += list(user.stajer.roles.values_list("name", flat=True))
        except Exception:
            pass

        try:
            hafiz = api_models.Hafiz.objects.filter(email=user.email).first()
            if hafiz:
                base_roles.append("Hafiz")
                sub_roles += list(hafiz.roles.values_list("name", flat=True))
        except Exception:
            pass

        try:
            if hasattr(user, "agent"):
                base_roles.append("Agent")
                sub_roles += list(user.agent.roles.values_list("name", flat=True))
        except Exception:
            pass

        token['base_roles'] = list(set(base_roles))
        token['sub_roles'] = list(set(sub_roles))
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'password2']

    def validate(self, attr):
        if attr['password'] != attr['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attr

    def create(self, validated_data):
        user = User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email']
        )
        email_username, _ = user.email.split("@")
        user.username = email_username
        user.set_password(validated_data['password'])
        user.save()
        return user
