from django.db import models

class BlockedIP(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    reason = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ip_address


class ContactSubject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "İletişim Konusu"
        verbose_name_plural = "İletişim Konuları"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # slug boşsa otomatik yap
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    # ESKİ: subject = models.CharField(choices=SUBJECT_CHOICES, ...)
    # YENİ:
    subject = models.ForeignKey(
        ContactSubject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages",
    )

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    message = models.TextField()
    city = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    replied = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.subject or 'Konu yok'} - {self.created_at:%Y-%m-%d}"
