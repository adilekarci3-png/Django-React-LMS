from rest_framework import serializers
from api import models as api_models
from .people import HafizSimpleSerializer, TeacherSerializer

class DersSerializer(serializers.ModelSerializer):
    hafiz = serializers.PrimaryKeyRelatedField(queryset=api_models.Hafiz.objects.all(), write_only=True)
    instructor = serializers.PrimaryKeyRelatedField(queryset=api_models.Teacher.objects.all(), write_only=True)

    hafiz_detail = HafizSimpleSerializer(source="hafiz", read_only=True)
    instructor_detail = TeacherSerializer(source="instructor", read_only=True)
    hafiz_id = serializers.IntegerField(source="hafiz.id", read_only=True)
    instructor_id = serializers.IntegerField(source="instructor.id", read_only=True)

    class Meta:
        model = api_models.Ders
        fields = [
            "id", "hafiz", "instructor",
            "hafiz_id", "instructor_id",
            "hafiz_detail", "instructor_detail",
            "start_time", "end_time", "description", "topic", "date",
        ]

class DersAtamasiSerializer(serializers.ModelSerializer):
    hafiz = serializers.PrimaryKeyRelatedField(queryset=api_models.Hafiz.objects.all(), write_only=True)
    instructor = serializers.PrimaryKeyRelatedField(queryset=api_models.Teacher.objects.all(), write_only=True)

    hafiz_detail = HafizSimpleSerializer(source="hafiz", read_only=True)
    instructor_detail = TeacherSerializer(source="instructor", read_only=True)
    hafiz_id = serializers.IntegerField(source="hafiz.id", read_only=True)
    instructor_id = serializers.IntegerField(source="instructor.id", read_only=True)

    class Meta:
        model = api_models.DersAtamasi
        fields = [
            "id","hafiz","instructor",
            "hafiz_id","instructor_id",
            "hafiz_detail","instructor_detail",
            "start_time","end_time","aciklama","topic",
        ]
