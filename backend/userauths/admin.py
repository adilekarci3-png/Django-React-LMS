# userauths/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from userauths.models import Profile

User = get_user_model()

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "date")
    search_fields = ("full_name", "user__email", "user__full_name")
    autocomplete_fields = ("user",)
