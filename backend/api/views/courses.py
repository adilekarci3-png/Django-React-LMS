# courses.py (GÜNCELLE/SONUNA EKLE)

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api import models as api_models
from api.views.permissions import IsEskepKoordinatorOrTeacher
from .. import models as api_models, serializers as api_serializer
from django.contrib.auth import get_user_model

from utils.booleans import strtobool
from django.core.files.uploadedfile import InMemoryUploadedFile

from ..serializers import (
    CategorySerializer,
    CourseSerializer,
    ReviewSerializer,
    WishlistSerializer,
    VariantSerializer,
    VariantItemSerializer,
)
from utils.booleans import strtobool
User = get_user_model()

class CategoryListAPIView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(
        platform_status="Yayinlanmis",
        teacher_course_status="Yayinlanmis"
    )
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class MyCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [IsEskepKoordinatorOrTeacher]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return api_models.Course.objects.filter(
            inserteduser__id=user_id,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis",
            active=True
        ).select_related("teacher", "category")

class CourseDetailAPIView(generics.RetrieveAPIView):
    """
    /course/course-detay/<int:pk>/
    """
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(
        platform_status="Yayinlanmis",
        teacher_course_status="Yayinlanmis"
    )

    def get_object(self):
        pk = self.kwargs['pk']
        return get_object_or_404(self.get_queryset(), id=pk)

class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query', '')
        return api_models.Course.objects.filter(
            title__icontains=query,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis"
        )

class CategoryListAPIView(generics.ListAPIView):
    queryset = api_models.Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]


class CourseListAPIView(generics.ListAPIView):
    queryset = api_models.Course.objects.filter(
        platform_status="Yayinlanmis",
        teacher_course_status="Yayinlanmis",
    )
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]


class MyCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [IsEskepKoordinatorOrTeacher]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return api_models.Course.objects.filter(
            inserteduser__id=user_id,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis",
            active=True,
        ).select_related("teacher", "category")


# NOT: URL’lerin <int:pk> kullandığını gördüğüm için pk ile çalışan versiyonu tutuyoruz.
class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = api_models.Course.objects.filter(
        platform_status="Yayinlanmis",
        teacher_course_status="Yayinlanmis",
    )
    lookup_field = "pk"

class CourseDeleteView(generics.DestroyAPIView):
    queryset = api_models.Course.objects.all()
    permission_classes = [IsEskepKoordinatorOrTeacher]

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()  # URL conf'taki pk/lookup_field'e göre yakalar
        obj.delete()
        return Response({"detail": "Silindi"}, status=status.HTTP_204_NO_CONTENT)


class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        return api_models.Course.objects.filter(
            title__icontains=query,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis",
        )
        
class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get("query", "")
        return api_models.Course.objects.filter(
            title__icontains=query,
            platform_status="Yayinlanmis",
            teacher_course_status="Yayinlanmis",
        ) 

class StudentRateCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = get_object_or_404(api_models.User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)

        api_models.Review.objects.create(
            user=user, course=course, review=review, rating=rating, active=True,
        )
        return Response({"message": "Review created successfullly"}, status=status.HTTP_201_CREATED)


class StudentRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = get_object_or_404(api_models.User, id=user_id)
        return get_object_or_404(api_models.Review, id=review_id, user=user)

class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        return api_models.Wishlist.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        user = get_object_or_404(User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)
        wishlist = api_models.Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        api_models.Wishlist.objects.create(user=user, course=course)
        return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)
    



# --- EKLENENLER ---

