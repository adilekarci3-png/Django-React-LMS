from django.db import models
from django.conf import settings
from django.utils import timezone
from django.apps import apps
from .choices import LANGUAGE, LEVEL, STATUS, KOORDINATOR_STATUS,RATING
from shortuuid.django_fields import ShortUUIDField

class Odev(models.Model):
    category = models.ForeignKey("api.Category", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kategori")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ödev Koordinatörü")
    file = models.FileField("Ödev Dosyası", upload_to="course-file", blank=True, null=True)
    image = models.FileField("Ödev Resmi", upload_to="course-file", blank=True, null=True)
    title = models.CharField("Ödev Başlığı", max_length=200)
    description = models.TextField("Ödev Açıklaması", null=True, blank=True)
    language = models.CharField("Ödev Dili", choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField("Ödev Seviyesi", choices=LEVEL, default="Baslangic", max_length=100)
    odev_status = models.CharField("Ödevin Durumu", choices=STATUS, default="Taslak", max_length=100)
    koordinator_odev_status = models.CharField("Koordinatörün Sistemindeki Durumu", choices=KOORDINATOR_STATUS, max_length=100, blank=True, null=True)
    date = models.DateTimeField(default=timezone.now)
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Ödevi Hazırlayan", on_delete=models.SET_NULL, null=True, blank=True)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ödev"
        verbose_name_plural = "Ödevler"

    def __str__(self):
        return self.title

    def curriculum(self):
        return VariantOdev.objects.filter(odev=self)

    def lectures(self):
        return VariantOdevItem.objects.filter(variant__odev=self)


class VariantOdev(models.Model):
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Ödev")
    title = models.CharField("Ödev Başlığı", max_length=1000)
    variant_id = ShortUUIDField("Ödev Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Ödev Eklenme Tarihi", default=timezone.now)
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Ekleyen", on_delete=models.SET_NULL, null=True, blank=True)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ödev Müfredat"
        verbose_name_plural = "Ödev Müfredat Bölümleri"

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantOdevItem.objects.filter(variant=self)

    def items(self):
        return VariantOdevItem.objects.filter(variant=self)


class VariantOdevItem(models.Model):
    variant = models.ForeignKey("api.VariantOdev", on_delete=models.CASCADE, related_name="variantOdev_items", verbose_name="Ödev")
    title = models.CharField("Ödev Başlığı", max_length=1000)
    description = models.TextField("Ödev Açıklaması", null=True, blank=True)
    file = models.FileField("Ödev Dosyası", upload_to="course-file", null=True, blank=True)
    duration = models.DurationField("Süre", null=True, blank=True)
    content_duration = models.CharField("İçerik Süresi", max_length=1000, null=True, blank=True)
    preview = models.BooleanField("Önizleme", default=False)
    variant_item_id = ShortUUIDField("Ödev Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ödev Bölüm"
        verbose_name_plural = "Ödev Bölümler"

    def __str__(self):
        return f"{self.variant.title} - {self.title}"
    
class Question_AnswerOdev(models.Model):
    odev = models.ForeignKey(
        "api.Odev", related_name="question_answers",
        on_delete=models.CASCADE, verbose_name="Ödev"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_odev",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_odev",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    title = models.CharField("Soru Başlığı", max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Ödev Soru Cevap"
        verbose_name_plural = "Ödev Soru Cevaplar"

    def __str__(self):
        gonderen = getattr(self.mesajiGonderen, "username", "Bilinmeyen Gönderen")
        odev_basligi = getattr(self.odev, "title", "Bilinmeyen Ödev")
        return f"{gonderen} - {odev_basligi}"

    def messages(self):
        return Question_Answer_MessageOdev.objects.filter(question=self).order_by("created_at")

    def profile(self):
        if not self.mesajiGonderen:
            return None
        from django.apps import apps
        Profile = apps.get_model("userauths", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None


class Question_Answer_MessageOdev(models.Model):
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Ödev")
    question = models.ForeignKey(
        "api.Question_AnswerOdev", on_delete=models.CASCADE,
        verbose_name="Soru Başlığı", related_name="messages"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_mesaj_odev",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_mesaj_odev",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    message = models.TextField("Mesaj", null=True, blank=True)
    qam_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    created_at = models.DateTimeField("Oluşturulma", default=timezone.now)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Ödev Soru Cevap Mesaj"
        verbose_name_plural = "Ödev Soru Cevap Mesajlar"

    def __str__(self):
        gonderen = getattr(self.mesajiGonderen, "username", "Bilinmeyen Gönderen")
        odev_basligi = getattr(self.odev, "title", "Bilinmeyen Ödev")
        return f"{gonderen} - {odev_basligi}"

    def profile(self):
        if not self.mesajiGonderen:
            return None
        from django.apps import apps
        Profile = apps.get_model("userauths", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None
class CompletedOdev(models.Model):
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Tamamlanan Ödev")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    variant_item = models.ForeignKey("api.VariantOdevItem", on_delete=models.CASCADE, verbose_name="Tamamlanan Bölüm")
    date = models.DateTimeField("Ödevin Tamamlanma Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Tamamlanmış Ödev"
        verbose_name_plural = "Tamamlanmış Ödevler"

    def __str__(self):
        return self.odev.title


class EnrolledOdev(models.Model):
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Ödev")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ödevi Hazırlayan")
    egitmen = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    enrollment_id = ShortUUIDField("Ödev Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Ödev Kayıt Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Eğitmene Gönderilen Ödev"
        verbose_name_plural = "Eğitmene Gönderilen Ödevler"

    def __str__(self):
        return self.odev.title

    def lectures(self):
        return apps.get_model("api", "VariantOdevItem").objects.filter(variant__odev=self.odev)

    def curriculum(self):
        return apps.get_model("api", "VariantOdev").objects.filter(odev=self.odev)

    def note(self):
        return apps.get_model("api", "NoteOdev").objects.filter(odev=self.odev, ogrenciStajer=self.inserteduser)

    def question_answer(self):
        return apps.get_model("api", "Question_AnswerOdev").objects.filter(odev=self.odev)

    def review(self):
        return apps.get_model("api", "ReviewOdev").objects.filter(odev=self.odev, ogrenciStajer=self.inserteduser).first()


class NoteOdev(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, related_name="notes", verbose_name="Ödev")
    title = models.CharField("Başlık", max_length=1000, null=True, blank=True)
    note = models.TextField("Not")
    note_id = ShortUUIDField("Not No", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Ödev Not"
        verbose_name_plural = "Ödev Notları"

    def __str__(self):
        return self.title or f"Not #{self.note_id}"


class ReviewOdev(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    odev = models.ForeignKey("api.Odev", on_delete=models.CASCADE, verbose_name="Ödev")
    review = models.TextField("Yorum")
    rating = models.IntegerField("Puan", choices=RATING, default=None)
    reply = models.CharField("Yanıt", null=True, blank=True, max_length=1000)
    active = models.BooleanField("Aktif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Ödev Notu"
        verbose_name_plural = "Ödev Notları"

    def __str__(self):
        return self.odev.title

    def profile(self):
        Profile = apps.get_model("userauths", "Profile")
        try:
            return Profile.objects.get(ogrenciStajer=self.ogrenciStajer)
        except Profile.DoesNotExist:
            return None