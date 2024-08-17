from django.contrib import admin
from api import models 

admin.site.register(models.Teacher)
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

class CountryAdmin(admin.ModelAdmin):        
    list_display = ('name','active')

class CityAdmin(admin.ModelAdmin):        
    list_display = ('name','active')
    
class JobAdmin(admin.ModelAdmin):        
    list_display = ('name','active')
    
class AgentAdmin(admin.ModelAdmin):        
    list_display = ('full_name','email','ceptel','country','city','active')
    
class HafizbilgileriAdmin(admin.ModelAdmin):        
    list_display = ('full_name','tcno','email','ceptel','country','adresIl','active','onaydurumu')   
     
class DistrictAdmin(admin.ModelAdmin):        
    list_display = ('name','city','active')
    
admin.site.register(models.City, CityAdmin)
admin.site.register(models.District, DistrictAdmin)
admin.site.register(models.Agent,AgentAdmin)
admin.site.register(models.Hafizbilgileri,HafizbilgileriAdmin)
admin.site.register(models.Job, JobAdmin)
admin.site.register(models.Country,CountryAdmin)