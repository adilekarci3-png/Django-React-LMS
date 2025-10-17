from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from api import models as api_models, serializers as api_serializer
from utils.hbs_user import _get_user_agent_city, _is_hbs_koordinator

class HafizsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = api_models.Hafiz.objects.select_related("adresIl") \
                                     .exclude(adresIl__isnull=True)

        if _is_hbs_koordinator(user):
            return qs

        city = _get_user_agent_city(user)
        if city:
            return qs.filter(adresIl=city)

        return qs.none()

class HafizsListByAgentAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # URL'lerinle tutarlı olsun diye <int:agent_id> tercih et
        agent_id = self.kwargs.get("agent_id") or self.kwargs.get("agent")
        agent = get_object_or_404(
            api_models.Agent.objects.select_related("city"), pk=agent_id
        )

        # --- Basit yetki kuralı ---
        # 1) Koordinatörse her agent'ı görebilir
        # 2) Agent kendisiyse görebilir
        user = self.request.user
        if not (_is_hbs_koordinator(user) or getattr(agent, "user_id", None) == user.id):
            # 403 yerine boş liste döndürmek istersen: return Hafiz.objects.none()
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bu ajan için listeleme yetkin yok.")

        return api_models.Hafiz.objects.select_related("adresIl") \
                                       .filter(adresIl=agent.city) \
                                       .exclude(adresIl__isnull=True)
                                       
