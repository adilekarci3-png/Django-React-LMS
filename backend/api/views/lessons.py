# api/views/lessons.py
from django.utils.timezone import localdate
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .. import models as api_models, serializers as api_serializer

User = get_user_model()


@api_view(['GET'])
def dersler_by_date(request, hafiz_id, date):
    dersler = api_models.Ders.objects.filter(hafiz_id=hafiz_id, date=date)
    serializer = api_serializer.DersSerializer(dersler, many=True)
    return Response(serializer.data)


class DersViewSet(viewsets.ModelViewSet):
    queryset = api_models.Ders.objects.all()
    serializer_class = api_serializer.DersSerializer


class HataNotuViewSet(viewsets.ModelViewSet):
    queryset = api_models.HataNotu.objects.all()
    serializer_class = api_serializer.HataNotuSerializer


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = api_models.Annotation.objects.all()
    serializer_class = api_serializer.AnnotationSerializer


class LiveLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = api_models.LiveLesson.objects.all()
    serializer_class = api_serializer.LiveLessonSerializer
