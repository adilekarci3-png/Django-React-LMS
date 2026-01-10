from rest_framework import serializers
from api import models as api_models
from .users import ProfileSerializer

class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_Answer_Message
        fields = '__all__'

class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True)
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_Answer
        fields = '__all__'

class Question_Answer_MessageOdevSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_Answer_MessageOdev
        fields = '__all__'

class Question_AnswerOdevSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageOdevSerializer(many=True)
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_AnswerOdev
        fields = '__all__'

# Kitap Tahlili
class Question_Answer_MessageKitapTahliliSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = api_models.Question_Answer_MessageKitapTahlili
        fields = ("id", "kitaptahlili", "question", "mesajiGonderen",
                  "mesajiAlan", "message", "date", "profile")

    def get_profile(self, obj):
        # Öncelik gönderen kullanıcıda, yoksa alıcı
        user = obj.mesajiGonderen or obj.mesajiAlan
        prof = getattr(user, "profile", None) if user else None
        return ProfileSerializer(prof, context=self.context).data if prof else None

class Question_AnswerKitapTahliliSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField(read_only=True)
    messages = Question_Answer_MessageKitapTahliliSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.Question_AnswerKitapTahlili
        fields = ('id','kitaptahlili','title','date','mesajiGonderen','mesajiAlan','profile','messages')

    def get_profile(self, obj):
        from userauths.models import Profile
        user = obj.mesajiGonderen or obj.mesajiAlan
        p = Profile.objects.filter(user=user).first()
        return ProfileSerializer(p).data if p else None

# Ders Sonu Raporu
class Question_Answer_MessageDersSonuRaporuSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_Answer_MessageDersSonuRaporu
        fields = '__all__'

class Question_AnswerDersSonuRaporuSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Question_AnswerDersSonuRaporu
        fields = '__all__'

    def get_messages(self, obj):
        return Question_Answer_MessageDersSonuRaporuSerializer(obj.messages(), many=True).data

    def get_profile(self, obj):
        return ProfileSerializer(obj.profile()).data

# Eskep Proje
class Question_Answer_MessageEskepProjeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_Answer_MessageEskepProje
        fields = '__all__'

class Question_AnswerEskepProjeSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageEskepProjeSerializer(many=True)
    profile = ProfileSerializer(many=False)
    class Meta:
        model = api_models.Question_AnswerEskepProje
        fields = '__all__'

# Odev QA message create (helper)
class OdevQAMessageCreateSerializer(serializers.ModelSerializer):
    odev_id = serializers.IntegerField(write_only=True, required=False)
    question_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = api_models.Question_Answer_MessageOdev
        fields = ("id", "odev_id", "question_id", "message", "created_at")
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        request = self.context["request"]
        view = self.context.get("view")

        odev_id = (getattr(view, "kwargs", {}) or {}).get("odev_id") or attrs.get("odev_id")
        if not odev_id:
            raise serializers.ValidationError({"odev_id": "Gerekli."})

        try:
            odev = api_models.Odev.objects.get(id=odev_id)
        except api_models.Odev.DoesNotExist:
            raise serializers.ValidationError({"odev_id": "Geçersiz ödev."})

        qid = attrs.get("question_id")
        if not qid:
            raise serializers.ValidationError({"question_id": "Gerekli."})

        try:
            question = api_models.Question_AnswerOdev.objects.get(id=qid, odev=odev)
        except api_models.Question_AnswerOdev.DoesNotExist:
            raise serializers.ValidationError({"question_id": "Soru bulunamadı ya da bu ödeve ait değil."})

        attrs["odev"] = odev
        attrs["question"] = question
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        odev = validated_data["odev"]
        question = validated_data["question"]
        mesajiGonderen = request.user
        mesajiAlan = question.mesajiAlan or getattr(odev, "inserteduser", None)

        return api_models.Question_Answer_MessageOdev.objects.create(
            odev=odev,
            question=question,
            mesajiAlan=mesajiAlan,
            mesajiGonderen=mesajiGonderen,
            message=validated_data["message"],
        )
