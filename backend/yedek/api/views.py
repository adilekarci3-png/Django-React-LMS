# from django.db.models import Sum
# from django.utils.timezone import localdate
# from django.forms import ValidationError
# from django.http import JsonResponse
# from django.shortcuts import get_object_or_404
# from django.core.mail import EmailMultiAlternatives
# from django.template.loader import render_to_string
# from django.conf import settings
# from django.contrib.auth.hashers import check_password
# from django.db import models
# from django.db.models.functions import ExtractMonth
# from django.core.files.uploadedfile import InMemoryUploadedFile
# from rest_framework import serializers, generics, filters
# from rest_framework.exceptions import NotFound
# from api import serializer as api_serializer
# from api import models as api_models
# from setuptools.dist import strtobool
# from api.permissions import IsGeneralKoordinator, IsGeneralTeacher

# from utils.hbs_user import _get_user_agent_city, _is_hbs_koordinator
# from utils.instructor_videos import _get_video_object
# from django.db.models import Q, Prefetch
# from utils.permissions import CanModifyVideoLink, IsEskepKoordinatorOrTeacher, get_educator_for_user, get_teacher_for_user, is_eskep_koordinator
# from userauths.models import User, Profile
# from django.db.models import Count
# from django.db.models import Q
# from rest_framework.viewsets import ViewSet
# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework import generics, status, viewsets
# from rest_framework.permissions import AllowAny
# from rest_framework.decorators import permission_classes
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.response import Response
# from rest_framework.decorators import api_view,action
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
# import random
# from decimal import Decimal
# import stripe
# import requests
# from datetime import datetime, timedelta
# from django.db import transaction
# from rest_framework.permissions import BasePermission
# from rest_framework.exceptions import PermissionDenied
# from django.core.exceptions import ObjectDoesNotExist
# from django.contrib.contenttypes.models import ContentType
# from api import models as M
# # import distutils
# # from distutils.util import strtobool

# stripe.api_key = settings.STRIPE_SECRET_KEY
# PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
# PAYPAL_SECRET_ID = settings.PAYPAL_SECRET_ID       


            

    



# class TeacherCourseListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.CourseSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Course.objects.filter(teacher=teacher)  

# class TeacherReviewListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.ReviewSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Review.objects.filter(course__teacher=teacher)
    

# class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
#     serializer_class = api_serializer.ReviewSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         teacher_id = self.kwargs['teacher_id']
#         review_id = self.kwargs['review_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Review.objects.get(course__teacher=teacher, id=review_id)
    

# class TeacherStudentsListAPIVIew(viewsets.ViewSet):
    
#     def list(self, request, teacher_id=None):
#         teacher = api_models.Teacher.objects.get(id=teacher_id)

#         enrolled_courses = api_models.EnrolledCourse.objects.filter(teacher=teacher)
#         unique_student_ids = set()
#         students = []

#         for course in enrolled_courses:
#             if course.user_id not in unique_student_ids:
#                 user = User.objects.get(id=course.user_id)
#                 student = {
#                     "full_name": user.profile.full_name,
#                     "image": user.profile.image.url if user.profile.image else None,
#                     "country": str(user.profile.country),  # ✅ burası düzeltildi
#                     "date": course.date.strftime("%Y-%m-%d"),  # ✅ datetime string'e çevrildi
#                 }

#                 students.append(student)
#                 unique_student_ids.add(course.user_id)

#         return Response(students)

# class EskepInstructorStudentsStajersListAPIView(viewsets.ViewSet):
#     def list(self, request, user_id=None):
#         if not str(user_id).isdigit():
#             return Response({"error": "Geçersiz kullanıcı ID'si."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             koordinator = api_models.Koordinator.objects.get(user_id=user_id)
#         except api_models.Koordinator.DoesNotExist:
#             return Response({"error": "Koordinatör bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

#         ogrenciler = api_models.Ogrenci.objects.filter(instructor=koordinator)
#         stajerler = api_models.Stajer.objects.filter(instructor=koordinator)

#         unique_user_ids = set()
#         response_data = []

