from rest_framework import serializers
from api.models.contact import BlockedIP, ContactMessage, ContactSubject

class ContactSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubject
        fields = ["id", "name", "slug", "is_active"]


class ContactMessageSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",       # FK id
            "subject_name",  # sadece okumak için
            "message",
            "ip_address",
            "user_agent",
            "created_at",
            "is_read",
            "replied",
        ]
        read_only_fields = ["ip_address", "user_agent", "created_at", "is_read", "replied"]
        
class BlockedIPSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedIP
        fields = "__all__"
