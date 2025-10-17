# api/views/__init__.py

# --- teachers ---
from .teachers import (
    TeacherCourseListAPIView,
    TeacherReviewListAPIView,
    TeacherReviewDetailAPIView,
    TeacherStudentsListAPIVIew,
    EskepInstructorStudentsStajersListAPIView,
    TeacherAllMonthEarningAPIView,
    TeacherBestSellingCourseAPIView,
    TeacherCourseOrdersListAPIView,
    TeacherQuestionAnswerListAPIView,
    TeacherCouponListCreateAPIView,
    TeacherCouponDetailAPIView,
    TeacherNotificationListAPIView,
    TeacherNotificationDetailAPIView,
)

# --- courses (ek yönetim uçları) ---
from .courses import (
    CourseCreateAPIView,
    CourseUpdateAPIView,
    TeacherCourseDetailAPIView,
    CourseVariantDeleteAPIView,
    CourseVariantItemDeleteAPIVIew,
)

# --- commerce extra ---
from .commerce import CartOrderItemListAPIView

# --- agents & hafiz ---
from .agents_hafiz import (
    # IsAgent,
    # AgentListAPIView,
    # HafizBilgiCreateAPIView,
    # HafizBilgiUpdateAPIView,
    # HafizListAPIView,
    # AgentHafizListAPIView,
    HafizsListAPIView,
    HafizsListByAgentAPIView,
)

from .permissions import (
    IsAgent,
    AgentListAPIView,
    HafizBilgiCreateAPIView,
    HafizBilgiUpdateAPIView,
    HafizListAPIView,
    AgentHafizListAPIView    
)

# --- lookups ---
from .lookups import (
    JobListAPIView,
    CityListAPIView,
    CountryListAPIView,
    DistrictListAPIView,
    BranchListAPIView,
    EducationLevelListAPIView
)

# --- organization ---
from .organization import OrganizationMemberViewSetAPIVIew, UyeViewSet, DepartmanViewSet

# --- about ---
from .about_views import AboutPageDetailAPIView

# --- notes ---
from .notes import (
    EskepInstructorOdevNoteCreateAPIView,
    EskepInstructorOdevNoteDetailAPIView,
    EskepInstructorDerSonuRaporuNoteCreateAPIView,
    EskepInstructorDersSonuRaporuNoteDetailAPIView,
    EskepInstructorKitapTahliliNoteCreateAPIView,
    EskepInstructorKitapTahliliNoteDetailAPIView,
    EskepInstructorProjeNoteCreateAPIView,
    EskepInstructorProjeNoteDetailAPIView,
    OdevCreateOrUpdateNoteAPIView,
    DersSonuRaporuCreateOrUpdateNoteAPIView,
    KitapTahliliCreateOrUpdateNoteAPIView,
    EskepProjeCreateOrUpdateNoteAPIView,
    StudentNoteDetailAPIView
)

# --- base mixins/helpers ---
from .base import BaseListAPIView, BaseCreateAPIView, BaseUpdateAPIView, BaseDestroyAPIView

# --- odevs ---
from .odevs import (
    EskepInstructorOdevListAPIView,
    EskepStajerOdevListAPIView,
    EskepOgrenciOdevListAPIView,
    EskepOdevCreateAPIView,
    EskepOdevUpdateAPIView,
    EskepOdevListAPIView,
    EskepOdevDestroyAPIView,
    EskepInstructorOdevDetailAPIView,
    EskepStajerOdevDetailAPIView,
    InstructorOdevCompletedCreateAPIView,
    InstructorWishListListCreateAPIView,
    InstructorRateCourseCreateAPIView,
    InstructorRateCourseUpdateAPIView,
    EskepOdevDeleteAPIView
)

