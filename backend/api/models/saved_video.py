# # api/models/saved_video.py
# from django.conf import settings
# from django.db import models
# from django.db.models import Q

# class SavedVideo(models.Model):
#     KIND_LINK = "link"
#     KIND_FILE = "file"
#     KIND_CHOICES = (
#         (KIND_LINK, "YouTube Link"),
#         (KIND_FILE, "File Video"),
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         related_name="saved_videos",
#         on_delete=models.CASCADE,
#     )
#     kind = models.CharField(max_length=10, choices=KIND_CHOICES)

#     # İlişkiler (yalnızca biri dolu olur)
#     link = models.ForeignKey(
#         "api.EducatorVideoLink",
#         null=True, blank=True,
#         related_name="saved_items",
#         on_delete=models.CASCADE,
#     )
#     file = models.ForeignKey(
#         "api.EducatorVideo",
#         null=True, blank=True,
#         related_name="saved_items",
#         on_delete=models.CASCADE,
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             # Aynı link + aynı kullanıcı sadece 1 kez kaydedilebilir
#             models.UniqueConstraint(
#                 fields=["user", "link"],
#                 condition=Q(link__isnull=False),
#                 name="uq_saved_link_per_user",
#             ),
#             # Aynı dosya + aynı kullanıcı sadece 1 kez kaydedilebilir
#             models.UniqueConstraint(
#                 fields=["user", "file"],
#                 condition=Q(file__isnull=False),
#                 name="uq_saved_file_per_user",
#             ),
#         ]
#         ordering = ["-created_at"]

#     def __str__(self):
#         target = self.link_id or self.file_id
#         return f"{self.user_id} - {self.kind}:{target}"
