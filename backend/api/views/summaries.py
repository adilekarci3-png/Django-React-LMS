# summaries.py (YENİ)
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
# from api import models as api_models
# from api import serializers as api_serializer
from django.contrib.auth import get_user_model
from .. import models as api_models, serializers as api_serializer

from datetime import datetime, timedelta
from django.db import models

User = get_user_model()

class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(api_models.User, id=self.kwargs['user_id'])
        return [{
            "total_courses": api_models.EnrolledCourse.objects.filter(user=user).count(),
            "completed_lessons": api_models.CompletedLesson.objects.filter(user=user).count(),
            "achieved_certificates": api_models.Certificate.objects.filter(user=user).count(),
        }]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class InstructorSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPStudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(api_models.User, id=self.kwargs['user_id'])
        return [{
            "total_courses": api_models.EnrolledOdev.objects.filter(user=user).count(),
            "completed_lessons": api_models.CompletedOdev.objects.filter(user=user).count(),
            "achieved_certificates": api_models.Certificate.objects.filter(user=user).count(),
        }]

class AgentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AgentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent = get_object_or_404(api_models.Agent, id=self.kwargs['agent_id'])
        return [{"total_hafizs": api_models.Hafiz.objects.filter(agent=agent).count()}]


class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(api_models.User, id=user_id)

        total_courses = api_models.EnrolledCourse.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedLesson.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class InstructorSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPStudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(api_models.User, id=user_id)

        total_odevs = api_models.EnrolledOdev.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedOdev.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_odevs,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class AgentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AgentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs['agent_id']
        agent = api_models.Agent.objects.get(id=agent_id)
        total_hafizs = api_models.Hafiz.objects.filter(agent=agent).count()

        return [{"total_hafizs": total_hafizs}]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        user = get_object_or_404(User, id=user_id)

        total_courses = api_models.EnrolledCourse.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedLesson.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        data = self.get_queryset()
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data)


class InstructorSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ESKEPStudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        user = get_object_or_404(User, id=user_id)

        total_odevs = api_models.EnrolledOdev.objects.filter(user=user).count()
        completed_lessons = api_models.CompletedOdev.objects.filter(user=user).count()
        achieved_certificates = api_models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_odevs,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        data = self.get_queryset()
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data)


class AgentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AgentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs["agent_id"]
        agent = get_object_or_404(api_models.Agent, id=agent_id)
        total_hafizs = api_models.Hafiz.objects.filter(agent=agent).count()
        return [{"total_hafizs": total_hafizs}]

    def list(self, request, *args, **kwargs):
        data = self.get_queryset()
        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data)
    
class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        teacher = api_models.Teacher.objects.get(id=user_id)
        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(teacher=teacher).count()
        total_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid")
            .aggregate(total=models.Sum("price"))["total"] or 0
        )
        monthly_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago)
            .aggregate(total=models.Sum("price"))["total"] or 0
        )

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = {c.user_id for c in enrolled_courses}

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(unique_student_ids),
        }]