#         for item in list(ogrenciler) + list(stajerler):
#             user = item.user
#             if user.id in unique_user_ids:
#                 continue

#             try:
#                 profile = user.profile
#                 profile_date = getattr(profile, "date", None)
#                 if isinstance(profile_date, (str, type(None))):
#                     formatted_date = profile_date
#                 else:
#                     formatted_date = profile_date.strftime("%Y-%m-%d")
#             except Exception:
#                 formatted_date = None

#             response_data.append({
#                 "full_name": item.full_name,
#                 "image": item.image.url if item.image else None,
#                 "country": str(item.country) if item.country else None,
#                 "city": str(item.city) if item.city else None,
#                 "date": formatted_date,
#             })

#             unique_user_ids.add(user.id)

#         return Response(response_data)

# @api_view(["GET"])
# def TeacherAllMonthEarningAPIView(request, teacher_id):
#     monthly_earning_tracker = (
#         api_models.CartOrderItem.objects
#         .filter(teacher_id=teacher_id, order__payment_status="Paid")
#         .annotate(month=ExtractMonth("date"))
#         .values("month")
#         .annotate(total_earning=Sum("price"))
#         .order_by("month")
#     )

#     return Response(list(monthly_earning_tracker))

# @api_view(["GET"])
# def IsAgent(request, user_id):
#     if not str(user_id).isdigit():
#         return Response({"error": "Geçersiz kullanıcı ID'si"}, status=status.HTTP_400_BAD_REQUEST)

#     agent = api_models.Agent.objects.filter(user_id=user_id).first()

#     return Response({
#         "is_agent": bool(agent),
#         "agent_id": agent.id if agent else None
#     })
        
# class CartOrderItemListAPIView(APIView):
#     def get(self, request):
#         items = api_models.CartOrderItem.objects.all()      
#         serializer = api_serializer.CartOrderItemSerializer(items, many=True)
#         return Response(serializer.data)

# class TeacherBestSellingCourseAPIView(viewsets.ViewSet):
#     def list(self, request, teacher_id=None):
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         courses_with_total_price = []
#         courses = api_models.Course.objects.filter(teacher=teacher)

#         for course in courses:
#             revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum('order_item__price'))['total_price'] or 0
#             sales = course.enrolledcourse_set.count()

#             courses_with_total_price.append({
#                 'course_image': course.image.url,
#                 'course_title': course.title,
#                 'revenue': revenue,
#                 'sales': sales,
#             })

#         return Response(courses_with_total_price)
    
# class TeacherCourseOrdersListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.CartOrderItemSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         return api_models.CartOrderItem.objects.filter(teacher__id=teacher_id)

# class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.Question_AnswerSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Question_Answer.objects.filter(course__teacher=teacher)
    
# class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
#     serializer_class = api_serializer.CouponSerializer
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Coupon.objects.filter(teacher=teacher)
    
# class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = api_serializer.CouponSerializer
#     permission_classes = [AllowAny]
    
#     def get_object(self):
#         teacher_id = self.kwargs['teacher_id']
#         coupon_id = self.kwargs['coupon_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Coupon.objects.get(teacher=teacher, id=coupon_id)
    
# class TeacherNotificationListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.NotificationSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         teacher_id = self.kwargs['teacher_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Notification.objects.filter(teacher=teacher, seen=False)
    
# class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
#     serializer_class = api_serializer.NotificationSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         teacher_id = self.kwargs['teacher_id']
#         noti_id = self.kwargs['noti_id']
#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         return api_models.Notification.objects.get(teacher=teacher, id=noti_id)
    
# class CourseCreateAPIView(generics.CreateAPIView):
#     querysect = api_models.Course.objects.all()
#     serializer_class = api_serializer.CourseSerializer
#     permisscion_classes = [AllowAny]

#     def perform_create(self, serializer):
#         serializer.is_valid(raise_exception=True)
#         course_instance = serializer.save()

#         variant_data = []
#         for key, value in self.request.data.items():
#             if key.startswith('variant') and '[variant_title]' in key:
#                 index = key.split('[')[1].split(']')[0]
#                 title = value

#                 variant_dict = {'title': title}
#                 item_data_list = []
#                 current_item = {}
#                 variant_data = []

