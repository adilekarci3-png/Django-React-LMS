from django.db import models

class Branch(models.Model):
    name = models.CharField("Branş", max_length=100)

    class Meta:
        verbose_name = "Branş"
        verbose_name_plural = "Branşlar"

    def __str__(self):
        return self.name


class Educator(models.Model):
    GENDER_CHOICES = (("Erkek", "Erkek"), ("Kadın", "Kadın"))

    full_name = models.CharField("Ad Soyad", max_length=100)
    phone = models.CharField("Telefon", max_length=20)
    email = models.EmailField("E-posta")
    image = models.FileField("Profil Resmi", upload_to="educator-Photo",
                             blank=True, null=True, default="default.jpg")
    gender = models.CharField("Cinsiyet", max_length=10, choices=GENDER_CHOICES)
    city = models.ForeignKey("api.City", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="İl")
    district = models.ForeignKey("api.District", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="İlçe")
    branch = models.ForeignKey("api.Branch", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Branş")
    education_level = models.ForeignKey("api.EducationLevel", on_delete=models.SET_NULL,
                                        null=True, blank=True, verbose_name="Eğitim Düzeyi")
    description = models.TextField("Açıklama", blank=True)
    active = models.BooleanField("Aktif", default=True)

    class Meta:
        verbose_name = "Eğitici"
        verbose_name_plural = "Eğiticiler"

    def __str__(self):
        return self.full_name
    
class EducationLevel(models.Model):
    name = models.CharField("Eğitim Düzeyi", max_length=100)

    class Meta:
        verbose_name = "Eğitim Düzeyi"
        verbose_name_plural = "Eğitim Düzeyleri"

    def __str__(self):
        return self.name

class Job(models.Model):
    name = models.CharField("Meslek", max_length=100)
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "Meslek"
        verbose_name_plural = "Meslekler"

    def __str__(self):
        return self.name