# --- reports ---
from .reports import (
    EskepInstructorDersSonuRaporuListAPIView,
    EskepStajerDersSonuRaporuListAPIView,
    EskepOgrenciDersSonuRaporuListAPIView,
    EskepDersSonuRaporuCreateAPIView,
    EskepDersSonuRaporuUpdateAPIView,
    EskepDersSonuRaporuDeleteAPIView,
    EskepDersSonuRaporuListAPIView,
    EskepDersSonuRaporuDestroyAPIView,
    EskepInstructorDersSonuRaporuDetailAPIView,
    EskepStajerDersSonuRaporuDetailAPIView,
)

# --- book reviews ---
from .book_reviews import (
    EskepKitapTahliliListAPIView,
    EskepKitapTahliliDeleteAPIView,
    EskepKitapTahliliDestroyAPIView,
    EskepInstructorKitapTahliliListAPIView,
    EskepStajerKitapTahliliListAPIView,
    EskepOgrenciKitapTahliliListAPIView,
    EskepKitapTahliliCreateAPIView,
    EskepKitapTahliliUpdateAPIView,
    EskepInstructorKitapTahliliDetailAPIView,
    EskepStajerKitapTahliliDetailAPIView,
)

# --- projects ---
from .projects import (
    EskepInstructorProjeListAPIView,
    EskepStajerProjeListAPIView,
    EskepProjeCreateAPIView,
    EskepProjeUpdateAPIView,
    EskepProjeDeleteAPIView,
    EskepProjeListAPIView,
    EskepProjeDestroyAPIView,
    EskepInstructorProjeDetailAPIView,
    EskepStajerProjeDetailAPIView,
    ProjeListAPIView
)

# --- auth ---
from .auth import (
    MyTokenObtainPairView,
    RegisterView,
    PasswordResetEmailVerifyAPIView,
    PasswordChangeAPIView,
    ChangePasswordAPIView,
    ProfileAPIView,
)

# --- people (legacy lists) ---
from .people import (
    CoordinatorListAPIView,
    UserListAPIView,
    StajerListAPIView,
    OgrenciListAPIView,
    EskepEgitmenListAPIView,
    EgitmenListAPIView,
    EducatorDetailAPIView,
    koordinator_students_stajers,
    TeacherViewSet,
    StudentViewSet,
    egitmen_detay,
    hafiz_detay,
    EducatorCreateAPIView,
    KoordinatorByRoleAPIView,
    EducatorUpdateAPIView
)

# --- courses (genel) ---
from .courses import (
    CategoryListAPIView,
    CourseListAPIView,
    MyCourseListAPIView,
    CourseDetailAPIView,
    SearchCourseAPIView,
    StudentRateCourseCreateAPIView,
    StudentRateCourseUpdateAPIView,
    StudentWishListListCreateAPIView,
    CourseDeleteView
)

# --- qa (soru/cevap) ---
from .qa import (
    QuestionAnswerListCreateAPIView,
    CourseQuestionAnswerMessageCreateAPIView,
    OdevQuestionAnswerListCreateAPIView,
    OdevQuestionAnswerMessageCreateAPIView,
    OdevQuestionAnswerMessageSendAPIView,
    QuestionAnswerMessageCreateAPIView,
    KitapTahliliQuestionAnswerListCreateAPIView,
    KitapTahliliQuestionAnswerMessageCreateAPIView,
    KitapTahliliQuestionAnswerMessageSendAPIView,
    DersSonuRaporuQuestionAnswerListCreateAPIView,
    DersSonuRaporuQuestionAnswerMessageCreateAPIView,
    DersSonuRaporuQuestionAnswerMessageSendAPIView,
    ProjeQuestionAnswerListCreateAPIView,
    ProjeQuestionAnswerMessageSendAPIView,
)

# --- commerce / payments ---
from .commerce import (
    CartAPIView,
    CartListAPIView,
    CartItemDeleteAPIView,
    CartStatsAPIView,
    CreateOrderAPIView,
    CheckoutAPIView,
    CouponApplyAPIView,
    StripeCheckoutAPIView,
    PaymentSuccessAPIView,
)

