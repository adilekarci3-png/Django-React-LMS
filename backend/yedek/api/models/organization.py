# api/models/organization.py
from django.db import models
from django.conf import settings

class OrganizationMember(models.Model):
    Name = models.CharField("Üye Adı Soyadı", max_length=100)
    Designation = models.ForeignKey("api.Designation", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Görevi")
    ImageUrl = models.FileField("Üye Resmi", upload_to="course-file", blank=True, null=True, default="default.jpg")
    IsExpand = models.BooleanField("Expand")
    active = models.BooleanField("Aktif/Pasif")
    email = models.EmailField("E-Posta", default="")
    phone = models.CharField("Telefon", max_length=15, default="")

    class Meta:
        verbose_name = "Organizasyon Üyesi"
        verbose_name_plural = "Organizasyon Üyeleri"

    def __str__(self):
        return self.Name


class Designation(models.Model):
    name = models.CharField("Üye Görevi", max_length=100)
    ustBirim = models.IntegerField("Üst Birim", default=0)
    birimNumarasi = models.IntegerField("Birim Numarası", default=0)
    active = models.BooleanField("Aktif/Pasif")

    class Meta:
        verbose_name = "Üye Görevi"
        verbose_name_plural = "Üye Görevleri"

    def __str__(self):
        return self.name


class Proje(models.Model):
    name = models.CharField("Proje Adı", max_length=100)
    active = models.BooleanField("Aktif/Pasif", default=True)
    image = models.FileField("Proje Resmi", upload_to="proje-file", default="HBS.png", null=True, blank=True)

    class Meta:
        verbose_name = "Proje Adı"
        verbose_name_plural = "Projeler"

    def __str__(self):
        return self.name


class Departman(models.Model):
    name = models.CharField(max_length=120)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Uye(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True, blank=True,related_name="uyeler")
    full_name = models.CharField(max_length=120)
    title = models.CharField(max_length=120, blank=True)
    photo = models.ImageField(upload_to="avatars/", null=True, blank=True)
    department = models.ForeignKey(Departman, null=True, blank=True, on_delete=models.SET_NULL, related_name="employees")
    manager = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "full_name"]

    def __str__(self):
        return self.full_name
