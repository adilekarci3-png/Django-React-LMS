# api/models/commerce.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from .choices import NOTI_TYPE

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    teacher = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    order = models.ForeignKey("api.CartOrder", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Talep")
    order_item = models.ForeignKey("api.CartOrderItem", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Talep Öğesi")
    review = models.ForeignKey("api.Review", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Yorum")
    type = models.CharField("Tür", max_length=100, choices=NOTI_TYPE)
    seen = models.BooleanField("Görüldü", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Bildirim"
        verbose_name_plural = "Bildirimler"

    def __str__(self):
        return getattr(self.user, "full_name", f"Notification#{self.pk}") or f"Notification#{self.pk}"


class Coupon(models.Model):
    teacher = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    used_by = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, verbose_name="Kullananlar")
    code = models.CharField("Kod", max_length=50)
    discount = models.IntegerField("İndirim (%)", default=1)
    active = models.BooleanField("Aktif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Ödül"
        verbose_name_plural = "Ödüller"

    def __str__(self):
        return self.code


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, verbose_name="Kurs")
    active = models.BooleanField("Aktif", default=True)

    class Meta:
        verbose_name = "İstek"
        verbose_name_plural = "İstekler"

    def __str__(self):
        return str(self.course.title)


class WishlistOdev(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Ödev")
    active = models.BooleanField("Aktif", default=True)

    class Meta:
        verbose_name = "Ödev İstek"
        verbose_name_plural = "Ödev İstekler"

    def __str__(self):
        return str(self.odev.title)
