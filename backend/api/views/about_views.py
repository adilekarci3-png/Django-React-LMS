# api/views/about_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from ..models.about import AboutPage, EskepPage
from rest_framework import viewsets, mixins
from ..serializers.about_serializers import AboutPageSerializer, EskepPageSerializer

class AboutPageDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        """
        slug örnekleri: genel | akademi | hbs | hdm | eskep
        """
        page = get_object_or_404(
            AboutPage.objects.prefetch_related("cards", "stats", "gallery"),
            slug=slug, is_published=True
        )
        ser = AboutPageSerializer(page, context={"request": request})
        return Response(ser.data)

class EskepPageViewSet(mixins.ListModelMixin,
                       mixins.RetrieveModelMixin,
                       viewsets.GenericViewSet):
    """
    /api/v1/eskephakkimizda/           -> liste (genelde 1 kayıt)
    /api/v1/eskephakkimizda/eskephakkimizda/  -> slug ile detay
    /api/v1/eskephakkimizda/1/         -> id ile detay
    """
    queryset = EskepPage.objects.all()
    serializer_class = EskepPageSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]