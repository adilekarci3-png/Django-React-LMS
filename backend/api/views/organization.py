# api/views/organization.py
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from api.models.organization import Departman
from api.serializers.organization import DepartmanTreeSerializer
from api.views import permissions
from .. import models as api_models, serializers as api_serializer
from rest_framework.views import APIView

class OrganizationMemberViewSetAPIVIew(generics.ListAPIView):
    serializer_class = api_serializer.OrganizationMemberSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.OrganizationMember.objects.all()

    def list(self, request):
        members = []
        try:
            queryset = self.get_queryset()
            serialized = api_serializer.OrganizationMemberSerializer(
                queryset, many=True, context={'request': self.request}
            ).data

            for organizationMember in serialized:
                designation_id = organizationMember['Designation']
                designation = api_models.Designation.objects.get(id=designation_id)
                member = {
                    'id': organizationMember['id'],
                    'Name': organizationMember['Name'],
                    'Designation': organizationMember['Designation'],
                    'ImageUrl': organizationMember['ImageUrl'],
                    'IsExpand': organizationMember['IsExpand'],
                    'RatingColor': '#68C2DE',
                    'ReportingPerson': designation.ustBirim,
                    'DesignationText': designation.name
                }
                members.append(member)
            return Response(members, status=status.HTTP_200_OK, content_type='application/json')
        except Exception as e:
            return Response({'error': str(e)}, status=408, content_type='application/json')


class UyeViewSet(viewsets.ModelViewSet):
    queryset = (
        api_models.Uye.objects
        .filter(active=True)
        .select_related("department", "manager")
        .order_by("order", "full_name")
    )
    serializer_class = api_serializer.UyeFlatSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"], url_path="tree")  # <-- BURASI
    def tree(self, request):
        roots = self.get_queryset().filter(manager__isnull=True)
        data = api_serializer.UyeTreeNodeSerializer(
            roots, many=True, context={"request": request}
        ).data
        return Response(data)


class DepartmanViewSet(viewsets.ModelViewSet):
    queryset = api_models.Departman.objects.all()
    serializer_class = api_serializer.DepartmanSerializer
    permission_classes = [AllowAny]

class OrgChartByNameAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug, *args, **kwargs):
        """
        /api/orgchart/erkekler/ geldiğinde şunları sırayla dener:
        1) parent is null VE name == slug
        2) parent is null VE name icontains(slug)
        3) parent is null VE name icontains('erkek')  (erkekler özelinde)
        4) yoksa 404
        """
        raw = slug  # "erkekler" veya "kadinlar"
        normalized = raw.replace("-", " ").strip()  # "erkekler" -> "erkekler"

        # 1) tam eşleşme
        qs = Departman.objects.filter(parent__isnull=True, name__iexact=normalized)
        dept = qs.first()

        # 2) içinde geçiyorsa (senin dosya adın uzun olduğu için)
        if not dept:
            qs = Departman.objects.filter(
                parent__isnull=True,
                name__icontains=normalized
            ).order_by("id")
            dept = qs.first()

        # 3) özel kural: erkekler/kadinlar kelimesini ara
        if not dept and normalized.lower().startswith("erkek"):
            qs = Departman.objects.filter(
                parent__isnull=True
            ).filter(
                Q(name__icontains="erkek") | Q(name__icontains="ERKEK")
            ).order_by("id")
            dept = qs.first()

        if not dept and normalized.lower().startswith("kadin"):
            qs = Departman.objects.filter(
                parent__isnull=True
            ).filter(
                Q(name__icontains="kadın") | Q(name__icontains="kadin") | Q(name__icontains="KADIN")
            ).order_by("id")
            dept = qs.first()

        if not dept:
            return Response(
                {"detail": f"'{slug}' için kök departman bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DepartmanTreeSerializer(dept, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)