from django.http import JsonResponse
from api import models as api_models
from django.db.models import Q

def get_user_role(user_id):
    """
    Kullanıcının temel rolünü hızlıca döndürür.
    """
    from .. import models as api_models  # lokal import (döngüden kaçınmak için)
    try:
        if api_models.Koordinator.objects.filter(user__id=user_id).exists():
            return "Koordinator"
        elif api_models.Stajer.objects.filter(user__id=user_id).exists():
            return "Stajer"
        elif api_models.Ogrenci.objects.filter(user__id=user_id).exists():
            return "Ogrenci"
        elif api_models.Teacher.objects.filter(user__id=user_id).exists():
            return "Teacher"
        elif api_models.Agent.objects.filter(user__id=user_id).exists():
            return "Agent"
        else:
            return "Unknown"
    except Exception as e:
        return f"Error: {str(e)}"


def human_size(num, suffix="B"):
    for unit in ["", "K", "M", "G", "T"]:
        if abs(num) < 1024.0:
            return f"{num:3.1f} {unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f} P{suffix}"


def abs_url(request, f_or_url):
    """
    FileField ya da url string'i için mutlak URL döndür.
    """
    url = None
    try:
        url = getattr(f_or_url, "url")  # FileField
    except Exception:
        url = f_or_url
    if not url:
        return None
    if request and isinstance(url, str) and url.startswith("/"):
        return request.build_absolute_uri(url)
    return url

class KoordinatorLookupMixin:
    """
    URL: .../<kitaptahlili_id>/<user_id>/<note_id>/
    Buradaki user_id, ya Koordinator.pk ya da User.pk olabilir.
    """
    def get_koordinator(self):
        raw = self.kwargs.get("user_id") or getattr(self.request.user, "id", None)
        if raw is None:
            return None
        # Hem Koordinator.id hem Koordinator.user_id kabul et
        try:
            return api_models.Koordinator.objects.select_related("user").get(
                Q(id=raw) | Q(user__id=raw)
            )
        except api_models.Koordinator.DoesNotExist:
            return None

    def is_genel_koordinator(self, koordinator) -> bool:
        if koordinator is None:
            return False
        return koordinator.roles.filter(name="ESKEPGenelKoordinator").exists()