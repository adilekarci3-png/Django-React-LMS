# api/views/instructor_videos.py (yeni bir dosya açabilir veya mevcut views içine ekleyebilirsin)
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api import models as M
from api.views.permissions import IsGeneralKoordinator
from api import serializer as S

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
