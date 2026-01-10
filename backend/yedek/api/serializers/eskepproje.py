from rest_framework import serializers
from api import models as api_models
from .variants import VariantEskepProjeSerializer, VariantItemEskepProjeSerializer, VariantSerializer, VariantItemSerializer

class EskepProjeSerializer(serializers.ModelSerializer):
    curriculum = serializers.SerializerMethodField()
    lectures   = serializers.SerializerMethodField()

    class Meta:
        model  = api_models.EskepProje
        fields = [
            "id","category","koordinator","inserteduser",
            "file","image","title","description","language","level",
            "eskepProje_status","koordinator_eskepProje_status",
            "date","curriculum","lectures",
        ]
        depth = 3

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

    def get_curriculum(self, obj):
        if hasattr(obj, "curriculum") and callable(getattr(obj, "curriculum")):
            try:
                qs = obj.curriculum()
                return VariantEskepProjeSerializer(qs, many=True, context=self.context).data
            except Exception:
                pass
        for variants_attr in ["variants","variant_set","variantproje_set","variantEskepProje_set","varianteskepproje_set"]:
            if hasattr(obj, variants_attr):
                qs = getattr(obj, variants_attr).all()
                return VariantEskepProjeSerializer(qs, many=True, context=self.context).data
        return []

    def get_lectures(self, obj):
        variants = None
        if hasattr(obj, "curriculum") and callable(getattr(obj, "curriculum")):
            try:
                variants = obj.curriculum()
            except Exception:
                variants = None
        if variants is None:
            for variants_attr in ["variants","variant_set","variantproje_set","variantEskepProje_set","varianteskepproje_set"]:
                if hasattr(obj, variants_attr):
                    variants = getattr(obj, variants_attr).all()
                    break
        if variants is None and hasattr(obj, "lectures") and callable(getattr(obj, "lectures")):
            try:
                items_qs = obj.lectures()
                return VariantEskepProjeSerializer(items_qs, many=True, context=self.context).data
            except Exception:
                return []
        if variants is None:
            return []
        collected = []
        for v in variants:
            for items_attr in [
                "items","variant_items","variantProje_items",
                "variantEskepProje_items","variantprojeitem_set","varianteskepprojeitem_set",
            ]:
                if hasattr(v, items_attr):
                    try:
                        collected.extend(list(getattr(v, items_attr).all()))
                        break
                    except Exception:
                        continue
        return VariantItemEskepProjeSerializer(collected, many=True, context=self.context).data
