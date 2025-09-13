from django.db import models
from django.conf import settings
from django.utils import timezone
from django.apps import apps
from .choices import LANGUAGE, LEVEL, STATUS, KOORDINATOR_STATUS,RATING
from shortuuid.django_fields import ShortUUIDField

class EskepProje(models.Model):
    category = models.ForeignKey("api.Category", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kategori")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Proje Koordinatörü")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Projeyi Hazırlayan")
    file = models.FileField("Proje Dosyası", upload_to="course-file", blank=True, null=True)
    image = models.FileField("Proje Kapak Resmi", upload_to="course-file", blank=True, null=True)
    title = models.CharField("Proje Başlığı", max_length=200)
    description = models.TextField("Proje Açıklaması", null=True, blank=True)
    language = models.CharField("Proje Dili", choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField("Proje Seviyesi", choices=LEVEL, default="Baslangic", max_length=100)
    eskepProje_status = models.CharField("Proje Durumu", choices=STATUS, default="Taslak", max_length=100)
    koordinator_eskepProje_status = models.CharField("Koordinatörün Sistemindeki Durumu", choices=KOORDINATOR_STATUS, max_length=100, blank=True, null=True)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Eskep Proje"
        verbose_name_plural = "Eskep Projeleri"

    def __str__(self):
        return self.title

    def curriculum(self):
        return VariantEskepProje.objects.filter(eskepProje=self)

    def lectures(self):
        return VariantEskepProjeItem.objects.filter(variant__eskepProje=self)


class VariantEskepProje(models.Model):
    eskepProje = models.ForeignKey("api.EskepProje", on_delete=models.CASCADE, verbose_name="Proje")
    title = models.CharField("Proje Başlığı", max_length=1000)
    variant_id = ShortUUIDField("Proje Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Proje Eklenme Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Eskep Proje Müfredat"
        verbose_name_plural = "Eskep Proje Müfredat Bölümleri"

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantEskepProjeItem.objects.filter(variant=self)

    def items(self):
        return VariantEskepProjeItem.objects.filter(variant=self)


class VariantEskepProjeItem(models.Model):
    variant = models.ForeignKey("api.VariantEskepProje", on_delete=models.CASCADE, related_name="variantEskepProje_items", verbose_name="Proje")
    title = models.CharField("Başlık", max_length=1000)
    description = models.TextField("Açıklama", null=True, blank=True)
    file = models.FileField("Dosya", upload_to="course-file", null=True, blank=True)
    duration = models.DurationField("Süre", null=True, blank=True)
    content_duration = models.CharField("İçerik Süresi", max_length=1000, null=True, blank=True)
    preview = models.BooleanField("Önizleme", default=False)
    variant_item_id = ShortUUIDField("Numara", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Eskep Proje Bölüm"
        verbose_name_plural = "Eskep Proje Bölümler"

    def __str__(self):
        return f"{self.variant.title} - {self.title}"


class Question_AnswerEskepProje(models.Model):
    eskepproje = models.ForeignKey(
        "api.EskepProje", on_delete=models.CASCADE,
        verbose_name="Eskep Proje"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_proje",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_proje",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    title = models.CharField("Soru Başlığı", max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Eskep Proje Soru Cevap"
        verbose_name_plural = "Eskep Proje Soru Cevaplar"

    def __str__(self):
        gonderen = getattr(self.mesajiGonderen, "username", "Anonim")
        return f"{gonderen} - {self.eskepproje.title}"

    def messages(self):
        return Question_Answer_MessageEskepProje.objects.filter(question=self).order_by("date")

    def profile(self):
        if not self.mesajiGonderen:
            return None
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None


class Question_Answer_MessageEskepProje(models.Model):
    eskepproje = models.ForeignKey(
        "api.EskepProje", on_delete=models.CASCADE, verbose_name="Eskep Proje"
    )
    question = models.ForeignKey(
        "api.Question_AnswerEskepProje", on_delete=models.CASCADE,
        verbose_name="Soru Başlığı", related_name="messages"    # <-- HATALI FK düzeltilmiş
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_mesaj_proje",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_mesaj_proje",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    message = models.TextField("Mesaj", null=True, blank=True)
    qam_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["date"]
        verbose_name = "Eskep Proje Soru Cevap Mesaj"
        verbose_name_plural = "Eskep Proje Soru Cevap Mesajlar"

    def __str__(self):
        gonderen = getattr(self.mesajiGonderen, "username", "Anonim")
        return f"{gonderen} - {self.eskepproje.title}"

    def profile(self):
        if not self.mesajiGonderen:
            return None
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.mesajiGonderen)
        except Profile.DoesNotExist:
            return None
        
class EnrolledEskepProje(models.Model):
    eskepproje = models.ForeignKey("api.EskepProje", on_delete=models.CASCADE, verbose_name="Eskep Proje")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Hazırlayan")
    egitmen = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    enrollment_id = ShortUUIDField("Eskep Proje Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Kayıt Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Koordinatöre Gönderilen Proje"
        verbose_name_plural = "Koordinatöre Gönderilen Projeler"

    def __str__(self):
        return self.eskepproje.title

    def lectures(self):
        return apps.get_model("api", "VariantEskepProjeItem").objects.filter(variant__eskepProje=self.eskepproje)

    def curriculum(self):
        return apps.get_model("api", "VariantEskepProje").objects.filter(eskepProje=self.eskepproje)

    def note(self):
        return apps.get_model("api", "NoteEskepProje").objects.filter(eskepproje=self.eskepproje, ogrenciStajer=self.inserteduser)

    def question_answer(self):
        return apps.get_model("api", "Question_AnswerEskepProje").objects.filter(eskepproje=self.eskepproje)

    def review(self):
        return apps.get_model("api", "ReviewEskepProje").objects.filter(eskepproje=self.eskepproje, ogrenciStajer=self.inserteduser).first()


class NoteEskepProje(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    eskepproje = models.ForeignKey("api.EskepProje", on_delete=models.CASCADE, verbose_name="Eskep Proje")
    title = models.CharField("Başlık", max_length=1000, null=True, blank=True)
    note = models.TextField("Not")
    note_id = ShortUUIDField("Not No", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Eskep Proje Not"
        verbose_name_plural = "Eskep Proje Notları"

    def __str__(self):
        return self.title or f"Not #{self.note_id}"


class ReviewEskepProje(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    eskepproje = models.ForeignKey("api.EskepProje", on_delete=models.CASCADE, verbose_name="Eskep Proje")
    review = models.TextField("Yorum")
    rating = models.IntegerField("Puan", choices=RATING, default=None)
    reply = models.CharField("Yanıt", null=True, blank=True, max_length=1000)
    active = models.BooleanField("Aktif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Eskep Proje Notu"
        verbose_name_plural = "Eskep Proje Notları"

    def __str__(self):
        return self.eskepproje.title

    def profile(self):
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(ogrenciStajer=self.ogrenciStajer)
        except Profile.DoesNotExist:
            return None