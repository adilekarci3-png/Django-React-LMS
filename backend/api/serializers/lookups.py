from rest_framework import serializers
from api import models as api_models

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
    class Meta:
        model = api_models.OrganizationMember
        fields = '__all__'
