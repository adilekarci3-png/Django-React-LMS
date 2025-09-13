# api/views/agents_hafiz.py
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .. import models as api_models, serializers as api_serializer
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError


def _is_hbs_koordinator(user):
    # Projedeki role alanına göre uyarlayabilirsiniz
    return api_models.Koordinator.objects.filter(user=user, role__iexact="HBSKoordinator").exists()


def _get_user_agent_city(user):
    agent = api_models.Agent.objects.filter(user=user).first()
    return getattr(agent, "city", None)


@api_view(["GET"])
def IsAgent(request, user_id):
    if not str(user_id).isdigit():
        return Response({"error": "Geçersiz kullanıcı ID'si"}, status=status.HTTP_400_BAD_REQUEST)

    agent = api_models.Agent.objects.filter(user_id=user_id).first()
    return Response({"is_agent": bool(agent), "agent_id": agent.id if agent else None})


class AgentListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.AgentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Agent.objects.all()


class HafizBilgiCreateAPIView(generics.CreateAPIView):
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gender = serializer.validated_data.get("gender")
        adres_il = serializer.validated_data.get("adresIl")

        try:
            ankara_city = api_models.City.objects.get(name__iexact="Ankara")
        except api_models.City.DoesNotExist:
            raise ValidationError("Ankara şehri bulunamadı.")

        matching_agent = api_models.Agent.objects.filter(gender=gender, city=adres_il).first()
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(gender=gender, city=ankara_city.id).first()
        if not matching_agent:
            opposite_gender = "Kadın" if gender == "Erkek" else "Erkek"
            matching_agent = api_models.Agent.objects.filter(gender=opposite_gender, city=adres_il).first()
        if not matching_agent:
            matching_agent = api_models.Agent.objects.filter(gender=opposite_gender, city=ankara_city.id).first()
        if not matching_agent:
            raise ValidationError("Uygun Agent bulunamadı.")

        instance = serializer.save(agent=matching_agent)
        return Response({"message": "Hafız bilgisi başarılı bir şekilde eklendi"}, status=status.HTTP_201_CREATED)


class HafizBilgiUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Hafiz.objects.all()
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        agent_id = self.kwargs.get('agent_id')
        hafizbilgi_id = self.kwargs.get('hafizbilgi_id')
        get_object_or_404(api_models.Agent, id=agent_id)  # doğrulama
        return get_object_or_404(api_models.Hafiz, id=hafizbilgi_id)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()

        if "yas" in data:
            try:
                data["yas"] = int(data["yas"])
            except ValueError:
                return Response({"yas": ["Geçersiz yaş."]}, status=400)

        if "agent" in data:
            try:
                agent = api_models.Agent.objects.get(id=data["agent"])
                data["agent"] = agent.id
            except api_models.Agent.DoesNotExist:
                return Response({"agent": ["Temsilci bulunamadı."]}, status=400)

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
        agent = api_models.Agent.objects.get(id=agent_id)
        return api_models.Hafiz.objects.filter(agent=agent)


class HafizsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if _is_hbs_koordinator(user):
            return api_models.Hafiz.objects.select_related("adresIl").all()

        city = _get_user_agent_city(user)
        if city:
            return api_models.Hafiz.objects.select_related("adresIl").filter(adresIl=city)

        return api_models.Hafiz.objects.none()


class HafizsListByAgentAPIView(generics.ListAPIView):
    serializer_class = api_serializer.HafizBilgiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        agent_id = self.kwargs.get("agent") or self.kwargs.get("agent_id")
        agent = get_object_or_404(api_models.Agent, pk=agent_id)
        return api_models.Hafiz.objects.select_related("adresIl").filter(adresIl=agent.city)
