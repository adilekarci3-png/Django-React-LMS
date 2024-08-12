from datetime import datetime
from django.db import models
from django.utils.text import slugify
from django.utils import timezone

from userauths.models import User, Profile
from shortuuid.django_fields import ShortUUIDField
from moviepy.editor import VideoFileClip
import math

YEAR =set()
yearNow =int(datetime.strftime(datetime.now(),"%Y"))
for x in range(1930, yearNow):
  YEAR.add((str(x),str(x)))
  
LANGUAGE = (
    ("Turkce", "Türkçe"),
    ("Ingilizce", "İngilizce"),
    ("Arapca", "Arapça"),
)

GENDER_CHOICES =(
    ('erkek','Erkek'),
    ('kadin','Kadın')    
)

ONAY_CHOICES =(
    ('onaylandi','Onaylandi'),
    ('onaylanmadi','Onaylanmadi')    
)

ISMARRIED_CHOICES =(
    ('evli','Evli'),
    ('bekar','Bekar')    
)
OS_CHOICES =[
    ('android','Android'),
    ('ios','ios'),
    ('windows','Windows')        
]
LEVEL = (
    ("Başlangic", "Başlangıç"),
    ("Orta", "Orta"),
    ("Ileri Seviye", "İleri Seviye"),
)


TEACHER_STATUS = (
    ("Taslak", "Taslak"),
    ("Pasif", "Pasif"),
    ("Yayinlanmis", "Yayınlanmış"),
)

PAYMENT_STATUS = (
    ("Ödendi", "Paid"),
    ("İşleniyor", "İşleniyor"),
    ("Arizali", "Arızalı"),
)


PLATFORM_STATUS = (
    ("İncelemede", "İncelemede"),
    ("Pasif", "Pasif"),
    ("Reddedilmiş", "Reddedilmiş"),
    ("Taslak", "Taslak"),
    ("Yayinlanmis", "Yayınlanmış"),
)

RATING = (
    (1, "1 Yıldız"),
    (2, "2 Yıldız"),
    (3, "3 Yıldız"),
    (4, "4 Yıldız"),
    (5, "5 Yıldız"),
)

NOTI_TYPE = (
    ("New Order", "New Order"),
    ("New Review", "New Review"),
    ("New Course Question", "New Course Question"),
    ("Draft", "Draft"),
    ("Course Published", "Course Published"),
    ("Course Enrollment Completed", "Course Enrollment Completed"),
)

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="course-file", blank=True, null=True, default="default.jpg")
    full_name = models.CharField(max_length=100)
    bio = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.full_name
    
    def students(self):
        return CartOrderItem.objects.filter(teacher=self)
    
    def courses(self):
        return Course.objects.filter(teacher=self)
    
    def review(self):
        return Course.objects.filter(teacher=self).count()
    
    class Meta:
        verbose_name = "Eğitmen"
        verbose_name_plural = "Eğitmenler"
        
Teacher._meta.get_field('user').verbose_name = "Kullanıcı" 
Teacher._meta.get_field('image').verbose_name = "Eğitmen Profil Resmi"
Teacher._meta.get_field('full_name').verbose_name = "Adı Soyadı"
Teacher._meta.get_field('bio').verbose_name = "Eğitmen Biyografi"
Teacher._meta.get_field('about').verbose_name = "Eğitmen Hakkında Bilgi"
Teacher._meta.get_field('country').verbose_name = "Ülke"
   
class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="course-file", default="category.jpg", null=True, blank=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(unique=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Category"
        ordering = ['title']

    def __str__(self):
        return self.title
    
    def course_count(self):
        return Course.objects.filter(category=self).count()
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title) 
        super(Category, self).save(*args, **kwargs)
        
    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        
Category._meta.get_field('title').verbose_name = "Başlık" 
Category._meta.get_field('image').verbose_name = "Kategori Resmi"
Category._meta.get_field('active').verbose_name = "Aktf/Pasif"
Category._meta.get_field('slug').verbose_name = "Etiket"
           
