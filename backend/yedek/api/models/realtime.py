# api/models/realtime.py
from django.db import models
from django.conf import settings

class PeerID(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Kullanıcı")
    peer_id = models.CharField("Peer ID", max_length=100)
    active = models.BooleanField("Aktif", default=False)

    class Meta:
        verbose_name = "Peer ID"
        verbose_name_plural = "Peer ID'ler"

    def __str__(self):
        return f"{self.user} - {self.peer_id}"
