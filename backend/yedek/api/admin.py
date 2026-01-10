# api/admin.py
from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model

from api import models
from api.models.about import AboutCard, AboutGalleryImage, AboutMilestone, AboutPage, AboutStat, AboutType

User = get_user_model()

# -------------------------------------------------
# User admin – mevcut kaydı kaldırıp tek seferde ekle
# -------------------------------------------------
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class UserAutocompleteAdmin(admin.ModelAdmin):
    # autocomplete_fields kullanan diğer adminler için gerekli
    search_fields = ("email", "full_name", "username")
    list_display = ("id", "full_name", "email", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active", "date_joined")
    ordering = ("-date_joined",)


# -------------------------------------------------
# Basit list_display adminleri
# -------------------------------------------------
class CountryAdmin(admin.ModelAdmin):
    list_display = ("name", "active")


class CityAdmin(admin.ModelAdmin):
    list_display = ("name", "active")


class DistrictAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "active")


class ProjeAdmin(admin.ModelAdmin):
    list_display = ("name", "active")


class JobAdmin(admin.ModelAdmin):
    list_display = ("name", "active")


class AgentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "ceptel", "country", "city", "active")


# -------------------------------------------------
# Özel formlar
# -------------------------------------------------
class StajerForm(forms.ModelForm):
    class Meta:
        model = models.Stajer
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["instructor"].queryset = models.Koordinator.objects.filter(
            roles__name="ESKEPStajerKoordinator"
        )


class OgrenciForm(forms.ModelForm):
    class Meta:
        model = models.Ogrenci
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["instructor"].queryset = models.Koordinator.objects.filter(
            roles__name="ESKEPOgrenciKoordinator"
        )


# -------------------------------------------------
# Koordinator / Teacher admin
# -------------------------------------------------
class KoordinatorAdmin(admin.ModelAdmin):
    filter_horizontal = ("roles",)


class TeacherAdmin(admin.ModelAdmin):
    filter_horizontal = ("roles",)
    search_fields = ("full_name", "user__email")


# -------------------------------------------------
# Hafiz admin
# -------------------------------------------------
class HafizAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "tcno",
        "email",
        "ceptel",
        "country",
        "adresIl",
        "active",
        "onaydurumu",
        "hdm_egitmen",
    )
    filter_horizontal = ("roles",)
    list_filter = ("country", "adresIl", "onaydurumu", "hdm_egitmen")
    search_fields = ("full_name", "tcno", "hdm_egitmen__full_name")

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        try:
            hdm_role = models.TeacherRole.objects.get(name="HDMEgitmen")
            form.base_fields["hdm_egitmen"].queryset = models.Teacher.objects.filter(roles=hdm_role)
        except models.TeacherRole.DoesNotExist:
            form.base_fields["hdm_egitmen"].queryset = models.Teacher.objects.none()
        return form


# -------------------------------------------------
# EducatorDocument admin
# -------------------------------------------------
class EducatorDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "extension", "is_public", "file_size", "created_at")
    list_filter = ("is_public", "created_at")
    search_fields = (
        "title",
        "description",
        "tags",
        "original_filename",
        "instructor__full_name",
        "instructor__user__email",
    )
    readonly_fields = ("original_filename", "file_size", "mime_type", "created_at", "updated_at")
    autocomplete_fields = ("instructor",)


# -------------------------------------------------
# Video modelleri admin
# -------------------------------------------------
@admin.register(models.EducatorVideoLink)
class EducatorVideoLinkAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "instructor", "created_at")
    list_filter = ("created_at",)
    search_fields = (
        "title",
        "description",
        "videoUrl",
        "instructor__full_name",
        "instructor__user__email",
    )
    autocomplete_fields = ("instructor",)


@admin.register(models.EducatorVideo)
class EducatorVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "instructor", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "description", "instructor__full_name", "instructor__user__email")
    autocomplete_fields = ("instructor",)


@admin.register(models.SavedVideo)
class SavedVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "video", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__full_name", "video__title")
    autocomplete_fields = ("user", "video")


@admin.register(models.VideoPurchase)
class VideoPurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content_type", "object_id", "created_at")
    list_filter = ("content_type", "created_at")
    search_fields = ("user__email", "user__full_name")
    autocomplete_fields = ("user",)


@admin.register(models.VideoEnrollment)
class VideoEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "video", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__full_name", "video__title")
    autocomplete_fields = ("user", "video")


