# api/models/__init__.py
# Tek yerden import edilebilen paket yapısı

# ---- sabitler ----
from .choices import (
    YEAR, YEAR_CHOICES, LANGUAGE, GENDER_CHOICES, ONAY_CHOICES, ISMARRIED_CHOICES,
    OS_CHOICES, LEVEL, TEACHER_STATUS, STATUS, KOORDINATOR_STATUS, PAYMENT_STATUS,
    PLATFORM_STATUS, PLATFORM_CHOICES, RATING, NOTI_TYPE
)

# ---- temel / ortak ----
from .common import (
    Branch, Educator, EducationLevel, Job
)

# ---- coğrafi ----
from .geo import Country, City, District

# ---- iletişim ----
from .contact import ContactMessage, ContactSubject, BlockedIP

# ---- roller ----
from .roles import (
    TeacherRole, StajerRole, AgentRole, OgrenciRole, HafizRole, KoordinatorRole
)

# ---- kişiler / kullanıcı tipleri ----
from .teachers import Teacher
from .people import Koordinator, Hafiz, Agent, Stajer, Ogrenci

# ---- ilişkiler ----
from .relations import TeacherStudent

# from .saved_video import SavedVideo
# ---- içerik: kurslar ve varyantlar + Soru-Cevap (Kurs) ----
from .courses import (
    Category, Course, Variant, VariantItem,
    Question_Answer, Question_Answer_Message,
    CompletedLesson, EnrolledCourse, Note,Review
)

# ---- Ödev içerikleri + Soru-Cevap (Ödev) ----
from .odevs import (
    Odev, VariantOdev, VariantOdevItem,
    Question_AnswerOdev, Question_Answer_MessageOdev,
    CompletedOdev, EnrolledOdev, NoteOdev, ReviewOdev
)

# ---- Ders Sonu Raporu içerikleri + Soru-Cevap ----
from .reports import (
    DersSonuRaporu, VariantDersSonuRaporu, VariantDersSonuRaporuItem,
    Question_AnswerDersSonuRaporu, Question_Answer_MessageDersSonuRaporu,
    EnrolledDersSonuRaporu, NoteDersSonuRaporu, ReviewDersSonuRaporu
)

# # ---- Kitap Tahlili içerikleri + Soru-Cevap ----
# from .book_reviews import (
#     KitapTahlili, VariantKitapTahlili, VariantKitapTahliliItem,
#     Question_AnswerKitapTahlili, Question_Answer_MessageKitapTahlili,
#     CompletedKitapTahlili, EnrolledKitapTahlili, NoteKitapTahlili, ReviewKitapTahlili
# )

# ---- Proje içerikleri + Soru-Cevap ----
from .projects import (
    EskepProje, VariantEskepProje, VariantEskepProjeItem,
    Question_AnswerEskepProje, Question_Answer_MessageEskepProje,
    EnrolledEskepProje, NoteEskepProje, ReviewEskepProje
)

# ---- ticari / bildirim ----
from .commerce import (
    Coupon, Wishlist, WishlistOdev, Notification
)

from .orders import (
    Cart, CartOrder, CartOrderItem 
)

from .certificates import (
    Certificate
)
from .realtime import (
    PeerID
)
# ---- medya ----
from .media import (
    EducatorVideoLink, EducatorVideo,SavedVideo,
    EducatorDocument, VideoPurchase, VideoEnrollment
)

# ---- organizasyon / kadro ----
from .organization import OrganizationMember, Designation, Proje, Departman, Uye

# ---- takvim ----
from .lessons import ESKEPEvent, DersAtamasi, Ders,LiveLesson

# ---- anotasyonlar ----
from .quran import QuranAnnotation, HataNotu, QuranPage, Annotation

__all__ = [
    # sabitler ayrı, model sınıfları aşağıda
    # common / geo
    "Branch", "Educator", "EducationLevel", "LiveLesson", "Job",
    "Country", "City", "District",

    # roles / people / relations
    "TeacherRole", "StajerRole", "AgentRole", "OgrenciRole", "HafizRole", "KoordinatorRole",
    "Teacher", "TeacherStudent",
    "Koordinator", "Hafiz", "Agent", "Stajer", "Ogrenci",

    # courses
    "Category", "Course", "Variant", "VariantItem",
    "Question_Answer", "Question_Answer_Message",
    "CompletedLesson", "EnrolledCourse", "Note","Review"
 
    # odevs
    "Odev", "VariantOdev", "VariantOdevItem",
    "Question_AnswerOdev", "Question_Answer_MessageOdev",
    "CompletedOdev", "EnrolledOdev", "NoteOdev", "ReviewOdev",

    # reports
    "DersSonuRaporu", "VariantDersSonuRaporu", "VariantDersSonuRaporuItem",
    "Question_AnswerDersSonuRaporu", "Question_Answer_MessageDersSonuRaporu",
    "EnrolledDersSonuRaporu", "NoteDersSonuRaporu", "ReviewDersSonuRaporu",

    # # book reviews
    # "KitapTahlili", "VariantKitapTahlili", "VariantKitapTahliliItem",
    # "Question_AnswerKitapTahlili", "Question_Answer_MessageKitapTahlili",
    # "CompletedKitapTahlili", "EnrolledKitapTahlili", "NoteKitapTahlili", "ReviewKitapTahlili",

    # projects
    "EskepProje", "VariantEskepProje", "VariantEskepProjeItem",
    "Question_AnswerEskepProje", "Question_Answer_MessageEskepProje",
    "EnrolledEskepProje", "NoteEskepProje", "ReviewEskepProje",

    # commerce
    "Cart", "CartOrder", "CartOrderItem", "Coupon", "Wishlist", "WishlistOdev", "Certificate", "Notification",

    # media
    "EducatorVideoLink", "SavedVideo","EducatorVideo", "EducatorDocument", "VideoPurchase", "VideoEnrollment",

    # organization
    "OrganizationMember", "Designation", "Proje", "Departman", "Uye",
    
    # iletişim
    "ContactMessage","ContactSubject", "BlockedIP",

    # lessons & quran
    "ESKEPEvent", "DersAtamasi", "Ders", "QuranAnnotation", "QuranPage", "Annotation", "HataNotu", "PeerID",
]