class CourseCreateAPIView(generics.CreateAPIView):
    queryset = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        course_instance = serializer.save()

        # Variant/Item parse
        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variants') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                variant_dict = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})

                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_data': variant_dict, 'variant_item_data': item_data_list})

        for data_entry in variant_data:
            variant = api_models.Variant.objects.create(title=data_entry['variant_data']['title'], course=course_instance)
            for item_data in data_entry['variant_item_data']:
                preview_value = item_data.get("preview")
                preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                api_models.VariantItem.objects.create(
                    variant=variant,
                    title=item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']
        teacher = api_models.Teacher.objects.get(id=teacher_id)
        return api_models.Course.objects.get(teacher=teacher, course_id=course_id)

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None

        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if request.data.get('category') not in (None, 'NaN', 'undefined'):
            category = api_models.Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                item_data_list = []
                current_item = {}
                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()
                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = api_models.VariantItem.objects.filter(
                            variant_item_id=item_data.get("variant_item_id")
                        ).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            file = None if item_data.get("file") == "null" else item_data.get("file")
                            title_i = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title_i
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title_i,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        else:
                            title_i = item_data.get("title")
                            description = item_data.get("description")
                            if variant_item:
                                variant_item.title = title_i
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = api_models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title_i,
                                    description=description,
                                    preview=preview
                                )
                        variant_item.save()
                else:
                    new_variant = api_models.Variant.objects.create(course=course, title=title)
                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False
                        api_models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )


class TeacherCourseDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        course_id = self.kwargs['course_id']
        return api_models.Course.objects.get(course_id=course_id)


class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        return api_models.Variant.objects.get(id=variant_id)


class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = api_models.Teacher.objects.get(id=teacher_id)
        course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
        variant = api_models.Variant.objects.get(variant_id=variant_id, course=course)
        return api_models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id)


from rest_framework import generics, status, permissions # permissions eklendi
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
from api import models as api_models
from api import serializers as api_serializer

class StudentEnrollCourseAPIView(generics.CreateAPIView):
    """
    Ücretsiz kurslar (0.00 TL) için doğrudan kayıt oluşturur.
    """
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [permissions.AllowAny] 

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("user_id") or request.data.get("id")
        course_id = request.data.get("course_id")

        user = get_object_or_404(User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)

        if api_models.EnrolledCourse.objects.filter(user=user, course=course).exists():
            return Response({"message": "Bu kursa zaten kayıtlısınız."}, status=status.HTTP_400_BAD_REQUEST)

        if Decimal(str(course.price)) == Decimal("0.00"):
            try:
                with transaction.atomic():
                    order = api_models.CartOrder.objects.create(
                        student=user,
                        full_name=getattr(user, 'full_name', user.username),
                        email=user.email
                    )
                    order.teachers.add(course.teacher)

                    order_item = api_models.CartOrderItem.objects.create(
                        order=order,
                        course=course,
                        teacher=course.teacher,
                        price=Decimal("0.00"),
                        total=Decimal("0.00"),
                        initial_total=Decimal("0.00")
                    )

                    api_models.EnrolledCourse.objects.create(
                        user=user,
                        course=course,
                        teacher=course.teacher,
                        order_item=order_item
                    )

                return Response({"message": "Kursa başarıyla katıldınız!"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"message": f"Teknik hata: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Bu kurs bağış gerektiriyor."}, status=status.HTTP_402_PAYMENT_REQUIRED)

class StudentDonationCreateAPIView(generics.CreateAPIView):
    """
    Ücretli kurslar için sadece talep (CartOrder) oluşturur.
    """
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("user_id") or request.data.get("id")
        course_id = request.data.get("course_id")

        user = get_object_or_404(User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)

        try:
            with transaction.atomic():
                order = api_models.CartOrder.objects.create(
                    student=user,
                    full_name=getattr(user, 'full_name', user.username),
                    email=user.email
                )
                order.teachers.add(course.teacher)
                
                api_models.CartOrderItem.objects.create(
                    order=order,
                    course=course,
                    teacher=course.teacher,
                    price=course.price,
                    total=course.price,
                    initial_total=course.price
                )

            return Response({
                "message": "Bağış talebiniz alındı, onay bekliyor.", 
                "order_oid": order.oid
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": f"Hata: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