class Course(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    file = models.FileField(upload_to="course-file", blank=True, null=True)
    image = models.FileField(upload_to="course-file", blank=True, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    # price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    language = models.CharField(choices=LANGUAGE, default="Turkce", max_length=100)
    level = models.CharField(choices=LEVEL, default="Baslangic", max_length=100)
    platform_status = models.CharField(choices=PLATFORM_STATUS, default="Yayinlanmis", max_length=100)
    teacher_course_status = models.CharField(choices=TEACHER_STATUS, default="Yayinlanmis", max_length=100)
    featured = models.BooleanField(default=False)
    course_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    slug = models.SlugField(unique=True, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)


    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title) + str(self.pk)
        super(Course, self).save(*args, **kwargs)

    def students(self):
        return EnrolledCourse.objects.filter(course=self)
    
    def curriculum(self):
        return Variant.objects.filter(course=self)
    
    def lectures(self):
        return VariantItem.objects.filter(variant__course=self)
    
    def average_rating(self):
        average_rating = Review.objects.filter(course=self, active=True).aggregate(avg_rating=models.Avg('rating'))
        return average_rating['avg_rating']
    
    def rating_count(self):
        return Review.objects.filter(course=self, active=True).count()
    
    def reviews(self):
        return Review.objects.filter(course=self, active=True)
    
    class Meta:
        verbose_name = "Kurs"
        verbose_name_plural = "Kurslar"
        
Course._meta.get_field('category').verbose_name = "Kategori" 
Course._meta.get_field('teacher').verbose_name = "Kurs Öğretmeni"
Course._meta.get_field('image').verbose_name = "Kurs Resmi"
Course._meta.get_field('file').verbose_name = "Kurs Dosyası"
Course._meta.get_field('title').verbose_name = "Kurs Başlığı" 
Course._meta.get_field('language').verbose_name = "Kurs Dili"
Course._meta.get_field('description').verbose_name = "Kurs Açıklaması"
Course._meta.get_field('level').verbose_name = "Kurs Seviyesi"
Course._meta.get_field('platform_status').verbose_name = "Uygulamadaki Durumu" 
Course._meta.get_field('teacher_course_status').verbose_name = "Eğitmenin Sistemindeki Durumu"
Course._meta.get_field('featured').verbose_name = "Öne Çıksın Mı?"
Course._meta.get_field('course_id').verbose_name = "Kurs Numarası"
Course._meta.get_field('slug').verbose_name = "Etiket"
Course._meta.get_field('date').verbose_name = "Kurs Eklenme Tarihi"
  
class Variant(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000)
    variant_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
    
    def variant_items(self):
        return VariantItem.objects.filter(variant=self)
    
    def items(self):
        return VariantItem.objects.filter(variant=self)
    class Meta:
        verbose_name = "Müfredat"
        verbose_name_plural = "Müfredatlar"   
Variant._meta.get_field('course').verbose_name = "Ders" 
Variant._meta.get_field('title').verbose_name = "Ders Başlığı"
Variant._meta.get_field('variant_id').verbose_name = "Ders Numarası"
Variant._meta.get_field('date').verbose_name = "Ders Eklenme Tarihi"   

class VariantItem(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name="variant_items")
    title = models.CharField(max_length=1000)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to="course-file", null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    content_duration = models.CharField(max_length=1000, null=True, blank=True)
    preview = models.BooleanField(default=False)
    variant_item_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.variant.title} - {self.title}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.file:
            clip = VideoFileClip(self.file.path)
            duration_seconds = clip.duration

            minutes, remainder = divmod(duration_seconds, 60)  

            minutes = math.floor(minutes)
            seconds = math.floor(remainder)

            duration_text = f"{minutes}m {seconds}s"
            self.content_duration = duration_text
            super().save(update_fields=['content_duration'])
    class Meta:
        verbose_name = "Ders"
        verbose_name_plural = "Dersler" 

VariantItem._meta.get_field('variant').verbose_name = "Ders" 
VariantItem._meta.get_field('title').verbose_name = "Ders Başlığı"
VariantItem._meta.get_field('description').verbose_name = "Ders Açıklaması"
VariantItem._meta.get_field('file').verbose_name = "Ders Dosyası"  
VariantItem._meta.get_field('duration').verbose_name = "Ders Süresi" 
VariantItem._meta.get_field('content_duration').verbose_name = "İçerik Süresi"
VariantItem._meta.get_field('preview').verbose_name = "Önizleme"
VariantItem._meta.get_field('variant_item_id').verbose_name = "Ders Numarası"  
VariantItem._meta.get_field('date').verbose_name = "Tarih"  
      