# -------------------------------------------------
# Stajer / Ogrenci admin
# -------------------------------------------------
@admin.register(models.Stajer)
class StajerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "ceptel", "country", "city", "active")
    list_filter = ("country", "city", "active")
    search_fields = ("full_name", "user__email", "ceptel")
    form = StajerForm


@admin.register(models.Ogrenci)
class OgrenciAdmin(admin.ModelAdmin):
    list_display = ("full_name", "ceptel", "country", "city", "active")
    list_filter = ("country", "city", "active")
    search_fields = ("full_name", "user__email", "ceptel")
    form = OgrenciForm


# -------------------------------------------------
# AboutPage admin (inline'lar)
# -------------------------------------------------
@admin.register(AboutType)
class AboutTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")


class AboutCardInline(admin.TabularInline):
    model = AboutCard
    extra = 1
    fields = ("order", "title", "text", "pills")
    ordering = ("order", "id")


class AboutStatInline(admin.TabularInline):
    model = AboutStat
    extra = 1
    fields = ("order", "value", "label")
    ordering = ("order", "id")


class AboutGalleryImageInline(admin.TabularInline):
    model = AboutGalleryImage
    extra = 1
    fields = ("order", "image", "url", "caption")
    ordering = ("order", "id")

class AboutMilestoneInline(admin.TabularInline):
    model = AboutMilestone
    extra = 1
    fields = ("order", "year", "title", "text")
    ordering = ("order", "id")
    
@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "is_published", "slug")
    list_filter = ("is_published", "type")
    search_fields = ("title", "slug")
    autocomplete_fields = ("type",)
    fieldsets = (("Genel", {
        "fields": ("type","title","subtitle","hero_image","logo_image","is_published","slug")
    }),)
    # Milestone’u ekle (tablı admin kullanıyorsan yeni bir TAB olarak görünecek)
    inlines = [AboutMilestoneInline, AboutCardInline, AboutStatInline, AboutGalleryImageInline]

# -------------------------------------------------
# Diğer modeller (basit kayıt)
# -------------------------------------------------
admin.site.register(models.Category)
admin.site.register(models.Course)
admin.site.register(models.Variant)
admin.site.register(models.VariantItem)
admin.site.register(models.Question_Answer)
admin.site.register(models.Question_Answer_Message)
admin.site.register(models.Cart)
admin.site.register(models.CartOrder)
admin.site.register(models.CartOrderItem)
admin.site.register(models.Certificate)
admin.site.register(models.CompletedLesson)
admin.site.register(models.EnrolledCourse)
admin.site.register(models.Note)
admin.site.register(models.Review)
admin.site.register(models.Notification)
admin.site.register(models.Coupon)
admin.site.register(models.Wishlist)
admin.site.register(models.OrganizationMember)
admin.site.register(models.Designation)
admin.site.register(models.Odev)
admin.site.register(models.EskepProje)
admin.site.register(models.KitapTahlili)
admin.site.register(models.DersSonuRaporu)
admin.site.register(models.VariantOdev)
admin.site.register(models.VariantOdevItem)
admin.site.register(models.EnrolledOdev)
admin.site.register(models.NoteOdev)
admin.site.register(models.Question_AnswerOdev)
admin.site.register(models.Question_Answer_MessageOdev)
admin.site.register(models.TeacherStudent)
admin.site.register(models.ESKEPEvent)
admin.site.register(models.DersAtamasi)
admin.site.register(models.Ders)
admin.site.register(models.HataNotu)
admin.site.register(models.Annotation)
admin.site.register(models.KoordinatorRole)
admin.site.register(models.AgentRole)
admin.site.register(models.TeacherRole)
admin.site.register(models.StajerRole)
admin.site.register(models.OgrenciRole)
admin.site.register(models.HafizRole)
admin.site.register(models.Branch)
admin.site.register(models.Educator)
admin.site.register(models.EducationLevel)
admin.site.register(models.City, CityAdmin)
admin.site.register(models.Proje, ProjeAdmin)
admin.site.register(models.District, DistrictAdmin)
admin.site.register(models.Agent, AgentAdmin)
admin.site.register(models.Hafiz, HafizAdmin)
admin.site.register(models.Job, JobAdmin)
admin.site.register(models.Country, CountryAdmin)
admin.site.register(models.Koordinator, KoordinatorAdmin)
admin.site.register(models.Teacher, TeacherAdmin)
admin.site.register(models.EducatorDocument, EducatorDocumentAdmin)