# --- summaries ---
from .summaries import (
    StudentSummaryAPIView,
    InstructorSummaryAPIView,
    AgentSummaryAPIView,
    TeacherSummaryAPIView,
)

# --- enrollments ---
from .enrollments import (
    StudentCourseListAPIView,
    StudentCourseDetailAPIView,
    StudentCourseCompletedCreateAPIView,
    StudentNoteCreateAPIView,
    
)

# --- roles / users ---
from .roles import (
    user_role_view,
    user_role_by_id_view,
    get_user_role_detail,
    UpdateCoordinatorRole,
)

# --- events ---
from .events import (
    ESKEPEventCreateAPIView,
    InstructorEventListAPIView,
    StudentEventListAPIView,
    GeneralEventListAPIView,
    CombinedEventListAPIView,
)

# --- lessons / assignments ---
from .lessons import (
    dersler_by_date,
    DersViewSet,
    HataNotuViewSet,
    AnnotationViewSet,
    LiveLessonViewSet,
)
from .assignments import DersAtamasiAPIView, DersAtamasiDetailAPIView

# --- hafiz / agents extras ---
from .hafiz_agents_extras import HafizAgentListAPIView, HafizAPIView, HafizDetailAPIView

# --- educator media ---
from .educator_media import (
    EducatorVideoLinkListAPIView,
    InstructorVideoLinkListAPIView,
    EducatorVideoLinkCreateAPIView,
    EducatorVideoLinkUpdateAPIView,
    EducatorVideoLinkDeleteAPIView,
    EducatorVideoCreateAPIView,
    EducatorVideoListAPIView,
    EducatorVideoUpdateAPIView,
    EducatorVideoDeleteAPIView,
    delete_purchase,
    delete_enrollment,
    VideoBuyersView,
    VideoEnrolledView,
)

# --- quran ---
from .quran import QuranPageViewSet

# --- assigment ---
from .assignments import CoordinatorYetkiAtaAPIView

# --- dashboard ---
from .dashboard import (
    HBSKoordinatorDashboardViewSet,
    HBSTemsilciDashboardView,
    Top5TemsilciByHafizAPIView,
)

# --- misc / webrtc / checks ---
from .webrtc import peer_id_view
from .checks import check_ceptel, check_email


