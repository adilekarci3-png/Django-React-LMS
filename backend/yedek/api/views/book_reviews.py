
from django.db.models import Q

from api.views.base import BaseListAPIView, BaseDestroyAPIView, BaseCreateAPIView, BaseUpdateAPIView
from api import models as api_models
from api import serializers as api_serializer
from rest_framework import generics
from django.shortcuts import get_object_or_404

from rest_framework.permissions import AllowAny, IsAuthenticated

from api.views.utils import KoordinatorLookupMixin
from utils.permissions import IsEskepKoordinatorOrTeacher
from .. import models as api_models, serializers as api_serializer

from rest_framework.exceptions import NotFound
from .base import BaseListAPIView, BaseDestroyAPIView
from django.contrib.auth import get_user_model
User = get_user_model()

class EskepInstructorKitapTahliliListAPIView(KoordinatorLookupMixin, BaseListAPIView):
    serializer_class    = api_serializer.KitapTahliliSerializer
    permission_classes  = [IsAuthenticated]

    def get_queryset(self):
        koordinator = self.get_koordinator()
        if not koordinator:
            return api_models.KitapTahlili.objects.none()

        base_qs = api_models.KitapTahlili.objects.all() if self.is_genel_koordinator(koordinator) \
                  else api_models.KitapTahlili.objects.filter(koordinator=koordinator)

        return (
            base_qs
            .select_related(
                "inserteduser", "koordinator", "koordinator__user", "category",
                "inserteduser__stajer", "inserteduser__ogrenci"
            )
            .order_by("-date", "-id")
            .distinct()
        )


class EskepStajerKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        stajer_id = self.kwargs["stajer_id"]
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser = stajer.user
        return api_models.KitapTahlili.objects.filter(inserteduser=inserteduser)


class EskepOgrenciKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs["ogrenci_id"]
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)
        inserteduser = ogrenci.user
        return api_models.KitapTahlili.objects.filter(inserteduser=inserteduser)

class EskepKitapTahliliDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/kitaptahlili/<int:id>/
    """
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]

class EskepKitapTahliliListAPIView(BaseListAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

class EskepKitapTahliliDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer  

# --- CREATE / UPDATE ---

class EskepKitapTahliliCreateAPIView(BaseCreateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        self.extract_variants('kitaptahlili', instance,
                              api_models.VariantKitapTahlili,
                              api_models.VariantKitapTahliliItem)

    def _get_users(self):
        from django.contrib.auth import get_user_model
        from rest_framework import serializers as drf_serializers
        User = get_user_model()

        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self.get_koordinator_by_user(inserteduser_user)
                if not koordinator:
                    raise drf_serializers.ValidationError("Koordinatör bulunamadı.")
            except User.DoesNotExist:
                raise drf_serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator


class EskepKitapTahliliUpdateAPIView(BaseUpdateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
    lookup_field = "id"

    def get_object(self):
        from rest_framework import serializers as drf_serializers
        lookup = self.kwargs.get(self.lookup_field) or self.request.data.get("id")
        if not lookup:
            raise drf_serializers.ValidationError("Güncelleme için 'id' gerekli.")
        obj = get_object_or_404(self.get_queryset(), id=lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        instance = serializer.save()
        self._update_variants(instance)

    def _update_variants(self, kitaptahlili: api_models.KitapTahlili):
        from rest_framework import serializers as drf_serializers
        data = self.request.data
        files = self.request.FILES
        Variant = api_models.VariantKitapTahlili
        VariantItem = api_models.VariantKitapTahliliItem

        # delete list
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                Variant.objects.get(id=vid, kitaptahlili=kitaptahlili).delete()
            except Variant.DoesNotExist:
                continue

        # upsert
        for i in self._find_indices(prefix="variants"):
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)

            if not title:
                raise drf_serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                try:
                    variant = Variant.objects.get(id=vid, kitaptahlili=kitaptahlili)
                except Variant.DoesNotExist:
                    raise drf_serializers.ValidationError({f"variants[{i}][id]": "Geçersiz variant id"})

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
                variant = Variant.objects.create(kitaptahlili=kitaptahlili, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)

    # helpers
    def _listify(self, val):
        if isinstance(val, (list, tuple)):
            return list(val)
        if isinstance(val, str):
            return [v for v in val.split(",") if v]
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


# --- DELETE / LIST / DESTROY ---

class EskepKitapTahliliDeleteAPIView(generics.DestroyAPIView):
    """
    DELETE /api/v1/eskepstajer/kitaptahlili/<int:id>/
    """
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
    lookup_field = "id"
    permission_classes = [IsEskepKoordinatorOrTeacher]


class EskepKitapTahliliListAPIView(BaseListAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer


class EskepKitapTahliliDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer


# --- ROLE-BASED LISTS (zaten varsa tekrar eklemeye gerek yok) ---

class EskepStajerKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        stajer_id = self.kwargs['stajer_id']
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        return api_models.KitapTahlili.objects.filter(inserteduser=stajer.user)


class EskepOgrenciKitapTahliliListAPIView(BaseListAPIView):
    serializer_class = api_serializer.KitapTahliliSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs['ogrenci_id']
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)
        return api_models.KitapTahlili.objects.filter(inserteduser=ogrenci.user)

class EskepInstructorKitapTahliliDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepinstructor/kitaptahlili-detail/<int:koordinator_id>/<int:kitaptahlili_id>/
    """
    serializer_class = api_serializer.KitapTahliliSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "kitaptahlili_id"

    def _resolve_koordinator(self):
        raw = self.kwargs.get("koordinator_id")
        try:
            raw = int(raw)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz koordinator_id")

        return get_object_or_404(
            api_models.Koordinator.objects.select_related("user"),
            Q(id=raw) | Q(user__id=raw),
        )

    def get_queryset(self):
        k = self._resolve_koordinator()
        return (
            api_models.KitapTahlili.objects.filter(
                Q(koordinator=k)
                | Q(inserteduser__stajer__instructor=k)
                | Q(inserteduser__ogrenci__instructor=k)
            )
            .select_related("inserteduser", "koordinator", "koordinator__user", "category")
        )

    def get_object(self):
        try:
            kt_id = int(self.kwargs.get(self.lookup_url_kwarg))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz kitaptahlili_id")
        return get_object_or_404(self.get_queryset(), pk=kt_id)


class EskepStajerKitapTahliliDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepstajer/kitaptahlili-detail/<user_id>/<id>/
    """
    serializer_class = api_serializer.KitapTahliliSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_object(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return get_object_or_404(api_models.KitapTahlili, inserteduser=user, id=self.kwargs["id"])