from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views as api_views
from .views import (
    CourseQuestionAnswerMessageCreateAPIView, DersAtamasiAPIView, DersAtamasiDetailAPIView, EducatorVideoCreateAPIView, EducatorVideoDeleteAPIView, EducatorVideoLinkCreateAPIView, EducatorVideoLinkDeleteAPIView, EducatorVideoLinkListAPIView, EducatorVideoLinkUpdateAPIView, EducatorVideoListAPIView, EducatorVideoUpdateAPIView, EskepStajerOdevDetailAPIView, HBSKoordinatorDashboardViewSet, HafizAPIView, HafizAgentListAPIView, HafizDetailAPIView, HafizsListAPIView, HataNotuViewSet, InstructorViewSet, KoordinatorByRoleAPIView,peer_id_view
)

# ViewSet'ler için router
router = DefaultRouter()
router.register(r"egitmenler", api_views.TeacherViewSet,basename="egitmen")
router.register(r"instructors", InstructorViewSet, basename="instructors")
router.register(r"students", api_views.StudentViewSet, basename="student") 
# router.register(r"hafizlar", HafizViewSet, basename="hafiz")
router.register(r"hatalar", HataNotuViewSet, basename="hatalar")
router.register(r"dersler", api_views.DersViewSet)
router.register(r"cizimler", api_views.AnnotationViewSet)
router.register(r'stajer', api_views.StajerViewSet, basename='stajer')
router.register(r'ogrenci', api_views.OgrenciViewSet, basename='ogrenci')
router.register(r'annotation', api_views.AnnotationViewSet, basename='annotation')
router.register(r'quran-page', api_views.QuranPageViewSet, basename='quran-page')
router.register(r'live-lessons', api_views.LiveLessonViewSet)

dashboard = HBSKoordinatorDashboardViewSet.as_view({
    'get': 'summary'
})

assignments_chart = HBSKoordinatorDashboardViewSet.as_view({
    'get': 'assignments_chart'
})

recent_assignments = HBSKoordinatorDashboardViewSet.as_view({
    'get': 'recent_assignments'
})

