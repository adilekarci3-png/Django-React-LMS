# api/views/webrtc.py
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .. import models as api_models

User = get_user_model()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def peer_id_view(request):
    if request.method == 'POST':
        peer_id = request.data.get("peer_id")
        if not peer_id:
            return Response({"error": "peer_id is required"}, status=400)
        obj, _ = api_models.PeerID.objects.update_or_create(user=request.user, defaults={"peer_id": peer_id})
        return Response({"peer_id": obj.peer_id})

    user_id = request.query_params.get("user_id")
    try:
        peer_obj = api_models.PeerID.objects.get(user_id=user_id)
        return Response({"peer_id": peer_obj.peer_id})
    except api_models.PeerID.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
