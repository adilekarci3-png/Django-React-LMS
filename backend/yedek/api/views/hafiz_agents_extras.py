# api/views/hafiz_agents_extras.py
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .. import models as api_models, serializers as api_serializer


class HafizAgentListAPIView(APIView):
    """
    Agent'a bağlı tüm hafızları listeler (basit sürüm).
    """
    permission_classes = [AllowAny]

    def get(self, request, agent_id):
        hafizlar = api_models.Hafiz.objects.filter(agent_id=agent_id)
        serializer = api_serializer.HafizSerializer(hafizlar, many=True)
        return Response(serializer.data)


class HafizAPIView(APIView):
    def get(self, request):
        hafizlar = api_models.Hafiz.objects.all()
        serializer = api_serializer.HafizSerializer(hafizlar, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = api_serializer.HafizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class HafizDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return api_models.Hafiz.objects.get(pk=pk)
        except api_models.Hafiz.DoesNotExist:
            return None

    def get(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        serializer = api_serializer.HafizSerializer(hafiz)
        return Response(serializer.data)

    def put(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        serializer = api_serializer.HafizSerializer(hafiz, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        hafiz = self.get_object(pk)
        if not hafiz:
            return Response({"error": "Hafız bulunamadı."}, status=404)
        hafiz.delete()
        return Response(status=204)
