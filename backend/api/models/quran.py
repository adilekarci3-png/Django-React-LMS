# api/models/quran.py
from django.db import models
from django.conf import settings

class QuranAnnotation(models.Model):
    SHAPE_CHOICES = [('line', 'Line'), ('circle', 'Circle')]
    shape_type = models.CharField(max_length=10, choices=SHAPE_CHOICES)
    coordinates = models.JSONField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class QuranPage(models.Model):
    page_number = models.PositiveIntegerField(unique=True)
    image = models.ImageField(upload_to='quran_pages/')
    active = models.BooleanField(default=False)

    def __str__(self):
        return f"Page {self.page_number}"


class Annotation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Kullanıcı")
    page = models.ForeignKey(QuranPage, on_delete=models.CASCADE, verbose_name="Sayfa")
    shape_type = models.CharField("Şekil", max_length=10, choices=[('line', 'Line'), ('circle', 'Circle')])
    x1 = models.FloatField(default=0.0); y1 = models.FloatField(default=0.0)
    x2 = models.FloatField(default=0.0); y2 = models.FloatField(default=0.0)
    text = models.TextField("Metin", blank=True)

    def __str__(self):
        return f"{self.user} - Page {self.page.page_number} - {self.shape_type}"

    @property
    def coordinates(self):
        # API tüketimi için tek bir obje halinde döndür
        return {"x1": self.x1, "y1": self.y1, "x2": self.x2, "y2": self.y2}


class HataNotu(models.Model):
    hafiz = models.ForeignKey("api.Hafiz", on_delete=models.CASCADE, related_name="hatalar", verbose_name="Hafız")
    lesson = models.ForeignKey("api.Ders", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ders")
    sayfa = models.IntegerField("Sayfa")
    tarih = models.DateField("Tarih", auto_now_add=True)
    shape_type = models.CharField("Şekil", max_length=20, null=True, blank=True)
    coordinates = models.JSONField("Koordinatlar", null=True, blank=True)
    text = models.TextField("Metin", null=True, blank=True)
    hata_turu = models.CharField("Hata Türü", max_length=50, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Oluşturan")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True, null=True, blank=True)
    active = models.BooleanField("Aktif", default=False)

    class Meta:
        verbose_name = "Hata Notu"
        verbose_name_plural = "Hata Notları"

    def __str__(self):
        return f"{self.hafiz.full_name}"
