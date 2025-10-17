from api.models import Koordinator, Agent  # yolunu projene göre düzelt
from typing import Optional

def _is_hbs_koordinator(user) -> bool:
    """
    Kullanıcının Koordinator tablosunda 'HBSKoordinator' rolüne sahip olup
    olmadığını kontrol eder. Tek sorgu, DoesNotExist riski yok.
    """
    if not getattr(user, "is_authenticated", False):
        return False

    # Eğer staff/superuser herkesi görebilsin istersen bir sonraki iki satırı aç:
    # if user.is_superuser or user.is_staff:
    #     return True

    # Role modelinde alan adı 'name' değilse (örn. code/slug) aşağıdaki satırı uyarlayın.
    return Koordinator.objects.filter(
        user=user,
        roles__name__iexact="HBSKoordinator",
    ).exists()


def _get_user_agent_city(user):
    """
    Kullanıcı bir Agent/HBSTemsilci ise bağlı olduğu City (nesne) döner, yoksa None.
    Tek sorgu + select_related ile N+1 önlenir.
    """
    if not getattr(user, "is_authenticated", False):
        return None

    agent: Optional[Agent] = (
        Agent.objects.select_related("city")
        .filter(user=user)
        .first()
    )
    return agent.city if agent else None

