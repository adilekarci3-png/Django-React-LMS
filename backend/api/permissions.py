from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import BasePermission
from api import models as api_models


class IsGeneralKoordinator(BasePermission):
    """
    Kullanıcının Koordinator tablosunda olup,
    rollerinden biri allowed_sub_roles listesindeyse veya
    base_roles içinde 'Koordinator' varsa izin verilir.
    """
    allowed_sub_roles = [
        "HBSKoordinator",
        "HDMKoordinator",
        "AkademiKoordinator",
        "ESKEPKoordinator",
        "ESKEPOgrenciKoordinator",
        "ESKEPGenelKoordinator",
        "ESKEPStajerKoordinator",
    ]

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        try:
            koordinator = api_models.Koordinator.objects.get(user=user)
            if koordinator.roles.filter(name__in=self.allowed_sub_roles).exists():
                return True
        except ObjectDoesNotExist:
            pass

        # base_roles alanı veya token üzerinden kontrol
        if hasattr(user, "base_roles") and "Koordinator" in getattr(user, "base_roles", []):
            return True

        token_data = getattr(user, "token", None)
        if isinstance(token_data, dict) and "Koordinator" in token_data.get("base_roles", []):
            return True

        return False


class IsGeneralTeacher(BasePermission):
    """
    Kullanıcının Teacher tablosunda olup,
    rolleri arasında allowed_teacher_roles'ten biri varsa izin verilir.
    """
    allowed_teacher_roles = [
        "HBSEgitmen",
        "HDMEgitmen",
        "AkademiEgitmen",
        "ESKEPEgitmen",
    ]

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        try:
            teacher = api_models.Teacher.objects.get(user=user)
            return teacher.roles.filter(name__in=self.allowed_teacher_roles).exists()
        except ObjectDoesNotExist:
            return False
