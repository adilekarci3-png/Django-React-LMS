# backend/api/permissions.py
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import BasePermission, SAFE_METHODS
from api import models as api_models  # burası modelleri import eder; views import ETMEMELİ

# İzinlerde kullandığımız alt rol isimleri:
ALLOWED_KOORD_SUBROLES = {
    "ESKEPKoordinator",
    "ESKEPGenelKoordinator",
    "HBSKoordinator",
    "HDMKoordinator",
    "AkademiKoordinator",
    "ESKEPOgrenciKoordinator",
    "ESKEPStajerKoordinator",
}
ALLOWED_TEACHER_SUBROLES = {
    "ESKEPEgitmen",
    "HBSEgitmen",
    "HDMEgitmen",
    "AkademiEgitmen",
}

# -----------------------
# Yardımcılar
# -----------------------
def is_eskep_koordinator(user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        return True
    try:
        k = (
            api_models.Koordinator.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return k.roles.filter(name__in=ALLOWED_KOORD_SUBROLES).exists()
    except ObjectDoesNotExist:
        return False

def get_teacher_for_user(user):
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        t = (
            api_models.Teacher.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return t if t.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None

def user_is_teacher(user) -> bool:
    return get_teacher_for_user(user) is not None

def get_educator_for_user(user):
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        e = (
            api_models.Educator.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return e if e.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None

def user_is_educator(user) -> bool:
    return get_educator_for_user(user) is not None

def _user_matches_object_owner(user, obj) -> bool:
    """
    utils.educator.get_user_instructor_id KULLANMADAN,
    kullanıcının Teacher/Educator PK'sı ile objenin muhtemel sahip FK'larını eşleştirir.
    """
    user_owner_ids = set()
    t = get_teacher_for_user(user)
    e = get_educator_for_user(user)
    if t:
        user_owner_ids.add(getattr(t, "id", None))
    if e:
        user_owner_ids.add(getattr(e, "id", None))
    user_owner_ids.discard(None)

    if not user_owner_ids:
        return False

    target_ids = set()
    for attr in ("instructor_id", "teacher_id", "educator_id", "owner_id", "created_by_id"):
        if hasattr(obj, attr):
            target_ids.add(getattr(obj, attr))
    target_ids.discard(None)

    return bool(user_owner_ids & target_ids)

# -----------------------
# Permission sınıfları
# -----------------------
class IsEskepKoordinatorOrTeacher(BasePermission):
    """Koordinator (izinli alt roller) VEYA Teacher (izinli alt roller) ise izin ver."""
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_eskep_koordinator(user) or user_is_teacher(user)

class CanModifyVideoLink(BasePermission):
    """
    SAFE_METHODS: herkes görebilir (auth zorunlu değilse view belirler)
    Değişiklik:
      - Koordinator: her şeyi
      - Teacher/Educator: yalnızca kendisine ait kayıtlar
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_eskep_koordinator(user) or user_is_teacher(user) or user_is_educator(user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if is_eskep_koordinator(user):
            return True
        return _user_matches_object_owner(user, obj)
