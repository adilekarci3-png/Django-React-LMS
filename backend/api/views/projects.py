# api/views/projects.py
from django.db.models import Q

from api.views.base import BaseListAPIView
from api import models as api_models
from api import serializers as api_serializer
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import serializers


from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound

from api.views.utils import KoordinatorLookupMixin
from api.views.permissions import IsEskepKoordinatorOrTeacher

from .base import BaseCreateAPIView, BaseDestroyAPIView, BaseUpdateAPIView
User = get_user_model()

class EskepInstructorProjeListAPIView(KoordinatorLookupMixin, BaseListAPIView):
    serializer_class    = api_serializer.EskepProjeSerializer
    permission_classes  = [IsAuthenticated]

    def get_queryset(self):
        koordinator = self.get_koordinator()
        if not koordinator:
            return api_models.EskepProje.objects.none()

        base_qs = api_models.EskepProje.objects.all() if self.is_genel_koordinator(koordinator) \
                  else api_models.EskepProje.objects.filter(koordinator=koordinator)

        return (
            base_qs
            .select_related(
                "inserteduser", "koordinator", "koordinator__user", "category",
                "inserteduser__stajer", "inserteduser__ogrenci"
            )
            .order_by("-date", "-id")
            .distinct()
        )

class EskepStajerProjeListAPIView(BaseListAPIView):
    serializer_class = api_serializer.EskepProjeSerializer

    def get_queryset(self):
        stajer_id = self.kwargs["stajer_id"]
        stajer = api_models.Stajer.objects.get(user_id=stajer_id)
        inserteduser = stajer.user
        return api_models.EskepProje.objects.filter(inserteduser=inserteduser)
    

class EskepKitapTahliliCreateAPIView(BaseCreateAPIView):
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer

    def perform_create(self, serializer):
        inserteduser_user, koordinator = self._get_users()
        instance = serializer.save(inserteduser=inserteduser_user, koordinator=koordinator)
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
    queryset = api_models.KitapTahlili.objects.all()
    serializer_class = api_serializer.KitapTahliliSerializer
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

    def _update_variants(self, kitaptahlili: api_models.KitapTahlili):
        data = self.request.data
        files = self.request.FILES

        Variant = api_models.VariantKitapTahlili
        VariantItem = api_models.VariantKitapTahliliItem

        # silinecekler
        for vid in self._listify(data.getlist("variants_to_delete[]") or data.get("variants_to_delete") or []):
            try:
                v = Variant.objects.get(id=vid, kitaptahlili=kitaptahlili)
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
                    variant = Variant.objects.get(id=vid, kitaptahlili=kitaptahlili)
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
                variant = Variant.objects.create(kitaptahlili=kitaptahlili, title=title)
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


class EskepInstructorProjeDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepinstructor/proje-detail/<int:koordinator_id>/<int:proje_id>/
    koordinator_id: Koordinator.pk veya Koordinator.user_id
    """
    serializer_class = api_serializer.EskepProjeSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "proje_id"

    def _resolve_koordinator(self):
        """
        URL'den gelen koordinator_id hem Koordinator.id hem de Koordinator.user.id
        olabilir. İkisinden birine göre bulmaya çalışıyoruz.
        """
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
        """
        Sadece bu koordinatöre ait projeleri getir.
        EskepProje modelinde 'k' diye bir alan yok; doğru alan 'koordinator'.
        """
        koordinator = self._resolve_koordinator()

        # sadece o koordinatörün projeleri
        qs = (
            api_models.EskepProje.objects
            .filter(koordinator=koordinator)
            .select_related(
                "inserteduser",
                "koordinator",
                "koordinator__user",
                "category",
            )
        )
        return qs

    def get_object(self):
        """
        URL'den gelen proje_id'ye göre, sadece bu koordinatörün projeleri
        içinde arayacağız.
        """
        try:
            proj_id = int(self.kwargs.get(self.lookup_url_kwarg))
        except (TypeError, ValueError):
            raise NotFound("Geçersiz proje_id")

        return get_object_or_404(self.get_queryset(), pk=proj_id)


class EskepStajerProjeDetailAPIView(generics.RetrieveAPIView):
    """
    /eskepstajer/proje-detail/<user_id>/<id>/
    """
    serializer_class = api_serializer.EskepProjeSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_object(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return get_object_or_404(api_models.EskepProje, inserteduser=user, id=self.kwargs["id"])
    
class ProjeListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ProjeSerializer

    def get_queryset(self):
        return api_models.Proje.objects.all()
    
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