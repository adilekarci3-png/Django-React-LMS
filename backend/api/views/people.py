# api/views/people.py
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView,CreateAPIView

from api.views.permissions import IsGeneralKoordinator # <-- EKLENDİ

from .. import models as api_models, serializers as api_serializer

from .utils import abs_url

User = get_user_model()


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
            "image": person.image.url if getattr(person, "image", None) else None,
            "email": person.email,
            "gender": getattr(person, "gender", None),
            "country": getattr(person, "country", None),
            "city": str(person.city) if getattr(person, "city", None) else None,
        }

    return Response({
        "ogrenciler": [format_person(o) for o in ogrenciler],
        "stajerler": [format_person(s) for s in stajerler],
    })


@api_view(['GET'])
def egitmen_detay(request, egitmen_id):
    try:
        egitmen = api_models.Teacher.objects.get(id=egitmen_id)
    except api_models.Teacher.DoesNotExist:
        return Response({"error": "Eğitmen bulunamadı."}, status=404)

    dersler = api_models.DersAtamasi.objects.filter(instructor=egitmen).select_related("hafiz")
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
        "dersler": dersler_data,
    }
    return Response(data)


@api_view(['GET'])
def hafiz_detay(request, hafiz_id):
    try:
        hafiz = api_models.Hafiz.objects.get(id=hafiz_id)
    except api_models.Hafiz.DoesNotExist:
        return Response({"error": "Hafız bulunamadı."}, status=404)

    dersler = api_models.DersAtamasi.objects.filter(hafiz=hafiz).select_related("instructor")
    egitmen = dersler.last().instructor if dersler.exists() else None

    data = {
        "id": hafiz.id,
        "full_name": hafiz.full_name,
        "egitmen": {"id": egitmen.id, "full_name": egitmen.full_name} if egitmen else None,
        "dersler": api_serializer.DersAtamasiSerializer(dersler, many=True).data,
    }
    return Response(data)


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/instructors/
      - ?q=...
      - ?ordering=full_name
      - ?sub_role=AkademiEgitmen
      - ?only_teachers=1
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

        qs = qs.annotate(
            video_link_count=Count("teacher__video_links", distinct=True),
            uploaded_video_count=Count("teacher__uploaded_videos", distinct=True),
            document_count=Count("teacher__uploaded_documents", distinct=True),
        )
        return qs

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
        if teacher and getattr(teacher, "image", None):
            data["image"] = abs_url(request, teacher.image)
        elif profile and getattr(profile, "image", None):
            data["image"] = abs_url(request, profile.image)

        return Response(data)

    @action(detail=True, methods=["get"])
    def videos(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        links_qs = api_models.EducatorVideoLink.objects.filter(
            instructor=teacher
        ).only("id", "title", "videoUrl", "created_at")
        vids_qs = api_models.EducatorVideo.objects.filter(
            instructor=teacher
        ).only("id", "title", "file", "created_at")

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

        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        for it in items:
            if it["created_at"]:
                try:
                    it["created_at"] = it["created_at"].isoformat()
                except Exception:
                    pass
        return Response(items)

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        docs = api_models.EducatorDocument.objects.filter(
            instructor=teacher
        ).only("id", "title", "description", "file", "mime_type", "tags", "created_at").order_by("-created_at")

        data = []
        for d in docs:
            data.append({
                "id": str(d.id),
                "title": d.title,
                "category": d.tags or None,
                "summary": (d.description or "")[:200],
                "view_url": abs_url(request, d.file),
                "mime": d.mime_type or None,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            })
        return Response(data)

    @action(detail=True, methods=["get"])
    def files(self, request, pk=None):
        user = self.get_object()
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return Response([])

        out = []
        for d in api_models.EducatorDocument.objects.filter(instructor=teacher):
            size = getattr(d.file, "size", None) or getattr(d, "file_size", 0) or 0
            out.append({
                "id": f"doc-{d.id}",
                "name": getattr(d, "original_filename", None) or (d.file.name if d.file else d.title),
                "mime": d.mime_type or None,
                "size": size,
                "size_readable": f"{size} B" if size else None,
                "download_url": abs_url(request, d.file),
                "created_at": d.created_at.isoformat() if d.created_at else None,
            })
        for v in api_models.EducatorVideo.objects.filter(instructor=teacher):
            if not v.file:
                continue
            size = getattr(v.file, "size", None)
            out.append({
                "id": f"vid-{v.id}",
                "name": v.file.name,
                "mime": None,
                "size": size,
                "size_readable": None,
                "download_url": abs_url(request, v.file),
                "created_at": v.created_at.isoformat() if v.created_at else None,
            })
        out.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return Response(out)


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/students/
      - ?q=...
      - ?ordering=full_name
      - ?sub_role=AkademiOgrenci
      - ?only_students=1
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
            .select_related("profile", "ogrenci")
            .prefetch_related("ogrenci__roles")
            .filter(ogrenci__roles__name=role_name)
            .distinct()
        )

        if only_students:
            qs = qs.filter(ogrenci__isnull=False)

        return qs

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

    @action(detail=True, methods=["get"])
    def courses(self, request, pk=None):
        user = self.get_object()
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

    @action(detail=True, methods=["get"])
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
        for it in out:
            if it["enrolled_at"]:
                try:
                    it["enrolled_at"] = it["enrolled_at"].isoformat()
                except Exception:
                    pass
        return Response(out)


