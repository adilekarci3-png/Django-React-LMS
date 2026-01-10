# api/views/teachers.py
from datetime import timedelta

from api.views.utils import _build_person_response
from utils.booleans import strtobool
from django.core.files.uploadedfile import InMemoryUploadedFile

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .. import models as api_models, serializers as api_serializer

User = get_user_model()


class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.filter(teacher=teacher)


class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.filter(course__teacher=teacher)


class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Review.objects.get(course__teacher=teacher, id=review_id)


class TeacherStudentsListAPIVIew(viewsets.ViewSet):
    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url if getattr(user.profile, "image", None) else None,
                    "country": str(user.profile.country) if getattr(user.profile, "country", None) else None,
                    "date": course.date.strftime("%Y-%m-%d"),
                }
                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)


class EskepKoordinatorStudentsListAPIView(viewsets.ViewSet):
    """
    /eskep/koordinator/students/<user_id>/
    => sadece bu koordinator'e bağlı öğrenciler
    """
    def list(self, request, user_id=None):
        if not str(user_id).isdigit():
            return Response({"error": "Geçersiz kullanıcı ID'si."}, status=status.HTTP_400_BAD_REQUEST)

        # user_id -> koordinator
        try:
            koordinator = api_models.Koordinator.objects.get(user_id=user_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        ogrenciler = api_models.Ogrenci.objects.filter(instructor=koordinator)

        response_data = []
        unique_user_ids = set()

        for ogr in ogrenciler:
            user = getattr(ogr, "user", None)
            if user and user.id in unique_user_ids:
                continue

            response_data.append(_build_person_response(ogr))

            if user:
                unique_user_ids.add(user.id)

        return Response(response_data, status=status.HTTP_200_OK)

class EskepKoordinatorStajersListAPIView(viewsets.ViewSet):
    """
    /eskep/koordinator/stajers/<user_id>/
    => sadece bu koordinator'e bağlı stajerler
    """
    def list(self, request, user_id=None):
        if not str(user_id).isdigit():
            return Response({"error": "Geçersiz kullanıcı ID'si."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            koordinator = api_models.Koordinator.objects.get(user_id=user_id)
        except api_models.Koordinator.DoesNotExist:
            return Response({"error": "Koordinatör bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        stajerler = api_models.Stajer.objects.filter(instructor=koordinator)

        response_data = []
        unique_user_ids = set()

        for stj in stajerler:
            user = getattr(stj, "user", None)
            if user and user.id in unique_user_ids:
                continue

            response_data.append(_build_person_response(stj))

            if user:
                unique_user_ids.add(user.id)

        return Response(response_data, status=status.HTTP_200_OK)

@api_view(["GET"])
def TeacherAllMonthEarningAPIView(request, teacher_id):
    monthly_earning_tracker = (
        api_models.CartOrderItem.objects
        .filter(teacher_id=teacher_id, order__payment_status="Paid")
        .annotate(month=ExtractMonth("date"))
        .values("month")
        .annotate(total_earning=Sum("price"))
        .order_by("month")
    )
    return Response(list(monthly_earning_tracker))


class TeacherBestSellingCourseAPIView(viewsets.ViewSet):
    def list(self, request, teacher_id=None):
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = api_models.Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum('order_item__price'))['total_price'] or 0
            sales = course.enrolledcourse_set.count()
            courses_with_total_price.append({
                'course_image': course.image.url if course.image else None,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)


class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        return api_models.CartOrderItem.objects.filter(teacher__id=teacher_id)


class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Question_Answer.objects.filter(course__teacher=teacher)


class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.filter(teacher=teacher)


class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Coupon.objects.get(teacher=teacher, id=coupon_id)


class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.filter(teacher=teacher, seen=False)


class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Notification.objects.get(teacher=teacher, id=noti_id)
