from rest_framework import serializers
from api import models as api_models
from .variants import VariantSerializer, VariantItemSerializer
from .notes_reviews import NoteOdevSerializer
from .qa import Question_AnswerOdevSerializer

class OdevListSerializer(serializers.ModelSerializer):
    prepared_by_full_name = serializers.SerializerMethodField()
    prepared_by_id = serializers.IntegerField(source="inserteduser_id", read_only=True)
    prepared_by_username = serializers.CharField(source="inserteduser.username", read_only=True)
    koordinator_id = serializers.IntegerField(read_only=True)
    koordinator_username = serializers.CharField(source="koordinator.user.username", read_only=True)
    koordinator_full_name = serializers.SerializerMethodField()
    koordinator_display = serializers.SerializerMethodField()
    lectures = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Odev
        fields = [
            "id","title","description","date","odev_status","koordinator_odev_status",
            "image","file","active",
            "prepared_by_id","prepared_by_username","prepared_by_full_name",
            "koordinator_id","koordinator_username","koordinator_full_name","koordinator_display",
            "lectures",
        ]

    def get_prepared_by_full_name(self, obj):
        u = getattr(obj, "inserteduser", None)
        if not u:
            return None
        full = getattr(u, "full_name", None) or (u.get_full_name() if hasattr(u, "get_full_name") else None)
        return full or getattr(u, "username", None) or getattr(u, "email", None)

    def get_koordinator_full_name(self, obj):
        k = getattr(obj, "koordinator", None)
        if not k:
            return None
        user = getattr(k, "user", None)
        if getattr(k, "full_name", None):
            return k.full_name
        if user and getattr(user, "full_name", None):
            return user.full_name
        if user and hasattr(user, "get_full_name") and user.get_full_name():
            return user.get_full_name()
        if user and getattr(user, "username", None):
            return user.username
        if user and getattr(user, "email", None):
            return user.email
        return None

    def get_koordinator_display(self, obj):
        name = self.get_koordinator_full_name(obj)
        user = getattr(getattr(obj, "koordinator", None), "user", None)
        username = getattr(user, "username", None) if user else None
        return f"{name} (@{username})" if name and username else (name or username)

    def get_lectures(self, obj):
        out = []
        for v in obj.variantodev_set.all():
            for it in v.variantOdev_items.all():
                out.append({
                    "id": it.id,
                    "title": getattr(it, "title", None),
                    "description": getattr(it, "description", None),
                    "file": it.file.url if getattr(it, "file", None) else None,
                    "duration": getattr(it, "duration", None),
                    "content_duration": getattr(it, "content_duration", None),
                    "preview": getattr(it, "preview", None),
                    "order": getattr(it, "order", None) if hasattr(it, "order") else None,
                    "variant_id": v.id,
                    "variant_title": getattr(v, "title", None),
                })
        return out

class OdevSerializer(serializers.ModelSerializer):
    curriculum = VariantSerializer(many=True, read_only=True)
    lectures = VariantItemSerializer(many=True, read_only=True)
    notes = NoteOdevSerializer(many=True, read_only=True)
    question_answers = Question_AnswerOdevSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.Odev
        fields = [
            "id","category","koordinator","inserteduser","file","image","title","description",
            "language","level","odev_status","koordinator_odev_status","date",
            "curriculum","lectures","notes","question_answers"
        ]
        depth = 3

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3
