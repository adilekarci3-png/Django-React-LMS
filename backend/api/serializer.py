from asyncio import Event
from django.contrib.auth.password_validation import validate_password
from api import models as api_models
from api import serializer as api_serializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from userauths.models import Profile, User
from django.utils.crypto import get_random_string

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
        try:
            token['teacher_id'] = user.teacher.id
        except:
            token['teacher_id'] = 0

        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'password2']

    def validate(self, attr):
        if attr['password'] != attr['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attr
    
    def create(self, validated_data):
        user = User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email']            
        )

        email_username, _ = user.email.split("@")
        user.username = email_username        
        user.set_password(validated_data['password'])
        user.save()

        return user
    
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'title', 'image', 'slug', 'course_count']
        model = api_models.Category

class KoordinatorRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.KoordinatorRole
        fields = ['id', 'name']

class KoordinatorSerializer(serializers.ModelSerializer):
    roles = KoordinatorRoleSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.Koordinator
        fields = '__all__'

class StajerSerializer(serializers.ModelSerializer):
    image = serializers.FileField(required=False, allow_null=True)
    email = serializers.SerializerMethodField()
    input_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = api_models.Stajer
        fields = [
            'id', 'full_name', 'evtel', 'istel', 'ceptel', 'bio',
            'user', 'image', 'email', 'input_email', 'facebook', 'twitter', 'linkedin', 'about', 'gender',
            'country', 'city', 'active'
        ]
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def create(self, validated_data):
        input_email = validated_data.pop('input_email', None)

        if not input_email:
            raise serializers.ValidationError({'input_email': 'Email zorunludur.'})

        if User.objects.filter(email=input_email).exists():
            raise serializers.ValidationError({'input_email': 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut.'})

        user = User.objects.create_user(
            username=input_email,
            email=input_email,
            password=User.objects.make_random_password()
        )
        stajer = api_models.Stajer.objects.create(user=user, **validated_data)
        return stajer

class OgrenciSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = api_models.Ogrenci
        fields = ['id', 'full_name', 'evtel', 'istel', 'ceptel', 'bio',
            'user', 'image', 'email', 'facebook', 'twitter', 'linkedin', 'about', 'gender',
            'country', 'city', 'active']
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def create(self, validated_data):
        email = validated_data.pop('email')

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut.'})

        password = get_random_string(length=10)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )

        validated_data['user'] = user
        ogrenci = api_models.Ogrenci.objects.create(**validated_data)
        return ogrenci

class HafizSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Hafiz
        fields = ["id", "full_name", "ceptel","adres"]
        
class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    courses = serializers.SerializerMethodField()
    hafizlar = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Teacher
        fields = [
            "id", "user", "image", "full_name", "bio", "facebook", "twitter",
            "linkedin", "about", "country", "students", "courses", "review", "roles", "hafizlar"
        ]

    def get_courses(self, obj):
        courses = obj.courses()
        return CourseSerializer(courses, many=True).data

    def get_hafizlar(self, obj):
        return HafizSimpleSerializer(obj.hafiz_ogrencileri.all(), many=True).data


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["id", "user", "image", "full_name", "bio", "evtel", "istel", "ceptel", "email", "facebook", "twitter", "linkedin", "about","country","city","active","gender"]
        model = api_models.Agent
    
            
class HafizBilgiSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Hafiz 
   
            
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Job  
              
class CitySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.City  

class ProjeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Proje 

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Designation 
        
class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.OrganizationMember  
           
class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.District 
        
    def __init__(self, *args, **kwargs):
        super(DistrictSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3      
                               
class VariantItemSerializer(serializers.ModelSerializer):        
    class Meta:
        fields = '__all__'
        model = api_models.VariantItem
    
    def __init__(self, *args, **kwargs):
        super(VariantItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class VariantItemOdevSerializer(serializers.ModelSerializer):        
    class Meta:
        fields = '__all__'
        model = api_models.VariantOdevItem
    
    def __init__(self, *args, **kwargs):
        super(VariantItemOdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3   
            
class VariantItemKitapTahliliSerializer(serializers.ModelSerializer):        
    class Meta:
        fields = '__all__'
        model = api_models.VariantKitapTahliliItem
    
    def __init__(self, *args, **kwargs):
        super(VariantItemKitapTahliliSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3   

class VariantItemDersSonuRaporuSerializer(serializers.ModelSerializer):        
    class Meta:
        fields = '__all__'
        model = api_models.VariantDersSonuRaporuItem
    
    def __init__(self, *args, **kwargs):
        super(VariantItemDersSonuRaporuSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3 
                  
class VariantItemEskepProjeSerializer(serializers.ModelSerializer):        
    class Meta:
        fields = '__all__'
        model = api_models.VariantEskepProjeItem
    
    def __init__(self, *args, **kwargs):
        super(VariantItemEskepProjeSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3 

class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True)
    # items = VariantItemSerializer(many=True)
    class Meta:
        fields = '__all__'
        model = api_models.Variant


    def __init__(self, *args, **kwargs):
        super(VariantSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3



class VariantOdevSerializer(serializers.ModelSerializer):
    variant_items = VariantItemOdevSerializer(many=True)

    class Meta:
        model = api_models.VariantOdev
        fields = '__all__'


class VariantKitapTahliliSerializer(serializers.ModelSerializer):
    variant_items = VariantItemKitapTahliliSerializer(many=True)

    class Meta:
        model = api_models.VariantKitapTahlili
        fields = '__all__'


class VariantDersSonuRaporuSerializer(serializers.ModelSerializer):
    variant_items = VariantItemDersSonuRaporuSerializer(many=True)

    class Meta:
        model = api_models.VariantDersSonuRaporu
        fields = '__all__'


class VariantEskepProjeSerializer(serializers.ModelSerializer):
    variant_items = VariantItemEskepProjeSerializer(many=True)

    class Meta:
        model = api_models.VariantEskepProje
        fields = '__all__'
        
class VariantOdevDetailedSerializer(VariantOdevSerializer):
    class Meta(VariantOdevSerializer.Meta):
        depth = 3


class VariantKitapTahliliDetailedSerializer(VariantKitapTahliliSerializer):
    class Meta(VariantKitapTahliliSerializer.Meta):
        depth = 3


class VariantDersSonuRaporuDetailedSerializer(VariantDersSonuRaporuSerializer):
    class Meta(VariantDersSonuRaporuSerializer.Meta):
        depth = 3


class VariantEskepProjeDetailedSerializer(VariantEskepProjeSerializer):
    class Meta(VariantEskepProjeSerializer.Meta):
        depth = 3

class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_Message

class Question_Answer_MessageOdevSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_MessageOdev

class Question_Answer_MessageKitapTahliliSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_MessageKitapTahlili
        
class Question_Answer_MessageDersSonuRaporuSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_MessageDersSonuRaporu

class Question_Answer_MessageEskepProjeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_MessageEskepProje

class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True)
    profile = ProfileSerializer(many=False)
    
    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer
        


class Question_AnswerOdevSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageOdevSerializer(many=True)
    profile = ProfileSerializer(many=False)
    
    class Meta:
        fields = '__all__'
        model = api_models.Question_AnswerOdev
        
class Question_AnswerKitapTahliliSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageKitapTahliliSerializer(many=True)
    profile = ProfileSerializer(many=False)
    
    class Meta:
        fields = '__all__'
        model = api_models.Question_AnswerKitapTahlili

class Question_AnswerDersSonuRaporuSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageDersSonuRaporuSerializer(many=True)
    profile = ProfileSerializer(many=False)
    
    class Meta:
        fields = '__all__'
        model = api_models.Question_AnswerDersSonuRaporu

class Question_AnswerEskepProjeSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageEskepProjeSerializer(many=True)
    profile = ProfileSerializer(many=False)
    
    class Meta:
        fields = '__all__'
        model = api_models.Question_AnswerEskepProje

class CartSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.Cart

    def __init__(self, *args, **kwargs):
        super(CartSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CartOrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.CartOrderItem

    def __init__(self, *args, **kwargs):
        super(CartOrderItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CartOrderSerializer(serializers.ModelSerializer):
    order_items = CartOrderItemSerializer(many=True)
    
    class Meta:
        fields = '__all__'
        model = api_models.CartOrder


    def __init__(self, *args, **kwargs):
        super(CartOrderSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CertificateSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.Certificate



class CompletedLessonSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.CompletedLesson


    def __init__(self, *args, **kwargs):
        super(CompletedLessonSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class CompletedOdevSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.CompletedOdev


    def __init__(self, *args, **kwargs):
        super(CompletedOdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Note

class NoteOdevSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.NoteOdev
        
class NoteKitapTahliliSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.NoteKitapTahlili

class NoteDersSonuRaporuSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.NoteDersSonuRaporu
        
class NoteEskepProjeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.NoteEskepProje
        
class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Review

    def __init__(self, *args, **kwargs):
        super(ReviewSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class ReviewOdevSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.ReviewOdev

    def __init__(self, *args, **kwargs):
        super(ReviewOdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class ReviewKitapTahliliSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.ReviewKitapTahlili

    def __init__(self, *args, **kwargs):
        super(ReviewKitapTahliliSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class ReviewDersSonuRaporuSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.ReviewDersSonuRaporu

    def __init__(self, *args, **kwargs):
        super(ReviewDersSonuRaporuSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class ReviewEskepProjeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.ReviewEskepProje

    def __init__(self, *args, **kwargs):
        super(ReviewEskepProjeSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Notification


class CouponSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.Coupon


class WishlistSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.Wishlist

    def __init__(self, *args, **kwargs):
        super(WishlistSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CountrySerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = api_models.Country




class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledCourse

    def __init__(self, *args, **kwargs):
        super(EnrolledCourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class EnrolledOdevSerializer(serializers.ModelSerializer):
    lectures = VariantItemOdevSerializer(many=True, read_only=True)
    # completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantOdevSerializer(many=True, read_only=True)
    note = NoteOdevSerializer(many=True, read_only=True)
    question_answer = Question_AnswerOdevSerializer(many=True, read_only=True)
    review = ReviewOdevSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledOdev

    def __init__(self, *args, **kwargs):
        super(EnrolledOdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class EnrolledKitapTahliliSerializer(serializers.ModelSerializer):
    lectures = VariantItemKitapTahliliSerializer(many=True, read_only=True)
    # completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantKitapTahliliSerializer(many=True, read_only=True)
    note = NoteKitapTahliliSerializer(many=True, read_only=True)
    question_answer = Question_AnswerKitapTahliliSerializer(many=True, read_only=True)
    review = ReviewKitapTahliliSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledKitapTahlili

    def __init__(self, *args, **kwargs):
        super(EnrolledKitapTahliliSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class EnrolledDersSonuRaporuSerializer(serializers.ModelSerializer):
    lectures = VariantItemDersSonuRaporuSerializer(many=True, read_only=True)
    # completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantDersSonuRaporuSerializer(many=True, read_only=True)
    note = NoteDersSonuRaporuSerializer(many=True, read_only=True)
    question_answer = Question_AnswerDersSonuRaporuSerializer(many=True, read_only=True)
    review = ReviewDersSonuRaporuSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledDersSonuRaporu

    def __init__(self, *args, **kwargs):
        super(EnrolledDersSonuRaporuSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class EnrolledEskepProjeSerializer(serializers.ModelSerializer):
    lectures = VariantItemEskepProjeSerializer(many=True, read_only=True)
    # completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantEskepProjeSerializer(many=True, read_only=True)
    note = NoteEskepProjeSerializer(many=True, read_only=True)
    question_answer = Question_AnswerEskepProjeSerializer(many=True, read_only=True)
    review = ReviewEskepProjeSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledDersSonuRaporu

    def __init__(self, *args, **kwargs):
        super(EnrolledEskepProjeSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
            
class InstructorOdevSerializer(serializers.ModelSerializer):
    lectures = VariantItemOdevSerializer(many=True, read_only=True)
    # completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum =  VariantOdevSerializer(many=True, read_only=True)
    note = NoteOdevSerializer(many=True, read_only=True)
    question_answer = Question_AnswerOdevSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledOdev

    def __init__(self, *args, **kwargs):
        super(InstructorOdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class AttendHafizSerializer(serializers.ModelSerializer):
    hafizs = HafizBilgiSerializer(many=True, read_only=True)    

    class Meta:
        fields = '__all__'
        model = api_models.Hafiz

    def __init__(self, *args, **kwargs):
        super(AttendHafizSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    reviews = ReviewSerializer(many=True, read_only=True, required=False)
    class Meta:
        fields = ["id", "category", "teacher", "file", "image", "title", "description", "language", "level", "platform_status", "teacher_course_status", "featured", "course_id", "slug", "date", "students", "curriculum", "lectures", "average_rating", "rating_count", "reviews",]
        model = api_models.Course

    def __init__(self, *args, **kwargs):
        super(CourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CourseDetailSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, required=False, read_only=True)
    variants = VariantSerializer(many=True)
    reviews = ReviewSerializer(many=True)  # varsa

    class Meta:
        model = api_models.Course
        fields = [
            'id', 'course_id', 'title', 'description', 'image', 'level',
            'language', 'price', 'date', 'teacher_name', 'students',
            'variants', 'reviews'
        ]
        
class OdevSerializer(serializers.ModelSerializer):
    # students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    notes = NoteOdevSerializer(many=True, read_only=True)
    question_answers = Question_AnswerOdevSerializer(many=True, read_only=True)
    class Meta:       
        fields = ["id","category", "koordinator","hazirlayan", "file", "image", "title", "description", "language", "level", "odev_status", "koordinator_odev_status", "date","curriculum", "lectures","notes","question_answers"]
        model = api_models.Odev

    def __init__(self, *args, **kwargs):
        super(OdevSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class DersSonuRaporuSerializer(serializers.ModelSerializer):
    # students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    # reviews = ReviewSerializer(many=True, read_only=True, required=False)
    class Meta:
        fields = ["category", "koordinator","hazirlayan", "file", "image", "title", "description", "language", "level", "derssonuraporu_status", "koordinator_derssonuraporu_status", "date","curriculum", "lectures"]        
        model = api_models.DersSonuRaporu

    def __init__(self, *args, **kwargs):
        super(DersSonuRaporuSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3           

class KitapTahliliSerializer(serializers.ModelSerializer):
    # students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    notes = NoteKitapTahliliSerializer(many=True, read_only=True)
    question_answers = Question_AnswerKitapTahliliSerializer(many=True, read_only=True)
    # review = KitapTahliliReviewSerializer(read_only=True)
    
    class Meta:
        model = api_models.KitapTahlili
        fields = [
            "id", "category", "koordinator", "hazirlayan", "file", "image",
            "title", "description", "language", "level",
            "kitaptahlili_status", "koordinator_kitaptahlili_status", "date",
            "curriculum", "lectures", "notes", "question_answers"
        ]

    def __init__(self, *args, **kwargs):
        super(KitapTahliliSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if request and request.method == "POST" else 3

class EskepProjeSerializer(serializers.ModelSerializer):
    # students = EnrolledCourseSerializer(many=True, required=False, read_only=True,)
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    # reviews = ReviewSerializer(many=True, read_only=True, required=False)
    class Meta:
        fields = ["category", "koordinator","hazirlayan", "file", "image", "title", "description", "language", "level", "eskepProje_status", "koordinator_eskepProje_status", "date","curriculum", "lectures"]        
        model = api_models.EskepProje

    def __init__(self, *args, **kwargs):
        super(EskepProjeSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3  

class StudentSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    achieved_certificates = serializers.IntegerField(default=0)
    
class ESKEPStudentSummarySerializer(serializers.Serializer):
    total_odevs = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    achieved_certificates = serializers.IntegerField(default=0)

class AgentSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    achieved_certificates = serializers.IntegerField(default=0)
    total_hafizs = serializers.IntegerField(default=0)

class TeacherSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    total_students = serializers.IntegerField(default=0)
    total_revenue = serializers.IntegerField(default=0)
    monthly_revenue = serializers.IntegerField(default=0)
    
class ESKEPEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.ESKEPEvent
        fields = ['id', 'title', 'date', 'background_color', 'border_color']
        read_only_fields = ['id']
        
# class HDMEgitmenSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)

#     class Meta:
#         model = api_models.HDMEgitmen
#         fields = ["id", "user", "full_name", "photo"]


class DersAtamasiSerializer(serializers.ModelSerializer):
    hafiz = serializers.PrimaryKeyRelatedField(queryset=api_models.Hafiz.objects.all(), write_only=True)
    instructor = serializers.PrimaryKeyRelatedField(queryset=api_models.Teacher.objects.all(), write_only=True)

    hafiz_detail = api_serializer.HafizSimpleSerializer(source="hafiz", read_only=True)
    instructor_detail = api_serializer.TeacherSerializer(source="instructor", read_only=True)

    class Meta:
        model = api_models.DersAtamasi
        fields = [
            "id",
            "hafiz",               # sadece POST/PUT için (id)
            "instructor",          # sadece POST/PUT için (id)
            "hafiz_detail",        # sadece GET için
            "instructor_detail",   # sadece GET için
            "start_time",
            "end_time",
            "aciklama",
            "topic"
        ]


class DersSerializer(serializers.ModelSerializer):   
    hafiz = serializers.PrimaryKeyRelatedField(queryset=api_models.Hafiz.objects.all(), write_only=True)
    instructor = serializers.PrimaryKeyRelatedField(queryset=api_models.Teacher.objects.all(), write_only=True)

    hafiz_detail = api_serializer.HafizSimpleSerializer(source="hafiz", read_only=True)
    instructor_detail = api_serializer.TeacherSerializer(source="instructor", read_only=True)

    class Meta:
        model = api_models.Ders
        fields = [
            "id",
            "hafiz",               # sadece POST/PUT için (id)
            "instructor",          # sadece POST/PUT için (id)
            "hafiz_detail",        # sadece GET için
            "instructor_detail",   # sadece GET için
            "start_time",
            "end_time",
            "description",
            "topic",
            "date"
        ]

class HafizSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    hdm_egitmen = TeacherSerializer(read_only=True)
    hdm_egitmen_id = serializers.PrimaryKeyRelatedField(
        queryset=api_models.Teacher.objects.none(),
        source='hdm_egitmen',
        write_only=True
    )

    class Meta:
        model = api_models.Hafiz
        fields = ["id", "full_name", "hdm_egitmen",'hdm_egitmen_id', "dersler","user","ceptel"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            role = api_models.TeacherRole.objects.get(name="HDMEgitmen")
            self.fields["hdm_egitmen_id"].queryset = api_models.Teacher.objects.filter(roles=role)
        except api_models.TeacherRole.DoesNotExist:
            self.fields["hdm_egitmen_id"].queryset = api_models.Teacher.objects.none()

    def get_dersler(self, obj):        
        dersler = obj.dersler.all()
        return DersSerializer(dersler, many=True).data
    
class HataNotuSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.HataNotu
        fields = '__all__'

class AnnotationSerializer(serializers.ModelSerializer):
    hafiz = serializers.PrimaryKeyRelatedField(queryset=api_models.Hafiz.objects.all())

    class Meta:
        model = api_models.Annotation
        fields = ["id", "hafiz", "page", "shape_type", "coordinates", "text", "created_at"]

class PeerIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.PeerID
        fields = ['user', 'peer_id']


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Annotation
        fields = ['id', 'user', 'page', 'shape_type', 'x1', 'y1', 'x2', 'y2', 'text']


class QuranPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.QuranPage
        fields = ['page_number', 'image']