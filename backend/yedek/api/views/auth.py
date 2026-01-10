# auth.py (YENİ)

import random
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from rest_framework import generics, status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from userauths.models import Profile
from .. import models as api_models, serializers as api_serializer
# from userauths.models import Profile
User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

def generate_random_otp(length=7):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.filter(email=email).first()
        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            # Kullanıcında bu alanlar tanımlı olmalı: refresh_token, otp
            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = f"{settings.FRONTEND_SITE_URL}/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            ctx = {"link": link, "username": user.username}
            subject = "Password Reset Email"
            text_body = render_to_string("email/password_reset.txt", ctx)
            html_body = render_to_string("email/password_reset.html", ctx)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send()
        return user

class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.filter(id=uuidb64, otp=otp).first()
        if user:
            user.set_password(password)
            # OTP'yi sıfırlamak güvenli olacaktır:
            user.otp = ""
            user.save()
            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message": "User Does Not Exist"}, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data['new_password']

        user = get_object_or_404(User, id=user_id)
        if check_password(old_password, user.password):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Şifre Başarılı Bir Şekilde Değiştirildi", "icon": "success"})
        return Response({"message": "Eski Şifre Yanlış", "icon": "warning"})

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return Profile.objects.get(user=user)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer


def generate_random_otp(length=7):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.filter(email=email).first()
        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = (
                f"http://localhost:5173/create-new-password/"
                f"?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"
            )

            context = {"link": link, "username": user.username}
            subject = "Password Reset Email"
            text_body = render_to_string("email/password_reset.txt", context)
            html_body = render_to_string("email/password_reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body,
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send()

        return user


class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.filter(id=uuidb64, otp=otp).first()
        if user:
            user.set_password(password)
            user.otp = otp
            user.save()
            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        return Response({"message": "User Does Not Exists"}, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data['new_password']

        user = get_object_or_404(User, id=user_id)
        if check_password(old_password, user.password):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Şifre Başarılı Bir Şekilde Değiştirildi", "icon": "success"})
        return Response({"message": "Eski Şifre Yanlış", "icon": "warning"})


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return Profile.objects.get(user=user)