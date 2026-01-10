# api/views/lookups.py
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .. import models as api_models, serializers as api_serializer


class JobListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.JobSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return api_models.Job.objects.all()


class CityListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CitySerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return api_models.City.objects.all()


class CountryListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CountrySerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return api_models.Country.objects.all()


class DistrictListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.DistrictSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return api_models.District.objects.all()


class BranchListAPIView(generics.ListAPIView):
    queryset = api_models.Branch.objects.all()
    serializer_class = api_serializer.BranchSerializer


class EducationLevelListAPIView(generics.ListAPIView):
    queryset = api_models.EducationLevel.objects.all()
    serializer_class = api_serializer.EducationLevelSerializer
