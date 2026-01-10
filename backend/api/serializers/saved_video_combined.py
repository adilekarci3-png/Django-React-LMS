from rest_framework import serializers
from api.models import EducatorVideoLink, EducatorVideo, SavedVideo, VideoEnrollment

# Yardımcı: YouTube thumb & embed üretimi
import re
_YT_RE = re.compile(
    r"(?:https?://)?(?:www\.)?(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{6,})",
    re.IGNORECASE,
)

def yt_id(url: str | None) -> str | None:
    if not url:
        return None
    m = _YT_RE.search(url)
    return m.group(1) if m else None

def yt_thumb(url: str | None) -> str | None:
    v = yt_id(url)
    return f"https://img.youtube.com/vi/{v}/hqdefault.jpg" if v else None

def yt_embed(url: str | None) -> str | None:
    v = yt_id(url)
    return f"https://www.youtube.com/embed/{v}" if v else None


class SavedVideoLinkSerializer(serializers.ModelSerializer):
    # SavedVideo (YouTube) -> birleşik format
    kind = serializers.SerializerMethodField()
    video_id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    source_created_at = serializers.SerializerMethodField()
    thumb = serializers.SerializerMethodField()
    watch = serializers.SerializerMethodField()

    class Meta:
        model = SavedVideo
        fields = [
            "id", "kind", "video_id", "title", "description",
            "source_created_at", "thumb", "watch", "created_at"
        ]

    def get_kind(self, obj): return "link"
    def get_video_id(self, obj): return obj.video_id
    def get_title(self, obj): return obj.video.title if obj.video else ""
    def get_description(self, obj): return obj.video.description if obj.video else ""
    def get_source_created_at(self, obj): return obj.video.created_at if obj.video else None
    def get_thumb(self, obj): return yt_thumb(getattr(obj.video, "videoUrl", None)) if obj.video else None
    def get_watch(self, obj): return yt_embed(getattr(obj.video, "videoUrl", None)) if obj.video else "#"


class SavedVideoFileSerializer(serializers.ModelSerializer):
    # VideoEnrollment (Dosya) -> birleşik format
    kind = serializers.SerializerMethodField()
    video_id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    source_created_at = serializers.SerializerMethodField()
    thumb = serializers.SerializerMethodField()
    watch = serializers.SerializerMethodField()

    class Meta:
        model = VideoEnrollment
        fields = [
            "id", "kind", "video_id", "title", "description",
            "source_created_at", "thumb", "watch", "created_at"
        ]

    def get_kind(self, obj): return "file"
    def get_video_id(self, obj): return obj.video_id
    def get_title(self, obj): return obj.video.title if obj.video else ""
    def get_description(self, obj): return obj.video.description if obj.video else ""
    def get_source_created_at(self, obj): return obj.video.created_at if obj.video else None
    def get_thumb(self, obj): return None  # dosya için thumb üretmiyoruz
    def get_watch(self, obj): return obj.video.file.url if (obj.video and obj.video.file) else "#"


class SavedVideoCreateSerializer(serializers.Serializer):
    # Frontend'in POST body’si
    kind = serializers.ChoiceField(choices=[("link", "link"), ("file", "file")])
    video_id = serializers.IntegerField()

    def validate(self, attrs):
        kind = attrs["kind"]
        vid = attrs["video_id"]
        request = self.context["request"]

        if kind == "link":
            # UniqueTogether: (user, video)
            exists = SavedVideo.objects.filter(user=request.user, video_id=vid).exists()
            if exists:
                raise serializers.ValidationError("Bu video zaten kayıtlı.")
            # var mı?
            if not EducatorVideoLink.objects.filter(pk=vid).exists():
                raise serializers.ValidationError("Geçersiz YouTube videosu.")
        else:
            exists = VideoEnrollment.objects.filter(user=request.user, video_id=vid).exists()
            if exists:
                raise serializers.ValidationError("Bu video zaten kayıtlı.")
            if not EducatorVideo.objects.filter(pk=vid).exists():
                raise serializers.ValidationError("Geçersiz Dosya videosu.")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        kind = validated_data["kind"]
        vid = validated_data["video_id"]

        if kind == "link":
            obj = SavedVideo.objects.create(user=request.user, video_id=vid)
            return obj
        else:
            # Kayıt mantığı için VideoEnrollment kullanıyoruz
            obj = VideoEnrollment.objects.create(user=request.user, video_id=vid)
            return obj
