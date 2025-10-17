# api/views/events.py
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .. import models as api_models, serializers as api_serializer
from api.views.permissions import IsGeneralKoordinator

User = get_user_model()


@permission_classes([IsAuthenticated])
class ESKEPEventCreateAPIView(generics.CreateAPIView):
    queryset = api_models.ESKEPEvent.objects.all()
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@permission_classes([IsAuthenticated])
class InstructorEventListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        try:
            User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise PermissionDenied("Kullanıcı bulunamadı.")
        return api_models.ESKEPEvent.objects.filter(owner_id=user_id).order_by("date")


class StudentEventListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        instructor = getattr(user, "instructor", None)
        if instructor:
            return api_models.ESKEPEvent.objects.filter(owner=instructor).order_by("date")
        return api_models.ESKEPEvent.objects.none()


class GeneralEventListAPIView(generics.ListAPIView):
    queryset = api_models.ESKEPEvent.objects.all().order_by("date")
    serializer_class = api_serializer.ESKEPEventSerializer
    permission_classes = [IsGeneralKoordinator]


class CombinedEventListAPIView(generics.ListAPIView):
    """
    Bir kullanıcının hem Event hem LiveLesson kayıtlarını tek listede döndürür.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise PermissionDenied("Kullanıcı bulunamadı.")

        events = api_models.ESKEPEvent.objects.filter(owner_id=user_id)
        live_lessons = api_models.LiveLesson.objects.filter(owner_id=user_id)

        serialized = []
        for ev in events:
            serialized.append({
                "id": ev.id,
                "title": ev.title,
                "date": ev.date,
                "background_color": ev.background_color,
                "border_color": ev.border_color,
                "type": "event",
            })
        for ls in live_lessons:
            serialized.append({
                "id": ls.id,
                "title": ls.title,
                "date": ls.datetime,
                "background_color": "#28a745",
                "border_color": "#1e7e34",
                "type": "live_lesson",
            })
        return Response(serialized)
