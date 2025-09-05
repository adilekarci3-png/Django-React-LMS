
from api.models import Agent, Koordinator
def _is_hbs_koordinator(user) -> bool:
    """
    Kullanıcının Koordinator tablosunda olup 'HBSKoordinator' alt rolüne sahip
    olup olmadığını kontrol eder.
    """
    try:
        k = Koordinator.objects.get(user=user)
        return k.roles.filter(name="HBSKoordinator").exists()
    except Koordinator.DoesNotExist:
        return False


def _get_user_agent_city(user):
    """
    Kullanıcı bir 'Agent/HBSTemsilci' ise bağlı olduğu city döner, yoksa None.
    """
    try:
        ag = Agent.objects.get(user=user)
        return ag.city
    except Agent.DoesNotExist:
        return None