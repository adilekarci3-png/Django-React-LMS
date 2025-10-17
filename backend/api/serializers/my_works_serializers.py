from rest_framework import serializers
from ..models import Odev, KitapTahlili, DersSonuRaporu

class OdevMiniSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = Odev
        fields = ["id", "title", "image", "file", "language", "level", "odev_status", "date", "type"]
    def get_type(self, obj): return "odev"

class KitapTahliliMiniSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = KitapTahlili
        fields = ["id", "title", "image", "file", "language", "level", "kitaptahlili_status", "date", "type"]
    def get_type(self, obj): return "kitaptahlili"

class DersSonuRaporuMiniSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = DersSonuRaporu
        fields = ["id", "title", "image", "file", "language", "level", "derssonuraporu_status", "date", "type"]
    def get_type(self, obj): return "derssonuraporu"