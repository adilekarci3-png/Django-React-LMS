# api/views/reports.py
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated,AllowAny

from api.views.base import BaseListAPIView
from api import models as api_models
from api import serializers as api_serializer
from api.views.utils import KoordinatorLookupMixin
from utils.permissions import IsEskepKoordinatorOrTeacher
from .base import BaseCreateAPIView, BaseUpdateAPIView, BaseListAPIView, BaseDestroyAPIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers
from rest_framework.exceptions import NotFound

User = get_user_model()

class EskepInstructorDersSonuRaporuListAPIView(KoordinatorLookupMixin, BaseListAPIView):
    serializer_class   = api_serializer.DersSonuRaporuSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        koordinator = self.get_koordinator()
        if not koordinator:
            return api_models.DersSonuRaporu.objects.none()

        base_qs = api_models.DersSonuRaporu.objects.all() if self.is_genel_koordinator(koordinator) \
                  else api_models.DersSonuRaporu.objects.filter(koordinator=koordinator)

        return (
            base_qs
            .select_related("inserteduser", "koordinator", "koordinator__user", "category")
            .order_by("-date", "-id")
            .distinct()
        )

class EskepStajerDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        stajer_id = self.kwargs["stajer_id"]
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser = stajer.user
        return api_models.DersSonuRaporu.objects.filter(inserteduser=inserteduser)


class EskepOgrenciDersSonuRaporuListAPIView(BaseListAPIView):
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs["ogrenci_id"]
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)
        inserteduser = ogrenci.user
        return api_models.DersSonuRaporu.objects.filter(inserteduser=inserteduser)
    
class EskepDersSonuRaporuCreateAPIView(BaseCreateAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
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
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer
    lookup_field = "id"

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        if not lookup:
            raise serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    def _update_variants(self, derssonuraporu: api_models.DersSonuRaporu):
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantDersSonuRaporu
        VariantItem = api_models.VariantDersSonuRaporuItem

        # silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, derssonuraporu=derssonuraporu)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # güncelle/ekle
        for i in self._find_indices(prefix="variants"):
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf = files.get(f"variants[{i}][pdf]")

            if not title:
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                try:
                    variant = Variant.objects.get(id=vid, derssonuraporu=derssonuraporu)
                except Variant.DoesNotExist:
                    raise serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})
                variant.title = title
                variant.save()

                item = VariantItem.objects.filter(variant=variant).first()
                if pdf:
                    if item:
                        item.file = pdf
                        item.save()
                    else:
                        VariantItem.objects.create(variant=variant, file=pdf)
            else:
                variant = Variant.objects.create(derssonuraporu=derssonuraporu, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)

    # yardımcılar
    def _listify(self, val):
        if isinstance(val, (list, tuple)): return list(val)
        if isinstance(val, str): return [v for v in val.split(",") if v]
        return []

    def _find_indices(self, prefix="variants"):
        indices = set()
        for key in self.request.data.keys():
            if key.startswith(f"{prefix}[") and "][" in key:
                try:
                    part = key.split("[", 1)[1]
                    idx = part.split("]", 1)[0]
                    indices.add(int(idx))
                except Exception:
                    continue
        return sorted(indices)


class EskepDersSonuRaporuDeleteAPIView(generics.DestroyAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]


class EskepDersSonuRaporuListAPIView(BaseListAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer


class EskepDersSonuRaporuDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.DersSonuRaporu.objects.all()
    serializer_class = api_serializer.DersSonuRaporuSerializer


class EskepInstructorDersSonuRaporuDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepinstructor/derssonuraporu-detail/<int:koordinator_id>/<int:derssonuraporu_id>/
    """
    serializer_class = api_serializer.DersSonuRaporuSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "derssonuraporu_id"

    def get_queryset(self):
        try:
            koordinator_id = int(self.kwargs.get("koordinator_id"))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz koordinator_id")
        return (
            api_models.DersSonuRaporu.objects.filter(koordinator_id=koordinator_id)
            .select_related("inserteduser", "koordinator", "koordinator__user", "category")
        )

    def get_object(self):
        try:
            rapor_id = int(self.kwargs.get(self.lookup_url_kwarg))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz derssonuraporu_id")
        return get_object_or_404(self.get_queryset(), pk=rapor_id)


class EskepStajerDersSonuRaporuDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepstajer/derssonuraporu-detail/<user_id>/<id>/
    """
    serializer_class = api_serializer.DersSonuRaporuSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_object(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return get_object_or_404(api_models.DersSonuRaporu, inserteduser=user, id=self.kwargs["id"])