# api/permissions.py
from __future__ import annotations

from typing import Optional, Set
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

# Yalnızca modelleri import edin; views import ETMEYİN
from api import models as api_models
from api.models.people import Agent
from api import serializers as api_serializer
# ============================================================================
# SABİTLER — Modellerdeki choices ile bire bir uyumlu
# ============================================================================
ALLOWED_KOORD_SUBROLES: Set[str] = {
    "ESKEPOgrenciKoordinator",
    "ESKEPStajerKoordinator",
    "ESKEPGenelKoordinator",
    "AkademiKoordinator",
    "HBSKoordinator",
    "HDMKoordinator",
}

ALLOWED_TEACHER_SUBROLES: Set[str] = {
    "AkademiEgitmen",
    "ESKEPEgitmen",
    "HBSEgitmen",
    "HDMEgitmen",
}

# Öğrenci alt rol kodu (tek doğruluk noktası)
ESKEP_STUDENT_SUBROLE_CODE = "ESKEPOgrenci"
ESKEP_GENERAL_KOORD_SUBROLE_CODE = "ESKEPGenelKoordinator"

# ============================================================================
# Yardımcılar
# ============================================================================
def user_is_student(user) -> bool:
    """Kullanıcı Ogrenci tablosunda mı?"""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return api_models.Ogrenci.objects.filter(user_id=user.id).exists()


def user_has_subrole(user, code: str) -> bool:
    """
    Kullanıcının alt rolünü kontrol eder (case-insensitive).
    Önce User modelindeki sub_roles property’sini, sonra olası diğer yapıları dener.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return False
    want = (code or "").strip().lower()

    # 0) User modelindeki property (tercih edilir) -> liste döner
    if hasattr(user, "sub_roles"):
        try:
            sub = user.sub_roles
            if isinstance(sub, (list, tuple, set)):
                return any(str(x).strip().lower() == want for x in sub)
        except Exception:
            pass

    # 1) Profil/JSON listesi (varsa)
    profile = getattr(user, "profile", None) or getattr(user, "userprofile", None)
    if profile and hasattr(profile, "sub_roles"):
        v = getattr(profile, "sub_roles")
        if isinstance(v, (list, tuple, set)):
            return any(str(x).strip().lower() == want for x in v)

    # 2) M2M rol ilişkisi (code/name kolonlarından biri olabilir)
    roles_rel = getattr(user, "sub_roles", None)
    if roles_rel and hasattr(roles_rel, "filter"):
        try:
            return (
                roles_rel.filter(name__iexact=code).exists()
                or roles_rel.filter(code__iexact=code).exists()
            )
        except Exception:
            pass

    # 3) CSV/düz text
    raw = getattr(user, "sub_roles", None)
    if isinstance(raw, str):
        return any(r.strip().lower() == want for r in raw.split(",") if r.strip())

    return False


def is_eskep_koordinator(user) -> bool:
    """Kullanıcı superuser/staff ya da Koordinator modelinde izinli alt rollere sahip mi?"""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        return True
    try:
        k = (
            api_models.Koordinator.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return k.roles.filter(name__in=ALLOWED_KOORD_SUBROLES).exists()
    except ObjectDoesNotExist:
        return False


class HafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        agent_id = self.kwargs.get("agent_id")
        return api_models.Hafiz.objects.filter(agent_id=agent_id).select_related("user", "hdm_egitmen").prefetch_related("dersler")

class AgentHafizListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):  
        agent_id = self.kwargs['agent_id']
        agent =  api_models.Agent.objects.get(id=agent_id) 
        queryset = api_models.Hafiz.objects.filter(agent=agent)      
           
        return queryset      

def get_teacher_for_user(user) -> Optional[api_models.Teacher]:
    """Kullanıcı Teacher ve izinli alt rollere sahip mi?"""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        t = (
            api_models.Teacher.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return t if t.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None


def user_is_teacher(user) -> bool:
    return get_teacher_for_user(user) is not None


def get_educator_for_user(user) -> Optional[api_models.Educator]:
    """Kullanıcı Educator ve izinli alt rollere sahip mi?"""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        e = (
            api_models.Educator.objects
            .select_related("user")
            .prefetch_related("roles")
            .get(user=user)
        )
        return e if e.roles.filter(name__in=ALLOWED_TEACHER_SUBROLES).exists() else None
    except ObjectDoesNotExist:
        return None


def user_is_educator(user) -> bool:
    return get_educator_for_user(user) is not None


def _user_matches_object_owner(user, obj) -> bool:
    """
    Kullanıcının Teacher/Educator PK'sı ile objenin muhtemel sahip FK'ları kesişiyor mu?
    Örn. instructor_id, teacher_id, educator_id, owner_id, created_by_id.
    """
    user_owner_ids = set()
    t = get_teacher_for_user(user)
    e = get_educator_for_user(user)
    if t:
        user_owner_ids.add(getattr(t, "id", None))
    if e:
        user_owner_ids.add(getattr(e, "id", None))
    user_owner_ids.discard(None)

    if not user_owner_ids:
        return False

    target_ids = set()
    for attr in ("instructor_id", "teacher_id", "educator_id", "owner_id", "created_by_id"):
        if hasattr(obj, attr):
            target_ids.add(getattr(obj, attr))
    target_ids.discard(None)

    return bool(user_owner_ids & target_ids)

# ============================================================================
# Permission Sınıfları
# ============================================================================
class IsEskepKoordinatorOrTeacher(BasePermission):
    """Koordinator (izinli alt roller) VEYA Teacher (izinli alt roller) ise izin ver."""
    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_eskep_koordinator(user) or user_is_teacher(user)


class CanModifyVideoLink(BasePermission):
    """
    SAFE_METHODS: True.
    Değişiklik: Koordinator -> her şey; Teacher/Educator -> sadece kendisine ait kayıtlar.
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and getattr(user, "is_authenticated", False)):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_eskep_koordinator(user) or user_is_teacher(user) or user_is_educator(user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if is_eskep_koordinator(user):
            return True
        return _user_matches_object_owner(user, obj)


class IsEskepStudentWithSubrole(BasePermission):
    """Ogrenci + ESKEPOgrenci sub rolü gerektirir."""
    required_subrole = ESKEP_STUDENT_SUBROLE_CODE

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and user_is_student(user)
            and user_has_subrole(user, self.required_subrole)
        )

