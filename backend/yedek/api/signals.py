# akademi/signals.py
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import EducatorDocument


@receiver(post_delete, sender=EducatorDocument)
def delete_document_file_on_row_delete(sender, instance, **kwargs):
    """
    Kayıt silinince fizikî dosyayı da storage'dan kaldır.
    """
    try:
        if instance.file and instance.file.storage.exists(instance.file.name):
            instance.file.delete(save=False)
    except Exception:
        pass


@receiver(pre_save, sender=EducatorDocument)
def delete_old_file_on_change(sender, instance, **kwargs):
    """
    Yeni dosya yüklendiyse eski dosyayı sil.
    """
    if not instance.pk:
        return
    try:
        old = EducatorDocument.objects.get(pk=instance.pk)
    except EducatorDocument.DoesNotExist:
        return

    old_file = getattr(old, "file", None)
    new_file = getattr(instance, "file", None)
    if old_file and new_file and old_file.name != new_file.name:
        try:
            if old_file.storage.exists(old_file.name):
                old_file.delete(save=False)
        except Exception:
            pass
