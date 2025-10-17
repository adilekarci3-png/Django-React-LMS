from django.db import models
from django.conf import settings
from django.utils import timezone
from django.apps import apps
from .choices import LANGUAGE, LEVEL, STATUS, KOORDINATOR_STATUS,RATING
from shortuuid.django_fields import ShortUUIDField
from django.utils.functional import cached_property

class KitapTahlili(models.Model):
    category = models.ForeignKey("api.Category", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kategori")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Kitap Tahlilini Hazırlayan")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, related_name="koordinated_kitaplar", verbose_name="Kitap Tahlili Koordinatör")
    file = models.FileField("Kitap Tahlili Dosyası", upload_to="course-file", blank=True, null=True)
    image = models.FileField("Kitap Tahlili Kapak Resmi", upload_to="course-file", blank=True, null=True)
    title = models.CharField("Kitap Tahlili Başlığı", max_length=200)
    description = models.TextField("Kitap Tahlili Açıklaması", null=True, blank=True)
    language = models.CharField("Kitap Tahlili Dili", choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField("Kitap Tahlili Seviyesi", choices=LEVEL, default="Baslangic", max_length=100)
    kitaptahlili_status = models.CharField("Kitap Tahlili Durumu", choices=STATUS, default="Taslak", max_length=100)
    koordinator_kitaptahlili_status = models.CharField("Koordinatörün Sistemindeki Durumu", choices=KOORDINATOR_STATUS, max_length=100, blank=True, null=True)
    date = models.DateTimeField(default=timezone.now)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Kitap Tahlili"
        verbose_name_plural = "Kitap Tahlilleri"

    def __str__(self):
        return self.title

    def curriculum(self):
        return VariantKitapTahlili.objects.filter(kitaptahlili=self)

    def lectures(self):
        return VariantKitapTahliliItem.objects.filter(variant__kitaptahlili=self)


class VariantKitapTahlili(models.Model):
    kitaptahlili = models.ForeignKey("api.KitapTahlili", on_delete=models.CASCADE, verbose_name="Kitap Tahlili")
    title = models.CharField("Kitap Tahlili Başlığı", max_length=1000)
    variant_id = ShortUUIDField("Kitap Tahlili Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Kitap Tahlili Eklenme Tarihi", default=timezone.now)
    active = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Kitap Tahlili Müfredat"
        verbose_name_plural = "Kitap Tahlili Müfredat Bölümleri"

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantKitapTahliliItem.objects.filter(variant=self)

    def items(self):
        return VariantKitapTahliliItem.objects.filter(variant=self)


class VariantKitapTahliliItem(models.Model):
    variant = models.ForeignKey("api.VariantKitapTahlili", on_delete=models.CASCADE, related_name="variantKitapTahlili_items", verbose_name="Kitap Tahlili")
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
        verbose_name = "Kitap Tahlili Bölüm"
        verbose_name_plural = "Kitap Tahlili Bölümler"

    def __str__(self):
        return f"{self.variant.title} - {self.title}"



class Question_AnswerKitapTahlili(models.Model):
    kitaptahlili = models.ForeignKey(
        "api.KitapTahlili", on_delete=models.CASCADE,
        related_name="question_answers", verbose_name="Kitap Tahlili"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiAlan_kitap",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_mesajiGonderen_kitap",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    title = models.CharField("Soru Başlığı", max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Kitap Tahlili Soru Cevap"
        verbose_name_plural = "Kitap Tahlili Soru Cevaplar"

    def __str__(self):
        return f"{self.kitaptahlili.title} - {self.title or ''}".strip(" -")

    @property
    def messages(self):
        # İsterseniz, mesaj modelinde ForeignKey'e related_name="messages" verip
        # burada self.messages.order_by("date") da kullanabilirsiniz.
        return Question_Answer_MessageKitapTahlili.objects.filter(
            question=self
        ).order_by("date")

    @cached_property
    def profile(self):
        """
        Mesajı gönderen kullanıcının profilini güvenli getirir.
        OneToOne alanınızın related_name'i 'profile' değilse aşağıdaki 'profile'
        yerine kendi related_name'inizi yazın (örn. 'user_profile').
        """
        u = self.mesajiGonderen
        return getattr(u, "profile", None) if u else None

class Question_Answer_MessageKitapTahlili(models.Model):
    kitaptahlili = models.ForeignKey(
        "api.KitapTahlili", on_delete=models.CASCADE,
        related_name="qa_messages", verbose_name="Kitap Tahlili"
    )
    question = models.ForeignKey(
        "api.Question_AnswerKitapTahlili", on_delete=models.CASCADE,
        related_name="messages", verbose_name="Soru Başlığı"
    )
    mesajiGonderen = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_msg_gonderen_kitap",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Gönderen"
    )
    mesajiAlan = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="qam_msg_alan_kitap",
        on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Mesajı Alan"
    )
    message = models.TextField("Mesaj")
    qam_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Kitap Tahlili Mesajı"
        verbose_name_plural = "Kitap Tahlili Mesajları"
        ordering = ["date"]

    def __str__(self):
        title = getattr(self.question, "title", "")
        return f"{title} - {self.message[:30]}"
    
class CompletedKitapTahlili(models.Model):
    kitaptahlili = models.ForeignKey("api.KitapTahlili", on_delete=models.CASCADE, verbose_name="Tamamlanan Kitap Tahlili")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    variant_item = models.ForeignKey("api.VariantKitapTahliliItem", on_delete=models.CASCADE, verbose_name="Tamamlanan Bölüm")
    date = models.DateTimeField("Kitap Tahlilinin Tamamlanma Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Tamamlanmış Kitap Tahlili"
        verbose_name_plural = "Tamamlanmış Kitap Tahlilleri"

    def __str__(self):
        return self.kitaptahlili.title


class EnrolledKitapTahlili(models.Model):
    kitaptahlili = models.ForeignKey("api.KitapTahlili", on_delete=models.CASCADE, verbose_name="Kitap Tahlili")
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Hazırlayan")
    egitmen = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Eğitmen")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    enrollment_id = ShortUUIDField("Kitap Tahlili Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Kayıt Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Eğitmene Gönderilen Kitap Tahlili"
        verbose_name_plural = "Eğitmene Gönderilen Kitap Tahlilleri"

    def __str__(self):
        return self.kitaptahlili.title

    def lectures(self):
        return apps.get_model("api", "VariantKitapTahliliItem").objects.filter(variant__kitaptahlili=self.kitaptahlili)

    def curriculum(self):
        return apps.get_model("api", "VariantKitapTahlili").objects.filter(kitaptahlili=self.kitaptahlili)

    def note(self):
        return apps.get_model("api", "NoteKitapTahlili").objects.filter(kitaptahlili=self.kitaptahlili, ogrenciStajer=self.inserteduser)

    def question_answer(self):
        return apps.get_model("api", "Question_AnswerKitapTahlili").objects.filter(kitaptahlili=self.kitaptahlili)

    def review(self):
        return apps.get_model("api", "ReviewKitapTahlili").objects.filter(kitaptahlili=self.kitaptahlili, ogrenciStajer=self.inserteduser).first()


class NoteKitapTahlili(models.Model):
    ogrenciStajer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Öğrenci/Stajyer")
    koordinator = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    kitaptahlili = models.ForeignKey("api.KitapTahlili", on_delete=models.CASCADE, related_name="notes", verbose_name="Kitap Tahlili")
    title = models.CharField("Başlık", max_length=1000, null=True, blank=True)
    note = models.TextField("Not")
    note_id = ShortUUIDField("Not No", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Kitap Tahlili Not"
        verbose_name_plural = "Kitap Tahlili Notları"

    def __str__(self):
        return self.title or f"Not #{self.note_id}"


class ReviewKitapTahlili(models.Model):
    ogrenciStajer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Öğrenci/Stajyer"
    )
    koordinator = models.ForeignKey(
        "api.Koordinator", on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Koordinatör"
    )
    kitaptahlili = models.ForeignKey(
        "api.KitapTahlili", on_delete=models.CASCADE, verbose_name="Kitap Tahlili"
    )
    review = models.TextField("Yorum")
    rating = models.IntegerField("Puan", choices=RATING, default=None)
    reply = models.CharField("Yanıt", null=True, blank=True, max_length=1000)
    active = models.BooleanField("Aktif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Kitap Tahlili Notu"
        verbose_name_plural = "Kitap Tahlili Notları"

    def __str__(self):
        return self.kitaptahlili.title

    @cached_property
    def profile(self):
        """
        Öğrenci/Stajyer kullanıcının profilini güvenli getirir.
        OneToOne related_name'iniz farklıysa 'profile'ı değiştirin.
        """
        u = self.ogrenciStajer
        return getattr(u, "profile", None) if u else None