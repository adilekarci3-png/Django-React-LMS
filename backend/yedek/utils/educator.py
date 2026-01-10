# api/utils/educator.py
from api.models import TeacherStudent

def _has_any_role(user, wanted=("Egitmen", "Koordinator", "GeneralKoordinator")):
    """Projendeki rol yapına göre serbestçe uyarlayabilirsin."""
    # Basit string alanı:
    role = getattr(user, "role", None)
    if role in wanted:
        return True
    # M2M ise:
    if hasattr(user, "roles"):
        try:
            names = [r.name for r in user.roles.all()]
            return any(r in wanted for r in names)
        except Exception:
            pass
    return False

def get_user_instructor_id(user):
    """
    TeacherStudent modeline göre:
      - Öğrenciyse -> bağlı olduğu instructor_id
      - Eğitmense -> kendi user.id (eğitmen kimliği olarak)
      - Diğer durumlar -> None
    """
    if not user or not getattr(user, "is_authenticated", False):
        return None

    # 1) Öğrenci olarak bir eğitmene bağlı mı?
    ins_id = (
        TeacherStudent.objects
        .filter(user=user)
        .values_list("instructor_id", flat=True)
        .first()
    )
    print
    if ins_id:
        return ins_id

    # 2) Kullanıcı rol olarak Eğitmen ise, kendi id'sini eğitmen id'si say.
    if _has_any_role(user, wanted=("Egitmen",)):
        return user.id

    # 3) Ne öğrenci-eğitmen eşleşmesi var ne de kullanıcı eğitmen rolünde
    return None
