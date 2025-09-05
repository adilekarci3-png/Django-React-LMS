from django.db.models import Sum
from django.utils.timezone import localdate
from django.forms import ValidationError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.db import models
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework import serializers, generics, filters
from rest_framework.exceptions import NotFound
from api import serializer as api_serializer
from api import models as api_models
from setuptools.dist import strtobool
from api.permissions import IsGeneralKoordinator, IsGeneralTeacher

from utils.hbs_user import _get_user_agent_city, _is_hbs_koordinator
from utils.instructor_videos import _get_video_object

from utils.permissions import CanModifyVideoLink, IsEskepKoordinatorOrTeacher, get_educator_for_user, get_teacher_for_user, is_eskep_koordinator
from userauths.models import User, Profile
from django.db.models import Count
from django.db.models import Q
from rest_framework.viewsets import ViewSet
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
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
from django.db import transaction
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.contenttypes.models import ContentType
from api import models as M
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

class EskepOgrenciOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(id=ogrenci_id)
        return api_models.Odev.objects.filter(ogrenci=ogrenci)
        
class EskepInstructorDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        # Giriş yapan kullanıcıya ait Koordinator kaydı
        try:
            koordinator = api_models.Koordinator.objects.select_related("user").get(user__id=user_id)
        except api_models.Koordinator.DoesNotExist:
            return api_models.DersSonuRaporu.objects.none()

        # inserteduser -> (stajer|ogrenci).instructor == koordinator olan raporları getir
        # Not: 'stajer' ve 'ogrenci' reverse isimlerini kendi modellerindeki related_name'e göre uyarlayın.
        qs = (
            api_models.DersSonuRaporu.objects
            .select_related("inserteduser")
            .filter(
                Q(inserteduser__stajer__instructor=koordinator) |
                Q(inserteduser__ogrenci__instructor=koordinator)
            )
            .order_by("-id")
        )
        return qs

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
     serializer_class = api_serializer.OdevListSerializer
     permission_classes = [IsAuthenticated]

     def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return (
            api_models.Odev.objects
            .filter(koordinator__user_id=user_id)  # kendi filtremi örnek verdim
            .select_related("inserteduser", "koordinator", "category")
            .order_by("-date")
        )

class EskepStajerDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']

        # Önce Stajer tablosundan kaydı al
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser_user = User.objects.get(id=stajer.user_id)
        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = inserteduser_user  
        print(inserteduser)
        return api_models.DersSonuRaporu.objects.filter(inserteduser=inserteduser)

class EskepStajerKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']

        # Önce Stajer tablosundan kaydı al
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser_user = User.objects.get(id=stajer.user_id)
        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = inserteduser_user  
        print(inserteduser)
        return api_models.KitapTahlili.objects.filter(inserteduser=inserteduser)

class EskepStajerProjeListAPIView(BaseListAPIView):
    serializer_class = api_serializer.EskepProjeSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']

        # Önce Stajer tablosundan kaydı al
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)

        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = stajer.user  

        return api_models.EskepProje.objects.filter(inserteduser=inserteduser)

class EskepStajerOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']

        # Önce Stajer tablosundan kaydı al
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)

        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = stajer.user  

        return api_models.Odev.objects.filter(inserteduser=inserteduser)

class EskepOgrenciOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']

        # Önce Stajer tablosundan kaydı al
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)

        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = ogrenci.user  

        return api_models.Odev.objects.filter(inserteduser=inserteduser)

class EskepOgrenciKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']

        # Önce Stajer tablosundan kaydı al
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)

        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = ogrenci.user  

        return api_models.KitapTahlili.objects.filter(inserteduser=inserteduser)
    
class EskepOgrenciDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']

        # Önce Stajer tablosundan kaydı al
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)

        # O stajerin bağlı olduğu user_id'yi inserteduser olarak belirle
        inserteduser = ogrenci.user  

        return api_models.DersSonuRaporu.objects.filter(inserteduser=inserteduser)
     
class EskepOdevCreateAPIView(BaseCreateAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        # create sırasında mevcut extract_variants fonksiyonunuzu kullanmaya devam
        self.extract_variants('odev', instance, api_models.VariantOdev, api_models.VariantOdevItem)

    def _get_users(self):
        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self.get_koordinator_by_user(inserteduser_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator


class EskepOdevUpdateAPIView(BaseUpdateAPIView):
    """
    http://127.0.0.1:8000/api/v1/eskepstajer/odev-edit/<int:id>/  → PUT/PATCH
    Body:
      title, description, image (opsiyonel), ...
      variants[i][id]       (opsiyonel: mevcutsa gönder)
      variants[i][title]
      variants[i][pdf]      (opsiyonel: yeni dosya yükleniyorsa)
      variants_to_delete[]  (opsiyonel)
    """
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer
    lookup_field = "id"  # URL conf: path("eskepstajer/odev-edit/<int:id>/", EskepOdevUpdateAPIView.as_view())
    
    def get_object(self):
        """
        Öncelik URL'deki id; yoksa body'deki id ile bul.
        """
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        print(lookup)
        if not lookup:
            raise serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    # --- Variant Güncelleme Mantığı ---
    def _update_variants(self, odev: api_models.Odev):
        """
        - Gönderilen variants[] içinde id varsa: güncelle
        - id yoksa: yeni oluştur
        - variants_to_delete[]: verilen id'leri sil
        - pdf dosyası gönderilmediyse mevcut dosya korunur
        """
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantOdev
        VariantItem = api_models.VariantOdevItem

        # Silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, odev=odev)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # Gönderilen variants dizisini indeksleyerek oku
        # Beklenen alanlar: variants[0][id], variants[0][title], variants[0][pdf]
        # Hem "variants[0][...]" hem de "variants.0...." tiplerini desteklemek isterseniz
        # parse ederek genişletebilirsiniz; burada köşeli parantez formu esas alındı.
        variant_indices = self._find_indices(prefix="variants")
        for i in variant_indices:
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)  # dosya varsa gelir

            if not title:
                # Başlık zorunlu kabul
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                # Güncelle
                try:
                    variant = Variant.objects.get(id=vid, odev=odev)
                except Variant.DoesNotExist:
                    raise serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})
                variant.title = title
                variant.save()

                # Tek dosyalı bir yapı varsayıyorum: VariantOdevItem(variant, file)
                # Birden fazla item varsa buna göre genişletin.
                item = VariantItem.objects.filter(variant=variant).first()
                if pdf:
                    if item:
                        item.file = pdf
                        item.save()
                    else:
                        VariantItem.objects.create(variant=variant, file=pdf)
                # pdf gönderilmediyse mevcut dosya korunur

            else:
                # Yeni oluştur
                variant = Variant.objects.create(odev=odev, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)
                else:
                    # Yeni oluşturuluyorsa dosya da zorunlu olsun istiyorsanız bu satırı hata fırlatacak şekilde değiştirin:
                    # raise serializers.ValidationError({f"variants[{i}][pdf]": "PDF dosyası zorunludur."})
                    pass

    # ---- yardımcılar ----
    def _listify(self, val):
        # ['1','2'] | '1,2' | [] → list
        if isinstance(val, (list, tuple)):
            return list(val)
        if isinstance(val, str):
            return [v for v in val.split(",") if v]
        return []

    def _find_indices(self, prefix="variants"):
        """
        request.data anahtarlarından variants[<i>][...] kalıbındaki indeksleri bulur.
        """
        indices = set()
        for key in self.request.data.keys():
            # ör: "variants[3][title]" → i=3
            if key.startswith(f"{prefix}[") and "][" in key:
                try:
                    part = key.split("[", 1)[1]           # "3][title]"
                    idx = part.split("]", 1)[0]            # "3"
                    indices.add(int(idx))
                except Exception:
                    continue
        return sorted(indices)

class EskepOdevDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/odev/<int:id>/
    204 No Content
    """
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]

    # Eğer ilişkilerde on_delete=CASCADE zaten ayarlıysa bu bloğa gerek yok.
    # Yine de elle temizlemek isterseniz perform_destroy'ı açın.
    #
    # def perform_destroy(self, instance):
    #     # İsteğe bağlı: variant ve item temizlik
    #     api_models.VariantOdev.objects.filter(odev=instance).delete()
    #
    

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
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        # create sırasında mevcut extract_variants fonksiyonunuzu kullanmaya devam
        self.extract_variants('derssonuraporu', instance, api_models.VariantDersSonuRaporu, api_models.VariantDersSonuRaporuItem)

    def _get_users(self):
        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self.get_koordinator_by_user(inserteduser_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator    


class EskepDersSonuRaporuUpdateAPIView(BaseUpdateAPIView):
    """    
    Body:
      title, description, image (opsiyonel), ...
      variants[i][id]       (opsiyonel: mevcutsa gönder)
      variants[i][title]
      variants[i][pdf]      (opsiyonel: yeni dosya yükleniyorsa)
      variants_to_delete[]  (opsiyonel)
    """
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer
    lookup_field = "id"  
    
    def get_object(self):
        """
        Öncelik URL'deki id; yoksa body'deki id ile bul.
        """
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        print(lookup)
        if not lookup:
            raise serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    # --- Variant Güncelleme Mantığı ---
    def _update_variants(self, derssonuraporu: api_models.DersSonuRaporu):
        """
        - Gönderilen variants[] içinde id varsa: güncelle
        - id yoksa: yeni oluştur
        - variants_to_delete[]: verilen id'leri sil
        - pdf dosyası gönderilmediyse mevcut dosya korunur
        """
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantDersSonuRaporu
        VariantItem = api_models.VariantDersSonuRaporuItem

        # Silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, derssonuraporu=derssonuraporu)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # Gönderilen variants dizisini indeksleyerek oku
        # Beklenen alanlar: variants[0][id], variants[0][title], variants[0][pdf]
        # Hem "variants[0][...]" hem de "variants.0...." tiplerini desteklemek isterseniz
        # parse ederek genişletebilirsiniz; burada köşeli parantez formu esas alındı.
        variant_indices = self._find_indices(prefix="variants")
        for i in variant_indices:
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)  # dosya varsa gelir

            if not title:
                # Başlık zorunlu kabul
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                # Güncelle
                try:
                    variant = Variant.objects.get(id=vid, derssonuraporu=derssonuraporu)
                except Variant.DoesNotExist:
                    raise serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})
                variant.title = title
                variant.save()

                # Tek dosyalı bir yapı varsayıyorum: VariantOdevItem(variant, file)
                # Birden fazla item varsa buna göre genişletin.
                item = VariantItem.objects.filter(variant=variant).first()
                if pdf:
                    if item:
                        item.file = pdf
                        item.save()
                    else:
                        VariantItem.objects.create(variant=variant, file=pdf)
                # pdf gönderilmediyse mevcut dosya korunur

            else:
                # Yeni oluştur
                variant = Variant.objects.create(derssonuraporu=derssonuraporu, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)
                else:
                    # Yeni oluşturuluyorsa dosya da zorunlu olsun istiyorsanız bu satırı hata fırlatacak şekilde değiştirin:
                    # raise serializers.ValidationError({f"variants[{i}][pdf]": "PDF dosyası zorunludur."})
                    pass

    # ---- yardımcılar ----
    def _listify(self, val):
        # ['1','2'] | '1,2' | [] → list
        if isinstance(val, (list, tuple)):
            return list(val)
        if isinstance(val, str):
            return [v for v in val.split(",") if v]
        return []

    def _find_indices(self, prefix="variants"):
        """
        request.data anahtarlarından variants[<i>][...] kalıbındaki indeksleri bulur.
        """
        indices = set()
        for key in self.request.data.keys():
            # ör: "variants[3][title]" → i=3
            if key.startswith(f"{prefix}[") and "][" in key:
                try:
                    part = key.split("[", 1)[1]           # "3][title]"
                    idx = part.split("]", 1)[0]            # "3"
                    indices.add(int(idx))
                except Exception:
                    continue
        return sorted(indices)
    
class EskepDersSonuRaporuDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/derssonuraporu/<int:id>/
    204 No Content
    """
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]

    # Eğer ilişkilerde on_delete=CASCADE zaten ayarlıysa bu bloğa gerek yok.
    # Yine de elle temizlemek isterseniz perform_destroy'ı açın.
    #
    # def perform_destroy(self, instance):
    #     # İsteğe bağlı: variant ve item temizlik
    #     api_models.VariantDersSonuRaporu.objects.filter(derssonuraporu=instance).delete()
    

