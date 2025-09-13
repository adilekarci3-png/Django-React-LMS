# api/views/dashboard.py
from django.db.models import Count
from django.utils.timezone import localdate
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet

from .. import models as api_models


class RecentHafizAssignmentSerializer(serializers.ModelSerializer):
    hafiz_name = serializers.CharField(source="full_name")
    egitmen_name = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Hafiz
        fields = ["hafiz_name", "egitmen_name", "date"]

    def get_egitmen_name(self, obj):
        return obj.hdm_egitmen.full_name if obj.hdm_egitmen else "-"

    def get_date(self, obj):
        tarih = getattr(obj, "modified", None) or getattr(obj, "created", None)
        return tarih.strftime("%Y-%m-%d") if tarih else "-"


class AssignmentChartSerializer(serializers.ModelSerializer):
    egitmen = serializers.CharField(source="full_name")
    hafiz_sayisi = serializers.IntegerField()

    class Meta:
        model = api_models.Teacher
        fields = ["egitmen", "hafiz_sayisi"]


class SummaryStatsSerializer(serializers.Serializer):
    total_hafiz = serializers.IntegerField()
    total_egitmen = serializers.IntegerField()
    assigned_hafiz = serializers.IntegerField()
    unassigned_hafiz = serializers.IntegerField()


class HBSKoordinatorDashboardViewSet(ViewSet):
    def summary(self, request):
        stats = {
            "total_hafiz": api_models.Hafiz.objects.count(),
            "total_egitmen": api_models.Agent.objects.count(),
            "assigned_hafiz": api_models.Hafiz.objects.filter(active=True, onaydurumu="Onaylandı").count(),
            "unassigned_hafiz": api_models.Hafiz.objects.filter(active=False, onaydurumu="Onaylanmadı").count(),
        }
        serializer = SummaryStatsSerializer(stats)
        return Response({"stats": serializer.data})

    def recent_assignments(self, request):
        queryset = api_models.Hafiz.objects.filter(hdm_egitmen__isnull=False).order_by("-id")[:20]
        serializer = RecentHafizAssignmentSerializer(queryset, many=True)
        return Response(serializer.data)

    def assignments_chart(self, request):
        queryset = api_models.Agent.objects.annotate(hafiz_sayisi=Count("hafizlar")).order_by("-hafiz_sayisi")[:5]
        serializer = AssignmentChartSerializer(queryset, many=True)
        return Response(serializer.data)


class HBSTemsilciDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_hafiz = api_models.Hafiz.objects.count()
        confirmed_hafiz = api_models.Hafiz.objects.filter(onaydurumu="Onaylandı").count()
        unconfirmed_hafiz = api_models.Hafiz.objects.filter(onaydurumu="Onaylanmadı").count()
        total_egitmen = api_models.Teacher.objects.count()

        today = localdate()
        alerts = []
        if unconfirmed_hafiz > 0:
            alerts.append({"message": f"Onaylanmamış {unconfirmed_hafiz} hafız var."})

        assigned_hafiz = 0
        hafizs = api_models.Hafiz.objects.none()
        if hasattr(request.user, "agent"):
            agent = api_models.Agent.objects.get(user=request.user)
            assigned_hafiz = api_models.Hafiz.objects.filter(agent=agent).count()
            hafizs = api_models.Hafiz.objects.filter(agent=agent)

        return Response({
            "stats": {
                "total_hafiz": total_hafiz,
                "confirmed_hafiz": confirmed_hafiz,
                "unconfirmed_hafiz": unconfirmed_hafiz,
                "total_egitmen": total_egitmen,
                "assigned_hafiz": assigned_hafiz,
                "hafizlar": hafizs.values("id", "full_name", "agent", "active"),
            },
            "alerts": alerts,
        })


class Top5TemsilciByHafizAPIView(APIView):
    def get(self, request):
        temsilciler = api_models.Agent.objects.annotate(hafiz_sayisi=Count("hafizlar")).order_by("-hafiz_sayisi")[:5]
        data = [{"ad": t.full_name, "adet": t.hafiz_sayisi} for t in temsilciler]
        return Response(data)
