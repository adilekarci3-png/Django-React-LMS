# api/views/odevs.py
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import serializers

from api.views.utils import KoordinatorLookupMixin
from api.views.permissions import IsEskepKoordinatorOrTeacher

# from api import serializers as api_serializer
from .base import BaseListAPIView, BaseCreateAPIView, BaseUpdateAPIView,BaseDestroyAPIView 
# from api import models as api_models
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from .. import models as api_models, serializers as api_serializer
from rest_framework.response import Response
User = get_user_model()

class EskepInstructorOdevListAPIView(KoordinatorLookupMixin, BaseListAPIView):
    serializer_class   = api_serializer.OdevListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        koordinator = self.get_koordinator()
        if not koordinator:
            return api_models.Odev.objects.none()

        base_qs = api_models.Odev.objects.all() if self.is_genel_koordinator(koordinator) \
                  else api_models.Odev.objects.filter(koordinator=koordinator)

        prefetch_items = Prefetch(
            "variantodev_set__variantOdev_items",
            queryset=api_models.VariantOdevItem.objects.all(),
        )

        return (
            base_qs
            .select_related(
                "inserteduser", "koordinator", "koordinator__user", "category",
                "inserteduser__stajer", "inserteduser__ogrenci"
            )
            .prefetch_related("variantodev_set", prefetch_items)
            .order_by("-date", "-id")
            .distinct()
        )

class EskepStajerOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        stajer_id = self.kwargs["stajer_id"]
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser = stajer.user
        return api_models.Odev.objects.filter(inserteduser=inserteduser)


class EskepOgrenciOdevListAPIView(BaseListAPIView):
    serializer_class = api_serializer.OdevSerializer

    def get_queryset(self):
        ogrenci_id = self.kwargs["ogrenci_id"]
        ogrenci = api_models.Ogrenci.objects.get(user_id=ogrenci_id)
        inserteduser = ogrenci.user
        return api_models.Odev.objects.filter(inserteduser=inserteduser)


