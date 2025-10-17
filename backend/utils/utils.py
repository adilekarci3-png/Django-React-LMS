# apps/eskep/utils.py
from __future__ import annotations

from typing import Optional, Union, TYPE_CHECKING
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import AnonymousUser

# Projede modelleri tek yerden çekelim:
from api import models as api_models

if TYPE_CHECKING:
    from api.models import Teacher  # sadece type-check için

# İstemci kodda genelde request.user geliyor:
UserLike = Union[AbstractBaseUser, AnonymousUser]


def _uid(user: UserLike) -> Optional[int]:
    """
    Güvenli şekilde kullanıcı ID'si döndürür. AnonymousUser için None döner.
    """
    # Bazı custom user tiplerinde pk kullanılıyor olabilir
    uid = getattr(user, "id", None)
    if uid is None:
        uid = getattr(user, "pk", None)
    return uid


def get_teacher_for_user(user: UserLike) -> Optional["Teacher"]:
    """
    Teacher tablosunda user_id == user.id olan kaydı getirir.
    Bulamazsa None döner.

    Performans:
      - select_related("user"): user alanına erişimde ek sorgu atılmaz.
      - only(...): gereksiz sütunlar taşınmaz (ihtiyaca göre genişletilebilir).
    """
    uid = _uid(user)
    if uid is None:
        return None

    return (
        api_models.Teacher.objects
        .select_related("user")
        .only("id", "user_id")   # gerekiyorsa alan ekleyin
        .filter(user_id=uid)
        .first()
    )


def get_user_instructor_id(user: UserLike) -> Optional[int]:
    """
    Eğitmen ise Teacher kaydının PK'sini döndürür; değilse None.
    (Geriye dönük uyumluluk için isim aynı bırakıldı.)
    """
    teacher = get_teacher_for_user(user)
    return teacher.id if teacher else None


def is_teacher(user: UserLike) -> bool:
    """
    Kullanıcının Teacher kaydı var mı?
    """
    uid = _uid(user)
    if uid is None:
        return False
    # exists() hem hızlıdır hem hafızayı şişirmez
    return api_models.Teacher.objects.filter(user_id=uid).exists()


__all__ = [
    "UserLike",
    "_uid",
    "get_teacher_for_user",
    "get_user_instructor_id",
    "is_teacher",
]
