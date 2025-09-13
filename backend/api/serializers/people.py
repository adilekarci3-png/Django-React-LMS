from django.utils.crypto import get_random_string
from rest_framework import serializers
from api import models as api_models
from userauths.models import User
from .users import ProfileSerializer

class KoordinatorSerializer(serializers.ModelSerializer):
    from .lookups import KoordinatorRoleSerializer  # local import to avoid cycles
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
            'id','full_name','evtel','istel','ceptel','bio',
            'user','image','email','input_email','facebook','twitter','linkedin',
            'about','gender','country','city','active'
        ]
        extra_kwargs = {'user': {'read_only': True}}

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def create(self, validated_data):
        input_email = validated_data.pop('input_email', None)
        if not input_email:
            raise serializers.ValidationError({'input_email': 'Email zorunludur.'})
        if User.objects.filter(email=input_email).exists():
            raise serializers.ValidationError({'input_email': 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut.'})

        user = User.objects.create_user(username=input_email, email=input_email,
                                        password=User.objects.make_random_password())
        return api_models.Stajer.objects.create(user=user, **validated_data)

class OgrenciSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = api_models.Ogrenci
        fields = [
            'id','full_name','evtel','istel','ceptel','bio','user','image','email',
            'facebook','twitter','linkedin','about','gender','country','city','active'
        ]
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        email = validated_data.pop('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut.'})
        password = get_random_string(length=10)
        user = User.objects.create_user(username=email, email=email, password=password)
        validated_data['user'] = user
        return api_models.Ogrenci.objects.create(**validated_data)

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Agent
        fields = ["id","user","image","full_name","bio","evtel","istel","ceptel","email",
                  "facebook","twitter","linkedin","about","country","city","active","gender"]

class HafizSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Hafiz
        fields = ["id", "full_name", "ceptel", "adres"]

class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    courses = serializers.SerializerMethodField()
    hafizlar = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Teacher
        fields = [
            "id","user","image","full_name","bio","facebook","twitter","linkedin",
            "about","country","courses","review","roles","hafizlar"
        ]

    def get_courses(self, obj):
        from .courses import CourseSimpleSerializer
        courses = obj.courses()
        return CourseSimpleSerializer(courses, many=True).data

    def get_hafizlar(self, obj):
        return HafizSimpleSerializer(obj.hafiz_ogrencileri.all(), many=True).data

class TeacherSimpleSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    class Meta:
        model = api_models.Teacher
        fields = ["id", "full_name", "image"]

class UserMiniSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "image")

    def get_image(self, obj):
        req = self.context.get("request")
        teacher = getattr(obj, "teacher", None)
        if teacher and getattr(teacher, "image", None):
            try:
                url = teacher.image.url
                return req.build_absolute_uri(url) if req else url
            except Exception:
                return teacher.image
        profile = getattr(obj, "profile", None)
        if profile and getattr(profile, "image", None):
            try:
                url = profile.image.url
                return req.build_absolute_uri(url) if req else url
            except Exception:
                return profile.image
        return None

class StudentListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "image", "date_joined")

    def get_image(self, obj):
        request = self.context.get("request")
        ogrenci = getattr(obj, "ogrenci", None)
        if ogrenci and getattr(ogrenci, "image", None):
            try:
                url = ogrenci.image.url
            except Exception:
                url = ogrenci.image
            return request.build_absolute_uri(url) if request and hasattr(ogrenci.image, "url") else url
        profile = getattr(obj, "profile", None)
        if profile and getattr(profile, "image", None):
            try:
                url = profile.image.url
            except Exception:
                url = profile.image
            return request.build_absolute_uri(url) if request and hasattr(profile.image, "url") else url
        return None

class StudentListItemSerializer(serializers.Serializer):
    user = UserMiniSerializer()
    created_at = serializers.DateTimeField()
    
class InstructorListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    video_link_count = serializers.IntegerField(read_only=True)
    uploaded_video_count = serializers.IntegerField(read_only=True)
    document_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "email",
            "image",
            "date_joined",
            "video_link_count",
            "uploaded_video_count",
            "document_count",
        )

    def _abs(self, file_or_url):
        req = self.context.get("request")
        # FileField ise .url var; string URL gelirse direkt dön
        url = None
        try:
            url = getattr(file_or_url, "url")
        except Exception:
            url = file_or_url
        if not url:
            return None
        return req.build_absolute_uri(url) if (req and url.startswith("/")) else url

    def get_image(self, obj):
        # 1) Teacher.image
        teacher = getattr(obj, "teacher", None)
        if teacher and getattr(teacher, "image", None):
            return self._abs(teacher.image)
        # 2) Profile.image
        profile = getattr(obj, "profile", None)
        if profile and getattr(profile, "image", None):
            return self._abs(profile.image)
        return None
