# api/models/about.py

from django.core.exceptions import ValidationError
from django.db import models

class AboutType(models.Model):
    slug = models.SlugField("Kısa ad (slug)", max_length=50, unique=True)
    name = models.CharField("Ad", max_length=100, unique=True)

    class Meta:
        verbose_name = "Hakkımızda Türü"
        verbose_name_plural = "Hakkımızda Türleri"

    def __str__(self):
        return self.name


class AboutPage(models.Model):
    type = models.ForeignKey(AboutType, verbose_name="Tür",
                             on_delete=models.CASCADE, related_name="pages")
    title = models.CharField("Başlık", max_length=200)
    subtitle = models.TextField("Alt başlık", blank=True)
    hero_image = models.ImageField("Hero görseli", upload_to="about/hero/", blank=True, null=True)
    logo_image = models.ImageField("Logo", upload_to="about/logo/", blank=True, null=True)
    is_published = models.BooleanField("Yayınlansın mı?", default=True)
    slug = models.SlugField("Slug", max_length=220, unique=True)

    class Meta:
        verbose_name = "Hakkımızda Sayfası"
        verbose_name_plural = "Hakkımızda Sayfaları"

    def __str__(self):
        return f"{self.type.name} • {self.title}"


class AboutCard(models.Model):
    page = models.ForeignKey(AboutPage, verbose_name="Sayfa",
                             on_delete=models.CASCADE, related_name="cards")
    order = models.PositiveIntegerField("Sıra", default=0)
    title = models.CharField("Başlık", max_length=160)
    text = models.TextField("Metin", blank=True)
    pills = models.JSONField("Etiketler", default=list, blank=True,
                             help_text="Küçük etiketler (liste). Örn: [\"Mentorluk\",\"Ölçme\"]")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Kart"
        verbose_name_plural = "Kartlar"

    def __str__(self):
        return f"{self.page.slug} • {self.title}"


class AboutStat(models.Model):
    page = models.ForeignKey(AboutPage, verbose_name="Sayfa",
                             on_delete=models.CASCADE, related_name="stats")
    order = models.PositiveIntegerField("Sıra", default=0)
    value = models.CharField("Değer", max_length=40)
    label = models.CharField("Açıklama", max_length=80)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "İstatistik"
        verbose_name_plural = "İstatistikler"

    def __str__(self):
        return f"{self.page.slug} • {self.value} {self.label}"


class AboutGalleryImage(models.Model):
    page = models.ForeignKey(AboutPage, verbose_name="Sayfa",
                             on_delete=models.CASCADE, related_name="gallery")
    order = models.PositiveIntegerField("Sıra", default=0)
    image = models.ImageField("Görsel", upload_to="about/gallery/", blank=True, null=True)
    url = models.URLField("Harici görsel URL’si", blank=True, null=True,
                          help_text="Yerel dosya yerine link kullanacaksanız doldurun.")
    caption = models.CharField("Açıklama", max_length=160, blank=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Galeri görseli"
        verbose_name_plural = "Galeri görselleri"

    def clean(self):
        if not self.image and not self.url:
            raise ValidationError("En az birini doldurun: Görsel dosyası veya Harici URL.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.page.slug} • {self.caption or 'Görsel'}"

class AboutMilestone(models.Model):
    page  = models.ForeignKey(AboutPage, verbose_name="Sayfa",
                              on_delete=models.CASCADE, related_name="milestones")
    order = models.PositiveIntegerField("Sıra", default=0)
    year  = models.CharField("Yıl/Yıl aralığı", max_length=12)  # 2010 veya 2016–2018
    title = models.CharField("Başlık", max_length=160)
    text  = models.TextField("Metin", blank=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Dönüm noktası"
        verbose_name_plural = "Dönüm noktaları"

    def __str__(self):
        return f"{self.page.slug} • {self.year} • {self.title}"