from django.db import models
from django.contrib.auth import get_user_model
from django.apps import apps
from django.conf import settings
from django.utils import timezone
from .choices import YEAR, ISMARRIED_CHOICES, ONAY_CHOICES, GENDER_CHOICES

User = get_user_model()

class Koordinator(models.Model):
    user = models.OneToOneField(User, verbose_name="Kullanıcı", on_delete=models.CASCADE)
    image = models.FileField("Koordinator Profil Resmi", upload_to="course-file",
                             blank=True, null=True, default="default.jpg")
    full_name = models.CharField("Adı Soyadı", max_length=100)
    roles = models.ManyToManyField("api.KoordinatorRole", verbose_name="Roller", blank=True)
    bio = models.CharField("Koordinator Biyografi", max_length=100, null=True, blank=True)
    facebook = models.URLField("Facebook", null=True, blank=True)
    twitter = models.URLField("Twitter", null=True, blank=True)
    linkedin = models.URLField("LinkedIn", null=True, blank=True)
    about = models.TextField("Koordinator Hakkında Bilgi", null=True, blank=True)
    country = models.CharField("Ülke", max_length=100, null=True, blank=True)
    active = models.BooleanField("Aktif/Pasif", default=True)

    class Meta:
        verbose_name = "Koordinator"
        verbose_name_plural = "Koordinatorler"

    def __str__(self):
        return self.full_name

    def ogrencis(self):
        Ogrenci = apps.get_model("api", "Ogrenci")
        return Ogrenci.objects.filter(koordinator=self)

    def stajers(self):
        Stajer = apps.get_model("api", "Stajer")
        return Stajer.objects.filter(koordinator=self)
    


