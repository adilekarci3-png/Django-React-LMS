# api/models/lessons.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class ESKEPEvent(models.Model):
    title = models.CharField("Başlık", max_length=200)
    date = models.DateField("Tarih")
    background_color = models.CharField("Arkaplan Rengi", max_length=20, default="#007bff")
    border_color = models.CharField("Çerçeve Rengi", max_length=20, default="#0056b3")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="events", verbose_name="Sahip")
    created_at = models.DateTimeField("Oluşturulma", default=timezone.now)
    active = models.BooleanField("Aktif", default=False)

    class Meta:
        verbose_name = "ESKEP Etkinliği"
        verbose_name_plural = "ESKEP Etkinlikleri"

    def __str__(self):
        return f"{self.title} ({self.date})"


class DersAtamasi(models.Model):
    hafiz = models.ForeignKey("api.Hafiz", on_delete=models.CASCADE, related_name="dersler", verbose_name="Hafız")
    instructor = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, verbose_name="Eğitmen")
    start_time = models.DateTimeField("Başlangıç")
    end_time = models.DateTimeField("Bitiş")
    date = models.DateTimeField("Tarih", default=timezone.now)
    time = models.TimeField("Saat", default=timezone.now)
    aciklama = models.TextField("Açıklama", blank=True, null=True)
    topic = models.CharField("Konu", max_length=255)
    active = models.BooleanField("Aktif", default=False)

    class Meta:
        verbose_name = "Ders Ataması"
        verbose_name_plural = "Ders Atamaları"

    def __str__(self):
        return f"{self.hafiz.full_name} - {self.date.date()} {self.time}"


class Ders(models.Model):
    hafiz = models.ForeignKey("api.Hafiz", on_delete=models.CASCADE, verbose_name="Hafız")
    Instructor = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, verbose_name="Eğitmen")
    date = models.DateTimeField("Tarih", default=timezone.now)
    start_time = models.DateTimeField("Başlangıç")
    end_time = models.DateTimeField("Bitiş")
    description = models.TextField("Açıklama", blank=True)
    topic = models.CharField("Konu", max_length=255, default="")
    active = models.BooleanField("Aktif", default=False)

    class Meta:
        verbose_name = "Ders"
        verbose_name_plural = "Dersler"

    def __str__(self):
        return f"{self.hafiz.full_name} - {self.date}"


class LiveLesson(models.Model):
    title = models.CharField("Başlık", max_length=200)
    description = models.TextField("Açıklama")
    datetime = models.DateTimeField("Tarih-Saat")
    platform = models.CharField("Platform", max_length=50, choices=[('zoom','Zoom'), ('meet','Google Meet'), ('teams','Microsoft Teams'), ('jitsi','Jitsi Meet')])
    platform_url = models.URLField("Bağlantı")

    class Meta:
        verbose_name = "Canlı Ders"
        verbose_name_plural = "Canlı Dersler"

    def __str__(self):
        return self.title
