from rest_framework import serializers
from api import models as api_models

class UyeFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Uye
        fields = ["id", "full_name", "title", "photo", "department", "manager", "order", "active"]

class UyeTreeNodeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = api_models.Uye
        fields = ["id", "full_name", "title", "department", "department_name", "photo", "children"]

    def get_children(self, obj):
        qs = obj.reports.filter(active=True).order_by("order", "full_name")
        return UyeTreeNodeSerializer(qs, many=True, context=self.context).data

class DepartmanSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Departman
        fields = ["id", "name", "parent", "order"]
