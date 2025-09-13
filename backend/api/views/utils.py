from django.http import JsonResponse

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