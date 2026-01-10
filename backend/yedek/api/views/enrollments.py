# enrollments.py (YENİ)
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

from .. import models as api_models, serializers as api_serializer

class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(api_models.User, id=self.kwargs['user_id'])
        return api_models.EnrolledCourse.objects.filter(user=user)

class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user = get_object_or_404(api_models.User, id=self.kwargs['user_id'])
        return get_object_or_404(
            api_models.EnrolledCourse,
            user=user,
            enrollment_id=self.kwargs['enrollment_id']
        )  

class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = api_models.User.objects.get(id=user_id)
        return api_models.EnrolledCourse.objects.filter(user=user)

class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        user = get_object_or_404(api_models.User, id=user_id)
        return api_models.EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)

class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        return api_models.EnrolledCourse.objects.filter(user=user)


class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = "enrollment_id"

    def get_object(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        enrollment_id = self.kwargs["enrollment_id"]
        return get_object_or_404(api_models.EnrolledCourse, user=user, enrollment_id=enrollment_id)


class StudentCourseCompletedCreateAPIView(generics.CreateAPIView):
    """
    Body: { "user_id": ..., "course_id": ..., "variant_item_id": ... }
    Toggle mantığı: varsa siler, yoksa oluşturur.
    """
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user = get_object_or_404(User, id=request.data.get("user_id"))
        course = get_object_or_404(api_models.Course, id=request.data.get("course_id"))
        variant_item = get_object_or_404(
            api_models.VariantItem, variant_item_id=request.data.get("variant_item_id")
        )

        existing = api_models.CompletedLesson.objects.filter(
            user=user, course=course, variant_item=variant_item
        ).first()

        if existing:
            existing.delete()
            return Response({"message": "Course marked as not completed"})
        else:
            api_models.CompletedLesson.objects.create(
                user=user, course=course, variant_item=variant_item
            )
            return Response({"message": "Course marked as completed"})


class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        enrolled = get_object_or_404(
            api_models.EnrolledCourse, enrollment_id=self.kwargs["enrollment_id"]
        )
        return api_models.Note.objects.filter(user=user, course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user = get_object_or_404(User, id=self.kwargs["user_id"])
        enrolled = get_object_or_404(
            api_models.EnrolledCourse, enrollment_id=self.kwargs["enrollment_id"]
        )
        api_models.Note.objects.create(
            user=user,
            course=enrolled.course,
            title=request.data.get("title", ""),
            note=request.data.get("note", ""),
        )
        return Response({"message": "Note created successfullly"}, status=status.HTTP_201_CREATED)