from urllib import response
from django.http import JsonResponse
from django.shortcuts import render, redirect,get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.db import models
from django.db.models import Q
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework import serializers
from rest_framework.exceptions import NotFound
from api import serializer as api_serializer
from api import models as api_models
from setuptools.dist import strtobool
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view,action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
import random
from decimal import Decimal
import stripe
import requests
from datetime import datetime, timedelta
# import distutils
# from distutils.util import strtobool

stripe.api_key = settings.STRIPE_SECRET_KEY
PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
PAYPAL_SECRET_ID = settings.PAYPAL_SECRET_ID

class BaseVariantMixin:
    permission_classes = [AllowAny]

    def extract_variants(self, prefix, parent_instance, variant_model, item_model):
        for key in self.request.data:
            if key.startswith('variants') and key.endswith('[title]'):
                index = key.split('[')[1].split(']')[0]
                title = self.request.data[key]
                pdf_key = f'variants[{index}][pdf]'
                pdf_file = self.request.data.get(pdf_key)

                variant_instance = variant_model.objects.create(
                    title=title,
                    **{prefix: parent_instance}
                )

                if pdf_file:
                    item_model.objects.create(
                        variant=variant_instance,
                        title=title,
                        file=pdf_file
                    )

    def get_koordinator_by_user(self, user):
        try:
            stajer = api_models.Stajer.objects.get(user=user)
            return stajer.instructor
        except api_models.Stajer.DoesNotExist:
            try:
                ogrenci = api_models.Ogrenci.objects.get(user=user)
                return ogrenci.instructor
            except api_models.Ogrenci.DoesNotExist:
                return None

class BaseCreateAPIView(BaseVariantMixin, generics.CreateAPIView):
    pass

class BaseUpdateAPIView(BaseVariantMixin, generics.UpdateAPIView):
    pass

class BaseListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]

class BaseDestroyAPIView(generics.DestroyAPIView):
    permission_classes = [AllowAny]

# Role-Based List Views

class EskepOgrenciDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(id=ogrenci_id)
        return api_models.DersSonuRaporu.objects.filter(ogrenci=ogrenci)

class EskepOgrenciKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(id=ogrenci_id)
        return api_models.KitapTahlili.objects.filter(ogrenci=ogrenci)

class EskepOgrenciProjeListAPIView(BaseListAPIView):
    serializer_class = api_serializer.EskepProjeSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(id=ogrenci_id)
        return api_models.EskepProje.objects.filter(ogrenci=ogrenci)
    
class EskepOgrenciOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(id=ogrenci_id)
        return api_models.Odev.objects.filter(ogrenci=ogrenci)
        
class EskepInstructorDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        koordinator = api_models.Koordinator.objects.get(user__id=user_id)
        return api_models.DersSonuRaporu.objects.filter(koordinator=koordinator)

class EskepInstructorKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        koordinator = api_models.Koordinator.objects.get(user__id=user_id)
        return api_models.KitapTahlili.objects.filter(koordinator=koordinator)

class EskepInstructorProjeListAPIView(BaseListAPIView):
    serializer_class = api_serializer.EskepProjeSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        koordinator = api_models.Koordinator.objects.get(user__id=user_id)
        return api_models.EskepProje.objects.filter(koordinator=koordinator)

class EskepInstructorOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        koordinator = api_models.Koordinator.objects.get(user__id=user_id)
        return api_models.Odev.objects.filter(koordinator=koordinator)

class EskepStajerDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']
        hazirlayan = User.objects.get(id=stajer_id)
        return api_models.DersSonuRaporu.objects.filter(hazirlayan=hazirlayan)

class EskepStajerKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']
        hazirlayan = User.objects.get(id=stajer_id)
        return api_models.KitapTahlili.objects.filter(hazirlayan=hazirlayan)

class EskepStajerProjeListAPIView(BaseListAPIView):
    serializer_class = api_serializer.EskepProjeSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']
        hazirlayan = User.objects.get(id=stajer_id)
        return api_models.EskepProje.objects.filter(hazirlayan=hazirlayan)

class EskepStajerOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']
        hazirlayan = User.objects.get(id=stajer_id)
        return api_models.Odev.objects.filter(hazirlayan=hazirlayan)

    
