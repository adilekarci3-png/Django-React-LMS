from rest_framework import serializers
from api import models as api_models
from .people import HafizSimpleSerializer, TeacherSerializer
from .lessons import DersSerializer

class HafizBilgiSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Hafiz
        fields = '__all__'

    def validate(self, data):
        current_id = self.instance.id if self.instance else None
        ceptel_qs = api_models.Hafiz.objects.filter(ceptel=data["ceptel"])
        if current_id:
            ceptel_qs = ceptel_qs.exclude(id=current_id)
        if ceptel_qs.exists():
            raise serializers.ValidationError({"ceptel": "Bu cep telefonu zaten kayıtlı."})

        if data.get("email"):
            email_qs = api_models.Hafiz.objects.filter(email=data["email"])
            if current_id:
                email_qs = email_qs.exclude(id=current_id)
            if email_qs.exists():
                raise serializers.ValidationError({"email": "Bu e-posta zaten kayıtlı."})
        return data

class HafizSerializer(serializers.ModelSerializer):
    from userauths.models import User
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    hdm_egitmen = TeacherSerializer(read_only=True)
    hdm_egitmen_id = serializers.PrimaryKeyRelatedField(
        queryset=api_models.Teacher.objects.none(),
        source='hdm_egitmen',
        write_only=True
    )
    dersler = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Hafiz
        fields = ["id","full_name","hdm_egitmen","hdm_egitmen_id","dersler","user","ceptel"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        role_qs = api_models.TeacherRole.objects.filter(name="HDMEgitmen")
        self.fields["hdm_egitmen_id"].queryset = (
            api_models.Teacher.objects.filter(roles=role_qs.first()) if role_qs.exists()
            else api_models.Teacher.objects.none()
        )

    def get_dersler(self, obj):
        dersler_qs = obj.dersler.all().select_related("hafiz", "instructor")
        return DersSerializer(dersler_qs, many=True).data

class AttendHafizSerializer(serializers.ModelSerializer):
    hafizs = HafizBilgiSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.Hafiz
        fields = '__all__'
        depth = 3

class HataNotuSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.HataNotu
        fields = '__all__'
