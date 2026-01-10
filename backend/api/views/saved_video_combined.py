from rest_framework import permissions, status, views
from rest_framework.response import Response
from django.db.models import Prefetch

from api.models import SavedVideo, VideoEnrollment, EducatorVideo, EducatorVideoLink
from api.serializers.saved_video_combined import (
    SavedVideoLinkSerializer,
    SavedVideoFileSerializer,
    SavedVideoCreateSerializer,
)

class MeSavedVideosListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # İki kaynağı çekip tek listede döndür
        link_qs = SavedVideo.objects.select_related("video").filter(user=request.user)
        file_qs = VideoEnrollment.objects.select_related("video").filter(user=request.user)

        link_ser = SavedVideoLinkSerializer(link_qs, many=True)
        file_ser = SavedVideoFileSerializer(file_qs, many=True)

        # Tarihe göre in-memory sıralayalım (created_at DESC)
        data = link_ser.data + file_ser.data
        data.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return Response(data)

    def post(self, request):
        ser = SavedVideoCreateSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        obj = ser.save()

        # Dönerken birleşik formatta dön
        if isinstance(obj, SavedVideo):
            out = SavedVideoLinkSerializer(obj).data
        else:
            out = SavedVideoFileSerializer(obj).data
        return Response(out, status=status.HTTP_201_CREATED)


class MeSavedVideosDeleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, saved_id: int, *args, **kwargs):
        # Önce YouTube (SavedVideo), yoksa Dosya (VideoEnrollment) dene
        deleted = 0
        sv = SavedVideo.objects.filter(id=saved_id, user=request.user)
        if sv.exists():
            deleted, _ = sv.delete()
        else:
            ve = VideoEnrollment.objects.filter(id=saved_id, user=request.user)
            if ve.exists():
                deleted, _ = ve.delete()

        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Kayıt bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
