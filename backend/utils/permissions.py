# api/permissions.py
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import BasePermission, SAFE_METHODS
from utils.educator import get_user_instructor_id
from api import models as api_models

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
# Yardımcılar (views da buradan çağıracak)
# -----------------------
def is_eskep_koordinator(user) -> bool:
    """Kullanıcı Koordinator tablosunda ve izinli alt rolllerden birine sahipse True."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    # staff/superuser -> koordinator gibi davranabilir (istersen kaldır)
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        return True
    try:
        k = api_models.Koordinator.objects.select_related("user").prefetch_related("roles").get(user=user)
        return k.roles.filter(name__in=ALLOWED_KOORD_SUBROLES).exists()
    except ObjectDoesNotExist:
        return False

def get_teacher_for_user(user):
    """Kullanıcı Teacher tablosunda ve izinli alt rollerden birine sahipse Teacher objesini, yoksa None döndürür."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        t = api_models.Teacher.objects.select_related("user").prefetch_related("roles").get(user=user)
        return t if t.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None

def user_is_teacher(user) -> bool:
    return get_teacher_for_user(user) is not None

def get_educator_for_user(user):
    """Kullanıcı Teacher tablosunda ve izinli alt rollerden birine sahipse Teacher objesini, yoksa None döndürür."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        t = api_models.Educator.objects.select_related("user").prefetch_related("roles").get(user=user)
        return t if t.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None

def user_is_educator(user) -> bool:
    return get_educator_for_user(user) is not None
# -----------------------
# Permission sınıfları
# -----------------------
class IsEskepKoordinatorOrTeacher(BasePermission):
    """
    Koordinator (izinli alt roller) VEYA Teacher (izinli alt roller) ise izin ver.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_eskep_koordinator(user) or user_is_teacher(user)

class CanModifyVideoLink(BasePermission):
    """
    GET/HEAD/OPTIONS: giriş yapan herkes görebilir.
    POST/PUT/PATCH/DELETE:
      - Koordinator: her şeyi
      - Teacher: sadece kendi kaydını
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        # Nesne-öncesi kapı: Koordinator veya Teacher olsun
        return is_eskep_koordinator(user) or user_is_teacher(user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        # Koordinator her şeyi düzenler/siler
        if is_eskep_koordinator(user):
            return True

        # Teacher yalnızca kendi videosu
        if user_is_teacher(user):
            # DİKKAT: obj.instructor FK'sı hangi tabloya bağlıysa,
            # get_user_instructor_id(user) o tablonun PK'sını döndürmelidir.
            # (Örn. FK Educator ise -> Educator.id; FK Teacher ise -> Teacher.id)
            my_ins_id = get_user_instructor_id(user)
            return bool(my_ins_id and obj.instructor_id == my_ins_id)

        return False