class EskepDersSonuRaporuListAPIView(BaseListAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

class EskepDersSonuRaporuDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer


#Eskep EskepProje Views
class EskepProjeCreateAPIView(BaseCreateAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        # create sırasında mevcut extract_variants fonksiyonunuzu kullanmaya devam
        self.extract_variants('eskepProje', instance, api_models.VariantEskepProje, api_models.VariantEskepProjeItem)

    def _get_users(self):
        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self.get_koordinator_by_user(inserteduser_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator    


class EskepProjeUpdateAPIView(BaseUpdateAPIView):    
    """    
    Body:
      title, description, image (opsiyonel), ...
      variants[i][id]       (opsiyonel: mevcutsa gönder)
      variants[i][title]
      variants[i][pdf]      (opsiyonel: yeni dosya yükleniyorsa)
      variants_to_delete[]  (opsiyonel)
    """
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer
    lookup_field = "id"  
    
    def get_object(self):
        """
        Öncelik URL'deki id; yoksa body'deki id ile bul.
        """
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        print(lookup)
        if not lookup:
            raise serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    # --- Variant Güncelleme Mantığı ---
    def _update_variants(self, eskepproje: api_models.EskepProje):
        """
        - Gönderilen variants[] içinde id varsa: güncelle
        - id yoksa: yeni oluştur
        - variants_to_delete[]: verilen id'leri sil
        - pdf dosyası gönderilmediyse mevcut dosya korunur
        """
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantEskepProje
        VariantItem = api_models.VariantEskepProjeItem

        # Silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, eskepProje=eskepproje)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # Gönderilen variants dizisini indeksleyerek oku
        # Beklenen alanlar: variants[0][id], variants[0][title], variants[0][pdf]
        # Hem "variants[0][...]" hem de "variants.0...." tiplerini desteklemek isterseniz
        # parse ederek genişletebilirsiniz; burada köşeli parantez formu esas alındı.
        variant_indices = self._find_indices(prefix="variants")
        for i in variant_indices:
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)  # dosya varsa gelir

            if not title:
                # Başlık zorunlu kabul
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                # Güncelle
                try:
                    variant = Variant.objects.get(id=vid, eskepProje=eskepproje)
                except Variant.DoesNotExist:
                    raise serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})
                variant.title = title
                variant.save()

                # Tek dosyalı bir yapı varsayıyorum: VariantOdevItem(variant, file)
                # Birden fazla item varsa buna göre genişletin.
                item = VariantItem.objects.filter(variant=variant).first()
                if pdf:
                    if item:
                        item.file = pdf
                        item.save()
                    else:
                        VariantItem.objects.create(variant=variant, file=pdf)
                # pdf gönderilmediyse mevcut dosya korunur

            else:
                # Yeni oluştur
                variant = Variant.objects.create(eskepProje=eskepproje, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)
                else:
                    # Yeni oluşturuluyorsa dosya da zorunlu olsun istiyorsanız bu satırı hata fırlatacak şekilde değiştirin:
                    # raise serializers.ValidationError({f"variants[{i}][pdf]": "PDF dosyası zorunludur."})
                    pass

    # ---- yardımcılar ----
    def _listify(self, val):
        # ['1','2'] | '1,2' | [] → list
        if isinstance(val, (list, tuple)):
            return list(val)
        if isinstance(val, str):
            return [v for v in val.split(",") if v]
        return []

    def _find_indices(self, prefix="variants"):
        """
        request.data anahtarlarından variants[<i>][...] kalıbındaki indeksleri bulur.
        """
        indices = set()
        for key in self.request.data.keys():
            # ör: "variants[3][title]" → i=3
            if key.startswith(f"{prefix}[") and "][" in key:
                try:
                    part = key.split("[", 1)[1]           # "3][title]"
                    idx = part.split("]", 1)[0]            # "3"
                    indices.add(int(idx))
                except Exception:
                    continue
        return sorted(indices)
    
class EskepProjeDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/eskepproje/<int:id>/
    204 No Content
    """
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]

    # Eğer ilişkilerde on_delete=CASCADE zaten ayarlıysa bu bloğa gerek yok.
    # Yine de elle temizlemek isterseniz perform_destroy'ı açın.
    #
    # def perform_destroy(self, instance):
    #     # İsteğe bağlı: variant ve item temizlik
    #     api_models.VariantEskepProje.objects.filter(eskepproje=instance).delete()


class EskepProjeListAPIView(BaseListAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer

class EskepProjeDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.EskepProje.objects.all()
    serializer_class = api_serializer.EskepProjeSerializer


#Eskep EskepProje Views
class EskepKitapTahliliCreateAPIView(BaseCreateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        # create sırasında mevcut extract_variants fonksiyonunuzu kullanmaya devam
        self.extract_variants('kitaptahlili', instance, api_models.VariantKitapTahlili, api_models.VariantKitapTahliliItem)

    def _get_users(self):
        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self.get_koordinator_by_user(inserteduser_user)
                if not koordinator:
                    raise serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator    


class EskepKitapTahliliUpdateAPIView(BaseUpdateAPIView):    
    """    
    Body:
      title, description, image (opsiyonel), ...
      variants[i][id]       (opsiyonel: mevcutsa gönder)
      variants[i][title]
      variants[i][pdf]      (opsiyonel: yeni dosya yükleniyorsa)
      variants_to_delete[]  (opsiyonel)
    """
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
    lookup_field = "id"  
    
    def get_object(self):
        """
        Öncelik URL'deki id; yoksa body'deki id ile bul.
        """
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        print(lookup)
        if not lookup:
            raise serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    # --- Variant Güncelleme Mantığı ---
    def _update_variants(self, kitaptahlili: api_models.KitapTahlili):
        """
        - Gönderilen variants[] içinde id varsa: güncelle
        - id yoksa: yeni oluştur
        - variants_to_delete[]: verilen id'leri sil
        - pdf dosyası gönderilmediyse mevcut dosya korunur
        """
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantKitapTahlili
        VariantItem = api_models.VariantKitapTahliliItem

        # Silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, kitaptahlili=kitaptahlili)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # Gönderilen variants dizisini indeksleyerek oku
        # Beklenen alanlar: variants[0][id], variants[0][title], variants[0][pdf]
        # Hem "variants[0][...]" hem de "variants.0...." tiplerini desteklemek isterseniz
        # parse ederek genişletebilirsiniz; burada köşeli parantez formu esas alındı.
        variant_indices = self._find_indices(prefix="variants")
        for i in variant_indices:
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)  # dosya varsa gelir

            if not title:
                # Başlık zorunlu kabul
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                # Güncelle
                try:
                    variant = Variant.objects.get(id=vid, kitaptahlili=kitaptahlili)
                except Variant.DoesNotExist:
                    raise serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})
                variant.title = title
                variant.save()

                # Tek dosyalı bir yapı varsayıyorum: VariantOdevItem(variant, file)
                # Birden fazla item varsa buna göre genişletin.
                item = VariantItem.objects.filter(variant=variant).first()
                if pdf:
                    if item:
                        item.file = pdf
                        item.save()
                    else:
                        VariantItem.objects.create(variant=variant, file=pdf)
                # pdf gönderilmediyse mevcut dosya korunur

            else:
                # Yeni oluştur
                variant = Variant.objects.create(kitaptahlili=kitaptahlili, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)
                else:
                    # Yeni oluşturuluyorsa dosya da zorunlu olsun istiyorsanız bu satırı hata fırlatacak şekilde değiştirin:
                    # raise serializers.ValidationError({f"variants[{i}][pdf]": "PDF dosyası zorunludur."})
                    pass

    # ---- yardımcılar ----
    def _listify(self, val):
        # ['1','2'] | '1,2' | [] → list
        if isinstance(val, (list, tuple)):
            return list(val)
        if isinstance(val, str):
            return [v for v in val.split(",") if v]
        return []

    def _find_indices(self, prefix="variants"):
        """
        request.data anahtarlarından variants[<i>][...] kalıbındaki indeksleri bulur.
        """
        indices = set()
        for key in self.request.data.keys():
            # ör: "variants[3][title]" → i=3
            if key.startswith(f"{prefix}[") and "][" in key:
                try:
                    part = key.split("[", 1)[1]           # "3][title]"
                    idx = part.split("]", 1)[0]            # "3"
                    indices.add(int(idx))
                except Exception:
                    continue
        return sorted(indices)
    
class EskepKitapTahliliDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/kitaptahlili/<int:id>/
    204 No Content
    """
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]

    # Eğer ilişkilerde on_delete=CASCADE zaten ayarlıysa bu bloğa gerek yok.
    # Yine de elle temizlemek isterseniz perform_destroy'ı açın.
    #
    # def perform_destroy(self, instance):
    #     # İsteğe bağlı: variant ve item temizlik
    #     api_models.VariantEskepProje.objects.filter(eskepproje=instance).delete()


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
    serializer_class = api_serializer.KoordinatorSerializer
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

class EskepEgitmenListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EducatorSerializer
    permission_classes = [IsGeneralKoordinator]

    def get_queryset(self):
        return api_models.Educator.objects.filter(
            active=True            
        ).distinct() 
        
class EducatorDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]
    
class OgrenciListAPIView(generics.ListAPIView):
    queryset = api_models.Ogrenci.objects.filter(active=True)  
    serializer_class = api_serializer.OgrenciSerializer
    permission_classes = [AllowAny]

class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]


class MyCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer    
    permission_classes = [IsEskepKoordinatorOrTeacher]    
    
    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        print("Kullanıcı:", self.request.user)
        print("Base role:", getattr(self.request.user, "base_roles", None))
        print("Sub roles:", getattr(self.request.user, "sub_roles", None))
        
        return api_models.Course.objects.filter(
            inserteduser__id=user_id,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis",
            active=True
        ).select_related("teacher", "category")

class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")

    def get_object(self):
        slug = self.kwargs['slug']
        course = api_models.Course.objects.get(slug=slug, platform_status="Yayinlanmis", teacher_course_status="Yayinlanmis")
        return course

class CourseDeleteView(APIView):
    def delete(self, request, pk):
        course = get_object_or_404(api_models.Course, pk=pk)
        course.delete()
        return Response({"detail": "Silindi"}, status=204)

class CourseDetailAPIView(APIView):
    def get(self, request,pk):
        print(request)
        course = get_object_or_404(api_models.Course, id=pk)
        serializer = api_serializer.CourseSerializer(course)
        return Response(serializer.data)
      
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
        return api_models.Cart.objects.filter(cart_id=cart_id)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_total = Decimal("0.00")

        for cart_item in queryset:
            total_price += Decimal(cart_item.price or 0)
            total_tax += Decimal(cart_item.tax_fee or 0)
            total_total += Decimal(cart_item.total or 0)

        data = {
            "price": float(total_price),
            "tax": float(total_tax),
            "total": float(total_total),
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
        from decimal import Decimal
        full_name = request.data.get('full_name', '')
        email = request.data.get('email', '')
        country = request.data.get('country', '')
        cart_id = request.data.get('cart_id')
        user_id = request.data.get('user_id', 0)

        user = get_object_or_404(User, id=user_id) if user_id not in (0, "0", None, "") else None
        cart_items = api_models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_initial_total = Decimal("0.00")
        total_total = Decimal("0.00")

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
            total_price += Decimal(c.price or 0)
            total_tax += Decimal(c.tax_fee or 0)
            total_initial_total += Decimal(c.total or 0)
            total_total += Decimal(c.total or 0)

            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({
            "message": "Order Created Successfully",
            "order_oid": str(order.oid)  # <- JSON için güvenli
        }, status=status.HTTP_201_CREATED)



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
        order = get_object_or_404(api_models.CartOrder, oid=order_oid)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=order.email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"Order for {order.full_name}",
                        },
                        'unit_amount': int(order.total * 100),  # cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.FRONTEND_SITE_URL}/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_SITE_URL}/payment-failed/",
            )

            order.stripe_session_id = checkout_session.id
            order.save()

            # Eğer frontend yönlendirme yapacaksa:
            return Response({"url": checkout_session.url}, status=status.HTTP_200_OK)

            # Veya direkt yönlendirme yapmak isterseniz:
            # return redirect(checkout_session.url)

        except stripe.error.StripeError as e:
            return Response({
                "message": "Something went wrong when trying to make payment.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        total_hafizs = api_models.Hafiz.objects.filter(agent=agent).count()

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
    lookup_url_kwarg = "odev_id"   # URL’de <int:odev_id> ise bunu oku

    def get_queryset(self):
        # URL: .../eskepinstructor/odev-detail/<int:koordinator_id>/<int:odev_id>/
        try:
            koordinator_id = int(self.kwargs.get("koordinator_id"))
        except (TypeError, ValueError):
            # Parametre bozuks a 404 verelim
            raise NotFound("Geçersiz koordinator_id")

        # Buraya soft-delete vb. ek filtreleriniz varsa ekleyin
        return api_models.Odev.objects.filter(koordinator_id=koordinator_id)

    def get_object(self):
        # RetrieveAPIView normalde get_object_or_404 ile pk bakar; biz pk yerine URL’deki odev_id’yi kullanıyoruz
        odev_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            odev_id = int(odev_id)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz odev_id")

        return get_object_or_404(self.get_queryset(), pk=odev_id)

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
        derssonuraporu_id = self.kwargs['derssonuraporu_id']

        # user = get_object_or_404(User, id=user_id)
        return api_models.DersSonuRaporu.objects.get(id=derssonuraporu_id,koordinator_id=koordinator_id)

class EskepInstructorProjeDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.ProjeSerializer
    permission_classes = [AllowAny]
    # lookup_field = 'enrollment_id'

    def get_object(self):
        koordinator_id = self.kwargs['koordinator_id']
        proje_id = self.kwargs['proje_id']

        # user = get_object_or_404(User, id=user_id)
        return api_models.Proje.objects.get(id=proje_id,koordinator_id=koordinator_id)


class EskepStajerOdevDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.OdevSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # URL'de kullanılacak alan

    def get_object(self):
        user_id = self.kwargs['user_id']
        odev_id = self.kwargs['id']

        user = get_object_or_404(User, id=user_id)    
        
        return get_object_or_404(api_models.Odev, inserteduser=user, id=odev_id)

class EskepStajerDersSonuRaporuDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # URL'de kullanılacak alan

    def get_object(self):
        user_id = self.kwargs['user_id']
        derssonuraporu_id = self.kwargs['id']

        user = get_object_or_404(User, id=user_id)    
        
        return get_object_or_404(api_models.DersSonuRaporu, inserteduser=user, id=derssonuraporu_id)
    
class EskepStajerKitapTahliliDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # URL'de kullanılacak alan

    def get_object(self):
        user_id = self.kwargs['user_id']
        kitaptahlili_id = self.kwargs['id']

        user = get_object_or_404(User, id=user_id)    
        
        return get_object_or_404(api_models.KitapTahlili, inserteduser=user, id=kitaptahlili_id)

class EskepStajerProjeDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EskepProjeSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # URL'de kullanılacak alan

    def get_object(self):
        user_id = self.kwargs['user_id']
        eskepproje_id = self.kwargs['id']

        user = get_object_or_404(User, id=user_id)    
        
        return get_object_or_404(api_models.EskepProje, inserteduser=user, id=eskepproje_id)   
    
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
        print(request.data['variant_item_id'])
        print(request.data['user_id'])
        print(request.data['course_id'])
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']
        
        if not variant_item_id:
            return Response({"error": "variant_item_id gönderilmedi"}, status=400)
        
        user = get_object_or_404(User, id=user_id)
        course = api_models.Course.objects.get(id=course_id)
        variant_item = api_models.VariantItem.objects.get(variant_item_id=variant_item_id)
        print(variant_item)
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
        
        if not variant_item_id:
            return Response({"error": "variant_item_id gönderilmedi"}, status=400)
        
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
    permission_classes = [AllowAny]  # gerektiği gibi ayarlayın

    def get_object(self):
        koordinator_id = self.kwargs['koordinator_id']
        odev_id = self.kwargs['odev_id']
        pk = self.kwargs['pk']

        # Önce notu ilgili ödev altından çekin; koordinator NULL olabilir.
        return get_object_or_404(
            api_models.NoteOdev,
            Q(koordinator_id=koordinator_id) | Q(koordinator__isnull=True),
            odev_id=odev_id,
            pk=pk
        )

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


class QuestionAnswerMessageCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        odev_id = request.data.get("odev_id")
        user_id = request.data.get("user_id")
        qa_id = request.data.get("qa_id")
        message = request.data.get("message")

        try:
            odev = api_models.Odev.objects.get(id=odev_id)
            question = api_models.Question_AnswerOdev.objects.get(qa_id=qa_id)
            mesaj_gonderen = User.objects.get(id=user_id)
            mesaj_alan = question.mesajiAlan

            msg = api_models.Question_Answer_MessageOdev.objects.create(
                odev=odev,
                question=question,
                mesajiGonderen=mesaj_gonderen,
                mesajiAlan=mesaj_alan,
                message=message
            )
            return Response({"message": "Mesaj gönderildi", "question": api_serializer.Question_AnswerOdevSerializer(question).data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class CourseQuestionAnswerMessageCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        print(request.data)
        data = request.data
        course_id = data.get("course_id")
        qa_id = data.get("qa_id")                 # mevcut thread id (opsiyonel)
        message = (data.get("message") or "").strip()
        title = (data.get("title") or "").strip() # opsiyonel: ilk mesaj başlığı

        # Temel alanlar
        if not course_id:
            return Response({"error": "course_id zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        if not message:
            return Response({"error": "message zorunlu"}, status=status.HTTP_400_BAD_REQUEST)

        # Kursu doğrula
        course = get_object_or_404(api_models.Course, pk=course_id)

        # 1) qa_id varsa: mevcut threade mesaj ekle
        if qa_id:
            question = get_object_or_404(api_models.Question_Answer, pk=qa_id)  # ← pk/id ile al
            # course uyumu kontrolü (modelinizde alan adı farklıysa uyarlayın)
            if getattr(question, "course_id", None) != course.id:
                return Response(
                    {"error": "qa_id verilen course ile eşleşmiyor"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 2) qa_id yoksa: yeni thread oluştur + ilk mesajı ekle
        else:
            # model alan adlarınıza göre güncelleyin (ör: user, course, title vs.)
            question = api_models.Question_Answer.objects.create(
                course=course,
                user=request.user,
                title=title or None,
            )

        # Mesajı oluştur
        msg = api_models.Question_Answer_Message.objects.create(
            course=course,
            question=question,
            user=request.user,      # body’den almayın
            message=message,
        )

        # Güncel thread’i dön
        serialized_question = api_serializer.Question_AnswerSerializer(
            question, context={"request": request}
        )
        return Response(
            {"message": "Mesaj gönderildi", "question": serialized_question.data},
            status=status.HTTP_201_CREATED,
        )
class OdevQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerOdevSerializer
    permission_classes = [IsAuthenticated]

    def _get_odev(self, request, **kwargs):
        # URL, query veya body'den al; olmayan durumda düzgün bir 404 döndür
        odev_id = (
            kwargs.get("odev_id")
            or request.query_params.get("odev_id")
            or request.data.get("odev_id")
        )
        if not odev_id:
            raise NotFound("odev_id gerekiyor.")
        return get_object_or_404(api_models.Odev, id=odev_id)

    def get_queryset(self):
        odev = self._get_odev(self.request, **self.kwargs)
        return api_models.Question_AnswerOdev.objects.filter(odev=odev).order_by("-id")

    def create(self, request, *args, **kwargs):
        odev = self._get_odev(request, **kwargs)
        user = request.user if request.user.is_authenticated else None
        if not user:
            user_id = request.data.get("user_id") or request.data.get("gonderen_id")
            user = get_object_or_404(User, id=user_id)

        title = request.data.get("title")
        message = request.data.get("message")
        mesajiAlan = odev.inserteduser

        question = api_models.Question_AnswerOdev.objects.create(
            odev=odev,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=user,
            title=title,
        )
        api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=user,
            message=message,
            question=question,
            # title=title,
        )

        data = self.get_serializer(question).data
        return Response(
            {"message": "Grup Konuşması Başlatıldı", "question_id": question.id, "question": data},
            status=status.HTTP_201_CREATED,
        )
            
class OdevQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.OdevQAMessageCreateSerializer
    
    def _get_odev(self, request, **kwargs):
        odev_id = kwargs.get("odev_id") or request.data.get("odev_id")
        if not odev_id:
            raise NotFound("odev_id gerekiyor.")
        return get_object_or_404(api_models.Odev, id=odev_id)

    def create(self, request, *args, **kwargs):
        odev = self._get_odev(request, **kwargs)
        question_id = request.data.get("question_id")
        # title = request.data.get("title")
        message = request.data.get("message")

        question = get_object_or_404(api_models.Question_AnswerOdev, id=question_id, odev=odev)

        mesajiGonderen = request.user
        mesajiAlan = question.mesajiAlan or odev.inserteduser
        print("KWARGS:", self.kwargs, "QUERY:", self.request.query_params, "DATA:", self.request.data)
        api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
            message=message,
            question=question,
            # title=title,
        )

        return Response({"ok": True, "question_id": question.id}, status=status.HTTP_201_CREATED)
    
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
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajiAlan = odev.inserteduser

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerOdev.objects.filter(
            odev=odev,
            mesajiGonderen=mesajiGonderen,
            mesajiAlan=mesajiAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerOdev.objects.create(
                odev=odev,
                mesajiGonderen=mesajiGonderen,
                mesajiAlan=mesajiAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            mesajiGonderen=mesajiGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajiAlan,  # burada alan olarak mesajiAlan kullanılmalı
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

class OdevCreateOrUpdateNoteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, koordinator_id, odev_id, id=None):
        """
        Not oluşturma (Create)
        URL: /.../<koordinator_id>/<odev_id>/<id>/
        Not: create için 'id' (note id) kullanılmaz; sadece URL imzasını karşılamak için alınır.
        """
        odev = get_object_or_404(api_models.Odev, id=odev_id)

        data = request.data.copy()
        data["odev"] = odev.id
        data["koordinator"] = koordinator_id

        serializer = api_serializer.NoteOdevSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, koordinator_id, odev_id, id):
        """ Not güncelleme (Update) """
        note = get_object_or_404(
            api_models.NoteOdev,
            id=id,                    # note id
            odev_id=odev_id,
            koordinator_id=koordinator_id,
        )
        serializer = api_serializer.NoteOdevSerializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, koordinator_id, odev_id, id):
        """ Not silme (Delete) """
        note = get_object_or_404(
            api_models.NoteOdev,
            id=id,                    # note id
            odev_id=odev_id,
            koordinator_id=koordinator_id,
        )
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)

class DersSonuRaporuCreateOrUpdateNoteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, koordinator_id, id):
        """ Not oluşturma (Create) """
        derssonuraporu = get_object_or_404(api_models.DersSonuRaporu, id=id)
        data = request.data.copy()
        data["derssonuraporu"] = derssonuraporu.id
        data["koordinator"] = koordinator_id

        serializer = api_serializer.NoteDersSonuRaporuSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, koordinator_id, derssonuraporu_id, id):
        """ Not güncelleme (Update) """
        note = get_object_or_404(api_models.NoteDersSonuRaporu, id=id, derssonuraporu_id=derssonuraporu_id, koordinator_id=koordinator_id)
        serializer = api_serializer.NoteDersSonuRaporuSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, koordinator_id, derssonuraporu_id, id):
        """ Not silme (Delete) """
        note = get_object_or_404(api_models.NoteDersSonuRaporu, id=id, derssonuraporu_id=derssonuraporu_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)

class KitapTahliliCreateOrUpdateNoteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, koordinator_id, id):
        """ Not oluşturma (Create) """
        kitaptahlili = get_object_or_404(api_models.KitapTahlili, id=id)
        data = request.data.copy()
        data["kitaptahlili"] = kitaptahlili.id
        data["koordinator"] = koordinator_id

        serializer = api_serializer.NoteKitapTahliliSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, koordinator_id, kitaptahlili_id, id):
        """ Not güncelleme (Update) """
        note = get_object_or_404(api_models.NoteKitapTahlili, id=id, kitaptahlili_id=kitaptahlili_id, koordinator_id=koordinator_id)
        serializer = api_serializer.NoteKitapTahliliSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, koordinator_id, kitaptahlili_id, id):
        """ Not silme (Delete) """
        note = get_object_or_404(api_models.NoteKitapTahlili, id=id, kitaptahlili_id=kitaptahlili_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)
    
class EskepProjeCreateOrUpdateNoteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, koordinator_id, id):
        """ Not oluşturma (Create) """
        proje = get_object_or_404(api_models.EskepProje, id=id)
        data = request.data.copy()
        data["proje"] = proje.id
        data["koordinator"] = koordinator_id

        serializer = api_serializer.NoteEskepProjeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, koordinator_id, proje_id, id):
        """ Not güncelleme (Update) """
        note = get_object_or_404(api_models.NoteEskepProje, id=id, proje_id=proje_id, koordinator_id=koordinator_id)
        serializer = api_serializer.NoteEskepProjeSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, koordinator_id, proje_id, id):
        """ Not silme (Delete) """
        note = get_object_or_404(api_models.NoteEskepProje, id=id, proje_id=proje_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)
        
class KitapTahliliQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerKitapTahliliSerializer
    permission_classes = [IsAuthenticated]
    queryset = api_models.Question_AnswerKitapTahlili.objects.all()

    def get_queryset(self):
        kt_id = self.kwargs.get("kitaptahlili_id") or self.request.query_params.get("kitaptahlili_id")
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)
        return self.queryset.filter(kitaptahlili=kt).order_by("-id")

    def create(self, request, *args, **kwargs):
        # URL ya da body'den al
        kt_id = kwargs.get("kitaptahlili_id") or request.data.get("kitaptahlili_id")
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)

        # Gönderen (auth varsa request.user)
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            sender = user
        else:
            user_id = request.data.get("user_id") or request.data.get("gonderen_id")
            sender = get_object_or_404(User, id=user_id)

        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        if not title or not message:
            return Response({"detail": "title ve message zorunlu"}, status=status.HTTP_400_BAD_REQUEST)

        receiver = kt.inserteduser  # projendeki mantık

        # Konuşmayı oluştur
        question = api_models.Question_AnswerKitapTahlili.objects.create(
            kitaptahlili=kt,
            mesajiAlan=receiver,
            mesajiGonderen=sender,
            title=title,
        )

        # İlk mesajı yaz
        api_models.Question_Answer_MessageKitapTahlili.objects.create(
            kitaptahlili=kt,
            mesajiAlan=receiver,
            mesajiGonderen=sender,
            message=message,
            question=question,
        )

        return Response(
            {"message": "Grup Konuşması Başlatıldı", "question_id": question.id},
            status=status.HTTP_201_CREATED,
        )

