from django.db import models
from django.conf import settings
from django.utils import timezone

class EskepBasvuru(models.Model):
    ROLE_CHOICES = [
        ("student", "Öğrenci"),
        ("stajer", "Stajyer"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    # Öğrenci alanları
    school = models.CharField(max_length=200, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    program = models.CharField(max_length=100, blank=True)

    # Stajyer alanları
    university = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=150, blank=True)
    graduation_year = models.CharField(max_length=4, blank=True)

    cv = models.FileField(
        upload_to="eskep/cv/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.role}"