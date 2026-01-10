from rest_framework import serializers
from api import models as api_models

class QuranPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.QuranPage
        fields = ['page_number', 'image']
