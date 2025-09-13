# api/models/choices.py
from datetime import datetime

# Yıl seçenekleri (mevcut yıl HARİÇ; eski koddaki gibi)
YEAR = {(str(y), str(y)) for y in range(1930, datetime.now().year)}
# İsterseniz sıralı/tuple versiyonunu da hazır verelim:
YEAR_CHOICES = tuple(sorted(YEAR, key=lambda t: t[0]))

LANGUAGE = (
    ("Turkce", "Türkçe"),
    ("Ingilizce", "İngilizce"),
    ("Arapca", "Arapça"),
)

GENDER_CHOICES = (("Erkek", "Erkek"), ("Kadın", "Kadın"))

ONAY_CHOICES = (("Onaylandı", "Onaylandı"), ("Onaylanmadı", "Onaylanmadı"))

ISMARRIED_CHOICES = (("Evli", "Evli"), ("Bekar", "Bekar"))

OS_CHOICES = [("android", "Android"), ("ios", "ios"), ("windows", "Windows")]

LEVEL = (
    ("Baslangic", "Başlangıç"),
    ("Orta", "Orta"),
    ("Ileri Seviye", "İleri Seviye"),
)

TEACHER_STATUS = (
    ("Taslak", "Taslak"),
    ("Pasif", "Pasif"),
    ("Yayinlanmis", "Yayınlanmış"),
)

STATUS = (
    ("İncelemede", "İncelemede"),
    ("Pasif", "Pasif"),
    ("Reddedilmiş", "Reddedilmiş"),
    ("Taslak", "Taslak"),
    ("Teslim Edildi", "Teslim Edildi"),
)

KOORDINATOR_STATUS = (
    ("Incelemede", "Incelemede"),
    ("Geri Gönderildi", "Geri Gönderildi"),
    ("Not Verildi", "Not Verildi"),
)

PAYMENT_STATUS = (
    ("Ödendi", "Paid"),
    ("İşleniyor", "İşleniyor"),
    ("Arizali", "Arızalı"),
)

PLATFORM_STATUS = (
    ("İncelemede", "İncelemede"),
    ("Pasif", "Pasif"),
    ("Reddedilmiş", "Reddedilmiş"),
    ("Taslak", "Taslak"),
    ("Yayinlanmis", "Yayınlanmış"),
)

PLATFORM_CHOICES = [
    ("zoom", "Zoom"),
    ("meet", "Google Meet"),
    ("teams", "Microsoft Teams"),
    ("jitsi", "Jitsi Meet"),
]

RATING = (
    (1, "1 Yıldız"),
    (2, "2 Yıldız"),
    (3, "3 Yıldız"),
    (4, "4 Yıldız"),
    (5, "5 Yıldız"),
)

NOTI_TYPE = (
    ("New Order", "New Order"),
    ("New Review", "New Review"),
    ("New Course Question", "New Course Question"),
    ("Draft", "Draft"),
    ("Course Published", "Course Published"),
    ("Course Enrollment Completed", "Course Enrollment Completed"),
)
