# api/views/summaries.py  (TEMİZ SÜRÜM)
from datetime import datetime, timedelta

from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from userauths.models import User

from .. import models as api_models, serializers as api_serializer


class StudentSummaryAPIView(generics.GenericAPIView):
    """
    /api/v1/student/summary/<user_id>/
    -> [{"total_courses": int, "completed_lessons": int, "achieved_certificates": int}]
    """
    permission_classes = [AllowAny]
    serializer_class = api_serializer.StudentSummarySerializer

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs["user_id"]
        user = get_object_or_404(User, id=user_id)

        data = [{
            "total_courses": api_models.EnrolledCourse.objects.filter(user=user).count(),
            "completed_lessons": api_models.CompletedLesson.objects.filter(user=user).count(),
            "achieved_certificates": api_models.Certificate.objects.filter(user=user).count(),
        }]

        serializer = self.get_serializer(data, many=True)  # instance= data (liste/dict)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InstructorSummaryAPIView(generics.GenericAPIView):
    """
    /api/v1/instructor/summary/<user_id>/
    -> [{"total_courses": int, "completed_lessons": int, "achieved_certificates": int}]
       (ESKEP bağlamında 'ödev' sayıları)
    """
    permission_classes = [AllowAny]
    serializer_class = api_serializer.ESKEPStudentSummarySerializer

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs["user_id"]
        user = get_object_or_404(User, id=user_id)

        data = [{
            "total_courses": api_models.EnrolledOdev.objects.filter(user=user).count(),
            "completed_lessons": api_models.CompletedOdev.objects.filter(user=user).count(),
            "achieved_certificates": api_models.Certificate.objects.filter(user=user).count(),
        }]

        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AgentSummaryAPIView(generics.GenericAPIView):
    """
    /api/v1/agent/summary/<agent_id>/
    -> [{"total_hafizs": int}]
    """
    permission_classes = [AllowAny]
    serializer_class = api_serializer.AgentSummarySerializer

    def get(self, request, *args, **kwargs):
        agent_id = self.kwargs["agent_id"]
        agent = get_object_or_404(api_models.Agent, id=agent_id)

        data = [{
            "total_hafizs": api_models.Hafiz.objects.filter(agent=agent).count()
        }]

        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeacherSummaryAPIView(generics.GenericAPIView):
    """
    /api/v1/teacher/summary/<teacher_id>/
    -> [{"total_courses": int, "total_revenue": Decimal, "monthly_revenue": Decimal, "total_students": int}]
    Not: Esneklik için hem teacher_id hem user_id kabul ediyoruz.
    """
    permission_classes = [AllowAny]
    serializer_class = api_serializer.TeacherSummarySerializer

    def get(self, request, *args, **kwargs):
        # Hem teacher_id hem user_id ile çağrılabiliyorsa ikisini de destekleyelim
        ident = self.kwargs.get("teacher_id") or self.kwargs.get("user_id")

        # Önce Teacher PK ile, yoksa user_id ile deneyelim:
        teacher = (
            api_models.Teacher.objects.filter(id=ident).first()
            or api_models.Teacher.objects.filter(user_id=ident).first()
        )
        teacher = get_object_or_404(api_models.Teacher, id=teacher.id)  # kesin 404 at

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = api_models.Course.objects.filter(teacher=teacher).count()
        total_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid")
            .aggregate(total=Sum("price"))["total"] or 0
        )
        monthly_revenue = (
            api_models.CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago)
            .aggregate(total=Sum("price"))["total"] or 0
        )

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher).only("user_id")
        unique_student_ids = {c.user_id for c in enrolled_courses}

        data = [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(unique_student_ids),
        }]

        serializer = self.get_serializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
