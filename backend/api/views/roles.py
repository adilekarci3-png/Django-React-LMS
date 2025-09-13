# api/views/roles.py
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import models as api_models, serializers as api_serializer
from .utils import get_user_role

User = get_user_model()


# Örnek kullanım view'i
def user_role_view(request):
    user = request.user
    role = get_user_role(user.id)
    return JsonResponse({"user_id": user.id, "role": role})


def user_role_by_id_view(request, user_id):
    role = get_user_role(user_id)
    return JsonResponse({"user_id": user_id, "role": role})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_role_detail(request):
    """
    Kullanıcının sahip olduğu base/sub rolleri (çoklu) döndürür.
    """
    user = request.user
    data = {"base_roles": [], "sub_roles": []}

    if api_models.Teacher.objects.filter(user=user).exists():
        teacher = api_models.Teacher.objects.get(user=user)
        data["base_roles"].append("Teacher")
        data["sub_roles"].extend(teacher.roles.values_list("name", flat=True))

    if api_models.Koordinator.objects.filter(user=user).exists():
        koordinator = api_models.Koordinator.objects.get(user=user)
        data["base_roles"].append("Koordinator")
        data["sub_roles"].extend(koordinator.roles.values_list("name", flat=True))

    if api_models.Ogrenci.objects.filter(user=user).exists():
        ogrenci = api_models.Ogrenci.objects.get(user=user)
        data["base_roles"].append("Ogrenci")
        data["sub_roles"].extend(ogrenci.roles.values_list("name", flat=True))

    if api_models.Stajer.objects.filter(user=user).exists():
        stajer = api_models.Stajer.objects.get(user=user)
        data["base_roles"].append("Stajer")
        data["sub_roles"].extend(stajer.roles.values_list("name", flat=True))

    if api_models.Hafiz.objects.filter(email=user.email).exists():
        hafiz = api_models.Hafiz.objects.get(email=user.email)
        data["base_roles"].append("Hafiz")
        data["sub_roles"].extend(hafiz.roles.values_list("name", flat=True))

    if api_models.Agent.objects.filter(user=user).exists():
        agent = api_models.Agent.objects.get(user=user)
        data["base_roles"].append("Agent")
        data["sub_roles"].extend(agent.roles.values_list("name", flat=True))

    data["sub_roles"] = list(set(data["sub_roles"]))
    data["base_roles"] = list(set(data["base_roles"]))
    return Response(data)


class UpdateCoordinatorRole(APIView):
    """
    Basit role map ile Koordinatör'ün rolünü set eder.
    """
    ROLE_MAP = {
        "Ogrenci": "ESKEPOgrenciKoordinator",
        "Stajer": "ESKEPStajerKoordinator",
        "Genel": "ESKEPGenelKoordinator",
    }

    def post(self, request):
        coordinator_id = request.data.get('coordinator_id')
        role_key = request.data.get('role')  # "Ogrenci" / "Stajer" / "Genel"

        if not coordinator_id or not role_key:
            return Response({"error": "Eksik veri"}, status=status.HTTP_400_BAD_REQUEST)

        role_name = self.ROLE_MAP.get(role_key)
        if not role_name:
            return Response({"error": "Geçersiz rol adı"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        try:
            role = api_models.KoordinatorRole.objects.get(name=role_name)
        except api_models.KoordinatorRole.DoesNotExist:
            return Response({"error": f"{role_name} adlı rol bulunamadı"}, status=status.HTTP_400_BAD_REQUEST)

        coordinator.roles.set([role])
        return Response({"detail": f"{role_key} rolü başarıyla atandı"}, status=status.HTTP_200_OK)
