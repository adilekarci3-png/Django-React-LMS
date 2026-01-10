from django.db import models

class TeacherRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[
            ("AkademiEgitmen", "AkademiEgitmen"),
            ("ESKEPEgitmen", "ESKEPEgitmen"),
            ("HBSEgitmen", "HBSEgitmen"),
            ("HDMEgitmen", "HDMEgitmen"),
        ],
        unique=True,
    )

    class Meta:
        verbose_name = "Eğitmen Rolü"
        verbose_name_plural = "Eğitmen Rolleri"

    def __str__(self):
        return self.get_name_display()


class StajerRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[("ESKEPStajer", "ESKEPStajer")],
        unique=True,
    )

    class Meta:
        verbose_name = "Stajer Rolü"
        verbose_name_plural = "Stajer Rolleri"

    def __str__(self):
        return self.get_name_display()


class AgentRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[("HBSTemsilci", "HBSTemsilci")],
        unique=True,
    )

    class Meta:
        verbose_name = "Temsilci Rolü"
        verbose_name_plural = "Temsilci Rolleri"

    def __str__(self):
        return self.get_name_display()


class OgrenciRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[
            ("AkademiOgrenci", "AkademiOgrenci"),
            ("HBSOgrenci", "HBSOgrenci"),
            ("HDMOgrenci", "HDMOgrenci"),
            ("ESKEPOgrenci", "ESKEPOgrenci"),
        ],
        unique=True,
    )

    class Meta:
        verbose_name = "Öğrenci Rolü"
        verbose_name_plural = "Öğrenci Rolleri"

    def __str__(self):
        return self.get_name_display()


class HafizRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[("HBSHafiz", "HBSHafiz"), ("HDMHafiz", "HDMHafiz")],
        unique=True,
    )

    class Meta:
        verbose_name = "Hafız Rolü"
        verbose_name_plural = "Hafız Rolleri"

    def __str__(self):
        return self.get_name_display()
    
class KoordinatorRole(models.Model):
    name = models.CharField(
        "Rol",
        max_length=50,
        choices=[
            ("ESKEPOgrenciKoordinator", "ESKEPOgrenciKoordinator"),
            ("ESKEPStajerKoordinator", "ESKEPStajerKoordinator"),
            ("ESKEPGenelKoordinator", "ESKEPGenelKoordinator"),
            ("AkademiKoordinator", "AkademiKoordinator"),
            ("HBSKoordinator", "HBSKoordinator"),
            ("HDMKoordinator", "HDMKoordinator"),
        ],
        unique=True,
    )

    class Meta:
        verbose_name = "Koordinatör Rolü"
        verbose_name_plural = "Koordinatör Rolleri"

    def __str__(self):
        return self.get_name_display()
