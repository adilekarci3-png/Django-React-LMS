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
    
class EskepPage(models.Model):
    """
    Tek sayfa olacak ama ileride 'hakkimizda', 'vizyon', 'misyon' vb. eklemek istersen
    slug üzerinden çoğaltabilirsin.
    """
    slug = models.SlugField(unique=True, default="eskephakkimizda")
    intro_chip = models.CharField(max_length=120, blank=True, default="Modül • ESKEP")
    title = models.CharField(max_length=200, default="ESKEP Hakkında")
    subtitle = models.TextField(
        blank=True,
        default="Öğrenci/stajyer ders sonu raporları, ödev, proje ve kitap tahlillerinin yüklendiği ve izlendiği modül.",
    )

    # görseller
    hero_image = models.URLField(
        blank=True,
        default="https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    )
    shot1 = models.URLField(
        blank=True,
        default="https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    )
    shot2 = models.URLField(
        blank=True,
        default="https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
    )
    logo = models.URLField(
        blank=True,
        default="https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
    )

    # style'ı da admin'den değiştirebilelim diye
    css = models.TextField(
        blank=True,
        help_text="React tarafına direkt vereceğin custom CSS buraya yazılabilir.",
    )

    class Meta:
        verbose_name = "ESKEP Sayfası"
        verbose_name_plural = "ESKEP Sayfası"

    def __str__(self):
        return self.title or self.slug


class EskepCard(models.Model):
    """
    Soldaki 'Ne Yapar?', sağdaki 'Akış & Çıktılar' kartları
    """
    page = models.ForeignKey(EskepPage, on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=150)
    order = models.PositiveIntegerField(default=0)
    # kısa açıklama
    lead = models.TextField(blank=True)
    # bullet maddeleri
    bullets = models.TextField(
        blank=True,
        help_text="Her satır bir madde olacak şekilde yaz.",
    )
    # pill'ler
    pills = models.CharField(
        max_length=255,
        blank=True,
        help_text="Örn: Öğrenci,Danışman,Koordinatör,Yönetici",
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.page.slug} – {self.title}"


class EskepGalleryItem(models.Model):
    """
    Ortadaki 4 görsel galeri
    """
    page = models.ForeignKey(EskepPage, on_delete=models.CASCADE, related_name="gallery")
    image_url = models.URLField()
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.alt_text or self.image_url


class EskepStat(models.Model):
    """
    Alttaki turkuaz-mor şeritteki 4 kutu
    """
    page = models.ForeignKey(EskepPage, on_delete=models.CASCADE, related_name="stats")
    label = models.CharField(max_length=120)
    value = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.value} – {self.label}"