class IsAgent(BasePermission):
    message = "Bu endpoint yalnızca Agent kullanıcılar içindir."
    def has_permission(self, request, view):
        u = getattr(request, "user", None)
        return bool(u and u.is_authenticated and Agent.objects.filter(user=u).exists())

class AgentListAPIView(generics.ListAPIView):   
    serializer_class = api_serializer.AgentSerializer   
    
    def get_queryset(self):        
        queryset = api_models.Agent.objects.all()
        print(queryset)      
        return queryset 

class HafizBilgiUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        agent_id = self.kwargs.get('agent_id')
        hafizbilgi_id = self.kwargs.get('hafizbilgi_id')

        # Agent doğrulaması (ID ile)
        agent = get_object_or_404(api_models.Agent, id=agent_id)

        # Hafiz bilgisi sadece bu agent'e bağlıysa get edilsin (isteğe bağlı bağlama kontrolü)
        return get_object_or_404(api_models.Hafiz, id=hafizbilgi_id)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()

        # Yaş sayısal değilse dönüştür
        if "yas" in data:
            try:
                data["yas"] = int(data["yas"])
            except ValueError:
                return Response({"yas": ["Geçersiz yaş."]}, status=400)

        # Agent ID düzeltme (gelen veri isimse hatalıdır)
        if "agent" in data:
            try:
                agent = api_models.Agent.objects.get(id=data["agent"])
                data["agent"] = agent.id
            except api_models.Agent.DoesNotExist:
                return Response({"agent": ["Temsilci bulunamadı."]}, status=400)

        # adresIl düzeltme
        if "adresIl" in data and not isinstance(data["adresIl"], int):
            try:
                city = api_models.City.objects.get(name=data["adresIl"])
                data["adresIl"] = city.id
            except api_models.City.DoesNotExist:
                return Response({"adresIl": ["İl bulunamadı."]}, status=400)

        hafiz_bilgi = self.get_object()
        serializer = self.get_serializer(hafiz_bilgi, data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)

class HafizBilgiCreateAPIView(generics.CreateAPIView):
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = []  # Girişsiz kullanım için boş

    def perform_create(self, serializer):
        # Hafızın bilgilerini al
        gender = serializer.validated_data.get("gender")
        adres_il = serializer.validated_data.get("adresIl")

        try:
            ankara_city = api_models.City.objects.get(name__iexact="Ankara")
        except api_models.City.DoesNotExist:
            raise ValidationError("Ankara şehri bulunamadı.")
    
        matching_agent = api_models.Agent.objects.filter(
            gender=gender,
            city=adres_il
        ).first()

        # 2) gender + Ankara
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(
                gender=gender,
                city=ankara_city.id
            ).first()

        # 3) opposite gender + city
        if not matching_agent:
            opposite_gender = "Kadın" if gender == "Erkek" else "Erkek"
            matching_agent = api_models.Agent.objects.filter(
                gender=opposite_gender,
                city=adres_il
            ).first()

        # 4) opposite gender + Ankara
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(
                gender=opposite_gender,
                city=ankara_city.id
            ).first()

        # 5) Hiçbiri yoksa hata
        if not matching_agent:
            raise ValidationError("Uygun Agent bulunamadı.")
        # Hafızı kaydet
        instance = serializer.save(agent=matching_agent)

        # İsteğe göre mesaj dönecek
        return Response(
            {"message": "Hafız bilgisi başarılı bir şekilde eklendi"},
            status=status.HTTP_201_CREATED
        )

def IsGeneralKoordinator(user) -> bool:
    """
    Kullanıcının sub_roles içinde ESKEPGenelKoordinator olup olmadığını döndürür.
    Not: user_has_subrole case-insensitive çalışır.
    """
    return bool(
        user and getattr(user, "is_authenticated", False)
        and user_has_subrole(user, ESKEP_GENERAL_KOORD_SUBROLE_CODE)
    )
# ============================================================================
# Dışa Aktarım
# ============================================================================
__all__ = [
    # constants
    "ALLOWED_KOORD_SUBROLES",
    "ALLOWED_TEACHER_SUBROLES",
    "ESKEP_STUDENT_SUBROLE_CODE",
    # helpers
    "user_is_student",
    "user_has_subrole",
    "is_eskep_koordinator",
    "get_teacher_for_user",
    "user_is_teacher",
    "get_educator_for_user",
    "user_is_educator",
    "_user_matches_object_owner",
    # permissions
    "IsEskepKoordinatorOrTeacher",
    "CanModifyVideoLink",
    "IsEskepStudentWithSubrole",
    "IsGeneralKoordinator",
]