#Eskep Odev Views
class EskepOdevCreateAPIView(BaseCreateAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

    def perform_create(self, serializer):
        hazirlayan_user, koordinator = self._get_users()
        instance = serializer.save(hazirlayan=hazirlayan_user, koordinator=koordinator)
        self.extract_variants('odev', instance, api_models.VariantOdev, api_models.VariantOdevItem)

    def _get_users(self):
        hazirlayan_id = self.request.data.get("hazirlayan")
        hazirlayan_user = None
        koordinator = None
        if hazirlayan_id:
            try:
                hazirlayan_user = User.objects.get(id=hazirlayan_id)
                koordinator = self.get_koordinator_by_user(hazirlayan_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if hazirlayan_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return hazirlayan_user, koordinator

class EskepOdevUpdateAPIView(BaseUpdateAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.extract_variants('odev', instance, api_models.VariantOdev, api_models.VariantOdevItem)

class EskepOdevListAPIView(BaseListAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

class EskepOdevDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer
    
#Eskep DersSonuRaporu Views
class EskepDersSonuRaporuCreateAPIView(BaseCreateAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def perform_create(self, serializer):
        hazirlayan_user, koordinator = self._get_users()
        instance = serializer.save(hazirlayan=hazirlayan_user, koordinator=koordinator)
        self.extract_variants('derssonuraporu', instance, api_models.VariantDersSonuRaporu, api_models.VariantDersSonuRaporuItem)

    def _get_users(self):
        hazirlayan_id = self.request.data.get("hazirlayan")
        hazirlayan_user = None
        koordinator = None
        if hazirlayan_id:
            try:
                hazirlayan_user = User.objects.get(id=hazirlayan_id)
                koordinator = self.get_koordinator_by_user(hazirlayan_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if hazirlayan_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return hazirlayan_user, koordinator

class EskepDersSonuRaporuUpdateAPIView(BaseUpdateAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.extract_variants('derssonuraporu', instance, api_models.VariantDersSonuRaporu, api_models.VariantDersSonuRaporuItem)

class EskepDersSonuRaporuListAPIView(BaseListAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

class EskepDersSonuRaporuDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

# EskepProje Views
class EskepProjeCreateAPIView(BaseCreateAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

    def perform_create(self, serializer):
        hazirlayan_user, koordinator = self._get_users()
        instance = serializer.save(hazirlayan=hazirlayan_user, koordinator=koordinator)
        self.extract_variants('eskepProje', instance, api_models.VariantEskepProje, api_models.VariantEskepProjeItem)

    def _get_users(self):
        hazirlayan_id = self.request.data.get("hazirlayan")
        hazirlayan_user = None
        koordinator = None
        if hazirlayan_id:
            try:
                hazirlayan_user = User.objects.get(id=hazirlayan_id)
                koordinator = self.get_koordinator_by_user(hazirlayan_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if hazirlayan_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return hazirlayan_user, koordinator

class EskepProjeUpdateAPIView(BaseUpdateAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.extract_variants('eskepProje', instance, api_models.VariantEskepProje, api_models.VariantEskepProjeItem)

class EskepProjeListAPIView(BaseListAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

class EskepProjeDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

# Eskep KitapTahlili Views
class EskepKitapTahliliCreateAPIView(BaseCreateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

    def perform_create(self, serializer):
        hazirlayan_user, koordinator = self._get_users()
        instance = serializer.save(hazirlayan=hazirlayan_user, koordinator=koordinator)
        self.extract_variants('kitaptahlili', instance, api_models.VariantKitapTahlili, api_models.VariantKitapTahliliItem)

    def _get_users(self):
        hazirlayan_id = self.request.data.get("hazirlayan")
        hazirlayan_user = None
        koordinator = None
        if hazirlayan_id:
            try:
                hazirlayan_user = User.objects.get(id=hazirlayan_id)
                koordinator = self.get_koordinator_by_user(hazirlayan_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if hazirlayan_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return hazirlayan_user, koordinator

class EskepKitapTahliliUpdateAPIView(BaseUpdateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.extract_variants('kitaptahlili', instance, api_models.VariantKitapTahlili, api_models.VariantKitapTahliliItem)

class EskepKitapTahliliListAPIView(BaseListAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

class EskepKitapTahliliDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

def generate_random_otp(length=7):
    otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
    return otp

class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email'] # api/v1/password-email-verify/adilekarci3@gmail.com/

        user = User.objects.filter(email=email).first()

        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            context = {
                "link": link,
                "username": user.username
            }

            subject = "Password Rest Email"
            text_body = render_to_string("email/password_reset.txt", context)
            html_body = render_to_string("email/password_reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()

            print("link ======", link)
        return user
    
class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp = otp
            user.save()

            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "User Does Not Exists"}, status=status.HTTP_404_NOT_FOUND)

class ChangePasswordAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data['new_password']

        user = get_object_or_404(User, id=user_id)
        if user is not None:
            if check_password(old_password,user.password):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Şifre Başarılı Bir Şekilde Değiştirildi", "icon": "success"})
            else:
                return Response({"message": "Eski Şifre Yanlış", "icon": "warning"})
        else:
            return Response({"message": "Kullanıcı Mevcut Değil", "icon": "error"})

                

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return Profile.objects.get(user=user)

class CategoryListAPIView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)  
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

class CoordinatorListAPIView(generics.ListAPIView):
    queryset = api_models.Koordinator.objects.filter(active=True)  
    serializer_class = api_serializer.CoordinatorSerializer
    permission_classes = [AllowAny]

class UserListAPIView(generics.ListAPIView):
    # queryset = api_models.User.objects.filter(active=True)  
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Koordinatör atanmış kullanıcıların ID'lerini al
        koordinator_ids = api_models.Koordinator.objects.values_list("user__id", flat=True)

        # Eğer Koordinator modeliyle bağlantılı user'lar varsa filtrele
        users = api_models.User.objects.filter(active=True).exclude(id__in=list(koordinator_ids))
        # users = api_models.User.objects.filter(active=True)

        return users
        
class StajerListAPIView(generics.ListAPIView):
    queryset = api_models.Stajer.objects.filter(active=True)  
    serializer_class = api_serializer.StajerSerializer
    permission_classes = [AllowAny]

class EgitmenListAPIView(generics.ListAPIView):
    queryset = api_models.Teacher.objects.filter(active=True)  
    serializer_class = api_serializer.TeacherSerializer
    permission_classes = [AllowAny]

class OgrenciListAPIView(generics.ListAPIView):
    queryset = api_models.Ogrenci.objects.filter(active=True)  
    serializer_class = api_serializer.OgrenciSerializer
    permission_classes = [AllowAny]

class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")

    def get_object(self):
        slug = self.kwargs['slug']
        course = api_models.Course.objects.get(slug=slug, platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")
        return course
    
class CartAPIView(generics.CreateAPIView):
    queryset = api_models.Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']  
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        print("course_id ==========", course_id)

        course = api_models.Course.objects.filter(id=course_id).first()
        
        if user_id != "undefined":
            user = User.objects.filter(id=user_id).first()
        else:
            user = None

        try:
            country_object = api_models.Country.objects.filter(name=country_name).first()
            country = country_object.name
        except:
            country_object = None
            country = "Türkiye"

        if country_object:
            tax_rate = country_object.tax_rate / 100
        else:
            tax_rate = 0

        cart = api_models.Cart.objects.filter(cart_id=cart_id, course=course).first()

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Updated Successfully"}, status=status.HTTP_200_OK)

        else:
            cart = api_models.Cart()

            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Created Successfully"}, status=status.HTTP_201_CREATED)

class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = api_models.Cart.objects.filter(cart_id=cart_id)
        return queryset
    

class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']

        return get_object_or_404(api_models.Cart, cart_id=cart_id, id=item_id)


class CartStatsAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = api_models.Cart.objects.filter(cart_id=cart_id)
        return queryset
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # total_price = 0.00
        # total_tax = 0.00
        # total_total = 0.00

        for cart_item in queryset:
            total_price += float(self.calculate_price(cart_item))
            total_tax += float(self.calculate_tax(cart_item))
            total_total += round(float(self.calculate_total(cart_item)), 2)

        data = {
            "price": total_price,
            "tax": total_tax,
            "total": total_total,
        }

        return Response(data)

    def calculate_price(self, cart_item):
        return cart_item.price
    
    def calculate_tax(self, cart_item):
        return cart_item.tax_fee

    def calculate_total(self, cart_item):
        return cart_item.total   

class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        full_name = request.data['full_name']
        email = request.data['email']
        country = request.data['country']
        cart_id = request.data['cart_id']
        user_id = request.data['user_id']

        if user_id != 0:
            user = get_object_or_404(User, id=user_id)
        else:
            user = None

        cart_items = api_models.Cart.objects.filter(cart_id=cart_id)

        # total_price = Decimal(0.00)
        # total_tax = Decimal(0.00)
        # total_initial_total = Decimal(0.00)
        # total_total = Decimal(0.00)

        order = api_models.CartOrder.objects.create(
            full_name=full_name,
            email=email,
            country=country,
            student=user
        )

        for c in cart_items:
            api_models.CartOrderItem.objects.create(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            )

            total_price += Decimal(c.price)
            total_tax += Decimal(c.tax_fee)
            total_initial_total += Decimal(c.total)
            total_total += Decimal(c.total)

            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({"message": "Order Created Successfully", "order_oid": order.oid}, status=status.HTTP_201_CREATED)



class CheckoutAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = api_models.CartOrder.objects.all()
    lookup_field = 'oid'


class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = request.data.get('order_oid')
        coupon_code = request.data.get('coupon_code')

        # Güvenlik: Parametre kontrolleri
        if not order_oid or not coupon_code:
            return Response({"message": "Missing parameters", "icon": "error"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = api_models.CartOrder.objects.get(oid=order_oid)
        except api_models.CartOrder.DoesNotExist:
            return Response({"message": "Order not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

        try:
            coupon = api_models.Coupon.objects.get(code=coupon_code)
        except api_models.Coupon.DoesNotExist:
            return Response({"message": "Coupon not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

        # Öğretmene özel kupon
        order_items = api_models.CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)

        if not order_items.exists():
            return Response({"message": "No eligible items for this coupon", "icon": "warning"}, status=status.HTTP_200_OK)

        coupon_applied = False

        for item in order_items:
            if coupon not in item.coupons.all():
                discount = item.total * coupon.discount / 100
                item.total -= discount
                item.price -= discount
                item.saved += discount
                item.applied_coupon = True
                item.coupons.add(coupon)
                item.save()

                order.total -= discount
                order.sub_total -= discount
                order.saved += discount
                coupon_applied = True

        if coupon_applied:
            order.coupons.add(coupon)
            order.save()
            coupon.used_by.add(order.student)
            return Response({"message": "Coupon applied successfully", "icon": "success"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Coupon already applied", "icon": "warning"}, status=status.HTTP_200_OK)


class StripeCheckoutAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        
        order_oid = self.kwargs['order_oid']
        order = api_models.CartOrder.objects.get(oid=order_oid)

        if not order:
            return Response({"message": "Order Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email = order.email,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': order.full_name,
                            },
                            'unit_amount': int(order.total * 100)
                        },
                        'quantity': 1
                    }
                ],
                mode='payment',
                success_url=settings.FRONTEND_SITE_URL + '/payment-success/' + order.oid + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url= settings.FRONTEND_SITE_URL + '/payment-failed/'
            )
            print("checkout_session ====", checkout_session)
            order.stripe_session_id = checkout_session.id

            return redirect(checkout_session.url)
        except stripe.error.StripeError as e:
            return Response({"message": f"Something went wrong when trying to make payment. Error: {str(e)}"})


def get_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    auth = (client_id, secret_key)
    response = requests.post(token_url, data=data, auth=auth)

    if response.status_code == 200:
        print("Access TOken ====", response.json()['access_token'])
        return response.json()['access_token']
    else:
        raise Exception(f"Failed to get access token from paypal {response.status_code}")
    

class PaymentSuccessAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    queryset = api_models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        session_id = request.data['session_id']
        paypal_order_id = request.data['paypal_order_id']

        order = api_models.CartOrder.objects.get(oid=order_oid)
        order_items = api_models.CartOrderItem.objects.filter(order=order)


        # Paypal payment success
        if paypal_order_id != "null":
            paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {get_access_token(PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID)}"
            }
            response = requests.get(paypal_api_url, headers=headers)
            if response.status_code == 200:
                paypal_order_data = response.json()
                paypal_payment_status = paypal_order_data['status']
                if paypal_payment_status == "COMPLETED":
                    if order.payment_status == "Processing":
                        order.payment_status = "Paid"
                        order.save()
                        api_models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")

                        for o in order_items:
                            api_models.Notification.objects.create(
                                teacher=o.teacher,
                                order=order,
                                order_item=o,
                                type="New Order",
                            )
                            api_models.EnrolledCourse.objects.create(
                                course=o.course,
                                user=order.student,
                                teacher=o.teacher,
                                order_item=o
                            )

                        return Response({"message": "Payment Successfull"})
                    else:
                        return Response({"message": "Already Paid"})
                else:
                    return Response({"message": "Payment Failed"})
            else:
                return Response({"message": "PayPal Error Occured"})


        # Stripe payment success
        if session_id != 'null':
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid":
                if order.payment_status == "Processing":
                    order.payment_status = "Paid"
                    order.save()

                    api_models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")
                    for o in order_items:
                        api_models.Notification.objects.create(
                            teacher=o.teacher,
                            order=order,
                            order_item=o,
                            type="New Order",
                        )
                        api_models.EnrolledCourse.objects.create(
                            course=o.course,
                            user=order.student,
                            teacher=o.teacher,
                            order_item=o
                        )
                    return Response({"message": "Payment Successfull"})
                else:
                    return Response({"message": "Already Paid"})
            else:
                    return Response({"message": "Payment Failed"})
            
class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        # learn lms
        return api_models.Course.objects.filter(title__icontains=query, platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis") 

class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)

        total_courses = api_models.EnrolledCourse.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedLesson.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)



class InstructorSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPStudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)

        total_odevs = api_models.EnrolledOdev.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedOdev.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_odevs,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class AgentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AgentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs['agent_id']
        agent = api_models.Agent.objects.get(id=agent_id)

        # total_courses = api_models.EnrolledCourse.objects.filter(user=agent).count()
        # completed_lessons = api_models.CompletedLesson.objects.filter(user=agent).count()
        # achieved_certificates = api_models.Certificate.objects.filter(user=agent).count()
        total_hafizs = api_models.Hafizbilgileri.objects.filter(agent=agent).count()

        return [{
            # "total_courses": total_courses,
            # "completed_lessons": completed_lessons,
            # "achieved_certificates": achieved_certificates,
            "total_hafizs": total_hafizs,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user =  User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.filter(user=user)

class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = get_object_or_404(User, id=user_id)
        return api_models.EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)

class EskepInstructorOdevDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.OdevSerializer
    permission_classes = [AllowAny]
    # lookup_field = 'enrollment_id'

    def get_object(self):
        koordinator_id = self.kwargs['koordinator_id']
        odev_id = self.kwargs['odev_id']
        print(koordinator_id)
        print(odev_id)
        # koordinator = get_object_or_404(Koordinator, id=user_id)
        return api_models.Odev.objects.get(id=odev_id,koordinator_id=koordinator_id)

class EskepInstructorKitapTahliliDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        kitaptahlili_id = self.kwargs['kitaptahlili_id']
        user_id = self.kwargs['koordinator_id']
        koordinator = get_object_or_404(api_models.Koordinator, user_id=user_id)
        print(koordinator.id)
        try:
            return api_models.KitapTahlili.objects.get(id=kitaptahlili_id, koordinator_id=koordinator.id)
        except api_models.KitapTahlili.DoesNotExist:
            raise NotFound("Kitap tahlili bulunamadı.")
        
class EskepInstructorDersSonuRaporuDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer
    permission_classes = [AllowAny]
    # lookup_field = 'enrollment_id'

    def get_object(self):
        koordinator_id = self.kwargs['koordinator_id']
        dersSonuRaporu_id = self.kwargs['dersSonuRaporu_id']

        # user = get_object_or_404(User, id=user_id)
        return api_models.DersSonuRaporu.objects.get(id=dersSonuRaporu_id,koordinator_id=koordinator_id)

class EskepInstructorProjeDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.ProjeSerializer
    permission_classes = [AllowAny]
    # lookup_field = 'enrollment_id'

    def get_object(self):
        koordinator_id = self.kwargs['koordinator_id']
        proje_id = self.kwargs['proje_id']

        # user = get_object_or_404(User, id=user_id)
        return api_models.Proje.objects.get(id=proje_id,koordinator_id=koordinator_id)

class StajerOdevDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledOdevSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = get_object_or_404(User, id=user_id)
        return api_models.EnrolledOdev.objects.get(user=user, enrollment_id=enrollment_id)
   
# class InstructorOdevDetailAPIView(generics.RetrieveAPIView):
#     serializer_class = api_serializer.InstructorOdevSerializer
#     permission_classes = [AllowAny]
#     lookup_field = 'teacher_id'

#     def get_object(self):
#         print(self)
#         stajer_id = self.kwargs['user_id']
#         teacher_id = self.kwargs['teacher_id']

#         try:
#             user = User.objects.get(id=stajer_id)
#         except User.DoesNotExist:
#             raise NotFound({"error": "User not found"})

#         try:
#             teacher = api_models.Teacher.objects.get(id=teacher_id)
#         except api_models.Teacher.DoesNotExist:
#             raise NotFound({"error": "Teacher not found"})

#         try:
#             return api_models.EnrolledOdev.objects.get(user=user, teacher=teacher)
#         except api_models.EnrolledOdev.DoesNotExist:
#             raise NotFound({"error": "EnrolledOdev record not found"})
         
        
class StudentCourseCompletedCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        variant_item = api_models.VariantItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = api_models.CompletedLesson.objects.filter(user=user, course=course, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Course marked as not completed"})

        else:
            api_models.CompletedLesson.objects.create(user=user, course=course, variant_item=variant_item)
            return Response({"message": "Course marked as completed"})

class InstructorOdevCompletedCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        odev_id = request.data['odev_id']
        variant_item_id = request.data['variant_item_id']

        user = get_object_or_404(User, id=user_id)
        odev = api_models.Odev.objects.get(id=odev_id)
        variant_item = api_models.VariantOdevItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = api_models.CompletedOdev.objects.filter(user=user, odev=odev, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Ödev Tamamlanmadı olarak işaretlendi"})

        else:
            api_models.CompletedLesson.objects.create(user=user, odev=odev, variant_item=variant_item)
            return Response({"message": "Ödev Tamamlandı olarak işaretlendi"})       

class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = get_object_or_404(User, id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        return api_models.Note.objects.filter(user=user, course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = get_object_or_404(User, id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        api_models.Note.objects.create(user=user, course=enrolled.course, note=note, title=title)

        return Response({"message": "Note created successfullly"}, status=status.HTTP_201_CREATED)
    
class EskepInstructorOdevNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteOdevSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs['koordinator_id']
        odev_id = self.kwargs['odev_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        odev = api_models.Odev.objects.get(id=odev_id)
        
        return api_models.NoteOdev.objects.filter(koordinator=koordinator, odev=odev)

    def create(self, request, *args, **kwargs):
        odev_id = self.kwargs['odev_id']
        koordinator_id = self.kwargs['koordinator_id']
        title = request.data['title']
        note = request.data['note']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        odev = api_models.Odev.objects.get(id=odev_id)
        
        api_models.NoteOdev.objects.create(odev=odev,koordinator=koordinator, note=note, title=title)

        return Response({"message": "Not başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED)
 
class EskepInstructorDerSonuRaporuNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs['koordinator_id']
        derSonuRaporu_id = self.kwargs['derSonuRaporu_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        derssonuraporu = api_models.DersSonuRaporu.objects.get(id=derSonuRaporu_id)
        
        return api_models.NoteDersSonuRaporu.objects.filter(koordinator=koordinator, derssonuraporu=derssonuraporu)

    def create(self, request, *args, **kwargs):
        derSonuRaporu_id = self.kwargs['derSonuRaporu_id']
        koordinator_id = self.kwargs['koordinator_id']
        title = request.data['title']
        note = request.data['note']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        derssonuraporu = api_models.DersSonuRaporu.objects.get(id=derSonuRaporu_id)
        
        api_models.NoteDersSonuRaporu.objects.create(derssonuraporu=derssonuraporu,koordinator=koordinator, note=note, title=title)

        return Response({"message": "Not başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED) 

class EskepInstructorKitapTahliliNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteKitapTahliliSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs["koordinator_id"]
        kitaptahlili_id = self.kwargs["kitaptahlili_id"]

        koordinator = get_object_or_404(api_models.Koordinator, user_id=koordinator_id)
        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)

        return api_models.NoteKitapTahlili.objects.filter(
            koordinator=koordinator, kitaptahlili=kitaptahlili
        )

    def create(self, request, *args, **kwargs):
        kitaptahlili_id = self.kwargs["kitaptahlili_id"]
        koordinator_id = self.kwargs["koordinator_id"]
        title = request.data.get("title")
        note = request.data.get("note")

        koordinator = get_object_or_404(api_models.Koordinator, user_id=koordinator_id)
        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)

        api_models.NoteKitapTahlili.objects.create(
            kitaptahlili=kitaptahlili,
            koordinator=koordinator,
            title=title,
            note=note
        )

        return Response(
            {"message": "Not başarılı bir şekilde oluşturuldu"},
            status=status.HTTP_201_CREATED
        )

class EskepInstructorProjeNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs['koordinator_id']
        proje_id = self.kwargs['proje_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        proje = api_models.Proje.objects.get(id=proje_id)
        
        return api_models.NoteProje.objects.filter(koordinator=koordinator, proje=proje)

    def create(self, request, *args, **kwargs):
        kitaptahlili_id = self.kwargs['kitaptahlili_id']
        koordinator_id = self.kwargs['koordinator_id']
        title = request.data['title']
        note = request.data['note']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        kitaptahlili = api_models.KitapTahlili.objects.get(id=kitaptahlili_id)
        
        api_models.NoteKitapTahlili.objects.create(kitaptahlili=kitaptahlili,koordinator=koordinator, note=note, title=title)

        return Response({"message": "Not başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED) 
   
class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = get_object_or_404(User, id=user_id)
        enrolled = api_models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        note = api_models.Note.objects.get(user=user, course=enrolled.course, id=note_id)
        return note

class EskepInstructorOdevNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteOdevSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        odev_id = self.kwargs['odev_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        odev = api_models.Odev.objects.get(id=odev_id)
        note = api_models.NoteOdev.objects.get(koordinator=koordinator, odev=odev, id=note_id)
        return note

class EskepInstructorDersSonuRaporuNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        dersSonuRaporu_id = self.kwargs['dersSonuRaporu_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        derssonuraporu = api_models.DersSonuRaporu.objects.get(id=dersSonuRaporu_id)
        note = api_models.NoteDersSonuRaporu.objects.get(koordinator=koordinator, derssonuraporu=derssonuraporu, id=note_id)
        return note

class EskepInstructorKitapTahliliNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteKitapTahliliSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        kitaptahlili_id = self.kwargs['kitaptahlili_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        kitaptahlili = api_models.KitapTahlili.objects.get(id=kitaptahlili_id)
        note = api_models.NoteKitapTahlili.objects.get(koordinator=koordinator, kitaptahlili=kitaptahlili, id=note_id)
        return note

class EskepInstructorProjeNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteEskepProjeSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        proje_id = self.kwargs['proje_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        proje = api_models.EskepProje.objects.get(id=proje_id)
        note = api_models.NoteProje.objects.get(koordinator=koordinator, proje=proje, id=note_id)
        return note

class StudentRateCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        api_models.Review.objects.create(
            user=user,
            course=course,
            review=review,
            rating=rating,
            active=True,
        )

        return Response({"message": "Review created successfullly"}, status=status.HTTP_201_CREATED)

class InstructorRateCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewOdevSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        odev_id = request.data['odev_id']
        rating = request.data['rating']
        review = request.data['review']

        user = get_object_or_404(User, id=user_id)
        odev = api_models.Odev.objects.get(id=odev_id)

        api_models.Review.objects.create(
            user=user,
            odev=odev,
            review=review,
            rating=rating,
            active=True,
        )

        return Response({"message": "Yorum başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED)

class StudentRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = get_object_or_404(User, id=user_id)
        return api_models.Review.objects.get(id=review_id, user=user)
    
class InstructorRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewOdevSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = get_object_or_404(User, id=user_id)
        return api_models.ReviewOdev.objects.get(id=review_id, user=user)

class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return api_models.Wishlist.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)

        wishlist = api_models.Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            api_models.Wishlist.objects.create(
                user=user, course=course
            )
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)

class InstructorWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return api_models.WishlistOdev.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        odev_id = request.data['odev_id']

        user = get_object_or_404(User, id=user_id)
        odev = api_models.Odev.objects.get(id=odev_id)

        wishlist = api_models.WishlistOdev.objects.filter(user=user, odev=odev).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "İstekler Silindi"}, status=status.HTTP_200_OK)
        else:
            api_models.WishlistOdev.objects.create(
                user=user, odev=odev
            )
            return Response({"message": "İstekler Oluşturuldu"}, status=status.HTTP_201_CREATED)

class QuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = api_models.Course.objects.get(id=course_id)
        return api_models.Question_Answer.objects.filter(course=course)
    
    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']

        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        
        question = api_models.Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )
        
        return Response({"message": "Group conversation Started"}, status=status.HTTP_201_CREATED)


class QuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        qa_id = request.data['qa_id']
        user_id = request.data['user_id']
        message = request.data['message']

        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        question = api_models.Question_Answer.objects.get(qa_id=qa_id)
        api_models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = api_serializer.Question_AnswerSerializer(question)
        return Response({"messgae": "Message Sent", "question": question_serializer.data})

class OdevQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerOdevSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        odev_id = self.kwargs['odev_id']
        odev = get_object_or_404(api_models.Odev, id=odev_id)
        return api_models.Question_AnswerOdev.objects.filter(odev=odev)
    
    def create(self, request, *args, **kwargs):
        odev_id = request.data.get('odev_id')
        gonderen_id = request.data.get('gonderen_id')
        title = request.data.get('title')
        message = request.data.get('message')

        odev = get_object_or_404(api_models.Odev, id=odev_id)
        mesajGonderen = get_object_or_404(User, id=gonderen_id)
        mesajAlan = odev.hazirlayan

        question = api_models.Question_AnswerOdev.objects.create(
            odev=odev,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            title=title
        )

        api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            message=message,
            question=question
        )

        return Response({"message": "Grup Konuşması Başlatıldı"}, status=status.HTTP_201_CREATED)

class OdevQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageOdevSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        odev_id = request.data.get('odev_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')

        # Ödev nesnesini al
        odev = get_object_or_404(api_models.Odev, id=odev_id)
    
        # Koordinatör nesnesi üzerinden User nesnesine ulaşmak
        mesajGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajGonderen = mesajGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajAlan = odev.hazirlayan

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerOdev.objects.filter(
            odev=odev,
            mesajiGonderen=mesajGonderen,
            mesajiAlan=mesajAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerOdev.objects.create(
                odev=odev,
                mesajiGonderen=mesajGonderen,
                mesajiAlan=mesajAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            mesajiGonderen=mesajGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajAlan,  # burada alan olarak mesajiAlan kullanılmalı
            message=message,
            question=question
        )

        # Soru-Cevap nesnesini serialize et
        question_serializer = api_serializer.Question_AnswerOdevSerializer(question)

        # Başarı mesajı ve veri döndür
        return Response({
            "message": "Mesaj Gönderildi",
            "question": question_serializer.data
        }, status=status.HTTP_201_CREATED)

class KitapTahliliQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerKitapTahliliSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        kitaptahlili_id = self.kwargs['kitaptahlili_id']
        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)
        return api_models.Question_AnswerKitapTahlili.objects.filter(kitaptahlili=kitaptahlili)
    
    def create(self, request, *args, **kwargs):
        kitaptahlili_id = request.data.get('kitaptahlili_id')
        gonderen_id = request.data.get('gonderen_id')
        title = request.data.get('title')
        message = request.data.get('message')

        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)
        mesajGonderen = get_object_or_404(User, id=gonderen_id)
        mesajAlan = kitaptahlili.hazirlayan

        question = api_models.Question_AnswerKitapTahlili.objects.create(
            kitaptahlili=kitaptahlili,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            title=title
        )

        api_models.Question_Answer_MessageKitapTahlili.objects.create(
            kitaptahlili=kitaptahlili,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            message=message,
            question=question
        )

        return Response({"message": "Grup Konuşması Başlatıldı"}, status=status.HTTP_201_CREATED)

class KitapTahliliQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageKitapTahliliSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        kitaptahlili_id = request.data.get('kitaptahlili_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')

        # Ödev nesnesini al
        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)
    
        # Koordinatör nesnesi üzerinden User nesnesine ulaşmak
        mesajGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajGonderen = mesajGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajAlan = kitaptahlili.hazirlayan

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerKitapTahlili.objects.filter(
            kitaptahlili=kitaptahlili,
            mesajiGonderen=mesajGonderen,
            mesajiAlan=mesajAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerKitapTahlili.objects.create(
                kitaptahlili=kitaptahlili,
                mesajiGonderen=mesajGonderen,
                mesajiAlan=mesajAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageKitapTahlili.objects.create(
            kitaptahlili=kitaptahlili,
            mesajiGonderen=mesajGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajAlan,  # burada alan olarak mesajiAlan kullanılmalı
            message=message,
            question=question
        )

        # Soru-Cevap nesnesini serialize et
        question_serializer = api_serializer.Question_AnswerKitapTahliliSerializer(question)

        # Başarı mesajı ve veri döndür
        return Response({
            "message": "Mesaj Gönderildi",
            "question": question_serializer.data
        }, status=status.HTTP_201_CREATED)

class DersSonuRaporuQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        dersSonuRaporu_id = self.kwargs['dersSonuRaporu_id']
        kitaptahlili = get_object_or_404(api_models.DersSonuRaporu, id=dersSonuRaporu_id)
        return api_models.Question_AnswerKitapTahlili.objects.filter(kitaptahlili=kitaptahlili)
    
    def create(self, request, *args, **kwargs):
        dersSonuRaporu_id = request.data.get('dersSonuRaporu_id')
        gonderen_id = request.data.get('gonderen_id')
        title = request.data.get('title')
        message = request.data.get('message')

        derssonuraporu = get_object_or_404(api_models.DersSonuRaporu, id=dersSonuRaporu_id)
        mesajGonderen = get_object_or_404(User, id=gonderen_id)
        mesajAlan = derssonuraporu.hazirlayan

        question = api_models.Question_AnswerDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            title=title
        )

        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            message=message,
            question=question
        )

        return Response({"message": "Grup Konuşması Başlatıldı"}, status=status.HTTP_201_CREATED)

class DersSonuRaporuQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        dersSonuRaporu_id = request.data.get('dersSonuRaporu_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')

        # Ödev nesnesini al
        derssonuraporu = get_object_or_404(api_models.DersSonuRaporu, id=dersSonuRaporu_id)
    
        # Koordinatör nesnesi üzerinden User nesnesine ulaşmak
        mesajGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajGonderen = mesajGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajAlan = derssonuraporu.hazirlayan

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerDersSonuRaporu.objects.filter(
            derssonuraporu=derssonuraporu,
            mesajiGonderen=mesajGonderen,
            mesajiAlan=mesajAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerDersSonuRaporu.objects.create(
                derssonuraporu=derssonuraporu,
                mesajiGonderen=mesajGonderen,
                mesajiAlan=mesajAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajiGonderen=mesajGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajAlan,  # burada alan olarak mesajiAlan kullanılmalı
            message=message,
            question=question
        )

        # Soru-Cevap nesnesini serialize et
        question_serializer = api_serializer.Question_AnswerDersSonuRaporuSerializer(question)

        # Başarı mesajı ve veri döndür
        return Response({
            "message": "Mesaj Gönderildi",
            "question": question_serializer.data
        }, status=status.HTTP_201_CREATED)

class ProjeQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerEskepProjeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        proje_id = self.kwargs['proje_id']
        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
        return api_models.Question_AnswerEskepProje.objects.filter(proje=proje)
    
    def create(self, request, *args, **kwargs):
        proje_id = request.data.get('proje_id')
        gonderen_id = request.data.get('gonderen_id')
        title = request.data.get('title')
        message = request.data.get('message')

        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
        mesajGonderen = get_object_or_404(User, id=gonderen_id)
        mesajAlan = proje.hazirlayan

        question = api_models.Question_AnswerEskepProje.objects.create(
            proje=proje,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            title=title
        )

        api_models.Question_Answer_MessageEskepProje.objects.create(
            proje=proje,
            mesajAlan=mesajAlan,
            mesajGonderen=mesajGonderen,
            message=message,
            question=question
        )

        return Response({"message": "Grup Konuşması Başlatıldı"}, status=status.HTTP_201_CREATED)

class ProjeQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageEskepProjeSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        proje_id = request.data.get('proje_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')

        # Ödev nesnesini al
        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
    
        # Koordinatör nesnesi üzerinden User nesnesine ulaşmak
        mesajGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajGonderen = mesajGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajAlan = proje.hazirlayan

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerEskepProje.objects.filter(
            proje=proje,
            mesajiGonderen=mesajGonderen,
            mesajiAlan=mesajAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerEskepProje.objects.create(
                proje=proje,
                mesajiGonderen=mesajGonderen,
                mesajiAlan=mesajAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageEskepProje.objects.create(
            proje=proje,
            mesajiGonderen=mesajGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajAlan,  # burada alan olarak mesajiAlan kullanılmalı
            message=message,
            question=question
        )

        # Soru-Cevap nesnesini serialize et
        question_serializer = api_serializer.Question_AnswerEskepProjeSerializer(question)

        # Başarı mesajı ve veri döndür
        return Response({
            "message": "Mesaj Gönderildi",
            "question": question_serializer.data
        }, status=status.HTTP_201_CREATED)

class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        teacher = api_models.Teacher.objects.get(id=user_id)

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(teacher=teacher).count()
        # total_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid").aggregate(total_revenue=models.Sum("price"))['total_revenue'] or 0
        total_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher).count() or 0
        # monthly_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago).aggregate(total_revenue=models.Sum("price"))['total_revenue'] or 0
        monthly_revenue = api_models.CartOrderItem.objects.filter(teacher=teacher, date__gte=one_month_ago).count() or 0

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(students),
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.filter(teacher=teacher)  

class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.filter(course__teacher=teacher)
    

class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.get(course__teacher=teacher, id=review_id)
    

class TeacherStudentsListAPIVIew(viewsets.ViewSet):
    
    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)

class EskepInstructorStudentsStajersListAPIView(viewsets.ViewSet):
    def list(self, request, user_id=None):
        if not str(user_id).isdigit():
            return Response({"error": "Geçersiz kullanıcı ID'si."}, status=400)

        try:
            koordinator = api_models.Koordinator.objects.get(user_id=user_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı."}, status=404)

        # Koordinatöre bağlı tüm öğrencileri ve stajerleri al
        ogrenciler = api_models.Ogrenci.objects.filter(instructor=koordinator)
        stajerler = api_models.Stajer.objects.filter(instructor=koordinator)

        unique_user_ids = set()
        response_data = []

        for item in list(ogrenciler) + list(stajerler):
            user = item.user
            if user.id in unique_user_ids:
                continue

            try:
                profile = user.profile  # Eğer özel profile modeli varsa
                profile_date = getattr(profile, "date", None)
            except Exception:
                profile_date = None

            response_data.append({
                "full_name": item.full_name,
                "image": item.image.url if item.image else None,
                "country": str(item.country) if item.country else None,
                "city": str(item.city) if item.city else None,
                "date": profile_date,
            })

            unique_user_ids.add(user.id)

        return Response(response_data)

@api_view(("GET", ))
def TeacherAllMonthEarningAPIView(request, teacher_id):
    teacher = api_models.Teacher.objects.get(id=teacher_id)
    monthly_earning_tracker = (
        api_models.CartOrderItem.objects
        .filter(teacher=teacher, order__payment_status="Paid")
        .annotate(
            month=ExtractMonth("date")
        )
        .values("month")
        .annotate(
            total_earning=models.Sum("price")
        )
        .order_by("month")
    )

    return Response(monthly_earning_tracker)

@api_view(["GET"])
def IsAgent(request, user_id):
    # Sayısal değilse hata döndür
    if not str(user_id).isdigit():
        return Response({"error": "Geçersiz kullanıcı ID'si"}, status=status.HTTP_400_BAD_REQUEST)

    # Agent var mı kontrol et
    agent = api_models.Agent.objects.filter(user_id=user_id).first()

    if agent is None:
        return Response({"is_agent": False})  # veya sadece False
    else:
        return Response({"is_agent": True})
        


class TeacherBestSellingCourseAPIView(viewsets.ViewSet):

    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = api_models.Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum('order_item__price'))['total_price'] or 0
            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_image': course.image.url,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)
    
class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        return api_models.CartOrderItem.objects.filter(teacher=teacher)

class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Question_Answer.objects.filter(course__teacher=teacher)
    
class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.filter(teacher=teacher)
    
class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.get(teacher=teacher, id=coupon_id)
    
class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.filter(teacher=teacher, seen=False)
    
class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.get(teacher=teacher, id=noti_id)
    
class CourseCreateAPIView(generics.CreateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        course_instance = serializer.save()

        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variant') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                variant_dict = {'title': title}
                item_data_list = []
                current_item = {}
                variant_data = []

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_data': variant_dict, 'variant_item_data': item_data_list})

        for data_entry in variant_data:
            variant = api_models.Variant.objects.create(title=data_entry['variant_data']['title'], course=course_instance)

            for item_data in data_entry['variant_item_data']:
                preview_value = item_data.get("preview")
                preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                api_models.VariantItem.objects.create(
                    variant=variant,
                    title=item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 

 
    
class CoordinatorYetkiAtaAPIView(generics.GenericAPIView):
    serializer_class = api_serializer.CoordinatorSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Koordinator.objects.all()

    def put(self, request, *args, **kwargs):
        # request.data içeriğini yazdırarak kontrol ediyoruz
        print(request.data)
        data = request.data
        
        # coordinator_id ile veritabanında güncelleme yapacağımız koordinatörü buluyoruz
        try:
            coordinator = api_models.Koordinator.objects.get(id=data['coordinator_id'])
        except api_models.Koordinator.DoesNotExist:
            return Response({'message': 'Koordinatör bulunamadı'}, status=404)
        
        # Koordinatörün rolünü güncelliyoruz
        coordinator.role = data['role']
        coordinator.save()  # Güncellenen kaydı kaydediyoruz
        
        # Başarıyla güncellendikten sonra Response dönüyoruz
        return Response({
            'message': 'Koordinatör başarıyla güncellendi',
            'id': coordinator.id,
            'role': coordinator.role
        }, status=200)

    # def put(self, request, *args, **kwargs):
    #     # PUT işlemi yapılacak kod burada
    #     data = request.data
        
    #     # Burada koordinatörü güncelleme işlemi yapabiliriz
    #     try:
    #         coordinator = api_models.Koordinator.objects.get(id=kwargs['pk'])
    #         coordinator.full_name = data['full_name']
    #         coordinator.role = data['role']
    #         coordinator.save()
    #         return Response({'message': 'Koordinatör başarıyla güncellendi'}, status=200)
    #     except api_models.Koordinator.DoesNotExist:
    #         return Response({'message': 'Koordinatör bulunamadı'}, status=404)
    
class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(course_id=course_id)

        return course
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None
        
        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
            category = api_models.Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = api_models.VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None
                            
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        
                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )
                        
                        variant_item.save()

                else:
                    new_variant = api_models.Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        api_models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 


class TeacherCourseDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        course_id = self.kwargs['course_id']
        return api_models.Course.objects.get(course_id=course_id)


class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print("variant_id ========", variant_id)

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        return api_models.Variant.objects.get(id=variant_id)
    
class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        variant = api_models.Variant.objects.get(variant_id=variant_id, course=course)
        return api_models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id)


class HafizBilgiCreateAPIView(generics.CreateAPIView):
    querysect = api_models.Hafizbilgileri.objects.all()    
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]


    def create(self, request, *args, **kwargs):
        yasVar=0
        if "yas" in request.POST:
            yas = response.POST["yas"]
            yasVar = yas
            
        city_id = request.data['adresIl']
        kurscity_id = request.data['hafizlikyaptigikursili']
        ilce_id = request.data['adresIlce']
        job_id = request.data["job"]
        full_name=request.data['full_name']        
            
        babaadi=request.data['babaadi']
        tcno=request.data['tcno']
        adres=request.data['adres']       
        hafizlikbitirmeyili=request.data['hafizlikbitirmeyili']
        evtel=request.data['evtel']
        istel=request.data['istel']
        ceptel=request.data['ceptel']
        isMarried=request.data['isMarried']
        email=request.data['email']
        hafizlikyaptigikursadi=request.data['hafizlikyaptigikursadi']        
        gorev=request.data['gorev']
        hafizlikhocaadi=request.data['hafizlikhocaadi']
        hafizlikhocasoyadi=request.data['hafizlikhocasoyadi']
        hafizlikhocaceptel=request.data['hafizlikhocaceptel']
        hafizlikarkadasadi=request.data['hafizlikarkadasadi']
        hafizlikarkadasoyad=request.data['hafizlikarkadasoyad']
        hafizlikarkadasceptel=request.data['hafizlikarkadasceptel']
        referanstcno=request.data['referanstcno']
        onaydurumu='Onaylanmadı'
        description=request.data['description']
        gender=request.data['gender']        

        adresDistrict = api_models.District.objects.get(id=ilce_id)
        adrescity = api_models.City.objects.get(id=city_id)
        kurscity = api_models.City.objects.get(id=kurscity_id)
        job = api_models.Job.objects.get(id=job_id)
        agent = api_models.Agent.objects.get(city=adrescity, gender=gender)
        
        api_models.Hafizbilgileri.objects.create(         
            full_name=full_name,            
            babaadi=babaadi,
            tcno=tcno,
            adres=adres,
            adresIl=adrescity,
            adresIlce=adresDistrict,
            hafizlikbitirmeyili=hafizlikbitirmeyili,
            evtel=evtel,
            istel=istel,
            ceptel=ceptel,
            isMarried=isMarried,
            email=email,
            hafizlikyaptigikursadi=hafizlikyaptigikursadi,
            hafizlikyaptigikursili=kurscity,
            gorev=gorev,
            hafizlikhocaadi=hafizlikhocaadi,
            hafizlikhocasoyadi=hafizlikhocasoyadi,
            hafizlikhocaceptel=hafizlikhocaceptel,
            hafizlikarkadasadi=hafizlikarkadasadi,
            hafizlikarkadasoyad=hafizlikarkadasoyad,
            hafizlikarkadasceptel=hafizlikarkadasceptel,
            referanstcno=referanstcno,
            onaydurumu=onaydurumu,
            description=description,
            gender=gender,
            job=job,
            yas=yasVar,
            agent =agent,
            active=False
        )

        return Response({"message": "Hafız bilgisi başarılı bir şekilde eklendi"}, status=status.HTTP_201_CREATED)

class HafizBilgiUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = api_models.Hafizbilgileri.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        agent_id = self.kwargs['agent_id']
        print(agent_id)
        hafizbilgi_id = self.kwargs['hafizbilgi_id']

        agent = api_models.Agent.objects.get(full_name=str(agent_id))
        print(agent.id)
        print(hafizbilgi_id)
        self.kwargs['agent_id'] = agent.id
        hafizBilgi = api_models.Hafizbilgileri.objects.get(id=hafizbilgi_id)

        return hafizBilgi
    
    def update(self, request, *args, **kwargs):
        il = api_models.City.objects.all()
        ilce = api_models.District.objects.all()
        job = api_models.Job.objects.all()  
                
        if "yas" in request.data:
            request.data['yas'] = int(request.data['yas']) 
            
        if "agent" in request.data:
            agentBilgi = request.data['agent']
            print(agentBilgi)
            agent = api_models.Agent.objects.get(full_name=str(agentBilgi))
            print(agent)
            request.data['agent'] = int(agent.id) 
            
        if "adresIl" in request.data:
            if type(request.data['adresIl']) != int:
                for ilitem in il:
                    if ilitem == request.data['adresIl']:
                        request.data['adresIl']=ilitem.id
                        print(ilitem)  
           
     
                
        hafizBilgi = self.get_object()
        serializer = self.get_serializer(hafizBilgi, data=request.data)         
        print(request.data)
        serializer.is_valid(raise_exception=True)

        # if "gender" in request.data:
        #     if request.data['image']=='Kadın':
        #         hafizBilgi.gender = 'kadin'
        #     elif request.data['image']=='Erkek':
        #         hafizBilgi.gender = 'erkek'
                
        # if "onaydurumu" in request.data:
        #     if request.data['onaydurumu']=='Onaylanmadı':
        #         hafizBilgi.gender = 'onaylanmadi'
        #     elif request.data['onaydurumu']=='Onaylanmdı':
        #         hafizBilgi.gender = 'onaylandi'
       
        self.perform_update(serializer)
        # self.update_variant(hafizBilgi, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)   

# class AgentHafizListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         agent_id = self.kwargs['agent_id']
#         agent =  api_models.Agent.objects.get(id=agent_id)               
#         return api_models.Hafizbilgileri.objects.filter(agent=agent)  
    
class AgentHafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):  
        agent_id = self.kwargs['agent_id']
        agent =  api_models.Agent.objects.get(id=agent_id) 
        queryset = api_models.Hafizbilgileri.objects.filter(agent=agent)        
           
        return queryset        
     
class HafizsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):        
        queryset = api_models.Hafizbilgileri.objects.all()
        print(queryset)      
        return queryset   


class JobListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.JobSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.Job.objects.all()
        print(queryset)      
        return queryset      

class CityListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.CitySerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.City.objects.all()
        print(queryset)      
        return queryset  
     
class CountryListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.CountrySerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.Country.objects.all()
        print(queryset)      
        return queryset   
    
class ProjeListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.ProjeSerializer   
    
    def get_queryset(self):        
        queryset = api_models.Proje.objects.all()
        print(queryset)      
        return queryset 
    
class DistrictListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.DistrictSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.District.objects.all()
        print(queryset)      
        return queryset  
    
class HafizListViewSetAPIVIew(viewsets.ViewSet):
    
    def list(self, request, agent_id=None):
        agent = api_models.Agent.objects.get(id=agent_id)

        HafizBilgis = api_models.Hafizbilgileri.objects.filter(agent=agent)
        unique_agent_ids = set()
        hafizs = []

        for hafizBilgi in HafizBilgis:            
            agent = api_models.Agent.objects.get(id=hafizBilgi.agent_id)
            adresIL = str(hafizBilgi.adresIl)
            hafizlikyaptigikursili = str(hafizBilgi.hafizlikyaptigikursili)
            adresIlce = str(hafizBilgi.adresIlce)
            job = str(hafizBilgi.job)
            hafiz = {
                "id":hafizBilgi.id,
                "full_name": hafizBilgi.full_name,
                "babaadi": hafizBilgi.babaadi,
                "tcno": hafizBilgi.tcno,
                "adres": hafizBilgi.adres,
                "adresIl": adresIL,
                "adresIlce": adresIlce,
                "hafizlikbitirmeyili": hafizBilgi.hafizlikbitirmeyili,
                "evtel": hafizBilgi.evtel,
                "istel": hafizBilgi.istel,
                "ceptel": hafizBilgi.ceptel,
                "isMarried": hafizBilgi.isMarried,
                "email": hafizBilgi.email,
                "hafizlikyaptigikursadi": hafizBilgi.hafizlikyaptigikursadi,
                "hafizlikyaptigikursili": hafizlikyaptigikursili,
                "gorev": hafizBilgi.gorev,
                "hafizlikhocaadi": hafizBilgi.hafizlikhocaadi,
                "hafizlikhocasoyadi": hafizBilgi.hafizlikhocasoyadi,
                "hafizlikhocaceptel": hafizBilgi.hafizlikhocaceptel,
                "hafizlikarkadasadi": hafizBilgi.hafizlikarkadasadi,
                "hafizlikarkadasoyad": hafizBilgi.hafizlikarkadasoyad,
                "hafizlikarkadasceptel": hafizBilgi.hafizlikarkadasceptel,
                "referanstcno": hafizBilgi.referanstcno,
                "onaydurumu": hafizBilgi.onaydurumu,
                "description": hafizBilgi.description,
                "gender": hafizBilgi.gender,
                "job": job,
                "yas": hafizBilgi.yas,
                "active": hafizBilgi.active,
                "agent": str(hafizBilgi.agent),
                "country": str(hafizBilgi.country)                   
            }
            
            hafizs.append(hafiz)
            unique_agent_ids.add(hafizBilgi.agent_id)
            

        return Response(hafizs)


class OrganizationMemberViewSetAPIVIew(generics.ListAPIView):   
    serializer_class = api_serializer.OrganizationMemberSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.OrganizationMember.objects.all()
        print(queryset)        
        return queryset 
    
    def list(self,request):
        members =[]
        try:
            queryset = self.get_queryset()
            serialize_value = api_serializer.OrganizationMemberSerializer(queryset,many=True,context={'request': self.request}).data
            #Here in "serialize_value" you can append your data as much as you wish
            for organizationMember in serialize_value: 
                designation_id = organizationMember['Designation']
                
                designation = api_models.Designation.objects.get(id=designation_id)                  
                member = {
                    'id': organizationMember['id'],
                    'Name':organizationMember['Name'],
                    'Designation':organizationMember['Designation'],
                    'ImageUrl':organizationMember['ImageUrl'],
                    'IsExpand':organizationMember['IsExpand'],
                    'RatingColor':'#68C2DE',
                    'ReportingPerson':designation.ustBirim,
                    'DesignationText':designation.name
                    
                }
                members.append(member)    
            return Response(members, status=status.HTTP_200_OK, content_type='application/json')
        except Exception as E:
            return Response({'error': str(E)}, status=status.HTTP_408_REQUEST_TIMEOUT, content_type='application/json') 

def get_user_role(user_id):
    try:
        if  api_models.Koordinator.objects.filter(user__id=user_id).exists():
            return "Koordinator"
        elif api_models.Stajer.objects.filter(user__id=user_id).exists():
            return "Stajer"
        elif api_models.Ogrenci.objects.filter(user__id=user_id).exists():
            return "Ogrenci"
        else:
            return "Unknown"
    except Exception as e:
        return f"Error: {str(e)}"

# Örnek kullanım view'i
def user_role_view(request):
    print(request)
    user = request.user
    role = get_user_role(user.id)
    print(user)
    return JsonResponse({"user_id": user.id, "role": role})

def user_role_by_id_view(request, user_id):
    role = get_user_role(user_id)
    print(role)
    return JsonResponse({"user_id": user_id, "role": role})

# 🟩 Eğitmen etkinlik oluşturur
class ESKEPEventCreateAPIView(generics.CreateAPIView):
    queryset = api_models.ESKEPEvent.objects.all()
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        return {"request": self.request}
    
    def perform_create(self, serializer):
        print(self.request.user)
        serializer.save(owner=self.request.user)
    
# 🟨 Eğitmen: kendi etkinlikleri
class InstructorEventListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsAuthenticated]  # veya IsAuthenticated

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return api_models.ESKEPEvent.objects.filter(owner_id=user_id).order_by("date")

# 🟦 Öğrenci: sadece kendi eğitmeninin etkinlikleri
class StudentEventListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Burada öğrencinin bağlı olduğu eğitmeni bulup onun etkinliklerini filtrelersin
        user = self.request.user
        instructor = getattr(user, "instructor", None)  # Öğrencinin eğitmeni varsa
        if instructor:
            return api_models.ESKEPEvent.objects.filter(owner=instructor).order_by("date")
        return api_models.ESKEPEvent.objects.none()

# 🟥 Genel görünüm: tüm etkinlikler
class GeneralEventListAPIView(generics.ListAPIView):
    queryset = api_models.ESKEPEvent.objects.all().order_by("date")
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [AllowAny]
    
@api_view(['GET'])
def koordinator_students_stajers(request, koordinator_user_id):
    try:
        koordinator = api_models.Koordinator.objects.get(user_id=koordinator_user_id)
    except api_models.Koordinator.DoesNotExist:
        return Response({"error": "Koordinatör bulunamadı"}, status=404)

    ogrenciler = api_models.Ogrenci.objects.filter(instructor=koordinator)
    stajerler = api_models.Stajer.objects.filter(instructor=koordinator)

    def format_person(person):
        return {
            "full_name": person.full_name,
            "image": person.image.url if person.image else None,
            "email": person.email,
            "gender": person.gender,
            "country": person.country,
            "city": str(person.city) if person.city else None
        }

    return Response({
        "ogrenciler": [format_person(o) for o in ogrenciler],
        "stajerler": [format_person(s) for s in stajerler],
    })
    
@api_view(['GET'])
def dersler_by_date(request, hafiz_id, date):
    dersler = api_models.Ders.objects.filter(hafiz_id=hafiz_id, date=date)
    serializer = api_serializer.DersSerializer(dersler, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def egitmen_detay(request, egitmen_id):
    egitmen = api_models.HDMEgitmen.objects.get(id=egitmen_id)
    hafizlar = api_models.HDMHafiz.objects.filter(egitmen=egitmen)
    dersler = api_models.DersAtamasi.objects.filter(instructor=egitmen).select_related("hafiz")

    hafizlar_data = api_serializer.HDMHafizSerializer(hafizlar, many=True).data

    dersler_data = []
    for ders in dersler:
        ders_json = api_serializer.DersAtamasiSerializer(ders).data
        ders_json["hafiz"] = ders.hafiz.id                   # İD ile eşleştirme için
        ders_json["hafiz_adi"] = ders.hafiz.full_name       # 👈 Hafız adı burada
        dersler_data.append(ders_json)

    data = {
        "id": egitmen.id,
        "full_name": egitmen.full_name,        
        "hafizlar": hafizlar_data,
        "dersler": dersler_data
    }
    return Response(data)

@api_view(['GET'])
def hafiz_detay(request, hafiz_id):
    hafiz = api_models.HDMHafiz.objects.get(id=hafiz_id)
    dersler = api_models.DersAtamasi.objects.filter(hafiz=hafiz)
    egitmen = hafiz.egitmen

    data = {
        "id": hafiz.id,
        "full_name": hafiz.full_name,
        "egitmen": {
            "id": egitmen.id,
            "full_name": egitmen.full_name
        },
        "dersler": api_serializer.DersAtamasiSerializer(dersler, many=True).data
    }
    return Response(data)
class HDMEgitmenViewSet(viewsets.ModelViewSet):
    queryset = api_models.HDMEgitmen.objects.all()
    serializer_class = api_serializer.HDMEgitmenSerializer

class HDMHafizViewSet(viewsets.ModelViewSet):
    queryset = api_models.HDMHafiz.objects.all()
    serializer_class = api_serializer.HDMHafizSerializer

class DersAtamasiViewSet(viewsets.ModelViewSet):
    queryset = api_models.DersAtamasi.objects.all()
    serializer_class = api_serializer.DersAtamasiSerializer

class DersViewSet(viewsets.ModelViewSet):
    queryset = api_models.Ders.objects.all()
    serializer_class = api_serializer.DersSerializer

class HataNotuViewSet(viewsets.ModelViewSet):
    queryset = api_models.HataNotu.objects.all()
    serializer_class = api_serializer.HataNotuSerializer

class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = api_models.Annotation.objects.all()
    serializer_class = api_serializer.AnnotationSerializer
    
class StajerViewSet(viewsets.ModelViewSet):
    queryset = api_models.Stajer.objects.all()
    serializer_class = api_serializer.StajerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # parser_classes = (MultiPartParser, FormParser)

class OgrenciViewSet(viewsets.ModelViewSet):
    queryset = api_models.Ogrenci.objects.all()
    serializer_class = api_serializer.OgrenciSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]   

class UpdateCoordinatorRole(APIView):
    def post(self, request):
        coordinator_id = request.data.get('coordinator_id')
        role = request.data.get('role')

        if not coordinator_id or not role:
            return Response({"error": "Eksik veri"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
            coordinator.role = role
            coordinator.save()
            return Response({"detail": "Rol güncellendi"}, status=status.HTTP_200_OK)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
