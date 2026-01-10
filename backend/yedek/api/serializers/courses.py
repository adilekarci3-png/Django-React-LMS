from rest_framework import serializers
from api import models as api_models
from .variants import VariantSerializer, VariantItemSerializer
from .notes_reviews import NoteSerializer, ReviewSerializer
from .qa import Question_AnswerSerializer
from .commerce import CompletedLessonSerializer

class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lesson = serializers.SerializerMethodField()
    curriculum = VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        model = api_models.EnrolledCourse
        fields = '__all__'

    def get_completed_lesson(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        completed = api_models.CompletedLesson.objects.filter(course=obj.course, user=request.user)
        return CompletedLessonSerializer(completed, many=True).data

class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, read_only=True)
    curriculum = VariantSerializer(many=True, read_only=True)
    lectures = VariantItemSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = api_models.Course
        fields = [
            "id","category","teacher","file","image","title","description","language","level",
            "platform_status","teacher_course_status","featured","course_id","slug","date",
            "students","curriculum","lectures","average_rating","rating_count","reviews","price"
        ]
        depth = 3

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        self.Meta.depth = 0 if (request and request.method == "POST") else 3

class CourseDetailSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, read_only=True)
    variants = VariantSerializer(many=True)
    reviews = ReviewSerializer(many=True)

    class Meta:
        model = api_models.Course
        fields = [
            'id','course_id','title','description','image','level',
            'language','price','date','teacher_name','students','variants','reviews'
        ]

class CourseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Course
        fields = ["id", "title", "slug", "image"]
