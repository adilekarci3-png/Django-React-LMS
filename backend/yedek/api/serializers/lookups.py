from rest_framework import serializers
from api import models as api_models
from api.models.organization import Departman, OrganizationMember, Uye


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Category
        fields = ['id', 'title', 'image', 'slug', 'course_count']

class KoordinatorRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.KoordinatorRole
        fields = ['id', 'name']

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Job
        fields = ["id", "name"]

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.City
        fields = ["id", "name"]

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Country
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.District
        fields = '__all__'
        depth = 3

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

class ProjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Proje
        fields = '__all__'

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Designation
        fields = '__all__'

class OrganizationMemberSerializer(serializers.ModelSerializer):
    designation_name = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationMember
        fields = [
            "id",
            "Name",
            "designation_name",
            "email",
            "phone",
            "ImageUrl",
        ]

    def get_designation_name(self, obj):
        return obj.Designation.name if obj.Designation else None


class UyeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uye
        fields = ["id", "full_name", "title", "photo", "order", "active"]


class DepartmanTreeSerializer(serializers.ModelSerializer):
    employees = UyeSerializer(source="employees", many=True, read_only=True)
    members = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Departman
        fields = [
            "id",
            "name",
            "order",
            "employees",   # Uye tablosundaki kişiler
            "members",     # OrganizationMember tablosundaki kişiler
            "children",    # alt departmanlar
        ]

    def get_members(self, obj):
        """
        Eski yapıyı da kullanalım:
        OrganizationMember.Designation.birimNumarasi == Departman.id ise
        o kişiyi bu birimde göster.
        """
        qs = OrganizationMember.objects.filter(
            Designation__birimNumarasi=obj.id,
            active=True
        ).select_related("Designation")
        return OrganizationMemberSerializer(qs, many=True).data

    def get_children(self, obj):
        children_qs = obj.children.all().order_by("order", "name")
        return DepartmanTreeSerializer(children_qs, many=True, context=self.context).data