urlpatterns = [
    # Router ViewSet yolları
    path("", include(router.urls)),

    path('peer-id/', peer_id_view, name='peer_id'),

    #Roller ve Yetkiler
    path("egitmen/list/", api_views.EgitmenListAPIView.as_view(), name="job-list"),
    path("user-role-detail/", api_views.get_user_role_detail, name="role-detail"),
    
    # Özel HDM endpoint
    path("dersler/<int:hafiz_id>/<str:date>/", api_views.dersler_by_date, name="hafiz-dersler-by-date"),

    # HBS Hafız Bilgi
    path("hafizbilgi/create/", api_views.HafizBilgiCreateAPIView.as_view(), name="hafizbilgi-create"),   
    path("hafizbilgi/list/", api_views.HafizsListAPIView.as_view(), name="hafizbilgi-list"),   
    path("hafizbilgi/list/<int:agent>", api_views.HafizsListByAgentAPIView.as_view(), name="hafizbilgiByAgent-list"),   
    path("hafizbilgi/check-ceptel/", api_views.check_ceptel, name="check-ceptel"),
    path("hafizbilgi/check-email/", api_views.check_email, name="check-email"),

    # HBS Koordinator
    path("istatistik/temsilci-top5/", api_views.Top5TemsilciByHafizAPIView.as_view()),

    #HBS Dashboard
    path("dashboard/summary/", dashboard),
    path("dashboard/assignments_chart/", assignments_chart),
    path("dashboard/recent_assignments/", recent_assignments),
    
    # Konum ve Proje
    path("job/list/", api_views.JobListAPIView.as_view(), name="job-list"),
    path("city/list/", api_views.CityListAPIView.as_view(), name="city-list"),
    path("country/list/", api_views.CountryListAPIView.as_view(), name="country-list"),
    path("district/list/", api_views.DistrictListAPIView.as_view(), name="district-list"),
    path("proje/list/", api_views.ProjeListAPIView.as_view(), name="proje-list"),
    path("agent/list/", api_views.AgentListAPIView.as_view(), name="agent-list"),   
    path("branch/list/", api_views.BranchListAPIView.as_view(), name="branch-list"),
    path("education-level/list/", api_views.EducationLevelListAPIView.as_view(), name="education-level-list"),
    # Organizasyon Şeması
    path("admin/organizationchart/", api_views.OrganizationMemberViewSetAPIVIew.as_view(), name="organization-chart"),

    # Kullanıcı & Auth
    path("user/token/", api_views.MyTokenObtainPairView.as_view(), name="token-obtain"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("user/register/", api_views.RegisterView.as_view(), name="user-register"),
    path("user/password-reset/<email>/", api_views.PasswordResetEmailVerifyAPIView.as_view(), name="password-reset"),
    path("user/password-change/", api_views.PasswordChangeAPIView.as_view(), name="password-change"),
    path("user/change-password/", api_views.ChangePasswordAPIView.as_view(), name="change-password"),
    path("user/profile/<user_id>/", api_views.ProfileAPIView.as_view(), name="profile"),
    path("user/role/", api_views.user_role_view, name="user-role"),
    path("user/role/<int:user_id>/", api_views.user_role_by_id_view, name="user-role-by-id"),   
   
    # Course
    path("course/category/", api_views.CategoryListAPIView.as_view()),
    path("course/course-list/", api_views.CourseListAPIView.as_view()),
    path("course/search/", api_views.SearchCourseAPIView.as_view()),  
    path("course/cart/", api_views.CartAPIView.as_view()),
    path("course/cart-list/<cart_id>/", api_views.CartListAPIView.as_view()),
    path("cart/stats/<cart_id>/", api_views.CartStatsAPIView.as_view()),
    path("course/cart-item-delete/<cart_id>/<item_id>/", api_views.CartItemDeleteAPIView.as_view()),
    path("course/course-delete/<int:pk>/", api_views.CourseDeleteView.as_view()),
    path("course/course-detay/<int:pk>/", api_views.CourseDetailAPIView.as_view()),
    
    # Order & Payment
    path("order/create-order/", api_views.CreateOrderAPIView.as_view()),
    path("order/checkout/<oid>/", api_views.CheckoutAPIView.as_view()),
    path("order/coupon/", api_views.CouponApplyAPIView.as_view()),
    path("payment/stripe-checkout/<order_oid>/", api_views.StripeCheckoutAPIView.as_view()),
    path("payment/payment-sucess/", api_views.PaymentSuccessAPIView.as_view()),

    # Student
    path("student/summary/<user_id>/", api_views.StudentSummaryAPIView.as_view()),
    path("student/course-list/<user_id>/", api_views.StudentCourseListAPIView.as_view()),
    path("student/course-detail/<user_id>/<enrollment_id>/", api_views.StudentCourseDetailAPIView.as_view()),
    path("student/course-completed/", api_views.StudentCourseCompletedCreateAPIView.as_view()),
    path("student/course-note/<user_id>/<enrollment_id>/", api_views.StudentNoteCreateAPIView.as_view()),
    path("student/course-note-detail/<user_id>/<enrollment_id>/<note_id>/", api_views.StudentNoteDetailAPIView.as_view()),
    path("student/rate-course/", api_views.StudentRateCourseCreateAPIView.as_view()),
    path("student/review-detail/<user_id>/<review_id>/", api_views.StudentRateCourseUpdateAPIView.as_view()),
    path("student/wishlist/<user_id>/", api_views.StudentWishListListCreateAPIView.as_view()),
    path("student/question-answer-list-create/<course_id>/", api_views.QuestionAnswerListCreateAPIView.as_view()),
    path(
        "student/course-qa/messages/",
        CourseQuestionAnswerMessageCreateAPIView.as_view(),
        name="course-qa-messages-create",
    ),
    # İSTERSEN aynısını kısayol olarak da aç:
    path(
        "student/course-qa/",
        CourseQuestionAnswerMessageCreateAPIView.as_view(),
        name="course-qa-create-alias",
    ),

    # HBS Temsilci
    path("agent/summary/<agent_id>/", api_views.AgentSummaryAPIView.as_view()),
    path("agent/course-list/<user_id>/", api_views.StudentCourseListAPIView.as_view()),
    path("agent/hafiz-list/<int:agent_id>/", HafizAgentListAPIView.as_view(), name="agent-hafiz-list"),
    path("agent/<user_id>/", api_views.IsAgent),
    path("agent/hafizbilgi-update/<agent_id>/<hafizbilgi_id>/", api_views.HafizBilgiUpdateAPIView.as_view()),
    path("agent/hafizbilgi-create/", api_views.HafizBilgiCreateAPIView.as_view()),
    path("agent/dashboard/summary/", api_views.HBSTemsilciDashboardView.as_view(), name="hbstem_dashboard_summary"),

    # Teacher
    path("teacher/summary/<teacher_id>/", api_views.TeacherSummaryAPIView.as_view()),
    path("teacher/course-lists/<teacher_id>/", api_views.TeacherCourseListAPIView.as_view()),
    path("teacher/review-lists/<teacher_id>/", api_views.TeacherReviewListAPIView.as_view()),
    path("teacher/review-detail/<teacher_id>/<review_id>/", api_views.TeacherReviewDetailAPIView.as_view()),
    path("teacher/student-lists/<teacher_id>/", api_views.TeacherStudentsListAPIVIew.as_view({'get': 'list'})),
    path("teacher/all-months-earning/<teacher_id>/", api_views.TeacherAllMonthEarningAPIView),
    path("teacher/best-course-earning/<teacher_id>/", api_views.TeacherBestSellingCourseAPIView.as_view({'get': 'list'})),
    path("teacher/course-order-list/<teacher_id>/", api_views.TeacherCourseOrdersListAPIView.as_view()),
    path("teacher/question-answer-list/<teacher_id>/", api_views.TeacherQuestionAnswerListAPIView.as_view()),
    path("teacher/coupon-list/<teacher_id>/", api_views.TeacherCouponListCreateAPIView.as_view()),
    path("teacher/coupon-detail/<teacher_id>/<coupon_id>/", api_views.TeacherCouponDetailAPIView.as_view()),
    path("teacher/noti-list/<teacher_id>/", api_views.TeacherNotificationListAPIView.as_view()),
    path("teacher/noti-detail/<teacher_id>/<noti_id>", api_views.TeacherNotificationDetailAPIView.as_view()),
    path("teacher/course-create/", api_views.CourseCreateAPIView.as_view()),
    path("teacher/course-update/<teacher_id>/<course_id>/", api_views.CourseUpdateAPIView.as_view()),
    path("teacher/course-detail/<course_id>/", api_views.TeacherCourseDetailAPIView.as_view()),
    path("teacher/course/variant-delete/<variant_id>/<teacher_id>/<course_id>/", api_views.CourseVariantDeleteAPIView.as_view()),
    path("teacher/course/variant-item-delete/<variant_id>/<variant_item_id>/<teacher_id>/<course_id>/", api_views.CourseVariantItemDeleteAPIVIew.as_view()),

    # Eskep Stajer
    path("eskepstajer/odev-create/", api_views.EskepOdevCreateAPIView.as_view()),
    path("eskepstajer/odev-edit/<int:id>/", api_views.EskepOdevUpdateAPIView.as_view()),
    path("eskepstajer/odev-delete/<int:id>/", api_views.EskepOdevDeleteAPIView.as_view()),
    path("eskepstajer/odev-list/<stajer_id>/", api_views.EskepStajerOdevListAPIView.as_view()),
    path("eskepstajer/odev-detail/<int:user_id>/<int:id>/", EskepStajerOdevDetailAPIView.as_view(), name="stajer-odev-detail"),
    path("eskepstajer/kitaptahlili-create/", api_views.EskepKitapTahliliCreateAPIView.as_view()),
    path("eskepstajer/kitaptahlili-edit/<int:id>/", api_views.EskepKitapTahliliUpdateAPIView.as_view()),
    path("eskepstajer/kitaptahlili-delete/<int:id>/", api_views.EskepKitapTahliliDeleteAPIView.as_view()),
    path("eskepstajer/kitaptahlili-list/<stajer_id>/", api_views.EskepStajerKitapTahliliListAPIView.as_view()),
    path("eskepstajer/kitaptahlili-detail/<user_id>/<int:id>/", api_views.EskepStajerKitapTahliliDetailAPIView.as_view()),
    path("eskepstajer/derssonuraporu-create/", api_views.EskepDersSonuRaporuCreateAPIView.as_view()),
    path("eskepstajer/derssonuraporu-edit/<int:id>/", api_views.EskepDersSonuRaporuUpdateAPIView.as_view()),
    path("eskepstajer/derssonuraporu-delete/<int:id>/", api_views.EskepDersSonuRaporuDeleteAPIView.as_view()),
    path("eskepstajer/derssonuraporu-list/<stajer_id>/", api_views.EskepStajerDersSonuRaporuListAPIView.as_view()),
    path("eskepstajer/derssonuraporu-detail/<user_id>/<int:id>/", api_views.EskepStajerDersSonuRaporuDetailAPIView.as_view()),
    path("eskepstajer/proje-create/", api_views.EskepProjeCreateAPIView.as_view()),
    path("eskepstajer/proje-edit/<int:id>/", api_views.EskepProjeUpdateAPIView.as_view()),
    path("eskepstajer/proje-delete/<int:id>/", api_views.EskepProjeDeleteAPIView.as_view()),
    path("eskepstajer/proje-list/<stajer_id>/", api_views.EskepStajerProjeListAPIView.as_view()),
    path("eskepstajer/proje-detail/<user_id>/<int:id>/", api_views.EskepStajerProjeDetailAPIView.as_view()),
    path("eskepstajer/question-answer-message-create/", api_views.QuestionAnswerMessageCreateAPIView.as_view(), name="question-answer-message-create"),
    path("eskepstajer/question-answer-list-create/<odev_id>/", api_views.OdevQuestionAnswerListCreateAPIView.as_view()),
    path("eskepstajer/odev-note/<int:koordinator_id>/<int:id>/", api_views.OdevCreateOrUpdateNoteAPIView.as_view()),
    path("eskepstajer/derssonuraporu-note/<int:koordinator_id>/<int:id>/", api_views.DersSonuRaporuCreateOrUpdateNoteAPIView.as_view()),
    path("eskepstajer/kitaptahlili-note/<int:koordinator_id>/<int:id>/", api_views.KitapTahliliCreateOrUpdateNoteAPIView.as_view()),
    path("eskepstajer/proje-note/<int:koordinator_id>/<int:id>/", api_views.EskepProjeCreateOrUpdateNoteAPIView.as_view()),
    path("eskepstajer/odev-note-detail/<int:koordinator_id>/<int:odev_id>/<int:id>/", api_views.OdevCreateOrUpdateNoteAPIView.as_view()),
    
    # Eskep Student
    path("eskepstudent/odev-create/", api_views.EskepOdevCreateAPIView.as_view()),
    path("eskepogrenci/odev-list/<ogrenci_id>/", api_views.EskepOgrenciOdevListAPIView.as_view()),
    path("eskepstudent/odev-detail/<user_id>/<enrollment_id>/", api_views.EskepStajerOdevDetailAPIView.as_view()),
    path("eskepstudent/kitaptahlili-create/", api_views.EskepKitapTahliliCreateAPIView.as_view()),
    path("eskepogrenci/kitaptahlili-list/<ogrenci_id>/", api_views.EskepOgrenciKitapTahliliListAPIView.as_view()),
    path("eskepogrenci/kitaptahlili-detail/<user_id>/<enrollment_id>/", api_views.EskepStajerOdevDetailAPIView.as_view()),
    path("eskepstudent/derssonuraporu-create/", api_views.EskepDersSonuRaporuCreateAPIView.as_view()),
    path("eskepogrenci/derssonuraporu-list/<ogrenci_id>/", api_views.EskepOgrenciDersSonuRaporuListAPIView.as_view()),
    path("eskepstudent/derssonuraporu-detail/<user_id>/<enrollment_id>/", api_views.EskepStajerOdevDetailAPIView.as_view()),
    path("eskepstudent/question-answer-message-create/", api_views.OdevQuestionAnswerMessageSendAPIView.as_view()),
    
    # Eskep Koordinator
    path("videos/<str:kind>/<int:pk>/buyers/", api_views.VideoBuyersView.as_view()),
    path("videos/<str:kind>/<int:pk>/enrolled/", api_views.VideoEnrolledView.as_view()),
    path("videos/<str:kind>/<int:pk>/buyers/<int:user_id>/", api_views.delete_purchase),
    path("videos/<str:kind>/<int:pk>/enrolled/<int:user_id>/", api_views.delete_enrollment),
    path("eskepinstructor/odev-list/<user_id>/", api_views.EskepInstructorOdevListAPIView.as_view()),
    path("eskepinstructor/summary/<user_id>/", api_views.InstructorSummaryAPIView.as_view()),   
    path("eskepinstructor/odev-detail/<odev_id>/<koordinator_id>/", api_views.EskepInstructorOdevDetailAPIView.as_view()),
    path("eskepinstructor/odev-completed/", api_views.InstructorOdevCompletedCreateAPIView.as_view()),
    path("eskepinstructor/odev-note/<odev_id>/<koordinator_id>/", api_views.EskepInstructorOdevNoteCreateAPIView.as_view()),
    # path("eskepinstructor/odev-note-detail/<odev_id>/<koordinator_id>/<note_id>/", api_views.EskepInstructorOdevNoteDetailAPIView.as_view()),
    path("eskepinstructor/odev-note-detail/<int:koordinator_id>/<int:odev_id>/<int:pk>/",api_views.EskepInstructorOdevNoteDetailAPIView.as_view()),
    path("eskepinstructor/rate-odev/", api_views.InstructorRateCourseCreateAPIView.as_view()),
      path(
        "eskepinstructor/question-answer-list-create/<int:odev_id>/",
        api_views.OdevQuestionAnswerListCreateAPIView.as_view(),
    ),
    # path("eskepinstructor/odev-question-answer-message-create/", api_views.OdevQuestionAnswerMessageSendAPIView.as_view()),
     path(
        "eskepinstructor/question-answer-message-create/<int:odev_id>/",
        api_views.OdevQuestionAnswerMessageCreateAPIView.as_view(),
    ),
    path(  # opsiyonel
        "eskepinstructor/question-answer-message-create/",
        api_views.OdevQuestionAnswerMessageCreateAPIView.as_view(),
    ),
    path(
        "eskepinstructor/kitaptahlili-question-answer-list-create/<int:kitaptahlili_id>/",
        api_views.KitapTahliliQuestionAnswerListCreateAPIView.as_view(),
    ),
    path(
        "eskepinstructor/kitaptahlili-question-answer-message-create/<int:kitaptahlili_id>/",
        api_views.KitapTahliliQuestionAnswerMessageCreateAPIView.as_view(),
    ),
    path(
        "eskepinstructor/kitaptahlili-question-answer-message-create/",
        api_views.KitapTahliliQuestionAnswerMessageCreateAPIView.as_view(),
    ),
    path(
    "eskepinstructor/dsr-question-answer-list-create/<int:derssonuraporu_id>/",
    api_views.DersSonuRaporuQuestionAnswerListCreateAPIView.as_view(),
),
path(
    "eskepinstructor/dsr-question-answer-message-create/<int:derssonuraporu_id>/",
    api_views.DersSonuRaporuQuestionAnswerMessageCreateAPIView.as_view(),
),
path(  # body’den dsr_id alacaksan
    "eskepinstructor/dsr-question-answer-message-create/",
    api_views.DersSonuRaporuQuestionAnswerMessageCreateAPIView.as_view(),
),
#     path(
#     "eskepinstructor/dsr-question-answer-list-create/<int:derssonuraporu_id>/",
#     api_views.DersSonuRaporuQuestionAnswerListCreateAPIView.as_view(),
# ),
# path(
#     "eskepinstructor/dsr-question-answer-message-create/<int:derssonuraporu_id>/",
#     api_views.DersSonuRaporuQuestionAnswerMessageCreateAPIView.as_view(),
# ),
# path(  # body’den dsr_id alacaksan
#     "eskepinstructor/dsr-question-answer-message-create/",
#     api_views.DersSonuRaporuQuestionAnswerMessageCreateAPIView.as_view(),
# ),

    path("eskepinstructor/kitaptahlili-list/<user_id>/", api_views.EskepInstructorKitapTahliliListAPIView.as_view()),
    path("eskepinstructor/kitaptahlili-detail/<int:kitaptahlili_id>/<int:koordinator_id>/",api_views.EskepInstructorKitapTahliliDetailAPIView.as_view()),
    path('eskepinstructor/kitaptahlili-note/<int:kitaptahlili_id>/<int:koordinator_id>/', api_views.EskepInstructorKitapTahliliNoteCreateAPIView.as_view(),name='kitaptahlili-note-create'),
    path("eskepinstructor/kitaptahlili-note-detail/<kitaptahlili_id>/<koordinator_id>/<note_id>/", api_views.EskepInstructorKitapTahliliNoteDetailAPIView.as_view()),
    path("eskepinstructor/rate-kitaptahlili/", api_views.InstructorRateCourseCreateAPIView.as_view()),
    path("eskepinstructor/question-answer-list-create/<kitaptahlili_id>/", api_views.OdevQuestionAnswerListCreateAPIView.as_view()),       
    path("eskepinstructor/proje-list/<user_id>/", api_views.EskepInstructorProjeListAPIView.as_view()),
    path("eskepinstructor/proje-detail/<user_id>/<koordinator_id>/", api_views.EskepInstructorProjeDetailAPIView.as_view()), 
    path("eskepinstructor/derssonuraporu-list/<user_id>/", api_views.EskepInstructorDersSonuRaporuListAPIView.as_view()),
    path("eskepinstructor/derssonuraporu-detail/<user_id>/<koordinator_id>/", api_views.EskepInstructorDersSonuRaporuDetailAPIView.as_view()), 
    path("eskep/assign-role/", api_views.CoordinatorYetkiAtaAPIView.as_view()),
    path("eskepinstructor/create-educator/", api_views.EducatorCreateAPIView.as_view()),
    path("eskepinstructor/student-lists/<user_id>/", api_views.EskepInstructorStudentsStajersListAPIView.as_view({'get': 'list'})),
    path('eskepinstructor/<int:user_id>/kisisel-liste/', api_views.koordinator_students_stajers, name='koordinator-student-stajer-list'),
    path("eskepinstructor/koordinatorler/by-role/", KoordinatorByRoleAPIView.as_view()),
    path("eskepinstructor/course-list/<user_id>/", api_views.MyCourseListAPIView.as_view()),   
    
    # Eğitmen
    path("instructor/summary/<user_id>/", api_views.InstructorSummaryAPIView.as_view()),   
    # path("instructor/odev-note/<user_id>/<enrollment_id>/", api_views.InstructorNoteCreateAPIView.as_view()),
    # path("instructor/odev-note-detail/<user_id>/<enrollment_id>/<note_id>/", api_views.InstructorNoteDetailAPIView.as_view()),
    path("instructor/rate-odev/", api_views.InstructorRateCourseCreateAPIView.as_view()),
    path("instructor/review-detail/<user_id>/<review_id>/", api_views.InstructorRateCourseUpdateAPIView.as_view()),
    path("instructor/wishlist/<user_id>/", api_views.InstructorWishListListCreateAPIView.as_view()),
    path("instructor/question-answer-list-create/<odev_id>/", api_views.OdevQuestionAnswerListCreateAPIView.as_view()),
    path("instructor/question-answer-message-create/", api_views.OdevQuestionAnswerMessageSendAPIView.as_view()),    

    # Eskep Eğitmen
    path("educator/list/", api_views.EskepEgitmenListAPIView.as_view(), name="job-list"),
    path('educator/<int:pk>/', api_views.EducatorUpdateAPIView.as_view(), name="educator-update"),
    path('events/create/', api_views.ESKEPEventCreateAPIView.as_view(), name='instructor-event-create'),
    path('document/create/', api_views.ESKEPEventCreateAPIView.as_view(), name='instructor-event-create'),
    path('events/teacher_schedule/<int:user_id>/', api_views.CombinedEventListAPIView.as_view(), name='teacher-schedule'),
    path('events/student/', api_views.StudentEventListAPIView.as_view(), name='student-events'),
    path('events/all/', api_views.GeneralEventListAPIView.as_view(), name='general-events'),    
    path("educator/video/link/", EducatorVideoLinkListAPIView.as_view(), name="educator-video-link-list"),
    path("educator/video/link/create/", EducatorVideoLinkCreateAPIView.as_view(), name="educator-video-link-create"),   
    path("educator/video/link/<int:pk>/update/", EducatorVideoLinkUpdateAPIView.as_view(), name="educator-video-link-update"),
    path("educator/video/link/<int:pk>/delete/", EducatorVideoLinkDeleteAPIView.as_view(), name="educator-video-link-delete"),
    path("educator/video/create/", EducatorVideoCreateAPIView.as_view(), name="educator-video-create"),
    path("educator/video/", EducatorVideoListAPIView.as_view(), name="educator-video-list"),
    path("educator/video/<int:pk>/update/", EducatorVideoUpdateAPIView.as_view(), name="educator-video-update"),
    path("educator/video/<int:pk>/delete/", EducatorVideoDeleteAPIView.as_view(), name="educator-video-delete"),
    path("educator/document/create/", EducatorVideoCreateAPIView.as_view(), name="educator-video-create"),
    path("educator/document/", EducatorVideoListAPIView.as_view(), name="educator-video-list"),
    path("educator/document/<int:pk>/update/", EducatorVideoUpdateAPIView.as_view(), name="educator-video-update"),
    path("educator/document/<int:pk>/delete/", EducatorVideoDeleteAPIView.as_view(), name="educator-video-delete"),
    
    # Eskep Listeler
    path("eskep/coordinators/", api_views.CoordinatorListAPIView.as_view()),
    path("eskep/users/", api_views.UserListAPIView.as_view(),name="user-list"),
    path("eskep/ogrencis/", api_views.OgrenciListAPIView.as_view()),
    path("eskep/stajers/", api_views.StajerListAPIView.as_view()),
    path("eskep/egitmens/", api_views.EgitmenListAPIView.as_view()),
    path("eskep/create-student", api_views.EgitmenListAPIView.as_view()),
    path("eskep/create-intern", api_views.EgitmenListAPIView.as_view()),
    path("eskep/update_coordinator_role", api_views.UpdateCoordinatorRole.as_view()),
    
    # Ders ve etkinlik örnekleri
    path('events/create/', api_views.ESKEPEventCreateAPIView.as_view(), name='event-create'),
    path('events/teacher_schedule/<int:user_id>/', api_views.InstructorEventListAPIView.as_view(), name='teacher-schedule'),
    path('events/student/', api_views.StudentEventListAPIView.as_view(), name='student-events'),
    path('events/all/', api_views.GeneralEventListAPIView.as_view(), name='general-events'),
    path("egitmen/<int:egitmen_id>/detay/", api_views.egitmen_detay),
    path("hafiz/<int:hafiz_id>/detay/", api_views.hafiz_detay),
    
    # HDM
    path("ders-atamalari/", DersAtamasiAPIView.as_view(), name="ders-atamalari"),
    path("ders-atamalari/<int:pk>/", DersAtamasiDetailAPIView.as_view()),
    path("hafizlar/", HafizsListAPIView.as_view(), name="hafiz-list-create"),
    path("hafizlar/<int:pk>/", HafizDetailAPIView.as_view(), name="hafiz-detail-update-delete"),
    # path("me/saved-videos/", api_views.SavedVideoListCreateAPIView.as_view(), name="saved-video-list-create"),
    # path("me/saved-videos/<int:pk>/delete/", api_views.SavedVideoDeleteAPIView.as_view(), name="saved-video-delete"),
]
