from rest_framework import serializers
from api import models as api_models
from .users import ProfileSerializer

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Note
        fields = '__all__'

class NoteOdevSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.NoteOdev
        fields = '__all__'

class NoteKitapTahliliSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.NoteKitapTahlili
        fields = '__all__'
        
class NoteEskepProjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.NoteEskepProje
        fields = '__all__'

class NoteDersSonuRaporuSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.NoteDersSonuRaporu
        fields = '__all__'

class NoteEskepProjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.NoteEskepProje
        fields = '__all__'

class _ReviewBase(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'

class ReviewSerializer(_ReviewBase):
    class Meta(_ReviewBase.Meta):
        model = api_models.Review

class ReviewOdevSerializer(_ReviewBase):
    class Meta(_ReviewBase.Meta):
        model = api_models.ReviewOdev

class ReviewKitapTahliliSerializer(_ReviewBase):
    class Meta(_ReviewBase.Meta):
        model = api_models.ReviewKitapTahlili

class ReviewDersSonuRaporuSerializer(_ReviewBase):
    class Meta(_ReviewBase.Meta):
        model = api_models.ReviewDersSonuRaporu

class ReviewEskepProjeSerializer(_ReviewBase):
    class Meta(_ReviewBase.Meta):
        model = api_models.ReviewEskepProje

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Notification
        fields = '__all__'
