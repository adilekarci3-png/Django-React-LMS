# api/views/educator_media.py
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.views.permissions import CanModifyVideoLink, IsEskepKoordinatorOrTeacher, IsGeneralKoordinator, get_teacher_for_user, is_eskep_koordinator
from .. import models as M, serializers as S


# ---------- Video Linkleri ----------
class EducatorVideoLinkListAPIView(generics.ListAPIView):
    queryset = M.EducatorVideoLink.objects.select_related("instructor").order_by("-created_at")
    serializer_class = S.EducatorVideoLinkSerializer
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


class InstructorVideoLinkListAPIView(generics.ListCreateAPIView):
    queryset = M.EducatorVideoLink.objects.select_related("instructor").order_by("-created_at")
    serializer_class = S.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "videoUrl"]
    ordering_fields = ["created_at", "title"]


class EducatorVideoLinkCreateAPIView(generics.CreateAPIView):
    queryset = M.EducatorVideoLink.objects.all()
    serializer_class = S.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]

    def perform_create(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            serializer.save()
            return
        educator = get_teacher_for_user(user)
        if not educator:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bu kullanıcı için Eğitmen kaydı bulunamadı.")
        serializer.save(instructor=educator)


class EducatorVideoLinkUpdateAPIView(generics.UpdateAPIView):
    queryset = M.EducatorVideoLink.objects.all()
    serializer_class = S.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, CanModifyVideoLink]
    lookup_field = "pk"

    def perform_update(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            serializer.save()
            return
        educator = get_teacher_for_user(user)
        if not educator:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bu kullanıcı için Eğitmen (Educator) kaydı bulunamadı.")
        serializer.save(instructor=educator)


class EducatorVideoLinkDeleteAPIView(generics.DestroyAPIView):
    queryset = M.EducatorVideoLink.objects.all()
    serializer_class = S.EducatorVideoLinkSerializer
    permission_classes = [IsAuthenticated, CanModifyVideoLink]
    lookup_field = "pk"


# ---------- Video Dosyaları ----------
class EducatorVideoCreateAPIView(generics.CreateAPIView):
    queryset = M.EducatorVideo.objects.all()
    serializer_class = S.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            ins_id = self.request.data.get("instructor_id")
            if ins_id:
                try:
                    teacher = M.Teacher.objects.get(pk=int(ins_id))
                except (M.Teacher.DoesNotExist, ValueError, TypeError):
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Geçersiz eğitmen (instructor_id).")
            else:
                teacher = get_teacher_for_user(user)
                if not teacher:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Eğitmen bulunamadı. (Koordinatör için instructor_id verilebilir.)")
            serializer.save(instructor=teacher)
            return

        teacher = get_teacher_for_user(user)
        if not teacher:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Eğitmen kaydınız/rolünüz bulunamadı.")
        serializer.save(instructor=teacher)


class EducatorVideoListAPIView(generics.ListAPIView):
    """
    Koordinatör: tüm kayıtlar (opsiyonel instructor_id filtresi)
    Öğretmen: sadece kendi kayıtları
    """
    serializer_class = S.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher]
    queryset = M.EducatorVideo.objects.select_related("instructor").order_by("-created_at")
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
                    qs = qs.filter(instructor_id=int(ins_id))
                except ValueError:
                    return qs.none()
            return qs

        teacher = get_teacher_for_user(user)
        if not teacher:
            return qs.none()
        return qs.filter(instructor_id=teacher.id)


class EducatorVideoUpdateAPIView(generics.UpdateAPIView):
    serializer_class = S.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher, CanModifyVideoLink]
    queryset = M.EducatorVideo.objects.all()
    lookup_field = "pk"

    def perform_update(self, serializer):
        user = self.request.user
        if is_eskep_koordinator(user):
            ins_id = self.request.data.get("instructor_id")
            if ins_id:
                try:
                    teacher = M.Teacher.objects.get(pk=int(ins_id))
                except (M.Teacher.DoesNotExist, ValueError, TypeError):
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Geçersiz eğitmen (instructor_id).")
                serializer.save(instructor=teacher)
                return
            serializer.save()
            return

        teacher = get_teacher_for_user(user)
        if not teacher:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Eğitmen kaydınız/rolünüz bulunamadı.")
        serializer.save(instructor=teacher)


class EducatorVideoDeleteAPIView(generics.DestroyAPIView):
    serializer_class = S.EducatorVideoSerializer
    permission_classes = [IsAuthenticated, IsEskepKoordinatorOrTeacher, CanModifyVideoLink]
    queryset = M.EducatorVideo.objects.all()
    lookup_field = "pk"


# ---------- Satın alma / Kayıt yönetimi (rapor) ----------
def _get_video_object(kind, pk):
    if kind == "link":
        return get_object_or_404(M.EducatorVideoLink, pk=pk)
    if kind == "file":
        return get_object_or_404(M.EducatorVideo, pk=pk)
    from rest_framework.exceptions import ValidationError
    raise ValidationError("Invalid kind")


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


class VideoBuyersView(APIView):
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get(self, request, kind, pk):
        video = _get_video_object(kind, pk)
        ct = ContentType.objects.get_for_model(video.__class__)
        purchases = (
            M.VideoPurchase.objects
            .filter(content_type=ct, object_id=video.pk)
            .select_related("user", "user__teacher", "user__profile")
            .order_by("-created_at")
        )
        rows = [{"user": S.UserMiniSerializer(p.user, context={"request": request}).data, "created_at": p.created_at} for p in purchases]
        return Response(rows)


class VideoEnrolledView(APIView):
    permission_classes = [IsAuthenticated, IsGeneralKoordinator]

    def get(self, request, kind, pk):
        video = _get_video_object(kind, pk)

        if kind == "link":
            items = (
                M.SavedVideo.objects
                .filter(video=video)
                .select_related("user", "user__teacher", "user__profile")
                .order_by("-created_at")
            )
            rows = [{"user": S.UserMiniSerializer(s.user, context={"request": request}).data, "created_at": s.created_at} for s in items]
            return Response(rows)

        items = (
            M.VideoEnrollment.objects
            .filter(video=video)
            .select_related("user", "user__teacher", "user__profile")
            .order_by("-created_at")
        )
        rows = [{"user": S.UserMiniSerializer(e.user, context={"request": request}).data, "created_at": e.created_at} for e in items]
        return Response(rows)