class Question_Answer(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    class Meta:
        ordering = ['-date']

    def messages(self):
        return Question_Answer_Message.objects.filter(question=self)
    
    def profile(self):
        return Profile.objects.get(user=self.user)
    
    class Meta:
        verbose_name = "Soru Cevap"
        verbose_name_plural = "Soru Cevaplar" 
        
Question_Answer._meta.get_field('course').verbose_name = "Kurs" 
Question_Answer._meta.get_field('title').verbose_name = "Soru Başlığı"
Question_Answer._meta.get_field('user').verbose_name = "Kullanıcı"
Question_Answer._meta.get_field('qa_id').verbose_name = "Soru Cevap Numarası"  
Question_Answer._meta.get_field('date').verbose_name = "Soru Sorulan Tarih" 
        
class Question_Answer_Message(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    question = models.ForeignKey(Question_Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    qam_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    qa_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    class Meta:
        ordering = ['date']

    def profile(self):
        return Profile.objects.get(user=self.user)
    
    class Meta:
        verbose_name = "Soru Cevap Mesaj"
        verbose_name_plural = "Soru Cevap Mesajlar" 
        
Question_Answer_Message._meta.get_field('course').verbose_name = "Kurs" 
Question_Answer_Message._meta.get_field('question').verbose_name = "Soru Başlığı"
Question_Answer_Message._meta.get_field('user').verbose_name = "Kullanıcı"
Question_Answer_Message._meta.get_field('qam_id').verbose_name = "Soru Cevap Numarası"  
Question_Answer_Message._meta.get_field('qa_id').verbose_name = "Soru Cevap Numarası"  
Question_Answer_Message._meta.get_field('date').verbose_name = "Soru Sorulan Tarih" 

class Cart(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    # price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)
    cart_id = ShortUUIDField(length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
    class Meta:
        verbose_name = "Talep"
        verbose_name_plural = "Talepler"
        
Cart._meta.get_field('course').verbose_name = "Kurs" 
Cart._meta.get_field('tax_fee').verbose_name = "Kurs Linki"
Cart._meta.get_field('user').verbose_name = "Talep Eden Kullanıcı"
Cart._meta.get_field('total').verbose_name = "Toplam"  
Cart._meta.get_field('country').verbose_name = "Ülke"  
Cart._meta.get_field('date').verbose_name = "Soru Sorulan Tarih" 
       
class CartOrder(models.Model):
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teachers = models.ManyToManyField(Teacher, blank=True)
    #sub_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    #tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    #total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    #initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    #saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    #payment_status = models.CharField(choices=PAYMENT_STATUS, default="Processing", max_length=100)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    coupons = models.ManyToManyField("api.Coupon", blank=True)
    # stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)
    oid = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)


    class Meta:
        ordering = ['-date']
    
    def order_items(self):
        return CartOrderItem.objects.filter(order=self)
    
    def __str__(self):
        return self.oid
    
    class Meta:
        verbose_name = "Talep Seçenek"
        verbose_name_plural = "Talep Seçenekleri"
    
CartOrder._meta.get_field('student').verbose_name = "Öğrenci Adı" 
CartOrder._meta.get_field('teachers').verbose_name = "Eğitmen Adı"
CartOrder._meta.get_field('full_name').verbose_name = "Adı Soyadı"
CartOrder._meta.get_field('email').verbose_name = "E-Posta"  
CartOrder._meta.get_field('coupons').verbose_name = "Ödül"  
CartOrder._meta.get_field('oid').verbose_name = "Talep Numarası" 
CartOrder._meta.get_field('date').verbose_name = "Talep Tarihi" 
   
class CartOrderItem(models.Model):
    order = models.ForeignKey(CartOrder, on_delete=models.CASCADE, related_name="orderitem")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="order_item")
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    # price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    coupons = models.ManyToManyField("api.Coupon", blank=True)
    applied_coupon = models.BooleanField(default=False)
    oid = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date']
    
    def order_id(self):
        return f"Order ID #{self.order.oid}"
    
    def payment_status(self):
        return f"{self.order.payment_status}"
    
    def __str__(self):
        return self.oid
    
    class Meta:
        verbose_name = "Talep İstek Seçenek"
        verbose_name_plural = "Talep İstek Seçenekleri"
        
CartOrderItem._meta.get_field('order').verbose_name = "Talep Numarası"     
CartOrderItem._meta.get_field('course').verbose_name = "Talep Edilen Kurs Numarası" 
CartOrderItem._meta.get_field('teacher').verbose_name = "Eğitmen Adı" 
CartOrderItem._meta.get_field('applied_coupon').verbose_name = "Eklenen Ödül" 
CartOrderItem._meta.get_field('coupons').verbose_name = "Ödül"  
CartOrderItem._meta.get_field('oid').verbose_name = "Talep Numarası" 
CartOrderItem._meta.get_field('date').verbose_name = "Talep Tarihi" 
   
class Certificate(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    certificate_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
    class Meta:
        verbose_name = "Sertifika"
        verbose_name_plural = "Sertifikalar" 
        
Certificate._meta.get_field('course').verbose_name = "Sertifikası Alınan Kurs"     
Certificate._meta.get_field('user').verbose_name = "Sertifikası Alınan Kurs Numarası" 
Certificate._meta.get_field('certificate_id').verbose_name = "Sertifikası Numarası" 
Certificate._meta.get_field('date').verbose_name = "Sertifika Alınan Tarih" 
   
class CompletedLesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    variant_item = models.ForeignKey(VariantItem, on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
    class Meta:
        verbose_name = "Tamamlanmış Ders"
        verbose_name_plural = "Tamamlanmış Dersler"
         
CompletedLesson._meta.get_field('course').verbose_name = "Tamamlanan Kurs"     
CompletedLesson._meta.get_field('user').verbose_name = "Kurs Eğitmeni" 
CompletedLesson._meta.get_field('variant_item').verbose_name = "Tamamlanan Kurs" 
CompletedLesson._meta.get_field('date').verbose_name = "Kursun Tamamlanma Tarihi" 
   
class EnrolledCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.CASCADE)
    enrollment_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.course.title
    
    def lectures(self):
        return VariantItem.objects.filter(variant__course=self.course)
    
    def completed_lesson(self):
        return CompletedLesson.objects.filter(course=self.course, user=self.user)
    
    def curriculum(self):
        return Variant.objects.filter(course=self.course)
    
    def note(self):
        return Note.objects.filter(course=self.course, user=self.user)
    
    def question_answer(self):
        return Question_Answer.objects.filter(course=self.course)
    
    def review(self):
        return Review.objects.filter(course=self.course, user=self.user).first()
    
    class Meta:
        verbose_name = "Kaydedilan Kurs"
        verbose_name_plural = "Kaydedilen Kurslar" 
        
EnrolledCourse._meta.get_field('course').verbose_name = "Kayıt Olunan Kurs"     
EnrolledCourse._meta.get_field('user').verbose_name = "Kayıt Olunan Kurs Öğrencisi" 
EnrolledCourse._meta.get_field('teacher').verbose_name = "Kayıt Olunan Kurs Eğitmeni" 
EnrolledCourse._meta.get_field('order_item').verbose_name = "Kayıt Olunan Ders"     
EnrolledCourse._meta.get_field('enrollment_id').verbose_name = "Kayıt Olunan Kurs Numarası" 
EnrolledCourse._meta.get_field('date').verbose_name = "Kurs Kayıt Tarihi" 
       
class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000, null=True, blank=True)
    note = models.TextField()
    note_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    date = models.DateTimeField(default=timezone.now)   

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Not"
        verbose_name_plural = "Notlar"
         
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    review = models.TextField()
    rating = models.IntegerField(choices=RATING, default=None)
    reply = models.CharField(null=True, blank=True, max_length=1000)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)   

    def __str__(self):
        return self.course.title
    
    def profile(self):
        return Profile.objects.get(user=self.user)
    
    class Meta:
        verbose_name = "Yorum"
        verbose_name_plural = "Yorumlar"
        
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey(CartOrder, on_delete=models.SET_NULL, null=True, blank=True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.SET_NULL, null=True, blank=True)
    review = models.ForeignKey(Review, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=100, choices=NOTI_TYPE)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)  

    def __str__(self):
        return self.user.full_name
    
    class Meta:
        verbose_name = "Bildirim"
        verbose_name_plural = "Bildirimler"

class Coupon(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    used_by = models.ManyToManyField(User, blank=True)
    code = models.CharField(max_length=50)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)   
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.code
    
    class Meta:
        verbose_name = "Ödül"
        verbose_name_plural = "Ödüller"
    
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return str(self.course.title)
    
    class Meta:
        verbose_name = "İstek"
        verbose_name_plural = "İstekler"
    
class Country(models.Model):
    name = models.CharField(max_length=100)
    tax_rate = models.IntegerField(default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Ülke"
        verbose_name_plural = "Ülkeler"
        
class Job(models.Model):
    name = models.CharField(max_length=100)   
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Meslek"
        verbose_name_plural = "Meslekler"  
             
Job._meta.get_field('name').verbose_name = "Meslek" 
Job._meta.get_field('name').verbose_name = "Aktif/Pasif" 

class Hafizbilgileri(models.Model):
    name = models.CharField(max_length=150)
    surname = models.CharField(max_length=150,default="")
    babaadi = models.CharField(max_length=150,default="")
    tcno = models.CharField(max_length=150,default="")
    adres = models.CharField(max_length=150, default="")
    adresIl = models.CharField(max_length=150, default="")
    adresIlce = models.CharField(max_length=150, default="")
    hafizlikbitirmeyili = models.CharField(max_length=8, choices=tuple(sorted(YEAR))  ,default="")
    evtel = models.CharField(max_length=150, default="")
    istel = models.CharField(max_length=150, default="")
    ceptel = models.CharField(max_length=150, default="")
    isMarried = models.CharField(max_length=150, choices=ISMARRIED_CHOICES,default="")
    ePosta = models.CharField(max_length=150, default="")
    hafizlikyaptigikursadi = models.CharField(max_length=150, default="")
    hafizlikyaptigikursili = models.CharField(max_length=150, default="")
    gorev = models.CharField(max_length=150, default="")
    hafizlikhocaadi = models.CharField(max_length=150, default="")
    hafizlikhocasoyadi = models.CharField(max_length=150, default="")
    hafizlikhocaceptel = models.CharField(max_length=150, default="")
    hafizlikarkadasadi = models.CharField(max_length=150, default="")
    hafizlikarkadasoyad = models.CharField(max_length=150, default="")
    hafizlikarkadasceptel = models.CharField(max_length=150, default="")
    referanstcno = models.CharField(max_length=150, default="")
    onaydurumu = models.CharField(max_length=150,choices=ONAY_CHOICES,default="")    
    decription = models.TextField(blank=True)    
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES,default="")    
    job = models.ForeignKey("Job", related_name="Meslekler", null=True, blank=True, on_delete=models.SET_NULL)
    yas = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Hafız Bilgi"
        verbose_name_plural = "Hafız Bilgileri"   

Hafizbilgileri._meta.get_field('name').verbose_name = "Hafız Adı"     
Hafizbilgileri._meta.get_field('surname').verbose_name = "Hafız Soyadı" 
Hafizbilgileri._meta.get_field('babaadi').verbose_name = "Baba Adı" 
Hafizbilgileri._meta.get_field('tcno').verbose_name = "TC Kimlik NO"     
Hafizbilgileri._meta.get_field('adres').verbose_name = "Adres" 
Hafizbilgileri._meta.get_field('adresIl').verbose_name = "İl" 
Hafizbilgileri._meta.get_field('adresIlce').verbose_name = "İlçe"     
Hafizbilgileri._meta.get_field('hafizlikbitirmeyili').verbose_name = "Hafızlık Bitirme Yılı" 
Hafizbilgileri._meta.get_field('evtel').verbose_name = "Ev Telefonu" 
Hafizbilgileri._meta.get_field('istel').verbose_name = "İş Telefonu"     
Hafizbilgileri._meta.get_field('ceptel').verbose_name = "Cep Telefonu" 
Hafizbilgileri._meta.get_field('isMarried').verbose_name = "Medeni Hali" 
Hafizbilgileri._meta.get_field('ePosta').verbose_name = "E-Posta Adresi" 
Hafizbilgileri._meta.get_field('hafizlikyaptigikursadi').verbose_name = "Hafızlık Yaptığı Kurs Adı" 
Hafizbilgileri._meta.get_field('hafizlikyaptigikursili').verbose_name = "Hafızlık Yaptığı Kurs İli" 
Hafizbilgileri._meta.get_field('gorev').verbose_name = "Görevi" 
Hafizbilgileri._meta.get_field('hafizlikhocaadi').verbose_name = "Hoca Adı" 
Hafizbilgileri._meta.get_field('hafizlikhocasoyadi').verbose_name = "Hoca Soyadı" 
Hafizbilgileri._meta.get_field('hafizlikhocaceptel').verbose_name = "Hoca Cep Telefonu" 
Hafizbilgileri._meta.get_field('hafizlikarkadasadi').verbose_name = "Hafız Arkadaş Adı" 
Hafizbilgileri._meta.get_field('hafizlikarkadasoyad').verbose_name = "Hafız Arkadaş Soyadı" 
Hafizbilgileri._meta.get_field('hafizlikarkadasceptel').verbose_name = "Hafız Arkadaş Cep Telefonu" 
Hafizbilgileri._meta.get_field('referanstcno').verbose_name = "Referanst TC Kimlik NO" 
Hafizbilgileri._meta.get_field('onaydurumu').verbose_name = "Onay Durumu" 
Hafizbilgileri._meta.get_field('decription').verbose_name = "Hakkında" 
Hafizbilgileri._meta.get_field('gender').verbose_name = "Cinsiyet" 
Hafizbilgileri._meta.get_field('job').verbose_name = "Meslek" 
Hafizbilgileri._meta.get_field('yas').verbose_name = "Yaş" 
Hafizbilgileri._meta.get_field('active').verbose_name = "Aktif/Pasif" 