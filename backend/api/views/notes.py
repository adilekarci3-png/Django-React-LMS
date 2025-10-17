# api/views/notes.py
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from api import models as api_models
from api import serializers as api_serializer

from django.contrib.auth import get_user_model

from api.views.utils import KoordinatorLookupMixin

User = get_user_model()

class EskepInstructorProjeNoteCreateAPIView(generics.ListCreateAPIView):
    """
    GET/POST /eskepinstructor/proje-note/<koordinator_id>/<proje_id>/
    NOT: Burada Organization tarafındaki Proje + NoteProje kullanılıyor.
    """
    serializer_class = api_serializer.NoteEskepProjeSerializer  # <- projeye uygun serializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs['koordinator_id']
        proje_id = self.kwargs['proje_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        proje = get_object_or_404(api_models.Proje, id=proje_id)
        return api_models.NoteProje.objects.filter(koordinator=koordinator, proje=proje)

    def create(self, request, *args, **kwargs):
        proje_id = self.kwargs['proje_id']
        koordinator_id = self.kwargs['koordinator_id']
        title = request.data.get('title')
        note = request.data.get('note')

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        proje = get_object_or_404(api_models.Proje, id=proje_id)

        api_models.NoteProje.objects.create(
            proje=proje, koordinator=koordinator, note=note, title=title
        )
        return Response({"message": "Not başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED)


class EskepInstructorProjeNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteEskepProjeSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        proje_id = self.kwargs['proje_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']

        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        proje = get_object_or_404(api_models.Proje, id=proje_id)
        note = get_object_or_404(
            api_models.NoteProje,
            koordinator=koordinator,
            proje=proje,
            id=note_id
        )
        return note


class OdevCreateOrUpdateNoteAPIView(generics.GenericAPIView):
    """
    POST   /eskepstajer/odev-note/<koordinator_id>/<odev_id>/
    PATCH  /eskepstajer/odev-note/<koordinator_id>/<odev_id>/<id>/
    DELETE /eskepstajer/odev-note/<koordinator_id>/<odev_id>/<id>/
    """
    serializer_class = api_serializer.NoteOdevSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, koordinator_id, odev_id, id=None):
        odev = get_object_or_404(api_models.Odev, id=odev_id)
        data = request.data.copy()
        data["odev"] = odev.id
        data["koordinator"] = koordinator_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, koordinator_id, odev_id, id):
        note = get_object_or_404(
            api_models.NoteOdev,
            id=id,
            odev_id=odev_id,
            koordinator_id=koordinator_id,
        )
        serializer = self.get_serializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, koordinator_id, odev_id, id):
        note = get_object_or_404(
            api_models.NoteOdev,
            id=id,
            odev_id=odev_id,
            koordinator_id=koordinator_id,
        )
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)

class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = get_object_or_404(api_models.User, id=user_id)
        enrolled = get_object_or_404(api_models.EnrolledCourse, enrollment_id=enrollment_id)
        note = get_object_or_404(api_models.Note, user=user, course=enrolled.course, id=note_id)
        return note

class EskepInstructorOdevNoteCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /eskepinstructor/odev-note/<odev_id>/<koordinator_id>/
    POST /eskepinstructor/odev-note/<odev_id>/<koordinator_id>/
    """
    serializer_class = api_serializer.NoteOdevSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs["koordinator_id"]
        odev_id = self.kwargs["odev_id"]
        return api_models.NoteOdev.objects.filter(
            koordinator_id=koordinator_id, odev_id=odev_id
        )

    def perform_create(self, serializer):
        koordinator_id = self.kwargs["koordinator_id"]
        odev_id = self.kwargs["odev_id"]
        get_object_or_404(api_models.Odev, id=odev_id)
        get_object_or_404(api_models.Koordinator, id=koordinator_id)
        serializer.save(odev_id=odev_id, koordinator_id=koordinator_id)


class EskepInstructorOdevNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = api_models.NoteOdev.objects.all()
    serializer_class = api_serializer.NoteOdevSerializer
    lookup_field = "pk"          # URL’de son parametre ise
    lookup_url_kwarg = "pk"      # path(...) ile uyumlu

    def get_queryset(self):
        # Swagger şema üretimi için güvenli kısa devre
        if getattr(self, "swagger_fake_view", False):
            return api_models.NoteOdev.objects.none()

        koordinator_id = self.kwargs.get("koordinator_id")
        odev_id = self.kwargs.get("odev_id")

        qs = super().get_queryset()
        if koordinator_id:
            qs = qs.filter(koordinator_id=koordinator_id)
        if odev_id:
            qs = qs.filter(odev_id=odev_id)
        return qs


class EskepInstructorDerSonuRaporuNoteCreateAPIView(generics.ListCreateAPIView):
    """
    GET/POST /eskepinstructor/derssonuraporu-note/<derSonuRaporu_id>/<koordinator_id>/
    (Sınıf adındaki 'Der' özgün metninizle aynı bırakıldı)
    """
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_id = self.kwargs['koordinator_id']
        derSonuRaporu_id = self.kwargs['derSonuRaporu_id']
        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=derSonuRaporu_id)
        return api_models.NoteDersSonuRaporu.objects.filter(koordinator=koordinator, derssonuraporu=dsr)

    def create(self, request, *args, **kwargs):
        derSonuRaporu_id = self.kwargs['derSonuRaporu_id']
        koordinator_id = self.kwargs['koordinator_id']
        title = request.data.get('title')
        note = request.data.get('note')
        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=derSonuRaporu_id)
        api_models.NoteDersSonuRaporu.objects.create(derssonuraporu=dsr, koordinator=koordinator, note=note, title=title)
        return Response({"message": "Not başarılı bir şekilde oluşturuldu"}, status=status.HTTP_201_CREATED)


class EskepInstructorDersSonuRaporuNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        dersSonuRaporu_id = self.kwargs['dersSonuRaporu_id']
        koordinator_id = self.kwargs['koordinator_id']
        note_id = self.kwargs['note_id']
        koordinator = get_object_or_404(api_models.Koordinator, id=koordinator_id)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dersSonuRaporu_id)
        return get_object_or_404(api_models.NoteDersSonuRaporu, koordinator=koordinator, derssonuraporu=dsr, id=note_id)


class EskepInstructorKitapTahliliNoteCreateAPIView(KoordinatorLookupMixin,
                                                    generics.CreateAPIView):
    serializer_class   = api_serializer.NoteKitapTahliliSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        kitaptahlili_id = self.kwargs["kitaptahlili_id"]
        user_id         = self.kwargs["user_id"]
        koordinator     = self.get_koordinator_by_user_id(user_id)

        serializer.save(
            kitaptahlili_id=kitaptahlili_id,
            koordinator=koordinator
        )


class EskepInstructorKitapTahliliNoteDetailAPIView(
    KoordinatorLookupMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class   = api_serializer.NoteKitapTahliliSerializer
    permission_classes = [IsAuthenticated]  # AllowAny ise kalsın ama güvenlik için bu daha iyi

    def get_object(self):
        kitaptahlili_id = self.kwargs["kitaptahlili_id"]
        note_id         = self.kwargs["note_id"]

        koordinator = self.get_koordinator()
        # 👇 Teşhis için bir kez logla (gerekirse)
        # print("Resolved koordinator:", getattr(koordinator, "id", None), getattr(getattr(koordinator, "user", None), "id", None))

        base_filter = {
            "id": note_id,
            "kitaptahlili_id": kitaptahlili_id,
        }

        # Genel Koordinatör HER notu görebilir/silebilir
        if not self.is_genel_koordinator(koordinator):
            # Normal koordinator sadece kendi notu
            base_filter["koordinator"] = koordinator

        return get_object_or_404(api_models.NoteKitapTahlili, **base_filter)
    
# ---- Create/Update/Delete not endpoints (stajer tarafı) ----

class DersSonuRaporuCreateOrUpdateNoteAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.NoteDersSonuRaporuSerializer

    def post(self, request, koordinator_id, id):
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=id)
        data = request.data.copy()
        data["derssonuraporu"] = dsr.id
        data["koordinator"] = koordinator_id
        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def patch(self, request, koordinator_id, derssonuraporu_id, id):
        note = get_object_or_404(api_models.NoteDersSonuRaporu, id=id, derssonuraporu_id=derssonuraporu_id, koordinator_id=koordinator_id)
        ser = self.get_serializer(note, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, koordinator_id, derssonuraporu_id, id):
        note = get_object_or_404(api_models.NoteDersSonuRaporu, id=id, derssonuraporu_id=derssonuraporu_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)


class KitapTahliliCreateOrUpdateNoteAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.NoteKitapTahliliSerializer

    def post(self, request, koordinator_id, id):
        kt = get_object_or_404(api_models.KitapTahlili, id=id)
        data = request.data.copy()
        data["kitaptahlili"] = kt.id
        data["koordinator"] = koordinator_id
        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def patch(self, request, koordinator_id, kitaptahlili_id, id):
        note = get_object_or_404(api_models.NoteKitapTahlili, id=id, kitaptahlili_id=kitaptahlili_id, koordinator_id=koordinator_id)
        ser = self.get_serializer(note, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, koordinator_id, kitaptahlili_id, id):
        note = get_object_or_404(api_models.NoteKitapTahlili, id=id, kitaptahlili_id=kitaptahlili_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)


class EskepProjeCreateOrUpdateNoteAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.NoteEskepProjeSerializer

    def post(self, request, koordinator_id, id):
        proje = get_object_or_404(api_models.EskepProje, id=id)
        data = request.data.copy()
        data["proje"] = proje.id
        data["koordinator"] = koordinator_id
        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)

    def patch(self, request, koordinator_id, proje_id, id):
        note = get_object_or_404(api_models.NoteEskepProje, id=id, proje_id=proje_id, koordinator_id=koordinator_id)
        ser = self.get_serializer(note, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, koordinator_id, proje_id, id):
        note = get_object_or_404(api_models.NoteEskepProje, id=id, proje_id=proje_id, koordinator_id=koordinator_id)
        note.delete()
        return Response({"message": "Not silindi."}, status=status.HTTP_204_NO_CONTENT)

