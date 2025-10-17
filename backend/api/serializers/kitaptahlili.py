from rest_framework import serializers
from api import models as api_models
from .variants import VariantItemKitapTahliliSerializer, VariantKitapTahliliSerializer, VariantSerializer, VariantItemSerializer
from .notes_reviews import NoteKitapTahliliSerializer
from .qa import Question_AnswerKitapTahliliSerializer

class KitapTahliliSerializer(serializers.ModelSerializer):
    curriculum       = serializers.SerializerMethodField()
    lectures         = serializers.SerializerMethodField()
    notes            = NoteKitapTahliliSerializer(many=True, read_only=True)
    question_answers = Question_AnswerKitapTahliliSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.KitapTahlili
        fields = [
            "id","category","koordinator","inserteduser","file","image","title",
            "description","language","level","kitaptahlili_status",
            "koordinator_kitaptahlili_status","date",
            "curriculum","lectures","notes","question_answers",
        ]
        depth = 3

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

    def _get_variants_qs(self, obj):
        if hasattr(obj, "curriculum") and callable(getattr(obj, "curriculum")):
            try:
                return obj.curriculum()
            except Exception:
                pass
        for attr in ["variants","variant_set","variantkitaptahlili_set","variantKitapTahlili_set","variankitaptahlili_set"]:
            if hasattr(obj, attr):
                return getattr(obj, attr).all()
        return None

    def get_curriculum(self, obj):
        qs = self._get_variants_qs(obj)
        return VariantKitapTahliliSerializer(qs, many=True, context=self.context).data if qs is not None else []

    def get_lectures(self, obj):
        variants = self._get_variants_qs(obj)
        if variants is None and hasattr(obj, "lectures") and callable(getattr(obj, "lectures")):
            try:
                items_qs = obj.lectures()
                return VariantItemKitapTahliliSerializer(items_qs, many=True, context=self.context).data
            except Exception:
                return []
        if variants is None:
            return []
        collected = []
        for v in variants:
            for items_attr in [
                "items","variant_items","variantKitapTahlili_items",
                "variantkitaptahlili_items","variantkitaptahliliitem_set","variantkitaptahlili_items"
            ]:
                if hasattr(v, items_attr):
                    try:
                        collected.extend(list(getattr(v, items_attr).all()))
                        break
                    except Exception:
                        continue
        return VariantItemKitapTahliliSerializer(collected, many=True, context=self.context).data
