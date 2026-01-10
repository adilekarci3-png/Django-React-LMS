from rest_framework import serializers
from api.models.about import (
    AboutType, AboutPage, AboutCard, AboutStat, AboutGalleryImage, AboutMilestone
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
