from rest_framework import serializers
from api import models as api_models

class PeerIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.PeerID
        fields = ['user', 'peer_id']
