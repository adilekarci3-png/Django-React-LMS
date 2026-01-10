from rest_framework import serializers
from api import models as api_models
from api.models.organization import (
    Departman,
    OrganizationMember,
    Uye,
)

# 1) düz liste için
class UyeFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Uye
        fields = [
            "id",
            "full_name",
            "title",
            "photo",
            "department",
            "manager",
            "order",
            "active",
        ]


# 2) kişi bazlı hiyerarşi (manager -> reports)
class UyeTreeNodeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = api_models.Uye
        fields = [
            "id",
            "full_name",
            "title",
            "department",
            "department_name",
            "photo",
            "children",
        ]

    def get_children(self, obj):
        qs = obj.reports.filter(active=True).order_by("order", "full_name")
        return UyeTreeNodeSerializer(qs, many=True, context=self.context).data


# 3) basit departman
class DepartmanSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Departman
        fields = ["id", "name", "parent", "order"]


# 4) organization member
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


# 5) departmana bağlı üyeler (Uye)
class UyeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uye
        fields = ["id", "full_name", "title", "photo", "order", "active"]


# 6) departman ağacı (tam da React'te kullandığımız)
class DepartmanTreeSerializer(serializers.ModelSerializer):
    # Departman.employees (related_name) -> Uye
    employees = UyeSerializer(many=True, read_only=True)
    # OrganizationMember'dan gelenler
    members = serializers.SerializerMethodField()
    # alt departmanlar
    children = serializers.SerializerMethodField()

    class Meta:
        model = Departman
        fields = [
            "id",
            "name",
            "order",
            "employees",
            "members",
            "children",
        ]

    def get_members(self, obj):
        """
        OrganizationMember.Designation.birimNumarasi == Departman.id
        eşleşenleri getir.
        """
        qs = OrganizationMember.objects.filter(
            Designation__birimNumarasi=obj.id,
            active=True,
        ).select_related("Designation")
        return OrganizationMemberSerializer(qs, many=True).data

    def get_children(self, obj):
        children_qs = obj.children.all().order_by("order", "name")
        return DepartmanTreeSerializer(
            children_qs, many=True, context=self.context
        ).data