class Hafiz(models.Model):
    full_name = models.CharField("Adı Soyadı", max_length=100, default="")
    babaadi = models.CharField("Baba Adı", max_length=150, default="", null=True, blank=True)
    tcno = models.CharField("TC Kimlik NO", max_length=150, default="", null=True, blank=True)
    adres = models.CharField("Adres", max_length=150, default="", null=True, blank=True)
    adresIl = models.ForeignKey("api.City", related_name="adres_il_hafiz", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="İl")
    adresIlce = models.ForeignKey("api.District", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="İlçe")
    roles = models.ManyToManyField("api.HafizRole", verbose_name="Roller")
    hafizlikbitirmeyili = models.CharField("Hafızlık Bitirme Yılı", max_length=8, choices=tuple(sorted(YEAR)), default="")
    evtel = models.CharField("Ev Telefonu", max_length=150, default="", null=True, blank=True)
    istel = models.CharField("İş Telefonu", max_length=150, default="", null=True, blank=True)
    ceptel = models.CharField("Cep Telefonu", max_length=150, default="", unique=True)
    isMarried = models.CharField("Medeni Hali", max_length=150, choices=ISMARRIED_CHOICES, default="", null=True, blank=True)
    email = models.CharField("E-Posta Adresi", max_length=150, default="", unique=True)
    hafizlikyaptigikursadi = models.CharField("Hafızlık Yaptığı Kurs Adı", max_length=150, default="")
    hafizlikyaptigikursili = models.ForeignKey("api.City", related_name="hafizlik_kurs_illeri", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Hafızlık Yaptığı Kurs İli")
    gorev = models.CharField("Görevi", max_length=150, default="", null=True, blank=True)
    hafizlikhocaadi = models.CharField("Hoca Adı", max_length=150, default="", null=True, blank=True)
    hafizlikhocasoyadi = models.CharField("Hoca Soyadı", max_length=150, default="", null=True, blank=True)
    hafizlikhocaceptel = models.CharField("Hoca Cep Telefonu", max_length=150, default="", null=True, blank=True)
    hafizlikarkadasadi = models.CharField("Hafız Arkadaş Adı", max_length=150, default="", null=True, blank=True)
    hafizlikarkadasoyad = models.CharField("Hafız Arkadaş Soyadı", max_length=150, default="", null=True, blank=True)
    hafizlikarkadasceptel = models.CharField("Hafız Arkadaş Cep Telefonu", max_length=150, default="", null=True, blank=True)
    referanstcno = models.CharField("Referans TC Kimlik NO", max_length=150, default="", null=True, blank=True)
    onaydurumu = models.CharField("Onay Durumu", max_length=150, choices=ONAY_CHOICES, default="Onaylanmadı")
    description = models.TextField("Hakkında", blank=True, null=True)
    gender = models.CharField("Cinsiyet", max_length=50, choices=GENDER_CHOICES, default="")
    job = models.ForeignKey("api.Job", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Meslek")
    yas = models.IntegerField("Yaş", null=True, blank=True)
    active = models.BooleanField("Aktif/Pasif", default=True)
    agent = models.ForeignKey("api.Agent", null=True, blank=True, on_delete=models.SET_NULL, related_name="hafizlar", verbose_name="İl Temsilcisi")
    country = models.ForeignKey("api.Country", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Ülke")
    hdm_egitmen = models.ForeignKey("api.Teacher", on_delete=models.SET_NULL, null=True, blank=True, related_name="hafiz_ogrencileri", verbose_name="HDM Eğitmeni")

    class Meta:
        verbose_name = "Hafız Bilgi"
        verbose_name_plural = "Hafız Bilgileri"

    def __str__(self):
        return self.full_name


class Agent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Temsilci")
    image = models.FileField("Profil Resmi", upload_to="course-file", blank=True, null=True, default="default.jpg")
    roles = models.ManyToManyField("api.AgentRole", verbose_name="Roller")  # M2M'de default kullanılmaz
    full_name = models.CharField("Adı Soyadı", max_length=100)
    bio = models.CharField("Biyografi", max_length=100, null=True, blank=True)
    evtel = models.CharField("Ev Telefonu", max_length=150, default="")
    istel = models.CharField("İş Telefonu", max_length=150, default="")
    ceptel = models.CharField("Cep Telefonu", max_length=150, default="", unique=True)
    email = models.CharField("E-Posta Adresi", max_length=150, default="", unique=True)
    facebook = models.URLField("Facebook", null=True, blank=True)
    twitter = models.URLField("Twitter", null=True, blank=True)
    linkedin = models.URLField("Linkedin", null=True, blank=True)
    about = models.TextField("Hakkında", null=True, blank=True)
    country = models.ForeignKey("api.Country", related_name="ulkeler", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Ülke")
    city = models.ForeignKey("api.City", related_name="sehirler", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Şehir")
    active = models.BooleanField("Aktif/Pasif", default=True)
    gender = models.CharField("Cinsiyet", max_length=50, choices=GENDER_CHOICES, default="")

    class Meta:
        verbose_name = "Temsilci"
        verbose_name_plural = "Temsilciler"

    def __str__(self):
        return self.full_name

    def Hafizs(self):
        return Hafiz.objects.filter(agent=self)


class Stajer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Stajer")
    instructor = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Koordinatör")
    image = models.FileField("Profil Resmi", upload_to="course-file", blank=True, null=True, default="default.jpg")
    full_name = models.CharField("Adı Soyadı", max_length=100)
    bio = models.CharField("Biyografi", max_length=100, null=True, blank=True)
    evtel = models.CharField("Ev Telefonu", max_length=150, default="")
    istel = models.CharField("İş Telefonu", max_length=150, default="")
    ceptel = models.CharField("Cep Telefonu", max_length=150, default="", unique=True)
    roles = models.ManyToManyField("api.StajerRole", verbose_name="Roller")
    facebook = models.URLField("Facebook", null=True, blank=True)
    twitter = models.URLField("Twitter", null=True, blank=True)
    linkedin = models.URLField("Linkedin", null=True, blank=True)
    about = models.TextField("Hakkında", null=True, blank=True)
    country = models.ForeignKey("api.Country", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Ülke")
    city = models.ForeignKey("api.City", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Şehir")
    active = models.BooleanField("Aktif/Pasif", default=True)
    gender = models.CharField("Cinsiyet", max_length=50, choices=GENDER_CHOICES, default="")

    class Meta:
        verbose_name = "Stajer"
        verbose_name_plural = "Stajerler"

    def __str__(self):
        return self.full_name


class Ogrenci(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Öğrenci")
    instructor = models.ForeignKey("api.Koordinator", on_delete=models.SET_NULL, null=True, verbose_name="Koordinatör")
    image = models.FileField("Profil Resmi", upload_to="course-file", blank=True, null=True, default="default.jpg")
    full_name = models.CharField("Adı Soyadı", max_length=100)
    bio = models.CharField("Biyografi", max_length=100, null=True, blank=True)
    evtel = models.CharField("Ev Telefonu", max_length=150, default="")
    istel = models.CharField("İş Telefonu", max_length=150, default="")
    ceptel = models.CharField("Cep Telefonu", max_length=150, default="", unique=True)
    roles = models.ManyToManyField("api.OgrenciRole", verbose_name="Roller")
    facebook = models.URLField("Facebook", null=True, blank=True)
    twitter = models.URLField("Twitter", null=True, blank=True)
    linkedin = models.URLField("Linkedin", null=True, blank=True)
    about = models.TextField("Hakkında", null=True, blank=True)
    country = models.ForeignKey("api.Country", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Ülke")
    city = models.ForeignKey("api.City", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Şehir")
    active = models.BooleanField("Aktif/Pasif", default=True)
    gender = models.CharField("Cinsiyet", max_length=50, choices=GENDER_CHOICES, default="")

    class Meta:
        verbose_name = "Öğrenci"
        verbose_name_plural = "Öğrenciler"

    def __str__(self):
        return self.full_name
