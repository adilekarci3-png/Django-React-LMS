# api/models/geo.py
from django.db import models

class Country(models.Model):
    name = models.CharField("Ülke", max_length=100)
    tax_rate = models.IntegerField("Vergi Oranı", default=5)
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "Ülke"
        verbose_name_plural = "Ülkeler"

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField("Şehir", max_length=100)
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "Şehir"
        verbose_name_plural = "Şehirler"

    def __str__(self):
        return self.name


class District(models.Model):
    name = models.CharField("İlçe", max_length=100, unique=True)
    city = models.ForeignKey("api.City", related_name="districts", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Şehir")
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "İlçe"
        verbose_name_plural = "İlçeler"

    def __str__(self):
        return self.name


