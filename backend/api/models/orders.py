from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from shortuuid.django_fields import ShortUUIDField

class Cart(models.Model):
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, verbose_name="Kurs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Talep Eden Kullanıcı")
    tax_fee = models.DecimalField("Vergi/Talep Ücreti", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField("Toplam", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    country = models.CharField("Ülke", max_length=100, null=True, blank=True)
    cart_id = ShortUUIDField(length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Talep Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Talep"
        verbose_name_plural = "Talepler"

    def __str__(self):
        return self.course.title


class CartOrder(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci")
    teachers = models.ManyToManyField("api.Teacher", blank=True, verbose_name="Eğitmenler")
    full_name = models.CharField("Adı Soyadı", max_length=100, null=True, blank=True)
    email = models.CharField("E-Posta", max_length=100, null=True, blank=True)
    country = models.CharField("Ülke", max_length=100, null=True, blank=True)
    coupons = models.ManyToManyField("api.Coupon", blank=True, verbose_name="Ödüller")
    oid = ShortUUIDField("Talep Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Talep Tarihi", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Talep Seçenek"
        verbose_name_plural = "Talep Seçenekleri"

    def __str__(self):
        return self.oid

    def order_items(self):
        return CartOrderItem.objects.filter(order=self)


class CartOrderItem(models.Model):
    order = models.ForeignKey("api.CartOrder", on_delete=models.CASCADE, related_name="orderitem", verbose_name="Talep")
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, related_name="order_item", verbose_name="Kurs")
    teacher = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, verbose_name="Eğitmen")

    # snapshot alanları
    price = models.DecimalField("Fiyat", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_fee = models.DecimalField("Vergi", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField("Toplam", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    initial_total = models.DecimalField("İlk Toplam", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    saved = models.DecimalField("Kazanç", max_digits=12, decimal_places=2, default=Decimal("0.00"))

    coupons = models.ManyToManyField("api.Coupon", blank=True, verbose_name="Ödüller")
    applied_coupon = models.BooleanField("Kupon Uygulandı", default=False)
    oid = ShortUUIDField("Talep Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Talep Tarihi", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Talep İstek Seçenek"
        verbose_name_plural = "Talep İstek Seçenekleri"

    @property
    def order_id(self):
        return f"Order ID #{str(self.order.oid)}"

    @property
    def payment_status(self):
        # CartOrder'da alan yoksa None döner
        return getattr(self.order, "payment_status", None)

    def __str__(self):
        return str(self.oid)
