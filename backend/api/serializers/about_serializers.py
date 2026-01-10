from rest_framework import serializers
from api.models.about import (
    AboutType, AboutPage, AboutCard, AboutStat, AboutGalleryImage, AboutMilestone, EskepCard, EskepGalleryItem, EskepPage, EskepStat
)

class AboutMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutMilestone
        fields = ["order", "year", "title", "text"]  # istersen "id" de ekleyebilirsin

class AboutTypeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutType
        fields = ["slug", "name"]

class AboutCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutCard
        fields = ["order", "title", "text", "pills"]

class AboutStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutStat
        fields = ["order", "value", "label"]

class AboutGalleryImageSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    class Meta:
        model = AboutGalleryImage
        fields = ["order", "caption", "src"]

    def get_src(self, obj):
        if obj.url:
            return obj.url
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None

class AboutPageSerializer(serializers.ModelSerializer):
    type = AboutTypeMiniSerializer(read_only=True)
    cards = AboutCardSerializer(many=True, read_only=True)
    stats = AboutStatSerializer(many=True, read_only=True)
    gallery = AboutGalleryImageSerializer(many=True, read_only=True)
    milestones = AboutMilestoneSerializer(many=True, read_only=True)  # ← EKLENDİ

    hero_image_url = serializers.SerializerMethodField()
    logo_image_url = serializers.SerializerMethodField()

    class Meta:
        model = AboutPage
        fields = [
            "slug", "title", "subtitle", "is_published",
            "type",
            "hero_image_url", "logo_image_url",
            "cards", "stats", "gallery",
            "milestones",                    # ← LİSTEYE EKLENDİ
        ]

    def _abs(self, f):
        if not f:
            return None
        request = self.context.get("request")
        url = f.url
        return request.build_absolute_uri(url) if request else url

    def get_hero_image_url(self, obj): return self._abs(obj.hero_image)
    def get_logo_image_url(self, obj): return self._abs(obj.logo_image)

class EskepCardSerializer(serializers.ModelSerializer):
    bullets = serializers.SerializerMethodField()
    pills = serializers.SerializerMethodField()

    class Meta:
        model = EskepCard
        fields = ["id", "title", "lead", "bullets", "pills", "order"]

    def get_bullets(self, obj):
        # admin'de satır satır yazacağız, burada listeye çeviriyoruz
        if not obj.bullets:
            return []
        return [line.strip() for line in obj.bullets.splitlines() if line.strip()]

    def get_pills(self, obj):
        if not obj.pills:
            return []
        return [p.strip() for p in obj.pills.split(",") if p.strip()]


class EskepGalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EskepGalleryItem
        fields = ["id", "image_url", "alt_text", "order"]


class EskepStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = EskepStat
        fields = ["id", "label", "value", "order"]


class EskepPageSerializer(serializers.ModelSerializer):
    cards = EskepCardSerializer(many=True, read_only=True)
    gallery = EskepGalleryItemSerializer(many=True, read_only=True)
    stats = EskepStatSerializer(many=True, read_only=True)

    class Meta:
        model = EskepPage
        fields = [
            "id",
            "slug",
            "intro_chip",
            "title",
            "subtitle",
            "hero_image",
            "shot1",
            "shot2",
            "logo",
            "css",
            "cards",
            "gallery",
            "stats",
        ]