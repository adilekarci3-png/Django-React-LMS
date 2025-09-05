# akademi/utils/files.py
import os
import uuid
from django.core.exceptions import ValidationError

def educator_document_upload_to(instance, filename):
    """
    /akademi-docs/<teacher_id>/<uuid>__<orijinal_ad>
    """
    base, ext = os.path.splitext(filename)
    safe_name = "".join(c for c in base if c.isalnum() or c in ("-", "_"))[:80]
    return f"akademi-docs/{instance.instructor_id}/{uuid.uuid4()}__{safe_name}{ext.lower()}"

def validate_file_size(value, max_mb=50):
    limit = max_mb * 1024 * 1024
    if value and value.size > limit:
        raise ValidationError(f"Dosya {max_mb}MB sınırını aşıyor.")

