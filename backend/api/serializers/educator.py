from rest_framework import serializers
from api import models as api_models

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Branch
        fields = '__all__'

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.EducationLevel
        fields = '__all__'
      
class EducatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Educator
        fields = '__all__'

class EducatorVideoLinkSerializer(serializers.ModelSerializer):
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=api_models.Teacher.objects.all(),
        source="instructor",
        write_only=True,
        required=False,
    )
    video_url = serializers.CharField(write_only=True, required=False, allow_blank=True, source="videoUrl")
    url = serializers.CharField(write_only=True, required=False, allow_blank=True, source="videoUrl")
    url_read = serializers.URLField(source="videoUrl", read_only=True)
    owner_name = serializers.CharField(source="instructor.user.get_full_name", read_only=True, default="")

    class Meta:
        model = api_models.EducatorVideoLink
        fields = [
            "id","title","description","videoUrl","video_url","url","url_read",
            "instructor_id","instructor","owner_name","created_at",
        ]
        read_only_fields = ["id", "instructor", "owner_name", "created_at"]

    def validate(self, attrs):
        method = getattr(getattr(self.context, "request", None), "method", "").upper()
        is_create = self.instance is None or method == "POST"
        url = (attrs.get("videoUrl") or "").strip()
        if is_create and not url:
            raise serializers.ValidationError({"videoUrl": "Video bağlantısı zorunludur."})
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["url"] = data.pop("url_read", None)
        return data

class SavedVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.SavedVideo
        fields = ["id", "video", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)

class EducatorVideoSerializer(serializers.ModelSerializer):
    instructor_id = serializers.IntegerField(write_only=True, required=False)
    video_file = serializers.FileField(write_only=True, required=False, allow_null=True, source="file")
    videoFile   = serializers.FileField(write_only=True, required=False, allow_null=True, source="file")

    class Meta:
        model = api_models.EducatorVideo
        fields = ["id","title","description","file","video_file","videoFile",
                  "instructor","instructor_id","created_at","updated_at"]
        read_only_fields = ["id", "instructor", "created_at", "updated_at"]

    def validate(self, attrs):
        if not attrs.get("file"):
            raise serializers.ValidationError({"file": "Video dosyası zorunludur."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("instructor_id", None)
        return super().create(validated_data)

class EducatorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = api_models.EducatorDocument
        fields = "__all__"
        read_only_fields = ("id","original_filename","file_size","mime_type","created_at","updated_at")