#                 for item_key, item_value in self.request.data.items():
#                     if f'variants[{index}][items]' in item_key:
#                         field_name = item_key.split('[')[-1].split(']')[0]
#                         if field_name == "title":
#                             if current_item:
#                                 item_data_list.append(current_item)
#                             current_item = {}
#                         current_item.update({field_name: item_value})
                    
#                 if current_item:
#                     item_data_list.append(current_item)

#                 variant_data.append({'variant_data': variant_dict, 'variant_item_data': item_data_list})

#         for data_entry in variant_data:
#             variant = api_models.Variant.objects.create(title=data_entry['variant_data']['title'], course=course_instance)

#             for item_data in data_entry['variant_item_data']:
#                 preview_value = item_data.get("preview")
#                 preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

#                 api_models.VariantItem.objects.create(
#                     variant=variant,
#                     title=item_data.get("title"),
#                     description=item_data.get("description"),
#                     file=item_data.get("file"),
#                     preview=preview,
#                 )

#     def save_nested_data(self, course_instance, serializer_class, data):
#         serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
#         serializer.is_valid(raise_exception=True)
#         serializer.save(course=course_instance) 


# class EducatorCreateAPIView(generics.CreateAPIView):
#     queryset = api_models.Educator.objects.all()
#     serializer_class = api_serializer.EducatorSerializer

# class EducatorUpdateAPIView(generics.RetrieveUpdateAPIView):
#     queryset = api_models.Educator.objects.all()
#     serializer_class = api_serializer.EducatorSerializer
    
# class CoordinatorYetkiAtaAPIView(generics.UpdateAPIView):
#     serializer_class = api_serializer.KoordinatorSerializer
#     permission_classes = [AllowAny]
#     queryset = api_models.Koordinator.objects.all()

#     def put(self, request, *args, **kwargs):
#         coordinator_id = request.data.get("coordinator_id")
#         role = request.data.get("role")

#         if not coordinator_id or not role:
#             return Response({"message": "coordinator_id ve role alanları gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             coordinator = api_models.Koordinator.objects.get(id=coordinator_id)
#         except api_models.Koordinator.DoesNotExist:
#             return Response({'message': 'Koordinatör bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

#         coordinator.role = role
#         coordinator.save()

#         return Response({
#             'message': 'Koordinatör başarıyla güncellendi',
#             'id': coordinator.id,
#             'role': coordinator.role
#         }, status=status.HTTP_200_OK)

#     # def put(self, request, *args, **kwargs):
#     #     # PUT işlemi yapılacak kod burada
#     #     data = request.data
        
#     #     # Burada koordinatörü güncelleme işlemi yapabiliriz
#     #     try:
#     #         coordinator = api_models.Koordinator.objects.get(id=kwargs['pk'])
#     #         coordinator.full_name = data['full_name']
#     #         coordinator.role = data['role']
#     #         coordinator.save()
#     #         return Response({'message': 'Koordinatör başarıyla güncellendi'}, status=200)
#     #     except api_models.Koordinator.DoesNotExist:
#     #         return Response({'message': 'Koordinatör bulunamadı'}, status=404)
    
# class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
#     querysect = api_models.Course.objects.all()
#     serializer_class = api_serializer.CourseSerializer
#     permisscion_classes = [AllowAny]

#     def get_object(self):
#         teacher_id = self.kwargs['teacher_id']
#         course_id = self.kwargs['course_id']

#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         course = api_models.Course.objects.get(course_id=course_id)

#         return course
    
#     def update(self, request, *args, **kwargs):
#         course = self.get_object()
#         serializer = self.get_serializer(course, data=request.data)
#         serializer.is_valid(raise_exception=True)

#         if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
#             course.image = request.data['image']
#         elif 'image' in request.data and str(request.data['image']) == "No File":
#             course.image = None
        
#         if 'file' in request.data and not str(request.data['file']).startswith("http://"):
#             course.file = request.data['file']

#         if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
#             category = api_models.Category.objects.get(id=request.data['category'])
#             course.category = category