# -----------------------------
# KitapTahlili: Var olan konuşmaya mesaj ekle
# -----------------------------
class KitapTahliliQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        kt_id = kwargs.get("kitaptahlili_id") or request.data.get("kitaptahlili_id")
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)

        question_id = request.data.get("question_id")
        message = (request.data.get("message") or "").strip()
        if not question_id or not message:
            return Response({"detail": "question_id ve message zorunlu"}, status=status.HTTP_400_BAD_REQUEST)

        question = get_object_or_404(
            api_models.Question_AnswerKitapTahlili, id=question_id, kitaptahlili=kt
        )

        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            sender = user
        else:
            user_id = request.data.get("user_id") or request.data.get("gonderen_id")
            sender = get_object_or_404(User, id=user_id)

        receiver = question.mesajiAlan or kt.inserteduser

        api_models.Question_Answer_MessageKitapTahlili.objects.create(
            kitaptahlili=kt,
            mesajiAlan=receiver,
            mesajiGonderen=sender,
            message=message,
            question=question,
        )

        return Response({"ok": True, "question_id": question.id}, status=status.HTTP_201_CREATED)

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
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajiAlan = kitaptahlili.inserteduser

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerKitapTahlili.objects.filter(
            kitaptahlili=kitaptahlili,
            mesajiGonderen=mesajiGonderen,
            mesajiAlan=mesajiAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerKitapTahlili.objects.create(
                kitaptahlili=kitaptahlili,
                mesajiGonderen=mesajiGonderen,
                mesajiAlan=mesajiAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageKitapTahlili.objects.create(
            kitaptahlili=kitaptahlili,
            mesajiGonderen=mesajiGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajiAlan,  # burada alan olarak mesajiAlan kullanılmalı
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
    """
    GET  -> Belirli bir DSR (ders sonu raporu) için tüm Q/A kayıtları
    POST -> Yeni bir soru (question) + ilk mesaj (message) oluşturur
    """
    serializer_class = api_serializer.Question_AnswerDersSonuRaporuSerializer
    # İstersen AllowAny bırakabilirsin; ben güvenlik için IsAuthenticated kullandım:
    permission_classes = [IsAuthenticated]

    # ---- helpers ----
    def _get_dsr_id(self, request, **kwargs):
        # URL: /.../<int:derssonuraporu_id>/  veya /.../<int:dersSonuRaporu_id>/
        return (
            kwargs.get("derssonuraporu_id")
            or kwargs.get("dersSonuRaporu_id")
            or request.data.get("derssonuraporu_id")
            or request.data.get("dersSonuRaporu_id")
        )

    def _get_sender(self, request):
        # Tercihen auth kullan
        if getattr(request, "user", None) and request.user.is_authenticated:
            return request.user
        # Değilse body'den id al
        uid = request.data.get("user_id") or request.data.get("gonderen_id")
        return get_object_or_404(User, id=uid)

    # ---- list ----
    def get_queryset(self):
        dsr_id = self._get_dsr_id(self.request, **self.kwargs)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)
        return (
            api_models.Question_AnswerDersSonuRaporu
            .objects
            .filter(derssonuraporu=dsr)
            .order_by("-id")
        )

    # ---- create (new question + first message) ----
    def create(self, request, *args, **kwargs):
        dsr_id = self._get_dsr_id(request, **kwargs)
        if not dsr_id:
            return Response({"detail": "derssonuraporu_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)

        derssonuraporu = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)

        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        if not title or not message:
            return Response({"detail": "title ve message zorunludur"}, status=status.HTTP_400_BAD_REQUEST)

        mesajiGonderen = self._get_sender(request)
        mesajiAlan = getattr(derssonuraporu, "inserteduser", None)

        question = api_models.Question_AnswerDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
            title=title,
        )

        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
            message=message,
            question=question,
        )

        return Response(
            {"message": "Grup Konuşması Başlatıldı", "question_id": question.id},
            status=status.HTTP_201_CREATED,
        )
        
class DersSonuRaporuQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        dsr_id = (
            kwargs.get("derssonuraporu_id")
            or request.data.get("derssonuraporu_id")
            or request.data.get("dersSonuRaporu_id")
        )
        if not dsr_id:
            return Response({"detail": "derssonuraporu_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)

        derssonuraporu = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)

        qid = request.data.get("question_id")
        if not qid:
            return Response({"detail": "question_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)

        question = get_object_or_404(
            api_models.Question_AnswerDersSonuRaporu, id=qid, derssonuraporu=derssonuraporu
        )

        msg_text = (request.data.get("message") or "").strip()
        if not msg_text:
            return Response({"detail": "message boş olamaz"}, status=status.HTTP_400_BAD_REQUEST)

        sender = request.user if request.user.is_authenticated else None
        if not sender:
            uid = request.data.get("user_id") or request.data.get("gonderen_id")
            sender = get_object_or_404(User, id=uid)

        receiver = question.mesajiAlan or getattr(derssonuraporu, "inserteduser", None)

        msg = api_models.Question_Answer_MessageDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            question=question,   # FK —> instance
            mesajiGonderen=sender,
            mesajiAlan=receiver,
            message=msg_text,
        )

        return Response({"ok": True, "question_id": question.id, "message_id": msg.id}, status=status.HTTP_201_CREATED)


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
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajiAlan = derssonuraporu.inserteduser

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerDersSonuRaporu.objects.filter(
            derssonuraporu=derssonuraporu,
            mesajiGonderen=mesajiGonderen,
            mesajiAlan=mesajiAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerDersSonuRaporu.objects.create(
                derssonuraporu=derssonuraporu,
                mesajiGonderen=mesajiGonderen,
                mesajiAlan=mesajiAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(
            derssonuraporu=derssonuraporu,
            mesajiGonderen=mesajiGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajiAlan,  # burada alan olarak mesajiAlan kullanılmalı
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
        mesajiGonderen = get_object_or_404(User, id=gonderen_id)
        mesajiAlan = proje.inserteduser

        question = api_models.Question_AnswerEskepProje.objects.create(
            proje=proje,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
            title=title
        )

        api_models.Question_Answer_MessageEskepProje.objects.create(
            proje=proje,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
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
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
    
        # Mesajı alan kişinin ödevin hazırlayanı olduğunu varsayıyoruz
        mesajiAlan = proje.inserteduser

        # Soru-Cevap nesnesini filtrele, yoksa oluştur
        question = api_models.Question_AnswerEskepProje.objects.filter(
            proje=proje,
            mesajiGonderen=mesajiGonderen,
            mesajiAlan=mesajiAlan,
        ).first()

        if not question:
            question = api_models.Question_AnswerEskepProje.objects.create(
                proje=proje,
                mesajiGonderen=mesajiGonderen,
                mesajiAlan=mesajiAlan,
                title=title,
            )

        # Mesajı oluştur
        api_models.Question_Answer_MessageEskepProje.objects.create(
            proje=proje,
            mesajiGonderen=mesajiGonderen,  # burada gonderen olarak mesajiGonderen kullanılmalı
            mesajiAlan=mesajiAlan,  # burada alan olarak mesajiAlan kullanılmalı
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
        total_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid")
            .aggregate(total=models.Sum("price"))["total"] or 0
        )
        monthly_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago)
            .aggregate(total=models.Sum("price"))["total"] or 0
        )

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        for course in enrolled_courses:
            unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(unique_student_ids),
        }]

    

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
                    "image": user.profile.image.url if user.profile.image else None,
                    "country": str(user.profile.country),  # ✅ burası düzeltildi
                    "date": course.date.strftime("%Y-%m-%d"),  # ✅ datetime string'e çevrildi
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)

class EskepInstructorStudentsStajersListAPIView(viewsets.ViewSet):
    def list(self, request, user_id=None):
        if not str(user_id).isdigit():
            return Response({"error": "Geçersiz kullanıcı ID'si."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            koordinator = api_models.Koordinator.objects.get(user_id=user_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        ogrenciler = api_models.Ogrenci.objects.filter(instructor=koordinator)
        stajerler = api_models.Stajer.objects.filter(instructor=koordinator)

        unique_user_ids = set()
        response_data = []

        for item in list(ogrenciler) + list(stajerler):
            user = item.user
            if user.id in unique_user_ids:
                continue

            try:
                profile = user.profile
                profile_date = getattr(profile, "date", None)
                if isinstance(profile_date, (str, type(None))):
                    formatted_date = profile_date
                else:
                    formatted_date = profile_date.strftime("%Y-%m-%d")
            except Exception:
                formatted_date = None

            response_data.append({
                "full_name": item.full_name,
                "image": item.image.url if item.image else None,
                "country": str(item.country) if item.country else None,
                "city": str(item.city) if item.city else None,
                "date": formatted_date,
            })

            unique_user_ids.add(user.id)

        return Response(response_data)

@api_view(["GET"])
def TeacherAllMonthEarningAPIView(request, teacher_id):
    monthly_earning_tracker = (
        api_models.CartOrderItem.objects
        .filter(teacher_id=teacher_id, order__payment_status="Paid")
        .annotate(month=ExtractMonth("date"))
        .values("month")
        .annotate(total_earning=Sum("price"))
        .order_by("month")
    )

    return Response(list(monthly_earning_tracker))

@api_view(["GET"])
def IsAgent(request, user_id):
    if not str(user_id).isdigit():
        return Response({"error": "Geçersiz kullanıcı ID'si"}, status=status.HTTP_400_BAD_REQUEST)

    agent = api_models.Agent.objects.filter(user_id=user_id).first()

    return Response({
        "is_agent": bool(agent),
        "agent_id": agent.id if agent else None
    })
        
class CartOrderItemListAPIView(APIView):
    def get(self, request):
        items = api_models.CartOrderItem.objects.all()      
        serializer = api_serializer.CartOrderItemSerializer(items, many=True)
        return Response(serializer.data)

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
        return api_models.CartOrderItem.objects.filter(teacher__id=teacher_id)

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


class EducatorCreateAPIView(generics.CreateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer

class EducatorUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer
    
class CoordinatorYetkiAtaAPIView(generics.UpdateAPIView):
    serializer_class = api_serializer.KoordinatorSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Koordinator.objects.all()

    def put(self, request, *args, **kwargs):
        coordinator_id = request.data.get("coordinator_id")
        role = request.data.get("role")

        if not coordinator_id or not role:
            return Response({"message": "coordinator_id ve role alanları gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({'message': 'Koordinatör bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

        coordinator.role = role
        coordinator.save()

        return Response({
            'message': 'Koordinatör başarıyla güncellendi',
            'id': coordinator.id,
            'role': coordinator.role
        }, status=status.HTTP_200_OK)

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
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = []  # Girişsiz kullanım için boş

    def perform_create(self, serializer):
        # Hafızın bilgilerini al
        gender = serializer.validated_data.get("gender")
        adres_il = serializer.validated_data.get("adresIl")

        try:
            ankara_city = api_models.City.objects.get(name__iexact="Ankara")
        except api_models.City.DoesNotExist:
            raise ValidationError("Ankara şehri bulunamadı.")
    
        matching_agent = api_models.Agent.objects.filter(
            gender=gender,
            city=adres_il
        ).first()

        # 2) gender + Ankara
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(
                gender=gender,
                city=ankara_city.id
            ).first()

        # 3) opposite gender + city
        if not matching_agent:
            opposite_gender = "Kadın" if gender == "Erkek" else "Erkek"
            matching_agent = api_models.Agent.objects.filter(
                gender=opposite_gender,
                city=adres_il
            ).first()

        # 4) opposite gender + Ankara
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(
                gender=opposite_gender,
                city=ankara_city.id
            ).first()

        # 5) Hiçbiri yoksa hata
        if not matching_agent:
            raise ValidationError("Uygun Agent bulunamadı.")
        # Hafızı kaydet
        instance = serializer.save(agent=matching_agent)

        # İsteğe göre mesaj dönecek
        return Response(
            {"message": "Hafız bilgisi başarılı bir şekilde eklendi"},
            status=status.HTTP_201_CREATED
        )


class HafizBilgiUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        agent_id = self.kwargs.get('agent_id')
        hafizbilgi_id = self.kwargs.get('hafizbilgi_id')

        # Agent doğrulaması (ID ile)
        agent = get_object_or_404(api_models.Agent, id=agent_id)

        # Hafiz bilgisi sadece bu agent'e bağlıysa get edilsin (isteğe bağlı bağlama kontrolü)
        return get_object_or_404(api_models.Hafiz, id=hafizbilgi_id)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()

        # Yaş sayısal değilse dönüştür
        if "yas" in data:
            try:
                data["yas"] = int(data["yas"])
            except ValueError:
                return Response({"yas": ["Geçersiz yaş."]}, status=400)

        # Agent ID düzeltme (gelen veri isimse hatalıdır)
        if "agent" in data:
            try:
                agent = api_models.Agent.objects.get(id=data["agent"])
                data["agent"] = agent.id
            except api_models.Agent.DoesNotExist:
                return Response({"agent": ["Temsilci bulunamadı."]}, status=400)

        # adresIl düzeltme
        if "adresIl" in data and not isinstance(data["adresIl"], int):
            try:
                city = api_models.City.objects.get(name=data["adresIl"])
                data["adresIl"] = city.id
            except api_models.City.DoesNotExist:
                return Response({"adresIl": ["İl bulunamadı."]}, status=400)

        hafiz_bilgi = self.get_object()
        serializer = self.get_serializer(hafiz_bilgi, data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)


class HafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs.get("agent_id")
        return api_models.Hafiz.objects.filter(agent_id=agent_id).select_related("user", "hdm_egitmen").prefetch_related("dersler")
    
class AgentHafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):  
        agent_id = self.kwargs['agent_id']
        agent =  api_models.Agent.objects.get(id=agent_id) 
        queryset = api_models.Hafiz.objects.filter(agent=agent)        
           
        return queryset        
     
class HafizsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 1) HBSKoordinator ise TÜM kayıtlar
        if _is_hbs_koordinator(user):
            return api_models.Hafiz.objects.select_related("adresIl").all()

        # 2) Değilse (ör. HBSTemsilci), kendi şehrindeki hafızlar
        city = _get_user_agent_city(user)
        if city:
            return api_models.Hafiz.objects.select_related("adresIl").filter(adresIl=city)

        # 3) Hiçbiri değilse liste boş
        return api_models.Hafiz.objects.none()


class HafizsListByAgentAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        URL: .../hafizlar/agent/<agent_id>/
        Agent.city == Hafiz.adresIl eşleşmesine göre filtreler.
        """
        agent_id = self.kwargs.get("agent") or self.kwargs.get("agent_id")
        agent = get_object_or_404(api_models.Agent, pk=agent_id)

        return (
            api_models.Hafiz.objects
            .select_related("adresIl")
            .filter(adresIl=agent.city)
        )
    
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

class AgentListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.AgentSerializer   
    
    def get_queryset(self):        
        queryset = api_models.Agent.objects.all()
        print(queryset)      
        return queryset 
   
class DistrictListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.DistrictSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.District.objects.all()
        print(queryset)      
        return queryset  
   
class EgitmenListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.TeacherSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.Teacher.objects.all()
        print(queryset)      
        return queryset  
    


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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
class InstructorEventListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsAuthenticated, IsGeneralTeacher]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise PermissionDenied("Kullanıcı bulunamadı.")

        # Burada tekrar base_role veya sub_role kontrolüne gerek yok
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
    permission_classes = [IsGeneralKoordinator]
    
@api_view(['GET'])
def koordinator_students_stajers(request, user_id):
    try:
        koordinator = api_models.Koordinator.objects.get(user_id=user_id)
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
    try:
        egitmen = api_models.Teacher.objects.get(id=egitmen_id)
    except api_models.Teacher.DoesNotExist:
        return Response({"error": "Eğitmen bulunamadı."}, status=404)

    # Bu eğitmene bağlı ders atamalarını al
    dersler = api_models.DersAtamasi.objects.filter(instructor=egitmen).select_related("hafiz")

    # Bu eğitmenin atama yaptığı tüm hafızları çek (dolaylı olarak)
    hafiz_ids = dersler.values_list("hafiz_id", flat=True).distinct()
    hafizlar = api_models.Hafiz.objects.filter(id__in=hafiz_ids)

    hafizlar_data = api_serializer.HafizSerializer(hafizlar, many=True).data

    dersler_data = []
    for ders in dersler:
        ders_json = api_serializer.DersAtamasiSerializer(ders).data
        ders_json["hafiz"] = ders.hafiz.id
        ders_json["hafiz_adi"] = ders.hafiz.full_name
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
    try:
        hafiz = api_models.Hafiz.objects.get(id=hafiz_id)
    except api_models.Hafiz.DoesNotExist:
        return Response({"error": "Hafız bulunamadı."}, status=404)

    dersler = api_models.DersAtamasi.objects.filter(hafiz=hafiz).select_related("instructor")

    # Son atanan eğitmeni al (varsa)
    egitmen = dersler.last().instructor if dersler.exists() else None

    data = {
        "id": hafiz.id,
        "full_name": hafiz.full_name,
        "egitmen": {
            "id": egitmen.id,
            "full_name": egitmen.full_name
        } if egitmen else None,
        "dersler": api_serializer.DersAtamasiSerializer(dersler, many=True).data
    }
    return Response(data)


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = api_models.Teacher.objects.all()
    serializer_class = api_serializer.TeacherSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="hafizlar")
    def hafizlar(self, request):
        user = request.user
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        hafiz_qs = api_models.Hafiz.objects.filter(hdm_egitmen=teacher)
        serializer = api_serializer.HafizSerializer(hafiz_qs, many=True)
        return Response(serializer.data)
    
class HafizAgentListAPIView(APIView):
    def get(self, request, agent_id):
        try:
            hafizlar = api_models.Hafiz.objects.filter(agent_id=agent_id)
        except api_models.Hafiz.DoesNotExist:
            return Response({"error": "Agent'a ait hafız bulunamadı."}, status=404)

        serializer = api_serializer.HafizSerializer(hafizlar, many=True)
        return Response(serializer.data)



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
    ROLE_MAP = {
        "Ogrenci": "ESKEPOgrenciKoordinator",
        "Stajer": "ESKEPStajerKoordinator",
        "Genel": "ESKEPGenelKoordinator",
    }

    def post(self, request):
        coordinator_id = request.data.get('coordinator_id')
        role_key = request.data.get('role')  # "Öğrenci" gibi sade ad geliyor
        print(request.data)
        
        if not coordinator_id or not role_key:
            return Response({"error": "Eksik veri"}, status=status.HTTP_400_BAD_REQUEST)

        role_name = self.ROLE_MAP.get(role_key)
        if not role_name:
            return Response({"error": "Geçersiz rol adı"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        try:
            role = api_models.KoordinatorRole.objects.get(name=role_name)
        except api_models.KoordinatorRole.DoesNotExist:
            return Response({"error": f"{role_name} adlı rol bulunamadı"}, status=status.HTTP_400_BAD_REQUEST)

        coordinator.roles.set([role])
        return Response({"detail": f"{role_key} rolü başarıyla atandı"}, status=status.HTTP_200_OK)


class QuranPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = api_models.QuranPage.objects.all()
    serializer_class = api_serializer.QuranPageSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def peer_id_view(request):
    if request.method == 'POST':
        peer_id = request.data.get("peer_id")
        if not peer_id:
            return Response({"error": "peer_id is required"}, status=400)

        obj, _ = api_models.PeerID.objects.update_or_create(user=request.user, defaults={"peer_id": peer_id})
        return Response({"peer_id": obj.peer_id})

    elif request.method == 'GET':
        user_id = request.query_params.get("user_id")
        try:
            peer_obj = api_models.PeerID.objects.get(user_id=user_id)
            return Response({"peer_id": peer_obj.peer_id})
        except api_models.PeerID.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_role_detail(request):
    user = request.user
    data = {
        "base_roles": [],     # DİKKAT: çoğul hale getirildi
        "sub_roles": [],
    }

    # Her role için ayrı kontrol ve ekleme
    if api_models.Teacher.objects.filter(user=user).exists():
        teacher = api_models.Teacher.objects.get(user=user)
        data["base_roles"].append("Teacher")
        data["sub_roles"].extend(teacher.roles.values_list("name", flat=True))

    if api_models.Koordinator.objects.filter(user=user).exists():
        koordinator = api_models.Koordinator.objects.get(user=user)
        data["base_roles"].append("Koordinator")
        data["sub_roles"].extend(koordinator.roles.values_list("name", flat=True))

    if api_models.Ogrenci.objects.filter(user=user).exists():
        ogrenci = api_models.Ogrenci.objects.get(user=user)
        data["base_roles"].append("Ogrenci")
        data["sub_roles"].extend(ogrenci.roles.values_list("name", flat=True))

    if api_models.Stajer.objects.filter(user=user).exists():
        stajer = api_models.Stajer.objects.get(user=user)
        data["base_roles"].append("Stajer")
        data["sub_roles"].extend(stajer.roles.values_list("name", flat=True))

    if api_models.Hafiz.objects.filter(email=user.email).exists():
        hafiz = api_models.Hafiz.objects.get(email=user.email)
        data["base_roles"].append("Hafiz")
        data["sub_roles"].extend(hafiz.roles.values_list("name", flat=True))

    if api_models.Agent.objects.filter(user=user).exists():
        agent = api_models.Agent.objects.get(email=user.email)
        data["base_roles"].append("Agent")
        data["sub_roles"].extend(agent.roles.values_list("name", flat=True))

    # Aynı sub_role tekrar edebilir, benzersizleştir
    data["sub_roles"] = list(set(data["sub_roles"]))
    data["base_roles"] = list(set(data["base_roles"]))

    return Response(data)

@api_view(["POST"])
def check_ceptel(request):
    ceptel = request.data.get("ceptel")
    exists = api_models.Hafiz.objects.filter(ceptel=ceptel).exists()
    return Response({"exists": exists})

@api_view(["POST"])
def check_email(request):
    email = request.data.get("email")
    exists = api_models.Hafiz.objects.filter(email=email).exists()
    return Response({"exists": exists})


class Top5TemsilciByHafizAPIView(APIView):
    def get(self, request):
        temsilciler = (
            api_models.Agent.objects
            .annotate(hafiz_sayisi=Count("hafizlar"))
            .order_by("-hafiz_sayisi")[:5]
        )
        data = [
            {
                "ad": t.full_name,
                "adet": t.hafiz_sayisi
            }
            for t in temsilciler
        ]
        return Response(data)

class RecentHafizAssignmentSerializer(serializers.ModelSerializer):
    hafiz_name = serializers.CharField(source="full_name")
    egitmen_name = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Hafiz
        fields = ["hafiz_name", "egitmen_name", "date"]

    def get_egitmen_name(self, obj):
        return obj.hdm_egitmen.full_name if obj.hdm_egitmen else "-"

    def get_date(self, obj):
        tarih = getattr(obj, "modified", None) or getattr(obj, "created", None)
        return tarih.strftime("%Y-%m-%d") if tarih else "-"
    
class AssignmentChartSerializer(serializers.ModelSerializer):
    egitmen = serializers.CharField(source="full_name")
    hafiz_sayisi = serializers.IntegerField()

    class Meta:
        model = api_models.Teacher
        fields = ["egitmen", "hafiz_sayisi"]

class SummaryStatsSerializer(serializers.Serializer):
    total_hafiz = serializers.IntegerField()
    total_egitmen = serializers.IntegerField()
    assigned_hafiz = serializers.IntegerField()
    unassigned_hafiz = serializers.IntegerField()    

class HBSKoordinatorDashboardViewSet(ViewSet):
    def summary(self, request):
        stats = {
            "total_hafiz": api_models.Hafiz.objects.count(),
            "total_egitmen": api_models.Agent.objects.count(),
            "assigned_hafiz": api_models.Hafiz.objects.filter(active=True, onaydurumu="Onaylandı").count(),
            "unassigned_hafiz": api_models.Hafiz.objects.filter(active=False, onaydurumu="Onaylanmadı").count()            
        }
        serializer = SummaryStatsSerializer(stats)
        print(serializer.data)
        return Response({"stats": serializer.data})

    def recent_assignments(self, request):
        queryset = api_models.Hafiz.objects.filter(hdm_egitmen__isnull=False).order_by("-id")[:20]
        serializer = RecentHafizAssignmentSerializer(queryset, many=True)
        return Response(serializer.data)

    def assignments_chart(self, request):
        queryset = (
            api_models.Agent.objects
            .annotate(hafiz_sayisi=Count("hafizlar")) 
            .order_by("-hafiz_sayisi")[:5]
        )
        serializer = AssignmentChartSerializer(queryset, many=True)
        return Response(serializer.data)

class HBSTemsilciDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 🧮 Sayısal özet
        total_hafiz = api_models.Hafiz.objects.count()
        confirmed_hafiz = api_models.Hafiz.objects.filter(onaydurumu="Onaylandı").count() 
        unconfirmed_hafiz = api_models.Hafiz.objects.filter(onaydurumu="Onaylanmadı").count() 
        total_egitmen = api_models.Teacher.objects.count()
         
        today = localdate()        
        agent = api_models.Agent.objects.get(user=request.user)
        
        if hasattr(request.user, "agent"):
            assigned_hafiz = api_models.Hafiz.objects.filter(agent=agent).count()
            hafizs = api_models.Hafiz.objects.filter(agent=agent)
            print(hafizs)
        else:
            assigned_hafiz = 0
        # ⚠️ Uyarılar    
        alerts = []
        if unconfirmed_hafiz > 0:
            alerts.append({"message": f"Onaylanmamış {unconfirmed_hafiz} hafız var."})        

        # 📊 Eğitmen başına hafız grafiği
        chart_data = (api_models.Hafiz.objects.values("agent__full_name").annotate(hafiz_sayisi=Count("id")).order_by("-hafiz_sayisi"))       

        return Response({
            "stats": {
                "total_hafiz": total_hafiz,
                "confirmed_hafiz": confirmed_hafiz,
                "unconfirmed_hafiz": unconfirmed_hafiz,
                "total_egitmen": total_egitmen,
                "assigned_hafiz": assigned_hafiz,   
                "hafizlar":hafizs.values("id", "full_name","agent","active")             
            },            
            "alerts": alerts,            
        })

class HafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs.get("agent_id")
        return api_models.Hafiz.objects.filter(agent_id=agent_id).select_related("user", "hdm_egitmen").prefetch_related("dersler")
       
class LiveLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = api_models.LiveLesson.objects.all()
    serializer_class = api_serializer.LiveLessonSerializer
    
class CombinedEventListAPIView(APIView):    
    # permission_classes = [IsAuthenticated, IsGeneralTeacher]
    
    def get(self, request, user_id): 
        print(request)
        print(request.user.profile.role)   
        try:
            user = User.objects.get(id=user_id)            
        except User.DoesNotExist:
            raise PermissionDenied("Kullanıcı bulunamadı.")

        events = api_models.ESKEPEvent.objects.filter(owner_id=user_id)
        live_lessons = api_models.LiveLesson.objects.filter(owner_id=user_id)

        serialized_data = []

        for event in events:
            serialized_data.append({
                "id": event.id,
                "title": event.title,
                "date": event.date,
                "background_color": event.background_color,
                "border_color": event.border_color,
                "type": "event"
            })

        for lesson in live_lessons:
            serialized_data.append({
                "id": lesson.id,
                "title": lesson.title,
                "date": lesson.datetime,
                "background_color": "#28a745",
                "border_color": "#1e7e34",
                "type": "live_lesson"
            })

        return Response(serialized_data)
    
class KoordinatorByRoleAPIView(APIView):
    permission_classes = [IsGeneralKoordinator]
    
    def get(self, request):
        role_name = request.query_params.get("role")
        try:
            role = api_models.KoordinatorRole.objects.get(name=role_name)
            coordinators = api_models.Koordinator.objects.filter(roles=role)
            serializer = api_serializer.KoordinatorSerializer(coordinators, many=True)
            return Response(serializer.data)
        except api_models.KoordinatorRole.DoesNotExist:
            return Response({"error": "Rol bulunamadı"}, status=400)
        
class BranchListAPIView(generics.ListAPIView):    
    queryset = api_models.Branch.objects.all()
    serializer_class = api_serializer.BranchSerializer
    
class EducationLevelListAPIView(generics.ListAPIView):
    queryset = api_models.EducationLevel.objects.all()
    serializer_class = api_serializer.EducationLevelSerializer
    
# LIST
class EducatorVideoLinkListAPIView(generics.ListAPIView):
    queryset = api_models.EducatorVideoLink.objects.select_related("instructor").order_by("-created_at")
    serializer_class = api_serializer.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "videoUrl"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        qs = super().get_queryset()
        ins_id = self.request.query_params.get("instructor_id")
        if ins_id:
            qs = qs.filter(instructor_id=ins_id)
        return qs

class EducatorVideoLinkCreateAPIView(generics.CreateAPIView):
    queryset = api_models.EducatorVideoLink.objects.all()
    serializer_class = api_serializer.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]

    def perform_create(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            # Koordinatör başka eğitmen için instructor_id geçebilir
            serializer.save()
            return

        # Eğitmen ise kendi adına kaydet
        educator = get_teacher_for_user(user)
        if not educator:
            raise PermissionDenied("Bu kullanıcı için Eğitmen kaydı bulunamadı.")
        serializer.save(instructor=educator)

class EducatorVideoLinkUpdateAPIView(generics.UpdateAPIView):
    queryset = api_models.EducatorVideoLink.objects.all()
    serializer_class = api_serializer.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, CanModifyVideoLink]
    lookup_field = "pk"

    def perform_update(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            # Koordinatör güncellerken instructor değişebilir
            serializer.save()
            return

        # Eğitmen güncelliyorsa instructor hep kendi olmalı
        educator = get_teacher_for_user(user)
        if not educator:
            raise PermissionDenied("Bu kullanıcı için Eğitmen (Educator) kaydı bulunamadı.")
        serializer.save(instructor=educator)
# DELETE
class EducatorVideoLinkDeleteAPIView(generics.DestroyAPIView):
    queryset = api_models.EducatorVideoLink.objects.all()
    serializer_class = api_serializer.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, CanModifyVideoLink]
    lookup_field = "pk"

class EducatorVideoCreateAPIView(generics.CreateAPIView):
    queryset = api_models.EducatorVideo.objects.all()
    serializer_class = api_serializer.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        user = self.request.user

        # Koordinatör: instructor_id verilmişse o öğretmen adına kaydet, yoksa kendisi öğretmense ona yaz
        if is_eskep_koordinator(user):
            ins_id = self.request.data.get("instructor_id")
            if ins_id:
                try:
                    teacher = api_models.Teacher.objects.get(pk=int(ins_id))
                except (api_models.Teacher.DoesNotExist, ValueError, TypeError):
                    raise PermissionDenied("Geçersiz eğitmen (instructor_id).")
            else:
                teacher = get_teacher_for_user(user)
                if not teacher:
                    raise PermissionDenied("Eğitmen bulunamadı. (Koordinatör için instructor_id verilebilir.)")
            serializer.save(instructor=teacher)
            return

        # Öğretmen: sadece kendisi
        teacher = get_teacher_for_user(user)
        if not teacher:
            raise PermissionDenied("Eğitmen kaydınız/rolünüz bulunamadı.")
        serializer.save(instructor=teacher)

# LIST
class EducatorVideoListAPIView(generics.ListAPIView):
    """
    Koordinatör: tüm kayıtları görebilir (opsiyonel instructor_id parametresi ile filtreler).
    Öğretmen: sadece kendi videolarını görür.
    """
    serializer_class = api_serializer.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]
    queryset = api_models.EducatorVideo.objects.select_related("instructor").order_by("-created_at")
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if is_eskep_koordinator(user):
            ins_id = self.request.query_params.get("instructor_id")
            if ins_id:
                try:
                    ins_id = int(ins_id)
                    qs = qs.filter(instructor_id=ins_id)
                except ValueError:
                    qs = qs.none()
            return qs

        # Öğretmen: kendi kayıtları
        teacher = get_teacher_for_user(user)
        if not teacher:
            return qs.none()
        return qs.filter(instructor_id=teacher.id)


# UPDATE
class EducatorVideoUpdateAPIView(generics.UpdateAPIView):
    """
    Koordinatör: isterse instructor_id göndererek videonun sahibini değiştirebilir.
    Öğretmen: sadece kendi videosunu güncelleyebilir ve sahibi değiştirilemez.
    """
    serializer_class = api_serializer.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher, CanModifyVideoLink]
    queryset = api_models.EducatorVideo.objects.all()
    lookup_field = "pk"

    def perform_update(self, serializer):
        user = self.request.user

        if is_eskep_koordinator(user):
            # Koordinatör instructor değiştirmek isterse:
            ins_id = self.request.data.get("instructor_id")
            if ins_id:
                try:
                    teacher = api_models.Teacher.objects.get(pk=int(ins_id))
                except (api_models.Teacher.DoesNotExist, ValueError, TypeError):
                    raise PermissionDenied("Geçersiz eğitmen (instructor_id).")
                serializer.save(instructor=teacher)
                return
            serializer.save()
            return

        # Öğretmen: her zaman kendisi
        teacher = get_teacher_for_user(user)
        if not teacher:
            raise PermissionDenied("Eğitmen kaydınız/rolünüz bulunamadı.")
        serializer.save(instructor=teacher)


# DELETE
class EducatorVideoDeleteAPIView(generics.DestroyAPIView):
    """
    Koordinatör: her şeyi silebilir.
    Öğretmen: sadece kendi videosunu silebilir.
    """
    serializer_class = api_serializer.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher, CanModifyVideoLink]
    queryset = api_models.EducatorVideo.objects.all()
    lookup_field = "pk"
        
class DersAtamasiAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.DersAtamasiSerializer
    # performansı da iyileştir:
    def get_queryset(self):
        qs = api_models.DersAtamasi.objects.select_related("hafiz", "instructor").all()
        hafiz_id = self.request.query_params.get("hafiz")

        # Boş/None/“null”/“0” durumlarını ele
        if hafiz_id and hafiz_id not in ("null", "None", "0"):
            try:
                qs = qs.filter(hafiz_id=int(hafiz_id))
            except ValueError:
                qs = qs.none()  # geçersiz parametre ise boş liste dön
        return qs
    
class DersAtamasiDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return api_models.DersAtamasi.objects.get(pk=pk)
        except api_models.DersAtamasi.DoesNotExist:
            return None

    def get(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        serializer = api_serializer.DersAtamasiSerializer(ders)
        return Response(serializer.data)

    def put(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        serializer = api_serializer.DersAtamasiSerializer(ders, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        ders.delete()
        return Response(status=204)
    
class HafizAPIView(APIView):
    def get(self, request):
        hafizlar = api_models.Hafiz.objects.all()
        serializer = api_serializer.HafizSerializer(hafizlar, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = api_serializer.HafizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class HafizDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return api_models.Hafiz.objects.get(pk=pk)
        except api_models.Hafiz.DoesNotExist:
            return None

    def get(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        serializer = api_serializer.HafizSerializer(hafiz)
        return Response(serializer.data)

    def put(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        serializer = api_serializer.HafizSerializer(hafiz, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        hafiz.delete()
        return Response(status=204)
    
def human_size(num, suffix="B"):
    # basit boyut formatlayıcı
    for unit in ["", "K", "M", "G", "T"]:
        if abs(num) < 1024.0:
            return f"{num:3.1f} {unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f} P{suffix}"

def abs_url(request, f_or_url):
    url = None
    try:
        url = getattr(f_or_url, "url")
    except Exception:
        url = f_or_url
    if not url:
        return None
    return request.build_absolute_uri(url) if (request and isinstance(url, str) and url.startswith("/")) else url


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/instructors/
      - ?q=...               -> full_name, email arar
      - ?ordering=full_name  -> sıralama
      - ?sub_role=...        -> varsayılan: 'AkademiEgitmen'
      - ?only_teachers=1     -> sadece Teacher bağlı kullanıcıları döndür
    Dönen: teacher.roles içinde belirtilen alt role sahip kullanıcılar.
    """
    serializer_class = api_serializer.InstructorListSerializer
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "email", "profile__full_name"]
    ordering_fields = ["date_joined", "full_name"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        role_name = self.request.query_params.get("sub_role", "AkademiEgitmen")
        only_teachers = self.request.query_params.get("only_teachers") in ("1", "true", "True")

        qs = (
            User.objects.filter(active=True)
            .select_related("profile", "teacher")
            .prefetch_related("teacher__roles")
            .filter(teacher__roles__name=role_name)
            .distinct()
        )

        if only_teachers:
            qs = qs.filter(teacher__isnull=False)

        # 💡 Sayaçlar için annotate
        qs = qs.annotate(
            video_link_count=Count("teacher__video_links", distinct=True),
            uploaded_video_count=Count("teacher__uploaded_videos", distinct=True),
            document_count=Count("teacher__uploaded_documents", distinct=True),
        )
        return qs

    # ---- Detay (profil için) ----
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        profile = getattr(user, "profile", None)

        data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "about": getattr(teacher, "about", "") or getattr(profile, "about", "") or "",
            "country": getattr(teacher, "country", "") or "",
            "image": None,
        }
        # image öncelik Teacher -> Profile
        if teacher and getattr(teacher, "image", None):
            data["image"] = abs_url(request, teacher.image)
        elif profile and getattr(profile, "image", None):
            data["image"] = abs_url(request, profile.image)

        return Response(data)

    # ---- VIDEOS: YouTube linkleri + yüklenen video dosyaları (tek listede) ----
    @action(detail=True, methods=["get"])
    def videos(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        # YouTube linkleri
        links_qs = api_models.EducatorVideoLink.objects.filter(instructor=teacher).only(
            "id", "title", "videoUrl", "created_at"
        )

        # Yüklenen videolar (file)
        vids_qs = api_models.EducatorVideo.objects.filter(instructor=teacher).only(
            "id", "title", "file", "created_at"
        )

        items = []
        for v in links_qs:
            items.append({
                "id": f"link-{v.id}",
                "title": v.title,
                "source": "YouTube",
                "url": v.videoUrl,
                "created_at": v.created_at,
            })
        for v in vids_qs:
            items.append({
                "id": f"upload-{v.id}",
                "title": v.title,
                "source": "Upload",
                "url": abs_url(request, v.file) if v.file else None,
                "created_at": v.created_at,
            })

        # created_at’e göre yeni → eski
        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        # ISO string biçimine çevir (opsiyonel)
        for it in items:
            if it["created_at"]:
                it["created_at"] = it["created_at"].isoformat()
        return Response(items)

    # ---- DOCUMENTS: Eğitmen dökümanları ----
    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        docs = api_models.EducatorDocument.objects.filter(instructor=teacher).only(
            "id", "title", "description", "file", "mime_type", "tags", "created_at"
        ).order_by("-created_at")

        data = []
        for d in docs:
            data.append({
                "id": str(d.id),
                "title": d.title,
                "category": d.tags or None,             # frontend 'category' bekliyordu
                "summary": (d.description or "")[:200], # basit özet
                "view_url": abs_url(request, d.file),
                "mime": d.mime_type or None,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            })
        return Response(data)

    # ---- FILES: (isteğe bağlı) Videoların dosyaları + Döküman dosyaları tek listede ----
    @action(detail=True, methods=["get"])
    def files(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        out = []

        # Dökümanlar
        for d in api_models.EducatorDocument.objects.filter(instructor=teacher):
            size = getattr(d.file, "size", None) or d.file_size or 0
            out.append({
                "id": f"doc-{d.id}",
                "name": getattr(d, "original_filename", None) or (d.file.name if d.file else d.title),
                "mime": d.mime_type or None,
                "size": size,
                "size_readable": human_size(size) if size else None,
                "download_url": abs_url(request, d.file),
                "created_at": d.created_at.isoformat() if d.created_at else None,
            })

        # Yüklenen videolar (dosya)
        for v in api_models.EducatorVideo.objects.filter(instructor=teacher):
            if not v.file:
                continue
            size = getattr(v.file, "size", None)
            out.append({
                "id": f"vid-{v.id}",
                "name": v.file.name,
                "mime": None,
                "size": size,
                "size_readable": human_size(size) if size else None,
                "download_url": abs_url(request, v.file),
                "created_at": v.created_at.isoformat() if v.created_at else None,
            })

        # Yeni → eski
        out.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return Response(out)

    # ---- CALENDAR: (şimdilik boş; ileride program modelinle doldur) ----
    @action(detail=True, methods=["get"])
    def calendar(self, request, pk=None):
        # Uygun bir Event modeli eklediğinde burayı doldurabilirsin
        # Şimdilik boş liste dönüyoruz ki frontend modal'ı hatasız açılsın.
        return Response([])
    
@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsGeneralKoordinator])
def delete_purchase(request, kind, pk, user_id):
    video = _get_video_object(kind, pk)
    ct = ContentType.objects.get_for_model(video.__class__)
    M.VideoPurchase.objects.filter(content_type=ct, object_id=video.pk, user_id=user_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsGeneralKoordinator])
def delete_enrollment(request, kind, pk, user_id):
    video = _get_video_object(kind, pk)
    if kind == "link":
        M.SavedVideo.objects.filter(video=video, user_id=user_id).delete()
    else:
        M.VideoEnrollment.objects.filter(video=video, user_id=user_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def _get_video_object(kind, pk):
    if kind == "link":
        return get_object_or_404(M.EducatorVideoLink, pk=pk)
    if kind == "file":
        return get_object_or_404(M.EducatorVideo, pk=pk)
    raise ValueError("Invalid kind")


class VideoBuyersView(APIView):
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get(self, request, kind, pk):
        video = _get_video_object(kind, pk)

        # Purchases (Generic FK)
        ct = ContentType.objects.get_for_model(video.__class__)
        purchases = (
            M.VideoPurchase.objects
            .filter(content_type=ct, object_id=video.pk)
            .select_related("user", "user__teacher", "user__profile")
            .order_by("-created_at")
        )

        rows = [
            {"user": S.UserMiniSerializer(p.user, context={"request": request}).data,
             "created_at": p.created_at}
            for p in purchases
        ]
        return Response(rows)


class VideoEnrolledView(APIView):
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get(self, request, kind, pk):
        video = _get_video_object(kind, pk)

        if kind == "link":
            # SavedVideo(user, video=EducatorVideoLink)
            items = (
                M.SavedVideo.objects
                .filter(video=video)
                .select_related("user", "user__teacher", "user__profile")
                .order_by("-created_at")
            )
            rows = [
                {"user": S.UserMiniSerializer(s.user, context={"request": request}).data,
                 "created_at": s.created_at}
                for s in items
            ]
            return Response(rows)

        # kind == "file" → VideoEnrollment(user, video=EducatorVideo)
        items = (
            M.VideoEnrollment.objects
            .filter(video=video)
            .select_related("user", "user__teacher", "user__profile")
            .order_by("-created_at")
        )
        rows = [
            {"user": S.UserMiniSerializer(e.user, context={"request": request}).data,
             "created_at": e.created_at}
            for e in items
        ]
        return Response(rows)
    
def abs_url(request, fobj):
    """
    FileField ya da url string'i için mutlak URL döndür.
    """
    if not fobj:
        return None
    try:
        url = fobj.url  # FileField
        return request.build_absolute_uri(url)
    except Exception:
        # Düz string olabilir
        return str(fobj)

class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/students/
      - ?q=...                 -> full_name, email arar
      - ?ordering=full_name    -> sıralama
      - ?sub_role=...          -> varsayılan: 'AkademiOgrenci'
      - ?only_students=1       -> sadece Ogrenci bağlı kullanıcılar
    Dönen: ogrenci.roles içinde belirtilen alt-role sahip kullanıcılar.
    """
    serializer_class = api_serializer.StudentListSerializer
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["full_name", "email", "profile__full_name"]
    ordering_fields = ["date_joined", "full_name"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        role_name = self.request.query_params.get("sub_role", "AkademiOgrenci")
        only_students = self.request.query_params.get("only_students") in ("1", "true", "True")

        qs = (
            User.objects.filter(active=True)
            .select_related("profile", "ogrenci")       # ogrenci.image & profile.image için
            .prefetch_related("ogrenci__roles")         # M2M optimizasyonu
            .distinct()
        )

        # Öğrenci alt-rolünden filtrele
        qs = qs.filter(ogrenci__roles__name=role_name)

        if only_students:
            qs = qs.filter(ogrenci__isnull=False)

        # İstersen sayaç ekleyebilirsin (şimdilik gerekmiyor)
        # qs = qs.annotate(
        #     enrolled_count=Count("enrolledcourse", distinct=True),
        # )

        return qs

    # ---- PROFIL ----
    @action(detail=True, methods=["get"], url_path="profile")
    def profile(self, request, pk=None):
        user = self.get_object()
        ogrenci = getattr(user, "ogrenci", None)
        profile = getattr(user, "profile", None)

        data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "about": getattr(ogrenci, "about", "") or getattr(profile, "about", "") or "",
            "country_name": getattr(ogrenci, "country", "") or getattr(profile, "country", "") or "",
            "city_name": getattr(profile, "city", "") or "",
            "image": None,
        }
        if ogrenci and getattr(ogrenci, "image", None):
            data["image"] = abs_url(request, ogrenci.image)
        elif profile and getattr(profile, "image", None):
            data["image"] = abs_url(request, profile.image)
        return Response(data)

    # ---- COURSES: öğrencinin aldığı derslerin listesi ----
    @action(detail=True, methods=["get"], url_path="courses")
    def courses(self, request, pk=None):
        """
        Basit örnek: EnrolledCourse üzerinden o öğrencinin derslerini döndür.
        """
        user = self.get_object()
        # EnrolledCourse modelin: user(FK), course(FK) varsayıldı
        enrolls = (
            api_models.EnrolledCourse.objects
            .filter(user=user)
            .select_related("course", "course__teacher")
            .order_by("-id")
        )

        out = []
        for e in enrolls:
            course = getattr(e, "course", None)
            teacher = getattr(course, "teacher", None)
            out.append({
                "id": getattr(course, "id", e.id),
                "title": getattr(course, "title", "-"),
                "teacher_name": getattr(teacher, "full_name", None) or getattr(getattr(teacher, "user", None), "full_name", None),
                "level": getattr(course, "level", None) or getattr(course, "education_level", None),
                "status": getattr(e, "status", "Aktif"),
            })
        return Response(out)

    # ---- ENROLLMENTS: kayıt satırlarını (tarih, ilerleme, not) döndür ----
    @action(detail=True, methods=["get"], url_path="enrollments")
    def enrollments(self, request, pk=None):
        user = self.get_object()
        enrolls = (
            api_models.EnrolledCourse.objects
            .filter(user=user)
            .select_related("course")
            .order_by("-id")
        )

        out = []
        for e in enrolls:
            course = getattr(e, "course", None)
            out.append({
                "id": e.id,
                "course_title": getattr(course, "title", "-"),
                "enrolled_at": getattr(e, "created_at", None) or getattr(e, "date", None),
                "progress": getattr(e, "progress", None),
                "note": getattr(e, "note", None),
            })
        # ISO string'e çevir (opsiyonel)
        for it in out:
            if it["enrolled_at"]:
                try:
                    it["enrolled_at"] = it["enrolled_at"].isoformat()
                except Exception:
                    pass
        return Response(out)