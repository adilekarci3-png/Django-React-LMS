from django import forms
from django.contrib import admin
from api import models 

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
admin.site.register(models.KoordinatorRole)
admin.site.register(models.Question_AnswerOdev)
admin.site.register(models.Question_Answer_MessageOdev)
admin.site.register(models.TeacherStudent)
admin.site.register(models.ESKEPEvent)
# admin.site.register(models.HDMEgitmen)
# admin.site.register(models.HDMHafiz)
admin.site.register(models.DersAtamasi)
admin.site.register(models.Ders)
admin.site.register(models.HataNotu)
admin.site.register(models.Annotation)
admin.site.register(models.TeacherRole)
admin.site.register(models.StajerRole)
admin.site.register(models.OgrenciRole)
admin.site.register(models.HafizRole)



class StajerForm(forms.ModelForm):
    class Meta:
        model = models.Stajer
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(StajerForm, self).__init__(*args, **kwargs)
        # Sadece "Danışman" rolüne sahip olanları getir
        self.fields['instructor'].queryset = models.Koordinator.objects.filter(role='Stajer')

class OgrenciForm(forms.ModelForm):
    class Meta:
        model = models.Ogrenci
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(OgrenciForm, self).__init__(*args, **kwargs)
        # Sadece "Danışman" rolüne sahip olanları getir
        self.fields['instructor'].queryset = models.Koordinator.objects.filter(role='Ogrenci')

class CountryAdmin(admin.ModelAdmin):        
    list_display = ('name','active')

class CityAdmin(admin.ModelAdmin):        
    list_display = ('name','active')

class ProjeAdmin(admin.ModelAdmin):        
    list_display = ('name','active')
   
class JobAdmin(admin.ModelAdmin):        
    list_display = ('name','active')
    
class AgentAdmin(admin.ModelAdmin):        
    list_display = ('full_name','email','ceptel','country','city','active')
    
class StajerAdmin(admin.ModelAdmin):        
    list_display = ('full_name','ceptel','country','city','active')
    form = StajerForm
    
class OgrenciAdmin(admin.ModelAdmin):        
    list_display = ('full_name','ceptel','country','city','active')
    form = OgrenciForm
    
class HafizAdmin(admin.ModelAdmin):        
    list_display = ('full_name', 'tcno', 'email', 'ceptel', 'country', 'adresIl', 'active', 'onaydurumu', 'hdm_egitmen')
    filter_horizontal = ("roles",) 
    
    list_filter = [
        "country",
        "adresIl",
        "onaydurumu",
        "hdm_egitmen",  # Eğitmen'e göre filtreleme yapılabilir
    ]
    
    search_fields = (
        "full_name",
        "tcno",
        "hdm_egitmen__full_name",  # Eğitmen adına göre de arama yapılabilsin
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        try:
            hdm_role = models.TeacherRole.objects.get(name="HDMEgitmen")
            form.base_fields['hdm_egitmen'].queryset = models.Teacher.objects.filter(roles=hdm_role)
        except models.TeacherRole.DoesNotExist:
            form.base_fields['hdm_egitmen'].queryset = models.Teacher.objects.none()
        return form
     
class DistrictAdmin(admin.ModelAdmin):        
    list_display = ('name','city','active')
    
class KoordinatorAdmin(admin.ModelAdmin):
    filter_horizontal = ("roles",)  

class TeacherAdmin(admin.ModelAdmin):
    filter_horizontal = ("roles",)  
      
admin.site.register(models.City, CityAdmin)
admin.site.register(models.Proje, ProjeAdmin)
admin.site.register(models.District, DistrictAdmin)
admin.site.register(models.Agent,AgentAdmin)
admin.site.register(models.Hafiz,HafizAdmin)
admin.site.register(models.Job, JobAdmin)
admin.site.register(models.Country,CountryAdmin)
admin.site.register(models.Stajer,StajerAdmin)
admin.site.register(models.Ogrenci,OgrenciAdmin)
admin.site.register(models.Koordinator, KoordinatorAdmin)
admin.site.register(models.Teacher, TeacherAdmin)