#         self.perform_update(serializer)
#         self.update_variant(course, request.data)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
#     def update_variant(self, course, request_data):
#         for key, value in request_data.items():
#             if key.startswith("variants") and '[variant_title]' in key:

#                 index = key.split('[')[1].split(']')[0]
#                 title = value

#                 id_key = f"variants[{index}][variant_id]"
#                 variant_id = request_data.get(id_key)

#                 variant_data = {'title': title}
#                 item_data_list = []
#                 current_item = {}

#                 for item_key, item_value in request_data.items():
#                     if f'variants[{index}][items]' in item_key:
#                         field_name = item_key.split('[')[-1].split(']')[0]
#                         if field_name == "title":
#                             if current_item:
#                                 item_data_list.append(current_item)
#                             current_item = {}
#                         current_item.update({field_name: item_value})
                    
#                 if current_item:
#                     item_data_list.append(current_item)

#                 existing_variant = course.variant_set.filter(id=variant_id).first()

#                 if existing_variant:
#                     existing_variant.title = title
#                     existing_variant.save()

#                     for item_data in item_data_list[1:]:
#                         preview_value = item_data.get("preview")
#                         preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

#                         variant_item = api_models.VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

#                         if not str(item_data.get("file")).startswith("http://"):
#                             if item_data.get("file") != "null":
#                                 file = item_data.get("file")
#                             else:
#                                 file = None
                            
#                             title = item_data.get("title")
#                             description = item_data.get("description")

#                             if variant_item:
#                                 variant_item.title = title
#                                 variant_item.description = description
#                                 variant_item.file = file
#                                 variant_item.preview = preview
#                             else:
#                                 variant_item = api_models.VariantItem.objects.create(
#                                     variant=existing_variant,
#                                     title=title,
#                                     description=description,
#                                     file=file,
#                                     preview=preview
#                                 )
                        
#                         else:
#                             title = item_data.get("title")
#                             description = item_data.get("description")

#                             if variant_item:
#                                 variant_item.title = title
#                                 variant_item.description = description
#                                 variant_item.preview = preview
#                             else:
#                                 variant_item = api_models.VariantItem.objects.create(
#                                     variant=existing_variant,
#                                     title=title,
#                                     description=description,
#                                     preview=preview
#                                 )
                        
#                         variant_item.save()

#                 else:
#                     new_variant = api_models.Variant.objects.create(
#                         course=course, title=title
#                     )

#                     for item_data in item_data_list:
#                         preview_value = item_data.get("preview")
#                         preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

#                         api_models.VariantItem.objects.create(
#                             variant=new_variant,
#                             title=item_data.get("title"),
#                             description=item_data.get("description"),
#                             file=item_data.get("file"),
#                             preview=preview,
#                         )

#     def save_nested_data(self, course_instance, serializer_class, data):
#         serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
#         serializer.is_valid(raise_exception=True)
#         serializer.save(course=course_instance) 


# class TeacherCourseDetailAPIView(generics.RetrieveDestroyAPIView):
#     serializer_class = api_serializer.CourseSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         course_id = self.kwargs['course_id']
#         return api_models.Course.objects.get(course_id=course_id)


# class CourseVariantDeleteAPIView(generics.DestroyAPIView):
#     serializer_class = api_serializer.VariantSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         variant_id = self.kwargs['variant_id']
#         teacher_id = self.kwargs['teacher_id']
#         course_id = self.kwargs['course_id']

#         print("variant_id ========", variant_id)

#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
#         return api_models.Variant.objects.get(id=variant_id)
    
# class CourseVariantItemDeleteAPIVIew(generics.DestroyAPIView):
#     serializer_class = api_serializer.VariantItemSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         variant_id = self.kwargs['variant_id']
#         variant_item_id = self.kwargs['variant_item_id']
#         teacher_id = self.kwargs['teacher_id']
#         course_id = self.kwargs['course_id']

#         teacher = api_models.Teacher.objects.get(id=teacher_id)
#         course = api_models.Course.objects.get(teacher=teacher, course_id=course_id)
#         variant = api_models.Variant.objects.get(variant_id=variant_id, course=course)
#         return api_models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id)


