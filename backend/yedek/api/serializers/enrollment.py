from rest_framework import serializers
from api import models as api_models
from .variants import (
    VariantItemOdevSerializer, VariantOdevSerializer,
    VariantItemKitapTahliliSerializer, VariantKitapTahliliSerializer,
    VariantItemDersSonuRaporuSerializer, VariantDersSonuRaporuSerializer,
    VariantItemEskepProjeSerializer, VariantEskepProjeSerializer,
)
from .notes_reviews import (
    NoteOdevSerializer, NoteKitapTahliliSerializer, NoteDersSonuRaporuSerializer, NoteEskepProjeSerializer,
    ReviewOdevSerializer, ReviewKitapTahliliSerializer, ReviewDersSonuRaporuSerializer, ReviewSerializer,
)
from .qa import (
    Question_AnswerOdevSerializer, Question_AnswerKitapTahliliSerializer,
    Question_AnswerDersSonuRaporuSerializer, Question_AnswerEskepProjeSerializer,
)

class _DepthOnPostMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

class EnrolledOdevSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    lectures = VariantItemOdevSerializer(many=True, read_only=True)
    curriculum = VariantOdevSerializer(many=True, read_only=True)
    note = NoteOdevSerializer(many=True, read_only=True)
    question_answer = Question_AnswerOdevSerializer(many=True, read_only=True)
    review = ReviewOdevSerializer(many=False, read_only=True)

    class Meta:
        model = api_models.EnrolledOdev
        fields = '__all__'

class EnrolledKitapTahliliSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    lectures = VariantItemKitapTahliliSerializer(many=True, read_only=True)
    curriculum = VariantKitapTahliliSerializer(many=True, read_only=True)
    note = NoteKitapTahliliSerializer(many=True, read_only=True)
    question_answer = Question_AnswerKitapTahliliSerializer(many=True, read_only=True)
    review = ReviewKitapTahliliSerializer(many=False, read_only=True)

    class Meta:
        model = api_models.EnrolledKitapTahlili
        fields = '__all__'

class EnrolledDersSonuRaporuSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    lectures = VariantItemDersSonuRaporuSerializer(many=True, read_only=True)
    curriculum = VariantDersSonuRaporuSerializer(many=True, read_only=True)
    note = NoteDersSonuRaporuSerializer(many=True, read_only=True)
    question_answer = Question_AnswerDersSonuRaporuSerializer(many=True, read_only=True)
    review = ReviewDersSonuRaporuSerializer(many=False, read_only=True)

    class Meta:
        model = api_models.EnrolledDersSonuRaporu
        fields = '__all__'

class EnrolledEskepProjeSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    lectures = VariantItemEskepProjeSerializer(many=True, read_only=True)
    curriculum = VariantEskepProjeSerializer(many=True, read_only=True)
    note = NoteEskepProjeSerializer(many=True, read_only=True)
    question_answer = Question_AnswerEskepProjeSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        # Orijinalde model yanlış yazılmıştı (EnrolledDersSonuRaporu). Düzelttim:
        model = api_models.EnrolledEskepProje
        fields = '__all__'

class InstructorOdevSerializer(_DepthOnPostMixin, serializers.ModelSerializer):
    lectures = VariantItemOdevSerializer(many=True, read_only=True)
    curriculum = VariantOdevSerializer(many=True, read_only=True)
    note = NoteOdevSerializer(many=True, read_only=True)
    question_answer = Question_AnswerOdevSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        model = api_models.EnrolledOdev
        fields = '__all__'
