from rest_framework import serializers
from api import models as api_models
from api.models.quran import Annotation
from math import hypot

class AnnotationSerializer(serializers.ModelSerializer):
    # İstemci sadece bu alanı göndersin/alsın
    coordinates = serializers.DictField(write_only=True, required=False)
    radius = serializers.SerializerMethodField(read_only=True)  # circle için opsiyonel
    coordinates_out = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Annotation
        fields = [
            "id", "user", "page", "shape_type",
            "text",
            # write-only giriş
            "coordinates",
            # read-only çıkış
            "coordinates_out", "radius",
        ]
        read_only_fields = ["user"]

    # --- Write path: payload -> model alanları ---
    def validate(self, attrs):
        # shape_type kontrolü
        shape = attrs.get("shape_type") or getattr(getattr(self, "instance", None), "shape_type", None)
        if shape not in ("line", "circle"):
            raise serializers.ValidationError({"shape_type": "Geçersiz değer. 'line' veya 'circle' olmalı."})

        # coordinates varsa x1..y2’ye dağıt
        coords = attrs.pop("coordinates", None)
        if coords is not None:
            for key in ("x1", "y1", "x2", "y2"):
                if key not in coords:
                    raise serializers.ValidationError({"coordinates": f"'{key}' eksik"})
                if not isinstance(coords[key], (int, float)):
                    raise serializers.ValidationError({"coordinates": f"'{key}' sayısal olmalı"})

            # Basit kurallar
            if shape == "line":
                if coords["x1"] == coords["x2"] and coords["y1"] == coords["y2"]:
                    raise serializers.ValidationError({"coordinates": "Line için iki nokta farklı olmalı."})
            else:  # circle
                r = hypot(coords["x2"] - coords["x1"], coords["y2"] - coords["y1"])
                if r == 0:
                    raise serializers.ValidationError({"coordinates": "Circle için yarıçap > 0 olmalı."})

            # Model alanlarına yaz
            attrs["x1"] = coords["x1"]
            attrs["y1"] = coords["y1"]
            attrs["x2"] = coords["x2"]
            attrs["y2"] = coords["y2"]

        return attrs

    def create(self, validated_data):
        # user’ı request’ten setle
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["user"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    # --- Read path: model -> tek koordinat nesnesi + radius ---
    def get_coordinates_out(self, obj):
        return {"x1": obj.x1, "y1": obj.y1, "x2": obj.x2, "y2": obj.y2}

    def get_radius(self, obj):
        if obj.shape_type == "circle":
            return hypot(obj.x2 - obj.x1, obj.y2 - obj.y1)
        return None

    # Tek bir çıkış anahtarı istiyorsan, to_representation ile isimleri birleştirebilirsin:
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Frontend’e sade isimlerle dönmek istersen:
        data["coordinates"] = data.pop("coordinates_out")
        return data
