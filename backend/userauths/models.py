from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save


class User(AbstractUser):
    username = models.CharField(max_length=100, blank=True, null=True, unique=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100,unique=True)
    otp = models.CharField(max_length=100, null=True, blank=True)
    refresh_token = models.CharField(max_length=1000, null=True, blank=True)
    active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    @property
    def base_roles(self):
        from api.models import Hafiz        
        roles = []
        if hasattr(self, "teacher"):
            roles.append("Teacher")
        if hasattr(self, "koordinator"):
            roles.append("Koordinator")
        if hasattr(self, "ogrenci"):
            roles.append("Ogrenci")
        if hasattr(self, "stajer"):
            roles.append("Stajer")
        if Hafiz.objects.filter(email=self.email).exists():
            roles.append("Hafiz")
        if hasattr(self, "agent"):
            roles.append("Agent")
        return roles

    @property
    def sub_roles(self):
        from api.models import Hafiz
        roles = []
        try:
            if hasattr(self, "teacher"):
                roles += list(self.teacher.roles.values_list("name", flat=True))
            if hasattr(self, "koordinator"):
                roles += list(self.koordinator.roles.values_list("name", flat=True))
            if hasattr(self, "ogrenci"):
                roles += list(self.ogrenci.roles.values_list("name", flat=True))
            if hasattr(self, "stajer"):
                roles += list(self.stajer.roles.values_list("name", flat=True))
            hafiz = Hafiz.objects.filter(email=self.email).first()
            if hafiz:
                roles += list(hafiz.roles.values_list("name", flat=True))
            if hasattr(self, "agent"):
                roles += list(self.agent.roles.values_list("name", flat=True))
        except:
            pass
        return list(set(roles))
    
    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        email_username = self.email.split("@")[0]
        if not self.full_name:
            self.full_name = email_username
        if not self.username:
            base_username = email_username
            new_username = base_username
            counter = 1
            while User.objects.filter(username=new_username).exists():
                new_username = f"{base_username}{counter}"
                counter += 1
            self.username = new_username
        super(User, self).save(*args, **kwargs)   

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="user_folder", default="default-user.jpg", null=True, blank=True)
    full_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)        
    
    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name == self.user.username
        super(Profile, self).save(*args, **kwargs)
 
    
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)