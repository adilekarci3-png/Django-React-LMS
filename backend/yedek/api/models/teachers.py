from django.db import models
from django.contrib.auth import get_user_model
from django.apps import apps

User = get_user_model()

class Teacher(models.Model):
    user = models.OneToOneField(User, verbose_name="Kullanıcı", on_delete=models.CASCADE)
    image = models.FileField("Eğitmen Profil Resmi", upload_to="course-file",
                             blank=True, null=True, default="default.jpg")
    full_name = models.CharField("Adı Soyadı", max_length=100)
    roles = models.ManyToManyField("api.TeacherRole", verbose_name="Roller", blank=True)
    bio = models.CharField("Eğitmen Biyografi", max_length=100, null=True, blank=True)
    facebook = models.URLField("Facebook", null=True, blank=True)
    twitter = models.URLField("Twitter", null=True, blank=True)
    linkedin = models.URLField("LinkedIn", null=True, blank=True)
    about = models.TextField("Eğitmen Hakkında Bilgi", null=True, blank=True)
    country = models.CharField("Ülke", max_length=100, null=True, blank=True)
    branch = models.ForeignKey("api.Branch", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Branş")
    education_level = models.CharField("Eğitim Seviyesi", max_length=100, blank=True, null=True)
    description = models.TextField("Açıklama", blank=True)
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "Eğitmen"
        verbose_name_plural = "Eğitmenler"

    def __str__(self):
        return self.full_name

    # Yardımcı ilişkisel metodlar — döngüyü önlemek için apps.get_model kullandık
    def students(self):
        # CartOrderItem modelinde teacher FK varsa çalışır
        CartOrderItem = apps.get_model("api", "CartOrderItem")
        return CartOrderItem.objects.filter(teacher=self)

    def hafizs(self):
        # Projendeki M2M alan adı 'hafiz_ogrencileri' ise çalışır; farklıysa uyarlayın
        return getattr(self, "hafiz_ogrencileri", []).all()

    def courses(self):
        Course = apps.get_model("api", "Course")
        return Course.objects.filter(teacher=self)

    def review(self):
        Course = apps.get_model("api", "Course")
        return Course.objects.filter(teacher=self).count()