# class HafizBilgiCreateAPIView(generics.CreateAPIView):
#     queryset = api_models.Hafiz.objects.all()
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = []  # Girişsiz kullanım için boş

#     def perform_create(self, serializer):
#         # Hafızın bilgilerini al
#         gender = serializer.validated_data.get("gender")
#         adres_il = serializer.validated_data.get("adresIl")

#         try:
#             ankara_city = api_models.City.objects.get(name__iexact="Ankara")
#         except api_models.City.DoesNotExist:
#             raise ValidationError("Ankara şehri bulunamadı.")
    
#         matching_agent = api_models.Agent.objects.filter(
#             gender=gender,
#             city=adres_il
#         ).first()

#         # 2) gender + Ankara
#         if not matching_agent:
#             matching_agent = api_models.Agent.objects.filter(
#                 gender=gender,
#                 city=ankara_city.id
#             ).first()

#         # 3) opposite gender + city
#         if not matching_agent:
#             opposite_gender = "Kadın" if gender == "Erkek" else "Erkek"
#             matching_agent = api_models.Agent.objects.filter(
#                 gender=opposite_gender,
#                 city=adres_il
#             ).first()

#         # 4) opposite gender + Ankara
#         if not matching_agent:
#             matching_agent = api_models.Agent.objects.filter(
#                 gender=opposite_gender,
#                 city=ankara_city.id
#             ).first()

#         # 5) Hiçbiri yoksa hata
#         if not matching_agent:
#             raise ValidationError("Uygun Agent bulunamadı.")
#         # Hafızı kaydet
#         instance = serializer.save(agent=matching_agent)

#         # İsteğe göre mesaj dönecek
#         return Response(
#             {"message": "Hafız bilgisi başarılı bir şekilde eklendi"},
#             status=status.HTTP_201_CREATED
#         )


# class HafizBilgiUpdateAPIView(generics.RetrieveUpdateAPIView):
#     queryset = api_models.Hafiz.objects.all()
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = [AllowAny]

#     def get_object(self):
#         agent_id = self.kwargs.get('agent_id')
#         hafizbilgi_id = self.kwargs.get('hafizbilgi_id')

#         # Agent doğrulaması (ID ile)
#         agent = get_object_or_404(api_models.Agent, id=agent_id)

#         # Hafiz bilgisi sadece bu agent'e bağlıysa get edilsin (isteğe bağlı bağlama kontrolü)
#         return get_object_or_404(api_models.Hafiz, id=hafizbilgi_id)

#     def update(self, request, *args, **kwargs):
#         data = request.data.copy()

#         # Yaş sayısal değilse dönüştür
#         if "yas" in data:
#             try:
#                 data["yas"] = int(data["yas"])
#             except ValueError:
#                 return Response({"yas": ["Geçersiz yaş."]}, status=400)

#         # Agent ID düzeltme (gelen veri isimse hatalıdır)
#         if "agent" in data:
#             try:
#                 agent = api_models.Agent.objects.get(id=data["agent"])
#                 data["agent"] = agent.id
#             except api_models.Agent.DoesNotExist:
#                 return Response({"agent": ["Temsilci bulunamadı."]}, status=400)

#         # adresIl düzeltme
#         if "adresIl" in data and not isinstance(data["adresIl"], int):
#             try:
#                 city = api_models.City.objects.get(name=data["adresIl"])
#                 data["adresIl"] = city.id
#             except api_models.City.DoesNotExist:
#                 return Response({"adresIl": ["İl bulunamadı."]}, status=400)

#         hafiz_bilgi = self.get_object()
#         serializer = self.get_serializer(hafiz_bilgi, data=data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)

#         return Response(serializer.data, status=status.HTTP_200_OK)


# class HafizListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.HafizSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         agent_id = self.kwargs.get("agent_id")
#         return api_models.Hafiz.objects.filter(agent_id=agent_id).select_related("user", "hdm_egitmen").prefetch_related("dersler")
    
# class AgentHafizListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):  
#         agent_id = self.kwargs['agent_id']
#         agent =  api_models.Agent.objects.get(id=agent_id) 
#         queryset = api_models.Hafiz.objects.filter(agent=agent)        
           