class EskepOdevCreateAPIView(BaseCreateAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
        self.extract_variants("odev", instance, api_models.VariantOdev, api_models.VariantOdevItem)

    def _get_users(self):
        inserteduser_id = self.request.data.get("inserteduser")
        inserteduser_user = None
        koordinator = None
        if inserteduser_id:
            try:
                inserteduser_user = User.objects.get(id=inserteduser_id)
                koordinator = self._get_koordinator(inserteduser_user)
            except User.DoesNotExist:
                raise serializers.ValidationError("Geçersiz kullanıcı ID")

        if inserteduser_user and not koordinator:
            raise serializers.ValidationError("Hazırlayan kullanıcının koordinatörü bulunamadı.")
        return inserteduser_user, koordinator

    def _get_koordinator(self, inserteduser_user):
        # BaseVariantMixin ile aynı mantık
        try:
            stajer = api_models.Stajer.objects.get(user=inserteduser_user)
            return stajer.instructor
        except api_models.Stajer.DoesNotExist:
            try:
                ogrenci = api_models.Ogrenci.objects.get(user=inserteduser_user)
                return ogrenci.instructor
            except api_models.Ogrenci.DoesNotExist:
                return None


class EskepOdevUpdateAPIView(BaseUpdateAPIView):
    """
    path: .../eskepstajer/odev-edit/<int:id>/
    """
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer
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

    # --- Variant Güncelleme ---
    def _update_variants(self, odev: api_models.Odev):
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantOdev
        VariantItem = api_models.VariantOdevItem

        # silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, odev=odev)
                v.delete()
            except Variant.DoesNotExist:
                continue

        # gönderilen indices
        for i in self._find_indices(prefix="variants"):
            vid = data.get(f"variants[{i}][id]")
            title = data.get(f"variants[{i}][title]")
            pdf_field_name = f"variants[{i}][pdf]"
            pdf = files.get(pdf_field_name)

            if not title:
                raise serializers.ValidationError({f"variants[{i}][title]": "Bölüm adı zorunludur."})

            if vid:
                try:
                    variant = Variant.objects.get(id=vid, odev=odev)
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
                variant = Variant.objects.create(odev=odev, title=title)
                if pdf:
                    VariantItem.objects.create(variant=variant, file=pdf)

    # ---- yardımcılar ----
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
    
class EskepOdevListAPIView(BaseListAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

class EskepOdevDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer



class EskepOdevListAPIView(BaseListAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

class EskepOdevDestroyAPIView(BaseDestroyAPIView):
    queryset = api_models.Odev.objects.all()
    serializer_class = api_serializer.OdevSerializer

class EskepInstructorOdevDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepinstructor/odev-detail/<int:odev_id>/<int:koordinator_id>/
    """
    serializer_class = api_serializer.OdevSerializer
    lookup_url_kwarg = "odev_id"

    def get_queryset(self):
        koordinator_id = self.kwargs.get("koordinator_id")
        if koordinator_id is None:
            raise NotFound("koordinator_id eksik")
        try:
            koordinator_id = int(koordinator_id)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz koordinator_id")
        return api_models.Odev.objects.filter(koordinator_id=koordinator_id)

    def get_object(self):
        odev_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            odev_id = int(odev_id)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz odev_id")
        return get_object_or_404(self.get_queryset(), pk=odev_id)

class EskepInstructorOdevDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.OdevSerializer
    lookup_url_kwarg = "odev_id"

    def get_queryset(self):
        koordinator_id = self.kwargs.get("koordinator_id")
        if koordinator_id is None:
            raise NotFound("koordinator_id eksik")
        try:
            koordinator_id = int(koordinator_id)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz koordinator_id")

        return api_models.Odev.objects.filter(koordinator_id=koordinator_id)

    def get_object(self):
        odev_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            odev_id = int(odev_id)
        except (TypeError, ValueError):
            raise NotFound("Geçersiz odev_id")

        return generics.get_object_or_404(self.get_queryset(), pk=odev_id)
    
class EskepInstructorOdevDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepinstructor/odev-detail/<int:odev_id>/<int:koordinator_id>/
    """
    serializer_class = api_serializer.OdevSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "odev_id"

    def get_queryset(self):
        try:
            koordinator_id = int(self.kwargs.get("koordinator_id"))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz koordinator_id")
        return api_models.Odev.objects.filter(koordinator_id=koordinator_id)

    def get_object(self):
        try:
            odev_id = int(self.kwargs.get(self.lookup_url_kwarg))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz odev_id")
        return get_object_or_404(self.get_queryset(), pk=odev_id)


class EskepStajerOdevDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepstajer/odev-detail/<user_id>/<id>/
    """
    serializer_class = api_serializer.OdevSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_object(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return get_object_or_404(api_models.Odev, inserteduser=user, id=self.kwargs["id"])


class InstructorOdevCompletedCreateAPIView(generics.CreateAPIView):
    """
    Body: { "user_id": ..., "odev_id": ..., "variant_item_id": ... }
    Toggle CompletedOdev
    """
    serializer_class = api_serializer.CompletedLessonSerializer  # yalnızca dummy amaçlı
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user = get_object_or_404(User, id=request.data.get("user_id"))
        odev = get_object_or_404(api_models.Odev, id=request.data.get("odev_id"))
        variant_item = get_object_or_404(
            api_models.VariantOdevItem, variant_item_id=request.data.get("variant_item_id")
        )

        existing = api_models.CompletedOdev.objects.filter(
            user=user, odev=odev, variant_item=variant_item
        ).first()

        if existing:
            existing.delete()
            return Response({"message": "Ödev Tamamlanmadı olarak işaretlendi"})
        else:
            api_models.CompletedOdev.objects.create(
                user=user, odev=odev, variant_item=variant_item
            )
            return Response({"message": "Ödev Tamamlandı olarak işaretlendi"})
        
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
    
class InstructorRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewOdevSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = get_object_or_404(User, id=user_id)
        return api_models.ReviewOdev.objects.get(id=review_id, user=user)
    
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