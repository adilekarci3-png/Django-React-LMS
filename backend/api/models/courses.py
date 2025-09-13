# api/models/courses.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from django.apps import apps

from .choices import LANGUAGE, LEVEL, PLATFORM_STATUS, TEACHER_STATUS,RATING
from shortuuid.django_fields import ShortUUIDField

class Category(models.Model):
    title = models.CharField("Başlık", max_length=100)
    image = models.FileField("Kategori Resmi", upload_to="course-file", default="category.jpg", null=True, blank=True)
    active = models.BooleanField("Aktif/Pasif", default=True)
    slug = models.SlugField("Etiket", unique=True, null=True, blank=True)

    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        ordering = ["title"]

    def __str__(self):
        return self.title

    def course_count(self):
        Course = apps.get_model("api", "Course")
        return Course.objects.filter(category=self).count()

    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)
        if not self.slug:
            # title'dan slug üret (idempotent)
            base = slugify(self.title) or "kategori"
            slug = base
            if creating:
                # çakışma olursa sondan -2, -3 ... ekle
                i = 2
                while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                    slug = f"{base}-{i}"
                    i += 1
            self.slug = slug
            super().save(update_fields=["slug"])


class Course(models.Model):
    category = models.ForeignKey("api.Category", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kategori")
    teacher = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, verbose_name="Kurs Öğretmeni")
    file = models.FileField("Kurs Dosyası", upload_to="course-file", blank=True, null=True)
    image = models.FileField("Kurs Resmi", upload_to="course-file", blank=True, null=True)
    title = models.CharField("Kurs Başlığı", max_length=200)
    description = models.TextField("Kurs Açıklaması", null=True, blank=True)
    price = models.DecimalField("Fiyatı", max_digits=12, decimal_places=2, default=0.00)
    language = models.CharField("Kurs Dili", choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField("Kurs Seviyesi", choices=LEVEL, default="Baslangic", max_length=100)
    platform_status = models.CharField("Uygulamadaki Durumu", choices=PLATFORM_STATUS, default="Yayinlanmis", max_length=100)
    teacher_course_status = models.CharField("Eğitmenin Sistemindeki Durumu", choices=TEACHER_STATUS, default="Yayinlanmis", max_length=100)
    featured = models.BooleanField("Öne Çıksın Mı?", default=False)
    course_id = ShortUUIDField("Kurs Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    slug = models.SlugField("Etiket", unique=True, null=True, blank=True)
    date = models.DateTimeField("Kurs Eklenme Tarihi", default=timezone.now)
    inserteduser = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Ekleyen Kullanıcı", on_delete=models.SET_NULL, null=True, blank=True)
    active = models.BooleanField("Aktif/Pasif", default=False)

    class Meta:
        verbose_name = "Kurs"
        verbose_name_plural = "Kurslar"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)
        if not self.slug:
            base = slugify(self.title) or "kurs"
            # pk ile benzersizleştir
            self.slug = f"{base}-{self.pk}"
            super().save(update_fields=["slug"])

    # ---- yardımcılar
    def students(self):
        EnrolledCourse = apps.get_model("api", "EnrolledCourse")
        return EnrolledCourse.objects.filter(course=self)

    def curriculum(self):
        return Variant.objects.filter(course=self)

    def lectures(self):
        return VariantItem.objects.filter(variant__course=self)

    def average_rating(self):
        Review = apps.get_model("api", "Review")
        agg = Review.objects.filter(course=self, active=True).aggregate(avg_rating=models.Avg("rating"))
        return agg["avg_rating"]

    def rating_count(self):
        Review = apps.get_model("api", "Review")
        return Review.objects.filter(course=self, active=True).count()

    def reviews(self):
        Review = apps.get_model("api", "Review")
        return Review.objects.filter(course=self, active=True)


class Variant(models.Model):
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, verbose_name="Ders")
    title = models.CharField("Ders Başlığı", max_length=1000)
    variant_id = ShortUUIDField("Ders Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Ders Eklenme Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Müfredat"
        verbose_name_plural = "Müfredatlar"

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantItem.objects.filter(variant=self)


# moviepy opsiyonel: yoksa süre hesaplamasını atla
import math
try:
    from moviepy.editor import VideoFileClip  # type: ignore
except Exception:  # ImportError vs.
    VideoFileClip = None


class VariantItem(models.Model):
    variant = models.ForeignKey("api.Variant", on_delete=models.CASCADE, related_name="variant_items", verbose_name="Ders")
    title = models.CharField("Ders Başlığı", max_length=1000)
    description = models.TextField("Ders Açıklaması", null=True, blank=True)
    file = models.FileField("Ders Dosyası", upload_to="course-file", null=True, blank=True)
    duration = models.DurationField("Ders Süresi", null=True, blank=True)
    content_duration = models.CharField("İçerik Süresi", max_length=1000, null=True, blank=True)
    preview = models.BooleanField("Önizleme", default=False)
    variant_item_id = ShortUUIDField("Ders Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Tarih", default=timezone.now)
    active = models.BooleanField("Aktif/Pasif", default=False)

    class Meta:
        verbose_name = "Ders"
        verbose_name_plural = "Dersler"

    def __str__(self):
        return f"{self.variant.title} - {self.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.file and VideoFileClip:
            try:
                clip = VideoFileClip(self.file.path)
                seconds = clip.duration
                minutes, remainder = divmod(seconds, 60)
                minutes = math.floor(minutes)
                seconds = math.floor(remainder)
                self.content_duration = f"{minutes}m {seconds}s"
                super().save(update_fields=["content_duration"])
            except Exception:
                # moviepy hatası olduğunda sessiz geç
                pass


class Question_Answer(models.Model):
    course = models.ForeignKey(
        "api.Course", on_delete=models.CASCADE,
        verbose_name="Kurs", related_name="qa_threads"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Kullanıcı"
    )
    title = models.CharField("Soru Başlığı", max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Soru Cevap"
        verbose_name_plural = "Soru Cevaplar"

    def __str__(self):
        username = getattr(self.user, "username", "Anonim")
        return f"{username} - {self.course.title}"

    def messages(self):
        return Question_Answer_Message.objects.filter(question=self).order_by("date")

    def profile(self):
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.user) if self.user else None
        except Profile.DoesNotExist:
            return None


class Question_Answer_Message(models.Model):
    course = models.ForeignKey(
        "api.Course", on_delete=models.CASCADE,
        verbose_name="Kurs", related_name="qa_messages"
    )
    question = models.ForeignKey(
        "api.Question_Answer", on_delete=models.CASCADE,
        verbose_name="Soru Başlığı", related_name="messages"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Kullanıcı"
    )
    message = models.TextField("Mesaj", null=True, blank=True)
    qam_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    qa_id = ShortUUIDField("Soru Cevap Numarası", unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField("Soru Sorulan Tarih", default=timezone.now)

    class Meta:
        ordering = ["date"]
        verbose_name = "Soru Cevap Mesaj"
        verbose_name_plural = "Soru Cevap Mesajlar"

    def __str__(self):
        username = getattr(self.user, "username", "Anonim")
        return f"{username} - {self.course.title}"

    def profile(self):
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.user) if self.user else None
        except Profile.DoesNotExist:
            return None


class CompletedLesson(models.Model):
    course = models.ForeignKey("api.Course", on_delete=models.CASCADE, related_name="completed_lessons", verbose_name="Tamamlanan Kurs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Kullanıcı")
    variant_item = models.ForeignKey("api.VariantItem", on_delete=models.CASCADE, verbose_name="Tamamlanan Bölüm")
    date = models.DateTimeField("Kursun Tamamlanma Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Tamamlanmış Ders"
        verbose_name_plural = "Tamamlanmış Dersler"

    def __str__(self):
        return self.course.title
    
from django.apps import apps
from django.conf import settings
from django.utils import timezone
from shortuuid.django_fields import ShortUUIDField
from django.db import models


class EnrolledCourse(models.Model):
    course = models.ForeignKey(
        "api.Course", on_delete=models.CASCADE,
        verbose_name="Kayıt Olunan Kurs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Kayıt Olunan Kurs Öğrencisi"
    )
    teacher = models.ForeignKey(
        "api.Teacher", on_delete=models.SET_NULL,
        null=True, blank=True, verbose_name="Kayıt Olunan Kurs Eğitmeni"
    )
    order_item = models.ForeignKey(
        "api.CartOrderItem", on_delete=models.CASCADE,
        verbose_name="Kayıt Olunan Ders"
    )
    enrollment_id = ShortUUIDField(
        "Kayıt Olunan Kurs Numarası",
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    date = models.DateTimeField("Kurs Kayıt Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Kaydedilen Kurs"
        verbose_name_plural = "Kaydedilen Kurslar"
        ordering = ["-date"]

    def __str__(self):
        return self.course.title

    # ---- yardımcılar
    def lectures(self):
        VariantItem = apps.get_model("api", "VariantItem")
        return VariantItem.objects.filter(variant__course=self.course)

    def completed_lesson(self):
        CompletedLesson = apps.get_model("api", "CompletedLesson")
        return CompletedLesson.objects.filter(course=self.course, user=self.user)

    def curriculum(self):
        Variant = apps.get_model("api", "Variant")
        return Variant.objects.filter(course=self.course)

    def note(self):
        Note = apps.get_model("api", "Note")
        return Note.objects.filter(course=self.course, user=self.user)

    def question_answer(self):
        Question_Answer = apps.get_model("api", "Question_Answer")
        return Question_Answer.objects.filter(course=self.course)

    def review(self):
        Review = apps.get_model("api", "Review")
        return Review.objects.filter(course=self.course, user=self.user).first()
    
class Note(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Kullanıcı",
    )
    course = models.ForeignKey(
        "api.Course",
        on_delete=models.CASCADE,
        verbose_name="Kurs",
    )
    title = models.CharField("Başlık", max_length=1000, null=True, blank=True)
    note = models.TextField("Not")
    note_id = ShortUUIDField(
        "Not Numarası",
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    date = models.DateTimeField("Oluşturulma Tarihi", default=timezone.now)

    class Meta:
        verbose_name = "Not"
        verbose_name_plural = "Notlar"
        ordering = ["-date"]

    def __str__(self):
        return self.title or f"Not #{self.note_id}"
    
class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Kullanıcı",
    )
    course = models.ForeignKey(
        "api.Course",
        on_delete=models.CASCADE,
        verbose_name="Kurs",
    )
    review = models.TextField("Yorum")
    rating = models.IntegerField(
        "Puan",
        choices=RATING,
        null=True, blank=True,   # default=None ile uyumlu
    )
    reply = models.CharField("Yanıt", max_length=1000, null=True, blank=True)
    active = models.BooleanField("Aktif/Pasif", default=False)
    date = models.DateTimeField("Tarih", default=timezone.now)

    class Meta:
        verbose_name = "Yorum"
        verbose_name_plural = "Yorumlar"
        ordering = ["-date"]

    def __str__(self):
        return getattr(self.course, "title", f"Yorum #{self.pk}")

    def profile(self):
        Profile = apps.get_model("api", "Profile")
        try:
            return Profile.objects.get(user=self.user) if self.user else None
        except Profile.DoesNotExist:
            return None