class CoordinatorListAPIView(ListAPIView):
    queryset = api_models.Koordinator.objects.filter(active=True)
    serializer_class = api_serializer.KoordinatorSerializer
    permission_classes = [AllowAny]


class UserListAPIView(ListAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        koordinator_ids = api_models.Koordinator.objects.values_list("user__id", flat=True)
        return api_models.User.objects.filter(active=True).exclude(id__in=list(koordinator_ids))


class StajerListAPIView(ListAPIView):
    queryset = api_models.Stajer.objects.filter(active=True)
    serializer_class = api_serializer.StajerSerializer
    permission_classes = [AllowAny]


class EskepEgitmenListAPIView(ListAPIView):
    serializer_class = api_serializer.EducatorSerializer
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get_queryset(self):
        return api_models.Educator.objects.filter(active=True).distinct()

class EgitmenListAPIView(ListAPIView):   
    serializer_class = api_serializer.TeacherSerializer 
    permission_classes = [AllowAny]
    
    def get_queryset(self):        
        queryset = api_models.Teacher.objects.all()
        print(queryset)      
        return queryset  

class EducatorDetailAPIView(RetrieveUpdateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]


class OgrenciListAPIView(ListAPIView):
    queryset = api_models.Ogrenci.objects.filter(active=True)
    serializer_class = api_serializer.OgrenciSerializer
    permission_classes = [AllowAny]

class EducatorCreateAPIView(CreateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer
    
class KoordinatorByRoleAPIView(APIView):
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get(self, request):
        role_name = request.query_params.get("role")
        if not role_name:
            return Response(
                {"detail": "'role' query param gerekli. Örn: ?role=ESKEPGenelKoordinator"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Rolü isimle (case-insensitive) yakala
        try:
            role = api_models.KoordinatorRole.objects.get(name__iexact=role_name)
        except api_models.KoordinatorRole.DoesNotExist:
            return Response({"detail": "Rol bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        # O role sahip aktif koordinatorleri getir
        qs = (
            api_models.Koordinator.objects.filter(active=True, roles=role)
            .select_related("user")
            .prefetch_related("roles")
            .order_by("user__full_name")
            .distinct()
        )

        serializer = api_serializer.KoordinatorSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class EducatorUpdateAPIView(RetrieveUpdateAPIView):
    queryset = api_models.Educator.objects.all()
    serializer_class = api_serializer.EducatorSerializer