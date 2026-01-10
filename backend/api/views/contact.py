# api/views/contact.py
from typing import Optional

from django.db import models
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.core.mail import send_mail

from api.models.contact import ContactMessage, BlockedIP, ContactSubject
from api.serializers.contact import (
    ContactMessageSerializer,
    ContactSubjectSerializer,
)
from api.models.people import Agent

# from api.models.agent import Agent  # temsilci modelin adı buysa

# --- yardımcılar ----------------------------------------------------

def _get_user_agent_city(user):
    """
    Kullanıcı bir Agent/HBSTemsilci ise bağlı olduğu City (nesne) döner, yoksa None.
    """
    if not getattr(user, "is_authenticated", False):
        return None

    agent: Optional[Agent] = (
        Agent.objects.select_related("city")
        .filter(user=user)
        .first()
    )
    return agent.city if agent else None


def _user_has_role(user, base_role: str = "", sub_role: str = "") -> bool:
    """
    Biz frontend’de user-role-detail/ ile roles dönüyoruz.
    Burada da request.user üzerinde aynı bilgiyi tutuyorsan buna göre güncelle.
    En basit haliyle:
      - user.is_staff / user.is_superuser → True
    """
    if not user.is_authenticated:
      return False

    if user.is_superuser or user.is_staff:
      return True

    # Eğer user objesinde roles alanın varsa buraya göre kontrol et
    user_base_roles = getattr(user, "base_roles", []) or []
    user_sub_roles  = getattr(user, "sub_roles", []) or []

    if base_role and base_role in user_base_roles:
        if sub_role:
            return sub_role in user_sub_roles
        return True

    if sub_role and (sub_role in user_sub_roles):
        return True

    return False


# --- API’ler --------------------------------------------------------


class ContactMessageCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save(
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
            return Response({"detail": "Mesajınız alındı."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip


class ContactMessageListAPIView(generics.ListAPIView):
    """
    GET /api/v1/contact/messages/?q=...&subject_slug=...
    Görme kuralları:
      - admin/staff → hepsi
      - subject_slug=eskep → sadece ESKEPGenelKoordinator
      - subject_slug=hbs   → HBSKoordinator VEYA o ilin Agent’i
      - subject_slug=hdm   → HDMKoordinator
      - subject_slug=akademi → AkademiKoordinator
    """
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = (
            ContactMessage.objects
            .select_related("subject")
            .order_by("-created_at")
        )

        # 1) admin/her şeyi görür
        if user.is_staff or user.is_superuser:
            return self._apply_search(qs)

        # 2) hangi konu isteniyor?
        subject_slug = self.request.query_params.get("subject_slug")

        # eğer hiçbir şey gelmediyse zaten kimseye göstermeyelim
        if not subject_slug:
            return ContactMessage.objects.none()

        subject_slug = subject_slug.lower()

        # --- ESKEP ---
        if subject_slug == "eskep":
            if _user_has_role(user, "Koordinator", "ESKEPGenelKoordinator"):
                return self._apply_search(qs.filter(subject__slug__iexact="eskep"))
            return ContactMessage.objects.none()

        # --- HBS ---
        if subject_slug == "hbs":
            # 1) Koordinator ise görsün
            if _user_has_role(user, "Koordinator", "HBSKoordinator"):
                return self._apply_search(qs.filter(subject__slug__iexact="hbs"))

            # 2) Temsilci / Agent ise sadece kendi ilini görsün
            agent_city = _get_user_agent_city(user)
            if agent_city:
                return self._apply_search(
                    qs.filter(subject__slug__iexact="hbs", city=agent_city)
                )

            return ContactMessage.objects.none()

        # --- HDM ---
        if subject_slug == "hdm":
            if _user_has_role(user, "Koordinator", "HDMKoordinator"):
                return self._apply_search(qs.filter(subject__slug__iexact="hdm"))
            return ContactMessage.objects.none()

        # --- AKADEMİ ---
        if subject_slug == "akademi":
            if _user_has_role(user, "Koordinator", "AkademiKoordinator"):
                return self._apply_search(qs.filter(subject__slug__iexact="akademi"))
            return ContactMessage.objects.none()

        # bilinmeyen slug → gösterme
        return ContactMessage.objects.none()

    # senin eklediğin arama helper’ı aynen kullanıyoruz
    def _apply_search(self, qs):
        req = self.request
        q = req.query_params.get("q")
        subject_slug = req.query_params.get("subject_slug")

        if q:
            qs = qs.filter(
                models.Q(name__icontains=q)
                | models.Q(email__icontains=q)
                | models.Q(message__icontains=q)
            )

        if subject_slug:
            qs = qs.filter(subject__slug__iexact=subject_slug)

        return qs


class BlockIPAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # admin yapabilirsin

    def post(self, request, pk):
        try:
            msg = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"detail": "Mesaj bulunamadı"}, status=404)

        if not msg.ip_address:
            return Response({"detail": "Bu mesaja IP kaydedilmemiş."}, status=400)

        obj, created = BlockedIP.objects.get_or_create(
            ip_address=msg.ip_address,
            defaults={"reason": "contact formundan bloklandı"},
        )
        return Response(
            {"detail": "IP bloklandı.", "blocked": True, "ip": obj.ip_address},
            status=status.HTTP_200_OK,
        )


class ReplyContactMessageAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            msg = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"detail": "Mesaj bulunamadı"}, status=404)

        mail_subject = request.data.get("subject") or f"EHAD İletişim Yanıtı: {msg.subject}"
        mail_body = request.data.get("body") or ""

        if not mail_body.strip():
            return Response({"detail": "Mail içeriği boş olamaz."}, status=400)

        send_mail(
            mail_subject,
            mail_body,
            getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
            [msg.email],
            fail_silently=False,
        )

        msg.replied = True
        msg.is_read = True
        msg.save(update_fields=["replied", "is_read"])

        return Response({"detail": "Mail gönderildi."}, status=200)


class ContactSubjectListAPIView(generics.ListAPIView):
    queryset = ContactSubject.objects.filter(is_active=True).order_by("name")
    serializer_class = ContactSubjectSerializer
    permission_classes = [permissions.AllowAny]
