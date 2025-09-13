# api/views/assignments.py
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .. import models as api_models, serializers as api_serializer


class DersAtamasiAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.DersAtamasiSerializer

    def get_queryset(self):
        qs = api_models.DersAtamasi.objects.select_related("hafiz", "instructor").all()
        hafiz_id = self.request.query_params.get("hafiz")
        if hafiz_id and hafiz_id not in ("null", "None", "0"):
            try:
                qs = qs.filter(hafiz_id=int(hafiz_id))
            except ValueError:
                qs = qs.none()
        return qs


class DersAtamasiDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return api_models.DersAtamasi.objects.get(pk=pk)
        except api_models.DersAtamasi.DoesNotExist:
            return None

    def get(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        serializer = api_serializer.DersAtamasiSerializer(ders)
        return Response(serializer.data)

    def put(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        serializer = api_serializer.DersAtamasiSerializer(ders, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        ders = self.get_object(pk)
        if not ders:
            return Response({"error": "Ders bulunamadı."}, status=404)
        ders.delete()
        return Response(status=204)

class CoordinatorYetkiAtaAPIView(generics.UpdateAPIView):
    serializer_class = api_serializer.KoordinatorSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Koordinator.objects.all()

    def put(self, request, *args, **kwargs):
        coordinator_id = request.data.get("coordinator_id")
        role = request.data.get("role")

        if not coordinator_id or not role:
            return Response({"message": "coordinator_id ve role alanları gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({'message': 'Koordinatör bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

        coordinator.role = role
        coordinator.save()

        return Response({
            'message': 'Koordinatör başarıyla güncellendi',
            'id': coordinator.id,
            'role': coordinator.role
        }, status=status.HTTP_200_OK)

    # def put(self, request, *args, **kwargs):
    #     # PUT işlemi yapılacak kod burada
    #     data = request.data
        
    #     # Burada koordinatörü güncelleme işlemi yapabiliriz
    #     try:
    #         coordinator = api_models.Koordinator.objects.get(id=kwargs['pk'])
    #         coordinator.full_name = data['full_name']
    #         coordinator.role = data['role']
    #         coordinator.save()
    #         return Response({'message': 'Koordinatör başarıyla güncellendi'}, status=200)
    #     except api_models.Koordinator.DoesNotExist:
    #         return Response({'message': 'Koordinatör bulunamadı'}, status=404)
