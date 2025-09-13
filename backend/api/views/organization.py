# api/views/organization.py
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from .. import models as api_models, serializers as api_serializer


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
