# api/views/checks.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .. import models as api_models


@api_view(["POST"])
def check_ceptel(request):
    ceptel = request.data.get("ceptel")
    exists = api_models.Hafiz.objects.filter(ceptel=ceptel).exists()
    return Response({"exists": exists})


@api_view(["POST"])
def check_email(request):
    email = request.data.get("email")
    exists = api_models.Hafiz.objects.filter(email=email).exists()
    return Response({"exists": exists})
