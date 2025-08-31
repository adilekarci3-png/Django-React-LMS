# apps/eskep/utils.py
from __future__ import annotations

from typing import Optional, Union
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import AnonymousUser
from . import api_models

# İstemci kodda genelde request.user geliyor:
UserLike = Union[AbstractBaseUser, AnonymousUser]

def _uid(user: UserLike) -> Optional[int]:
    # AnonymousUser için id olmayabilir
    return getattr(user, "id", None)

def get_teacher_for_user(user: UserLike) -> Optional[api_models.Teacher]:
    """
    Teacher tablosunda user_id == user.id olan kaydı getirir.
    Kaydı bulamazsa None döner.
    """
    uid = _uid(user)
    if uid is None:
        return None
    return api_models.Teacher.objects.filter(user_id=uid).first()

def get_user_instructor_id(user: UserLike) -> Optional[int]:
    """
    Eğitmen ise Teacher kaydının PK'sini döndürür; değilse None.
    """
    teacher = get_teacher_for_user(user)
    return teacher.id if teacher else None

def is_teacher(user: UserLike) -> bool:
    uid = _uid(user)
    if uid is None:
        return False
    return api_models.Teacher.objects.filter(user_id=uid).exists()

