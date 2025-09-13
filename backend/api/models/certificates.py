from django.db import models
from django.conf import settings
from django.utils import timezone
from shortuuid.django_fields import ShortUUIDField

class Certificate(models.Model):
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, verbose_name="Sertifikası Alınan Kurs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    certificate_id = ShortUUIDField("Sertifika Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Sertifika Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Sertifika"
        verbose_name_plural = "Sertifikalar"

    def __str__(self):
        return self.course.title
