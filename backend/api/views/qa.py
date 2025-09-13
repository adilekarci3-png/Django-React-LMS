# api/views/qa.py
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model

from api import models as api_models
from api import serializers as api_serializer

User = get_user_model()


# ---------- Course QA ----------
class QuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(api_models.Course, id=course_id)
        return api_models.Question_Answer.objects.filter(course=course)
    
    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']
        user = get_object_or_404(User, id=user_id)
        course = get_object_or_404(api_models.Course, id=course_id)
        question = api_models.Question_Answer.objects.create(course=course, user=user, title=title)
        api_models.Question_Answer_Message.objects.create(course=course, user=user, message=message, question=question)
        return Response({"message": "Group conversation Started"}, status=status.HTTP_201_CREATED)


class CourseQuestionAnswerMessageCreateAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = request.data
        course_id = data.get("course_id")
        qa_id = data.get("qa_id")
        message = (data.get("message") or "").strip()
        title = (data.get("title") or "").strip()
        if not course_id:
            return Response({"error": "course_id zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        if not message:
            return Response({"error": "message zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        course = get_object_or_404(api_models.Course, pk=course_id)
        if qa_id:
            question = get_object_or_404(api_models.Question_Answer, pk=qa_id)
            if getattr(question, "course_id", None) != course.id:
                return Response({"error": "qa_id verilen course ile eşleşmiyor"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            question = api_models.Question_Answer.objects.create(course=course, user=request.user, title=title or None)
        api_models.Question_Answer_Message.objects.create(course=course, question=question, user=request.user, message=message)
        serialized_question = api_serializer.Question_AnswerSerializer(question, context={"request": request})
        return Response({"message": "Mesaj gönderildi", "question": serialized_question.data}, status=status.HTTP_201_CREATED)


# ---------- Odev QA ----------
class OdevQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerOdevSerializer
    permission_classes = [IsAuthenticated]

    def _get_odev(self, request, **kwargs):
        odev_id = kwargs.get("odev_id") or request.query_params.get("odev_id") or request.data.get("odev_id")
        if not odev_id:
            raise NotFound("odev_id gerekiyor.")
        return get_object_or_404(api_models.Odev, id=odev_id)

    def get_queryset(self):
        odev = self._get_odev(self.request, **self.kwargs)
        return api_models.Question_AnswerOdev.objects.filter(odev=odev).order_by("-id")

    def create(self, request, *args, **kwargs):
        odev = self._get_odev(request, **kwargs)
        user = request.user if request.user.is_authenticated else None
        if not user:
            user_id = request.data.get("user_id") or request.data.get("gonderen_id")
            user = get_object_or_404(User, id=user_id)
        title = request.data.get("title")
        message = request.data.get("message")
        mesajiAlan = odev.inserteduser
        question = api_models.Question_AnswerOdev.objects.create(odev=odev, mesajiAlan=mesajiAlan, mesajiGonderen=user, title=title)
        api_models.Question_Answer_MessageOdev.objects.create(odev=odev, mesajiAlan=mesajiAlan, mesajiGonderen=user, message=message, question=question)
        data = self.get_serializer(question).data
        return Response({"message": "Grup Konuşması Başlatıldı", "question_id": question.id, "question": data}, status=status.HTTP_201_CREATED)


class OdevQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = api_serializer.OdevQAMessageCreateSerializer
    
    def _get_odev(self, request, **kwargs):
        odev_id = kwargs.get("odev_id") or request.data.get("odev_id")
        if not odev_id:
            raise NotFound("odev_id gerekiyor.")
        return get_object_or_404(api_models.Odev, id=odev_id)

    def create(self, request, *args, **kwargs):
        odev = self._get_odev(request, **kwargs)
        question_id = request.data.get("question_id")
        message = request.data.get("message")
        question = get_object_or_404(api_models.Question_AnswerOdev, id=question_id, odev=odev)
        mesajiGonderen = request.user
        mesajiAlan = question.mesajiAlan or odev.inserteduser
        api_models.Question_Answer_MessageOdev.objects.create(odev=odev, mesajiAlan=mesajiAlan, mesajiGonderen=mesajiGonderen, message=message, question=question)
        return Response({"ok": True, "question_id": question.id}, status=status.HTTP_201_CREATED)


class OdevQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageOdevSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        odev_id = request.data.get('odev_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')
        odev = get_object_or_404(api_models.Odev, id=odev_id)
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
        mesajiAlan = odev.inserteduser
        question = api_models.Question_AnswerOdev.objects.filter(odev=odev, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan).first()
        if not question:
            question = api_models.Question_AnswerOdev.objects.create(odev=odev, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, title=title)
        api_models.Question_Answer_MessageOdev.objects.create(odev=odev, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, message=message, question=question)
        question_serializer = api_serializer.Question_AnswerOdevSerializer(question)
        return Response({"message": "Mesaj Gönderildi", "question": question_serializer.data}, status=status.HTTP_201_CREATED)


# (geriye dönük kullanım – odev QA mesajı)
from rest_framework.views import APIView
class QuestionAnswerMessageCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        odev_id = request.data.get("odev_id")
        user_id = request.data.get("user_id")
        qa_id = request.data.get("qa_id")
        message = request.data.get("message")
        try:
            odev = get_object_or_404(api_models.Odev, id=odev_id)
            question = get_object_or_404(api_models.Question_AnswerOdev, qa_id=qa_id)
            mesaj_gonderen = get_object_or_404(User, id=user_id)
            mesaj_alan = question.mesajiAlan
            api_models.Question_Answer_MessageOdev.objects.create(
                odev=odev, question=question,
                mesajiGonderen=mesaj_gonderen, mesajiAlan=mesaj_alan, message=message
            )
            return Response({"message": "Mesaj gönderildi", "question": api_serializer.Question_AnswerOdevSerializer(question).data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------- Kitap Tahlili QA ----------
class KitapTahliliQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerKitapTahliliSerializer
    permission_classes = [IsAuthenticated]
    queryset = api_models.Question_AnswerKitapTahlili.objects.all()

    def get_queryset(self):
        kt_id = self.kwargs.get("kitaptahlili_id") or self.request.query_params.get("kitaptahlili_id")
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)
        return self.queryset.filter(kitaptahlili=kt).order_by("-id")

    def create(self, request, *args, **kwargs):
        kt_id = kwargs.get("kitaptahlili_id") or request.data.get("kitaptahlili_id")
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)
        user = request.user if request.user.is_authenticated else get_object_or_404(User, id=(request.data.get("user_id") or request.data.get("gonderen_id")))
        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        if not title or not message:
            return Response({"detail": "title ve message zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        receiver = kt.inserteduser
        question = api_models.Question_AnswerKitapTahlili.objects.create(kitaptahlili=kt, mesajiAlan=receiver, mesajiGonderen=user, title=title)
        api_models.Question_Answer_MessageKitapTahlili.objects.create(kitaptahlili=kt, mesajiAlan=receiver, mesajiGonderen=user, message=message, question=question)
        return Response({"message": "Grup Konuşması Başlatıldı", "question_id": question.id}, status=status.HTTP_201_CREATED)


class KitapTahliliQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = api_serializer.Question_Answer_MessageKitapTahliliSerializer
    queryset           = api_models.Question_Answer_MessageKitapTahlili.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return api_models.Question_Answer_MessageKitapTahlili.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        kt_id = kwargs.get("kitaptahlili_id") or data.get("kitaptahlili_id")
        if not kt_id:
            return Response({"detail": "kitaptahlili_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)
        kt = get_object_or_404(api_models.KitapTahlili, id=kt_id)
        qid = data.get("question_id")
        msg_text = (data.get("message") or "").strip()
        if not msg_text:
            return Response({"detail": "message boş olamaz"}, status=status.HTTP_400_BAD_REQUEST)
        question = get_object_or_404(api_models.Question_AnswerKitapTahlili, id=qid, kitaptahlili=kt)
        sender = request.user if request.user.is_authenticated else get_object_or_404(User, id=(data.get("user_id") or data.get("gonderen_id")))
        receiver = getattr(question, "mesajiAlan", None) or getattr(kt, "inserteduser", None)
        msg = api_models.Question_Answer_MessageKitapTahlili.objects.create(kitaptahlili=kt, question=question, mesajiGonderen=sender, mesajiAlan=receiver, message=msg_text)
        return Response({"ok": True, "question_id": question.id, "message_id": msg.id}, status=status.HTTP_201_CREATED)


class KitapTahliliQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageKitapTahliliSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        kitaptahlili_id = request.data.get('kitaptahlili_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')
        kt = get_object_or_404(api_models.KitapTahlili, id=kitaptahlili_id)
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
        mesajiAlan = kt.inserteduser
        question = api_models.Question_AnswerKitapTahlili.objects.filter(kitaptahlili=kt, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan).first()
        if not question:
            question = api_models.Question_AnswerKitapTahlili.objects.create(kitaptahlili=kt, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, title=title)
        api_models.Question_Answer_MessageKitapTahlili.objects.create(kitaptahlili=kt, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, message=message, question=question)
        question_serializer = api_serializer.Question_AnswerKitapTahliliSerializer(question)
        return Response({"message": "Mesaj Gönderildi", "question": question_serializer.data}, status=status.HTTP_201_CREATED)


# ---------- DSR (Ders Sonu Raporu) QA ----------
class DersSonuRaporuQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerDersSonuRaporuSerializer
    permission_classes = [IsAuthenticated]

    def _get_dsr_id(self, request, **kwargs):
        return (
            kwargs.get("derssonuraporu_id")
            or kwargs.get("dersSonuRaporu_id")
            or request.data.get("derssonuraporu_id")
            or request.data.get("dersSonuRaporu_id")
        )

    def _get_sender(self, request):
        if getattr(request, "user", None) and request.user.is_authenticated:
            return request.user
        uid = request.data.get("user_id") or request.data.get("gonderen_id")
        return get_object_or_404(User, id=uid)

    def get_queryset(self):
        dsr_id = self._get_dsr_id(self.request, **self.kwargs)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)
        return api_models.Question_AnswerDersSonuRaporu.objects.filter(derssonuraporu=dsr).order_by("-id")

    def create(self, request, *args, **kwargs):
        dsr_id = self._get_dsr_id(request, **kwargs)
        if not dsr_id:
            return Response({"detail": "derssonuraporu_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)
        title = (request.data.get("title") or "").strip()
        message = (request.data.get("message") or "").strip()
        if not title or not message:
            return Response({"detail": "title ve message zorunludur"}, status=status.HTTP_400_BAD_REQUEST)
        sender = self._get_sender(request)
        receiver = getattr(dsr, "inserteduser", None)
        question = api_models.Question_AnswerDersSonuRaporu.objects.create(derssonuraporu=dsr, mesajiAlan=receiver, mesajiGonderen=sender, title=title)
        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(derssonuraporu=dsr, mesajiAlan=receiver, mesajiGonderen=sender, message=message, question=question)
        return Response({"message": "Grup Konuşması Başlatıldı", "question_id": question.id}, status=status.HTTP_201_CREATED)


class DersSonuRaporuQuestionAnswerMessageCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = api_serializer.Question_Answer_MessageDersSonuRaporuSerializer
    queryset           = api_models.Question_Answer_MessageDersSonuRaporu.objects.all()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return api_models.Question_Answer_MessageDersSonuRaporu.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        dsr_id = kwargs.get("derssonuraporu_id") or data.get("derssonuraporu_id")
        if not dsr_id:
            return Response({"detail": "derssonuraporu_id gerekli"}, status=status.HTTP_400_BAD_REQUEST)
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dsr_id)
        qid = data.get("question_id")
        question = get_object_or_404(api_models.Question_AnswerDersSonuRaporu, id=qid, derssonuraporu=dsr)
        msg_text = (data.get("message") or "").strip()
        if not msg_text:
            return Response({"detail": "message boş olamaz"}, status=status.HTTP_400_BAD_REQUEST)
        sender = request.user
        receiver = getattr(question, "mesajiAlan", None) or getattr(dsr, "inserteduser", None)
        msg = api_models.Question_Answer_MessageDersSonuRaporu.objects.create(derssonuraporu=dsr, question=question, mesajiGonderen=sender, mesajiAlan=receiver, message=msg_text)
        return Response({"ok": True, "question_id": question.id, "message_id": msg.id}, status=status.HTTP_201_CREATED)


class DersSonuRaporuQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageDersSonuRaporuSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        dersSonuRaporu_id = request.data.get('dersSonuRaporu_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')
        dsr = get_object_or_404(api_models.DersSonuRaporu, id=dersSonuRaporu_id)
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
        mesajiAlan = dsr.inserteduser
        question = api_models.Question_AnswerDersSonuRaporu.objects.filter(derssonuraporu=dsr, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan).first()
        if not question:
            question = api_models.Question_AnswerDersSonuRaporu.objects.create(derssonuraporu=dsr, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, title=title)
        api_models.Question_Answer_MessageDersSonuRaporu.objects.create(derssonuraporu=dsr, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, message=message, question=question)
        qs = api_serializer.Question_AnswerDersSonuRaporuSerializer(question)
        return Response({"message": "Mesaj Gönderildi", "question": qs.data}, status=status.HTTP_201_CREATED)


# ---------- Proje (EskepProje) QA ----------
class ProjeQuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerEskepProjeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        proje_id = self.kwargs['proje_id']
        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
        return api_models.Question_AnswerEskepProje.objects.filter(proje=proje)
    
    def create(self, request, *args, **kwargs):
        proje_id = request.data.get('proje_id')
        gonderen_id = request.data.get('gonderen_id')
        title = request.data.get('title')
        message = request.data.get('message')
        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
        mesajiGonderen = get_object_or_404(User, id=gonderen_id)
        mesajiAlan = proje.inserteduser
        question = api_models.Question_AnswerEskepProje.objects.create(proje=proje, mesajiAlan=mesajiAlan, mesajiGonderen=mesajiGonderen, title=title)
        api_models.Question_Answer_MessageEskepProje.objects.create(proje=proje, mesajiAlan=mesajiAlan, mesajiGonderen=mesajiGonderen, message=message, question=question)
        return Response({"message": "Grup Konuşması Başlatıldı"}, status=status.HTTP_201_CREATED)


class ProjeQuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageEskepProjeSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        proje_id = request.data.get('proje_id')
        gonderen_id = request.data.get('gonderen_id')
        message = request.data.get('message')
        title = request.data.get('title')
        proje = get_object_or_404(api_models.EskepProje, id=proje_id)
        mesajiGonderen_koord = get_object_or_404(api_models.Koordinator, id=gonderen_id)
        mesajiGonderen = mesajiGonderen_koord.user
        mesajiAlan = proje.inserteduser
        question = api_models.Question_AnswerEskepProje.objects.filter(proje=proje, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan).first()
        if not question:
            question = api_models.Question_AnswerEskepProje.objects.create(proje=proje, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, title=title)
        api_models.Question_Answer_MessageEskepProje.objects.create(proje=proje, mesajiGonderen=mesajiGonderen, mesajiAlan=mesajiAlan, message=message, question=question)
        qs = api_serializer.Question_AnswerEskepProjeSerializer(question)
        return Response({"message": "Mesaj Gönderildi", "question": qs.data}, status=status.HTTP_201_CREATED)
