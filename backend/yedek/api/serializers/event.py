from rest_framework import serializers
from api import models as api_models

class ESKEPEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.ESKEPEvent
        fields = ['id', 'title', 'date', 'background_color', 'border_color']
        read_only_fields = ['id']

class LiveLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.LiveLesson
        fields = '__all__'

class CombinedEventSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    date = serializers.DateTimeField(source="datetime", required=False)
    background_color = serializers.CharField(default="#007bff")
    border_color = serializers.CharField(default="#0056b3")
    type = serializers.CharField()
