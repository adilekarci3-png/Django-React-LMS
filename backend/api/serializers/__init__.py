# api/serializer/__init__.py
# Tüm serializer sınıflarını tek noktadan dışa açar
from .about_serializers import AboutPageSerializer
# auth & users
from .auth import MyTokenObtainPairSerializer, RegisterSerializer
from .users import UserSerializer, ProfileSerializer

# lookups
from .lookups import (
    CategorySerializer, KoordinatorRoleSerializer, JobSerializer,
    CitySerializer, CountrySerializer, DistrictSerializer,
    ProjeSerializer, DesignationSerializer, OrganizationMemberSerializer
)

# people / roles
from .people import (
    KoordinatorSerializer, StajerSerializer, OgrenciSerializer,
    AgentSerializer, TeacherSerializer, TeacherSimpleSerializer,
    UserMiniSerializer, StudentListSerializer, StudentListItemSerializer,
    InstructorListSerializer
)

# hafiz
from .hafiz import (
    HafizSimpleSerializer, HafizBilgiSerializer, HafizSerializer,
    AttendHafizSerializer, HataNotuSerializer
)

# variants
from .variants import (
    VariantItemSerializer, VariantSerializer,
    VariantItemOdevSerializer, VariantOdevSerializer, VariantOdevDetailedSerializer,
    VariantItemKitapTahliliSerializer, VariantKitapTahliliSerializer, VariantKitapTahliliDetailedSerializer,
    VariantItemDersSonuRaporuSerializer, VariantDersSonuRaporuSerializer, VariantDersSonuRaporuDetailedSerializer,
    VariantItemEskepProjeSerializer, VariantEskepProjeSerializer, VariantEskepProjeDetailedSerializer,
)

# QA
from .qa import (
    Question_Answer_MessageSerializer, Question_AnswerSerializer,
    Question_Answer_MessageOdevSerializer, Question_AnswerOdevSerializer,
    Question_Answer_MessageKitapTahliliSerializer, Question_AnswerKitapTahliliSerializer,
    Question_Answer_MessageDersSonuRaporuSerializer, Question_AnswerDersSonuRaporuSerializer,
    Question_Answer_MessageEskepProjeSerializer, Question_AnswerEskepProjeSerializer,
    OdevQAMessageCreateSerializer,
)

# notes & reviews
from .notes_reviews import (
    NoteSerializer, NoteOdevSerializer, NoteKitapTahliliSerializer,
    NoteDersSonuRaporuSerializer, NoteEskepProjeSerializer,
    ReviewSerializer, ReviewOdevSerializer, ReviewKitapTahliliSerializer,
    ReviewDersSonuRaporuSerializer, ReviewEskepProjeSerializer,
    NotificationSerializer,
)

# commerce
from .commerce import (
    CartSerializer, CartOrderItemSerializer, CartOrderSerializer,
    CouponSerializer, WishlistSerializer, CertificateSerializer,
    CompletedLessonSerializer, CompletedOdevSerializer,
)

# courses & enrollments
from .courses import CourseSerializer, CourseDetailSerializer, CourseSimpleSerializer, EnrolledCourseSerializer
from .enrollment import (
    EnrolledOdevSerializer, EnrolledKitapTahliliSerializer,
    EnrolledDersSonuRaporuSerializer, EnrolledEskepProjeSerializer,
    InstructorOdevSerializer,
)

# content types
from .odevs import OdevListSerializer, OdevSerializer
from .derssonuraporu import DersSonuRaporuSerializer
from .kitaptahlili import KitapTahliliSerializer
from .eskepproje import EskepProjeSerializer

# events & lessons
from .event import ESKEPEventSerializer, CombinedEventSerializer, LiveLessonSerializer
from .lessons import DersSerializer, DersAtamasiSerializer

# quran
from .quran import QuranPageSerializer

# educator media
from .educator import (
    EducatorSerializer, EducatorVideoLinkSerializer, SavedVideoSerializer,
    EducatorVideoSerializer, EducatorDocumentSerializer,BranchSerializer,EducationLevelSerializer
)

# dashboards
from .dashboard import (
    StudentSummarySerializer, ESKEPStudentSummarySerializer,
    AgentSummarySerializer, TeacherSummarySerializer,
)

# organization tree
from .organization import UyeFlatSerializer, UyeTreeNodeSerializer, DepartmanSerializer

# peers
from .peers import PeerIDSerializer

#annotations
from .annotations import AnnotationSerializer

__all__ = [name for name in globals().keys() if name.endswith("Serializer")]
