from django.db import models
from django.conf import settings
from django.utils import timezone
from django.apps import apps
from .choices import LANGUAGE, LEVEL, STATUS, KOORDINATOR_STATUS,RATING
from shortuuid.django_fields import ShortUUIDField

class DersSonuRaporu(models.Model):
    category = models.ForeignKey("api.Category", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kategori")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ders Sonu Raporu Koordinatörü")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Ders Sonunu Hazırlayan")
    file = models.FileField("Ders Sonu Raporu Dosyası", upload_to="course-file", blank=True, null=True)
    image = models.FileField("Ders Sonu Raporu Resmi", upload_to="course-file", blank=True, null=True)
    title = models.CharField("Ders Sonu Raporu Başlığı", max_length=200)
    description = models.TextField("Ders Sonu Raporu Açıklaması", null=True, blank=True)
    language = models.CharField("Ders Sonu Raporu Dili", choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField("Ders Sonu Raporu Seviyesi", choices=LEVEL, default="Baslangic", max_length=100)
    derssonuraporu_status = models.CharField("Ders Sonu Raporunun Durumu", choices=STATUS, default="Taslak", max_length=100)
    koordinator_derssonuraporu_status = models.CharField("Koordinatörün Sistemindeki Durumu", choices=KOORDINATOR_STATUS, max_length=100, blank=True, null=True)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Ders Sonu Raporu"
        verbose_name_plural = "Ders Sonu Raporuler"

    def __str__(self):
        return self.title

    def curriculum(self):
        return VariantDersSonuRaporu.objects.filter(derssonuraporu=self)

    def lectures(self):
        return VariantDersSonuRaporuItem.objects.filter(variant__derssonuraporu=self)


class VariantDersSonuRaporu(models.Model):
    derssonuraporu = models.ForeignKey("api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu")
    title = models.CharField("Ders Sonu Raporu Başlığı", max_length=1000)
    variant_id = ShortUUIDField("Ders Sonu Raporu Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Ders Sonu Raporu Eklenme Tarihi", default=timezone.now)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ders Sonu Raporu Müfredat"
        verbose_name_plural = "Ders Sonu Raporu Müfredat Bölümleri"

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantDersSonuRaporuItem.objects.filter(variant=self)

    def items(self):
        return VariantDersSonuRaporuItem.objects.filter(variant=self)


class VariantDersSonuRaporuItem(models.Model):
    variant = models.ForeignKey("api.VariantDersSonuRaporu", on_delete=models.CASCADE, related_name="variantDersSonuRaporu_items", verbose_name="Ders Sonu Raporu")
    title = models.CharField("Başlık", max_length=1000)
    description = models.TextField("Açıklama", null=True, blank=True)
    file = models.FileField("Dosya", upload_to="course-file", null=True, blank=True)
    duration = models.DurationField("Süre", null=True, blank=True)
    content_duration = models.CharField("İçerik Süresi", max_length=1000, null=True, blank=True)
    preview = models.BooleanField("Önizleme", default=False)
    variant_item_id = ShortUUIDField("Numara", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ders Sonu Raporu Bölüm"
        verbose_name_plural = "Ders Sonu Raporu Bölümler"

    def __str__(self):
        return f"{self.variant.title} - {self.title}"
    
class Question_AnswerDersSonuRaporu(models.Model):
    derssonuraporu = models.ForeignKey(
        "api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_derssonuraporu",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_derssonuraporu",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    title = models.CharField("Soru Başlığı", max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Ders Sonu Raporu Soru Cevap"
        verbose_name_plural = "Ders Sonu Raporu Soru Cevaplar"

    def __str__(self):
        return f"{self.derssonuraporu.title}"

    def messages(self):
        return Question_Answer_MessageDersSonuRaporu.objects.filter(question=self).order_by("date")

    def profile(self):
        if not self.mesajiGonderen:
            return None
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None


class Question_Answer_MessageDersSonuRaporu(models.Model):
    derssonuraporu = models.ForeignKey(
        "api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu"
    )
    question = models.ForeignKey(
        "api.Question_AnswerDersSonuRaporu", on_delete=models.CASCADE,
        verbose_name="Soru Başlığı", related_name="messages"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_mesaj_derssonuraporu",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_mesaj_derssonuraporu",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    message = models.TextField("Mesaj", null=True, blank=True)
    qam_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["date"]
        verbose_name = "Ders Sonu Raporu Soru Cevap Mesaj"
        verbose_name_plural = "Ders Sonu Raporu Soru Cevap Mesajlar"

    def __str__(self):
        gonderen = getattr(self.mesajiGonderen, "username", "Anonim")
        return f"{gonderen} - {self.derssonuraporu.title}"

    def profile(self):
        if not self.mesajiGonderen:
            return None
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None
        
class EnrolledDersSonuRaporu(models.Model):
    derssonuraporu = models.ForeignKey("api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Hazırlayan")
    egitmen = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    enrollment_id = ShortUUIDField("Ders Sonu Raporu Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Kayıt Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Eğitmene Gönderilen Ders Sonu Raporu"
        verbose_name_plural = "Eğitmene Gönderilen Ders Sonu Raporları"

    def __str__(self):
        return self.derssonuraporu.title

    def lectures(self):
        return apps.get_model("api", "VariantDersSonuRaporuItem").objects.filter(variant__derssonuraporu=self.derssonuraporu)

    def curriculum(self):
        return apps.get_model("api", "VariantDersSonuRaporu").objects.filter(derssonuraporu=self.derssonuraporu)

    def note(self):
        return apps.get_model("api", "NoteDersSonuRaporu").objects.filter(derssonuraporu=self.derssonuraporu, ogrenciStajer=self.inserteduser)

    def question_answer(self):
        return apps.get_model("api", "Question_AnswerDersSonuRaporu").objects.filter(derssonuraporu=self.derssonuraporu)

    def review(self):
        return apps.get_model("api", "ReviewDersSonuRaporu").objects.filter(derssonuraporu=self.derssonuraporu, ogrenciStajer=self.inserteduser).first()


class NoteDersSonuRaporu(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    derssonuraporu = models.ForeignKey("api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu")
    title = models.CharField("Başlık", max_length=1000, null=True, blank=True)
    note = models.TextField("Not")
    note_id = ShortUUIDField("Not No", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Ders Sonu Raporu Not"
        verbose_name_plural = "Ders Sonu Raporu Notları"

    def __str__(self):
        return self.title or f"Not #{self.note_id}"


class ReviewDersSonuRaporu(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    derssonuraporu = models.ForeignKey("api.DersSonuRaporu", on_delete=models.CASCADE, verbose_name="Ders Sonu Raporu")
    review = models.TextField("Yorum")
    rating = models.IntegerField("Puan", choices=RATING, default=None)
    reply = models.CharField("Yanıt", null=True, blank=True, max_length=1000)
    active = models.BooleanField("Aktif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Ders Sonu Raporu Notu"
        verbose_name_plural = "Ders Sonu Raporu Notları"

    def __str__(self):
        return self.derssonuraporu.title

    def profile(self):
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(ogrenciStajer=self.ogrenciStajer)
        except Profile.DoesNotExist:
            return None