#         return queryset        
     
# class HafizsListAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         # 1) HBSKoordinator ise TÜM kayıtlar
#         if _is_hbs_koordinator(user):
#             return api_models.Hafiz.objects.select_related("adresIl").all()

#         # 2) Değilse (ör. HBSTemsilci), kendi şehrindeki hafızlar
#         city = _get_user_agent_city(user)
#         if city:
#             return api_models.Hafiz.objects.select_related("adresIl").filter(adresIl=city)

#         # 3) Hiçbiri değilse liste boş
#         return api_models.Hafiz.objects.none()


# class HafizsListByAgentAPIView(generics.ListAPIView):
#     serializer_class = api_serializer.HafizBilgiSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         """
#         URL: .../hafizlar/agent/<agent_id>/
#         Agent.city == Hafiz.adresIl eşleşmesine göre filtreler.
#         """
#         agent_id = self.kwargs.get("agent") or self.kwargs.get("agent_id")
#         agent = get_object_or_404(api_models.Agent, pk=agent_id)

#         return (
#             api_models.Hafiz.objects
#             .select_related("adresIl")
#             .filter(adresIl=agent.city)
#         )
    
# class JobListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.JobSerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.Job.objects.all()
#         print(queryset)      
#         return queryset      

# class CityListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.CitySerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.City.objects.all()
#         print(queryset)      
#         return queryset  
     
# class CountryListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.CountrySerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.Country.objects.all()
#         print(queryset)      
#         return queryset   
    
# class ProjeListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.ProjeSerializer   
    
#     def get_queryset(self):        
#         queryset = api_models.Proje.objects.all()
#         print(queryset)      
#         return queryset 

# class AgentListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.AgentSerializer   
    
#     def get_queryset(self):        
#         queryset = api_models.Agent.objects.all()
#         print(queryset)      
#         return queryset 
   
# class DistrictListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.DistrictSerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.District.objects.all()
#         print(queryset)      
#         return queryset  
   
# class EgitmenListAPIView(generics.ListAPIView):   
#     serializer_class = api_serializer.TeacherSerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.Teacher.objects.all()
#         print(queryset)      
#         return queryset  
    


# class OrganizationMemberViewSetAPIVIew(generics.ListAPIView):   
#     serializer_class = api_serializer.OrganizationMemberSerializer 
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):        
#         queryset = api_models.OrganizationMember.objects.all()
#         print(queryset)        
#         return queryset 
    
#     def list(self,request):
#         members =[]
#         try:
#             queryset = self.get_queryset()
#             serialize_value = api_serializer.OrganizationMemberSerializer(queryset,many=True,context={'request': self.request}).data
#             #Here in "serialize_value" you can append your data as much as you wish
#             for organizationMember in serialize_value: 
#                 designation_id = organizationMember['Designation']
                
#                 designation = api_models.Designation.objects.get(id=designation_id)                  
#                 member = {
#                     'id': organizationMember['id'],
#                     'Name':organizationMember['Name'],
#                     'Designation':organizationMember['Designation'],
#                     'ImageUrl':organizationMember['ImageUrl'],
#                     'IsExpand':organizationMember['IsExpand'],
#                     'RatingColor':'#68C2DE',
#                     'ReportingPerson':designation.ustBirim,
#                     'DesignationText':designation.name
                    
#                 }
#                 members.append(member)    
#             return Response(members, status=status.HTTP_200_OK, content_type='application/json')
#         except Exception as E:
#             return Response({'error': str(E)}, status=status.HTTP_408_REQUEST_TIMEOUT, content_type='application/json') 

# def get_user_role(user_id):
#     try:
#         if  api_models.Koordinator.objects.filter(user__id=user_id).exists():
#             return "Koordinator"
#         elif api_models.Stajer.objects.filter(user__id=user_id).exists():
#             return "Stajer"
#         elif api_models.Ogrenci.objects.filter(user__id=user_id).exists():
#             return "Ogrenci"
#         else:
#             return "Unknown"
#     except Exception as e:
#         return f"Error: {str(e)}"

