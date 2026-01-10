from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TeacherStudent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="students")

    class Meta:
        unique_together = ("user", "instructor")
        verbose_name = "Eğitmen-Öğrenci"
        verbose_name_plural = "Eğitmen-Öğrenci İlişkileri"

    def __str__(self):
        ins_name = getattr(self.instructor, "full_name", getattr(self.instructor, "username", self.instructor_id))
        usr_name = getattr(self.user, "username", self.user_id)
        return f"{ins_name} ↔ {usr_name}"
