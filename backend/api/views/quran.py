from rest_framework import viewsets
from .. import models as api_models, serializers as api_serializer

class QuranPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = api_models.QuranPage.objects.all()
    serializer_class = api_serializer.QuranPageSerializer