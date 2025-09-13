from rest_framework import serializers
from api import models as api_models
from .variants import VariantSerializer, VariantItemSerializer
from .qa import Question_AnswerDersSonuRaporuSerializer

class DersSonuRaporuSerializer(serializers.ModelSerializer):
    curriculum       = serializers.SerializerMethodField()
    lectures         = serializers.SerializerMethodField()
    question_answers = serializers.SerializerMethodField()

    class Meta:
        model  = api_models.DersSonuRaporu
        fields = [
            "id","category","koordinator","inserteduser","file","image","title",
            "description","language","level","derssonuraporu_status",
            "koordinator_derssonuraporu_status","date",
            "curriculum","lectures","question_answers",
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
        for attr in ["variants","variant_set","variantderssonuraporu_set","variantDersSonuRaporu_set"]:
            if hasattr(obj, attr):
                return getattr(obj, attr).all()
        return None

    def get_curriculum(self, obj):
        qs = self._get_variants_qs(obj)
        return VariantSerializer(qs, many=True, context=self.context).data if qs is not None else []

    def get_lectures(self, obj):
        variants = self._get_variants_qs(obj)
        if variants is None and hasattr(obj, "lectures") and callable(getattr(obj, "lectures")):
            try:
                items_qs = obj.lectures()
                return VariantItemSerializer(items_qs, many=True, context=self.context).data
            except Exception:
                return []
        if variants is None:
            return []
        collected = []
        for v in variants:
            for items_attr in [
                "items","variant_items","variantderssonuraporu_items",
                "variantDersSonuRaporu_items","variantderssonuraporuitem_set"
            ]:
                if hasattr(v, items_attr):
                    try:
                        collected.extend(list(getattr(v, items_attr).all()))
                        break
                    except Exception:
                        continue
        return VariantItemSerializer(collected, many=True, context=self.context).data

    def get_question_answers(self, obj):
        qas = api_models.Question_AnswerDersSonuRaporu.objects.filter(derssonuraporu=obj)
        return Question_AnswerDersSonuRaporuSerializer(qas, many=True, context=self.context).data