__all__ = [
    # about
    "AboutPageDetailAPIView",

    #assigments
    "CoordinatorYetkiAtaAPIView",
    
    # base
    "BaseListAPIView",
    "BaseCreateAPIView",
    "BaseUpdateAPIView",
    "BaseDestroyAPIView",

    # notes
    "EskepInstructorOdevNoteCreateAPIView",
    "EskepInstructorOdevNoteDetailAPIView",
    "EskepInstructorDerSonuRaporuNoteCreateAPIView",
    "EskepInstructorDersSonuRaporuNoteDetailAPIView",
    "EskepInstructorKitapTahliliNoteCreateAPIView",
    "EskepInstructorKitapTahliliNoteDetailAPIView",
    "EskepInstructorProjeNoteCreateAPIView",
    "EskepInstructorProjeNoteDetailAPIView",
    "OdevCreateOrUpdateNoteAPIView",
    "DersSonuRaporuCreateOrUpdateNoteAPIView",
    "KitapTahliliCreateOrUpdateNoteAPIView",
    "EskepProjeCreateOrUpdateNoteAPIView",

    # odevs
    "EskepInstructorOdevListAPIView",
    "EskepStajerOdevListAPIView",
    "EskepOgrenciOdevListAPIView",
    "EskepOdevCreateAPIView",
    "EskepOdevUpdateAPIView",
    "EskepOdevListAPIView",
    "EskepOdevDestroyAPIView",
    "EskepInstructorOdevDetailAPIView",
    "EskepStajerOdevDetailAPIView",
    "InstructorOdevCompletedCreateAPIView",
    "InstructorWishListListCreateAPIView",
    "InstructorRateCourseCreateAPIView",
    "InstructorRateCourseUpdateAPIView",
    "EskepOdevDeleteAPIView",
    
    # reports
    "EskepInstructorDersSonuRaporuListAPIView",
    "EskepStajerDersSonuRaporuListAPIView",
    "EskepOgrenciDersSonuRaporuListAPIView",
    "EskepDersSonuRaporuCreateAPIView",
    "EskepDersSonuRaporuUpdateAPIView",
    "EskepDersSonuRaporuDeleteAPIView",
    "EskepDersSonuRaporuListAPIView",
    "EskepDersSonuRaporuDestroyAPIView",
    "EskepInstructorDersSonuRaporuDetailAPIView",
    "EskepStajerDersSonuRaporuDetailAPIView",

    # book reviews
    "EskepKitapTahliliListAPIView",
    "EskepKitapTahliliDeleteAPIView",
    "EskepKitapTahliliDestroyAPIView",
    "EskepInstructorKitapTahliliListAPIView",
    "EskepStajerKitapTahliliListAPIView",
    "EskepOgrenciKitapTahliliListAPIView",
    "EskepKitapTahliliCreateAPIView",
    "EskepKitapTahliliUpdateAPIView",
    "EskepInstructorKitapTahliliDetailAPIView",
    "EskepStajerKitapTahliliDetailAPIView",

    # projects
    "EskepInstructorProjeListAPIView",
    "EskepStajerProjeListAPIView",
    "EskepProjeCreateAPIView",
    "EskepProjeUpdateAPIView",
    "EskepProjeDeleteAPIView",
    "EskepProjeListAPIView",
    "EskepProjeDestroyAPIView",
    "EskepInstructorProjeDetailAPIView",
    "EskepStajerProjeDetailAPIView",
    "ProjeListAPIView",

    # auth
    "MyTokenObtainPairView",
    "RegisterView",
    "PasswordResetEmailVerifyAPIView",
    "PasswordChangeAPIView",
    "ChangePasswordAPIView",
    "ProfileAPIView",

    # people (legacy lists)
    "CoordinatorListAPIView",
    "UserListAPIView",
    "StajerListAPIView",
    "OgrenciListAPIView",
    "EskepEgitmenListAPIView",
    "EducatorDetailAPIView",
    "koordinator_students_stajers",
    "TeacherViewSet",
    "StudentViewSet",
    "egitmen_detay",
    "hafiz_detay",
    "EgitmenListAPIView",
    "EducatorCreateAPIView",
    "KoordinatorByRoleAPIView",
    "EducatorUpdateAPIView",
    
    # courses (genel)
    "CategoryListAPIView",
    "CourseListAPIView",
    "MyCourseListAPIView",
    "CourseDetailAPIView",
    "SearchCourseAPIView",
    "StudentRateCourseCreateAPIView",
    "StudentRateCourseUpdateAPIView",
    "StudentWishListListCreateAPIView",
    "CourseDeleteView",

    # qa
    "QuestionAnswerListCreateAPIView",
    "CourseQuestionAnswerMessageCreateAPIView",
    "OdevQuestionAnswerListCreateAPIView",
    "OdevQuestionAnswerMessageCreateAPIView",
    "OdevQuestionAnswerMessageSendAPIView",
    "QuestionAnswerMessageCreateAPIView",
    "KitapTahliliQuestionAnswerListCreateAPIView",
    "KitapTahliliQuestionAnswerMessageCreateAPIView",
    "KitapTahliliQuestionAnswerMessageSendAPIView",
    "DersSonuRaporuQuestionAnswerListCreateAPIView",
    "DersSonuRaporuQuestionAnswerMessageCreateAPIView",
    "DersSonuRaporuQuestionAnswerMessageSendAPIView",
    "ProjeQuestionAnswerListCreateAPIView",
    "ProjeQuestionAnswerMessageSendAPIView",

    # commerce
    "CartAPIView",
    "CartListAPIView",
    "CartItemDeleteAPIView",
    "CartStatsAPIView",
    "CreateOrderAPIView",
    "CheckoutAPIView",
    "CouponApplyAPIView",
    "StripeCheckoutAPIView",
    "PaymentSuccessAPIView",

    # summaries
    "StudentSummaryAPIView",
    "InstructorSummaryAPIView",
    "AgentSummaryAPIView",
    "TeacherSummaryAPIView",

    # enrollments
    "StudentCourseListAPIView",
    "StudentCourseDetailAPIView",
    "StudentCourseCompletedCreateAPIView",
    "StudentNoteCreateAPIView",
    "StudentNoteDetailAPIView",

    # teachers
    "TeacherCourseListAPIView",
    "TeacherReviewListAPIView",
    "TeacherReviewDetailAPIView",
    "TeacherStudentsListAPIVIew",
    "EskepInstructorStudentsStajersListAPIView",
    "TeacherAllMonthEarningAPIView",
    "TeacherBestSellingCourseAPIView",
    "TeacherCourseOrdersListAPIView",
    "TeacherQuestionAnswerListAPIView",
    "TeacherCouponListCreateAPIView",
    "TeacherCouponDetailAPIView",
    "TeacherNotificationListAPIView",
    "TeacherNotificationDetailAPIView",

    # courses (manage)
    "CourseCreateAPIView",
    "CourseUpdateAPIView",
    "TeacherCourseDetailAPIView",
    "CourseVariantDeleteAPIView",
    "CourseVariantItemDeleteAPIVIew",

    # commerce extra
    "CartOrderItemListAPIView",

    # agents & hafiz
    "IsAgent",
    "AgentListAPIView",
    "HafizBilgiCreateAPIView",
    "HafizBilgiUpdateAPIView",
    "HafizListAPIView",
    "AgentHafizListAPIView",
    "HafizsListAPIView",
    "HafizsListByAgentAPIView",

    # lookups
    "JobListAPIView",
    "CityListAPIView",
    "CountryListAPIView",
    "DistrictListAPIView",
    "BranchListAPIView",
    "EducationLevelListAPIView",
    
    # organization
    "OrganizationMemberViewSetAPIVIew",
    "UyeViewSet",
    "DepartmanViewSet",

    # roles / users
    "user_role_view",
    "user_role_by_id_view",
    "get_user_role_detail",
    "UpdateCoordinatorRole",

    # events
    "ESKEPEventCreateAPIView",
    "InstructorEventListAPIView",
    "StudentEventListAPIView",
    "GeneralEventListAPIView",
    "CombinedEventListAPIView",

    # lessons / assignments
    "dersler_by_date",
    "DersViewSet",
    "HataNotuViewSet",
    "AnnotationViewSet",
    "LiveLessonViewSet",
    "DersAtamasiAPIView",
    "DersAtamasiDetailAPIView",

    # hafiz / agents extras
    "HafizAgentListAPIView",
    "HafizAPIView",
    "HafizDetailAPIView",

    # educator media
    "EducatorVideoLinkListAPIView",
    "InstructorVideoLinkListAPIView",
    "EducatorVideoLinkCreateAPIView",
    "EducatorVideoLinkUpdateAPIView",
    "EducatorVideoLinkDeleteAPIView",
    "EducatorVideoCreateAPIView",
    "EducatorVideoListAPIView",
    "EducatorVideoUpdateAPIView",
    "EducatorVideoDeleteAPIView",
    "delete_purchase",
    "delete_enrollment",
    "VideoBuyersView",
    "VideoEnrolledView",

    # quran
    "QuranPageViewSet",

    # dashboard
    "HBSKoordinatorDashboardViewSet",
    "HBSTemsilciDashboardView",
    "Top5TemsilciByHafizAPIView",

    # misc
    "peer_id_view",
    "check_ceptel",
    "check_email",
]
