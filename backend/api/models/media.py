# api/models/media.py
import os, uuid, mimetypes
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

def educator_document_upload_to(instance, filename):
    return f"educator-documents/{instance.instructor_id}/{filename}"

def validate_file_size(f):
    max_bytes = 50 * 1024 * 1024  # 50MB
    if getattr(f, "size", 0) > max_bytes:
        raise ValidationError("Dosya 50 MB'den büyük olamaz.")

class EducatorVideoLink(models.Model):
    instructor = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, related_name="video_links", verbose_name="Eğitmen")
    title = models.CharField("Başlık", max_length=200)
    videoUrl = models.URLField("Video URL")
    description = models.TextField("Açıklama", blank=True)
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Eğitmen Video Linki"
        verbose_name_plural = "Eğitmen Video Linkleri"

    def __str__(self):
        return self.title


class SavedVideo(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_videos", verbose_name="Kullanıcı")
    video = models.ForeignKey(EducatorVideoLink, on_delete=models.CASCADE, related_name="saved_by", verbose_name="Video")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        unique_together = ("user", "video")
        verbose_name = "Kaydedilen Video"
        verbose_name_plural = "Kaydedilen Videolar"

    def __str__(self):
        return f"{self.user} -> {self.video}"


class EducatorVideo(models.Model):
    instructor = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, related_name="uploaded_videos", help_text="Videoyu yükleyen eğitmen (Teacher).", verbose_name="Eğitmen")
    title = models.CharField("Başlık", max_length=200)
    description = models.TextField("Açıklama", blank=True)
    file = models.FileField("Video Dosyası", upload_to="akademi-video-file", blank=True, null=True)
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)
    updated_at = models.DateTimeField("Güncellenme", auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Eğitmen Videosu"
        verbose_name_plural = "Eğitmen Videoları"

    def __str__(self):
        return f"{self.title} (Teacher#{self.instructor_id})"


class EducatorDocument(models.Model):
    DOCUMENT_EXTS = ["pdf","doc","docx","ppt","pptx","xls","xlsx","txt","rtf","odt","csv","md"]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instructor = models.ForeignKey("api.Teacher", on_delete=models.CASCADE, related_name="uploaded_documents", help_text="Dökümanı yükleyen eğitmen (Teacher).", verbose_name="Eğitmen")
    title = models.CharField("Başlık", max_length=200)
    description = models.TextField("Açıklama", blank=True)
    file = models.FileField(
        "Dosya",
        upload_to=educator_document_upload_to,
        validators=[FileExtensionValidator(allowed_extensions=DOCUMENT_EXTS), validate_file_size],
        help_text="PDF, Word, PowerPoint vb. (maks. 50 MB).",
    )
    original_filename = models.CharField("Orijinal Ad", max_length=255, blank=True, editable=False)
    file_size = models.PositiveBigIntegerField("Boyut (B)", default=0, editable=False)
    mime_type = models.CharField("MIME", max_length=100, blank=True, editable=False)
    is_public = models.BooleanField("Herkese Açık", default=False)
    tags = models.CharField("Etiketler", max_length=255, blank=True, help_text="Virgülle ayırın. Örn: pdf, sunum")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)
    updated_at = models.DateTimeField("Güncellenme", auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Eğitmen Dökümanı"
        verbose_name_plural = "Eğitmen Dökümanları"

    def __str__(self):
        return f"{self.title} (Teacher#{self.instructor_id})"

    @property
    def extension(self):
        _, ext = os.path.splitext(self.file.name or "")
        return ext.lstrip(".").lower()

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, "name"):
            self.original_filename = os.path.basename(getattr(self.file, "name", self.original_filename))
            self.file_size = getattr(self.file, "size", self.file_size) or 0
            self.mime_type = mimetypes.guess_type(self.original_filename or "")[0] or ""
        super().save(*args, **kwargs)


class VideoPurchase(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="video_purchases", verbose_name="Kullanıcı")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    video_object = GenericForeignKey("content_type", "object_id")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        indexes = [models.Index(fields=["content_type", "object_id"])]
        verbose_name = "Video Satın Alma"
        verbose_name_plural = "Video Satın Almalar"

    def __str__(self):
        return f"{self.user_id} bought {self.content_type_id}:{self.object_id}"


class VideoEnrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="video_enrollments", verbose_name="Kullanıcı")
    video = models.ForeignKey(EducatorVideo, on_delete=models.CASCADE, related_name="enrollments", verbose_name="Video")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        unique_together = ("user", "video")
        verbose_name = "Video Kaydı"
        verbose_name_plural = "Video Kayıtları"

    def __str__(self):
        return f"{self.user_id} enrolled {self.video_id}"
