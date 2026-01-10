from django.db import models

class LookupType(models.Model):
    key = models.CharField(max_length=50, unique=True)   # örn: "LANGUAGE", "GENDER"
    name = models.CharField(max_length=100)              # görünen ad: "Dil", "Cinsiyet"
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Sözlük Türü"
        verbose_name_plural = "Sözlük Türleri"

    def __str__(self):
        return f"{self.name} ({self.key})"


class Lookup(models.Model):
    type = models.ForeignKey(LookupType, on_delete=models.CASCADE, related_name="items")
    code = models.CharField(max_length=50)               # örn: "Turkce", "Erkek", "Zoom"
    label = models.CharField(max_length=100)             # görünen etiket: "Türkçe", "Erkek", "Zoom"
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    extra = models.JSONField(blank=True, null=True)      # gerekirse metadata (renk, ikon vs.)

    class Meta:
        unique_together = ("type", "code")
        ordering = ["type__key", "order", "label"]
        verbose_name = "Sözlük Değeri"
        verbose_name_plural = "Sözlük Değerleri"

    def __str__(self):
        return f"{self.type.key} · {self.label}"