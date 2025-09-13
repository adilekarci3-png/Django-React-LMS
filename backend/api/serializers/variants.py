from rest_framework import serializers
from api import models as api_models

class _DepthOnPostMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

class VariantItemSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.VariantItem
        fields = '__all__'

class VariantSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True)
    class Meta:
        model = api_models.Variant
        fields = '__all__'

# ODEV
class VariantItemOdevSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.VariantOdevItem
        fields = '__all__'

class VariantOdevSerializer(serializers.ModelSerializer):
    variant_items = VariantItemOdevSerializer(many=True)
    class Meta:
        model = api_models.VariantOdev
        fields = '__all__'

class VariantOdevDetailedSerializer(VariantOdevSerializer):
    class Meta(VariantOdevSerializer.Meta):
        depth = 3

# KITAP TAHLILI
class VariantItemKitapTahliliSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.VariantKitapTahliliItem
        fields = '__all__'

class VariantKitapTahliliSerializer(serializers.ModelSerializer):
    variant_items = VariantItemKitapTahliliSerializer(many=True)
    class Meta:
        model = api_models.VariantKitapTahlili
        fields = '__all__'

class VariantKitapTahliliDetailedSerializer(VariantKitapTahliliSerializer):
    class Meta(VariantKitapTahliliSerializer.Meta):
        depth = 3

# DERS SONU RAPORU
class VariantItemDersSonuRaporuSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.VariantDersSonuRaporuItem
        fields = '__all__'

class VariantDersSonuRaporuSerializer(serializers.ModelSerializer):
    variant_items = VariantItemDersSonuRaporuSerializer(many=True)
    class Meta:
        model = api_models.VariantDersSonuRaporu
        fields = '__all__'

class VariantDersSonuRaporuDetailedSerializer(VariantDersSonuRaporuSerializer):
    class Meta(VariantDersSonuRaporuSerializer.Meta):
        depth = 3

# ESKep Proje
class VariantItemEskepProjeSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    class Meta:
        model = api_models.VariantEskepProjeItem
        fields = '__all__'

class VariantEskepProjeSerializer(serializers.ModelSerializer):
    variant_items = VariantItemEskepProjeSerializer(many=True)
    class Meta:
        model = api_models.VariantEskepProje
        fields = '__all__'

class VariantEskepProjeDetailedSerializer(VariantEskepProjeSerializer):
    class Meta(VariantEskepProjeSerializer.Meta):
        depth = 3
