from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.views.permissions import IsEskepStudentWithSubrole
from api.models import Odev, KitapTahlili, DersSonuRaporu
from api.serializers.my_works_serializers import (
    OdevMiniSerializer,
    KitapTahliliMiniSerializer,
    DersSonuRaporuMiniSerializer,
)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsEskepStudentWithSubrole])
def student_my_works(request):
    user = request.user

    # inserteduser = giriş yapan kullanıcı
    odev_qs = Odev.objects.filter(inserteduser=user).order_by("-date")
    kt_qs   = KitapTahlili.objects.filter(inserteduser=user).order_by("-date")
    dsr_qs  = DersSonuRaporu.objects.filter(inserteduser=user).order_by("-date")

    data = {
        "odevler": OdevMiniSerializer(odev_qs, many=True, context={"request": request}).data,
        "kitap_tahlilleri": KitapTahliliMiniSerializer(kt_qs, many=True, context={"request": request}).data,
        "ders_sonu_raporlari": DersSonuRaporuMiniSerializer(dsr_qs, many=True, context={"request": request}).data,
    }
    return Response(data, status=status.HTTP_200_OK)
