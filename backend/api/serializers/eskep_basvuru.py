# apps/eskep/serializers.py
from api.models.eskep_basvuru import EskepBasvuru
from rest_framework import serializers



class EskepApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EskepBasvuru
        fields = "__all__"

    def validate(self, attrs):
        role = attrs.get("role")

        # Ortak alanlar
        if not attrs.get("full_name"):
            raise serializers.ValidationError({"full_name": "Ad Soyad zorunlu."})
        if not attrs.get("email"):
            raise serializers.ValidationError({"email": "E-posta zorunlu."})
        if not attrs.get("phone"):
            raise serializers.ValidationError({"phone": "Telefon zorunlu."})

        # Role göre
        if role == "student":
            if not attrs.get("school"):
                raise serializers.ValidationError({"school": "Okul adı zorunlu."})

        if role == "stajer":
            if not attrs.get("university"):
                raise serializers.ValidationError({"university": "Üniversite zorunlu."})
            if not attrs.get("department"):
                raise serializers.ValidationError({"department": "Bölüm zorunlu."})

        return attrs
