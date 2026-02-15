import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartContext, ProfileContext } from "./views/plugin/Context";
import useAxios from "./utils/useAxios";
import { useAuthStore } from "./store/auth";
import { setUser } from "./utils/auth";

import useUserData from "./views/plugin/useUserData";

import MainWrapper from "./layouts/MainWrapper";

// Auth Pages
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreateNewPassword from "./views/auth/CreateNewPassword";

// Base Pages
import Index from "./views/base/Index";
// import CourseDetail from "./views/base/CourseDetail";
import Cart from "./views/base/Cart";
import Checkout from "./views/base/Checkout";
import Success from "./views/base/Success";
import Search from "./views/base/Search";

// Hafiz Bilgi
import HafizBilgiIndex from "./views/base/HafizBilgiIndex";
import HafizBilgiDashboard from "./views/hafizbilgi/HafizBilgiDashboard";
import HafizBilgiList from "./views/hafizbilgi/HafizBilgiList";
import HafizBilgiCreate from "./views/hafizbilgi/HafizBilgiCreate";
import HafizCountPage from "./views/hafizbilgi/HafizCountPage";
import KayitliOgrencilerPage from "./views/hafizbilgi/KayitliOgrencilerPage";
import UygulamaUzerindenHafizPage from "./views/hafizbilgi/UygulamaUzerindenHafizPage";

// Student Pages
import StudentDashboard from "./views/student/Dashboard";
import StudentCourses from "./views/student/Courses";
import StudentCourseDetail from "./views/student/CourseDetail";
import Wishlist from "./views/student/Wishlist";
import StudentProfile from "./views/student/Profile";
import StudentChangePassword from "./views/student/ChangePassword";

// Instructor Pages
import Dashboard from "./views/instructor/Dashboard";
import Courses from "./views/instructor/Courses";
import Review from "./views/instructor/Review";
import Students from "./views/instructor/Students";
import Earning from "./views/instructor/Earning";
import Orders from "./views/instructor/Orders";
import Coupon from "./views/instructor/Coupon";
import TeacherNotification from "./views/instructor/TeacherNotification";
import QA from "./views/instructor/QA";
import ChangePassword from "./views/instructor/ChangePassword";
import Profile from "./views/instructor/Profile";
import CourseCreate from "./views/instructor/CourseCreate";
import CourseEdit from "./views/instructor/CourseEdit";
import CourseDetail from "./views/instructor/CourseDetail";

//EHAD Akademi Pages
import AkademiIndex from "./views/base/AkademiIndex";
import AkademiCourses from "./views/Akademi/Courses";
import {
  AllYoutubeVideosPage,
  AllInstructorVideosPage,
  VideoPurchasersPage,
  VideoEnrolleesPage,
  MyInstructorVideosPage,
  AllVideoPurchasesPage,
  AllVideoEnrollmentsPage,
} from "./views/AkademiKoordinator/VideoLists";
import AllInstructorDocumentsCrudPage from "./views/AkademiKoordinator/DocumentsPage";

//HDM Pages
import HDMIndex from "./views/base/HDMIndex";
import HafizlikDinlemeDashboard from "./views/HDM/HafizlikDinlemeDashboard";
import HafizTakip from "./views/HDM/HafizTakip";
import HafizGenelTakvim from "./views/HDM/HafizGenelTakvim";
import KuranDinleme from "./views/HDM/KuranDinleme";
import EgitmenDetay from "./views/HDM/EgitmenDetay";
import HafizDetay from "./views/HDM/HafizDetay";
import EgitmenHafizListesi from "./views/HDM/EgitmenHafizListesi";

// ESKEP Pages
import ESKEPDashboard from "./views/ESKEPinstructor/ESKEPDashboard";
import ESKEPIndex from "./views/base/ESKEPIndex";
import ESKEPStudent from "./views/ESKEPstudent/Dashboard";
import DersSonuAnketi from "./views/ESKEPstudent/DersSonuAnketi";
import OdevCreate from "./views/ESKEP/OdevCreate";
import OdevEdit from "./views/ESKEP/OdevEdit";
import KitapTahliliCreate from "./views/ESKEP/KitapTahliliCreate";
import DersSonuRaporuCreate from "./views/ESKEP/DersSonuRaporuCreate";
import DersSonuRaporuEdit from "./views/ESKEP/DersSonuRaporuEdit";
import ProjeCreate from "./views/ESKEP/ProjeCreate";
import ProjeEdit from "./views/ESKEP/ProjeEdit";
import DersSonuRaporuDetail from "./views/ESKEPinstructor/DersSonuRaporuDetail";
import OdevDetail from "./views/ESKEPinstructor/OdevDetail";
import ProjeDetail from "./views/ESKEPinstructor/ProjeDetail";
import ESKEPContactMessages from "./views/base/ContactMessages";

//Eskep Instructor Pages
import ESKEPinstructorCourseCreate from "./views/ESKEPinstructor/EskepInstructorCourseCreate";
import ESKEPinstructorDashboard from "./views/ESKEPinstructor/EskepInstructorDashboard";
import ESKEPinstructorCourses from "./views/ESKEPinstructor/EskepInstructorCourses";
import ESKEPinstructorOdevs from "./views/ESKEPinstructor/EskepInstructorOdevs";
import ESKEPinstructorKitapTahlils from "./views/ESKEPinstructor/EskepInstructorKitapTahlils";
import ESKEPinstructorDersSonuRaporus from "./views/ESKEPinstructor/EskepInstructorDersSonuRaporus";
import ESKEPinstructorOdevDetail from "./views/ESKEPinstructor/OdevDetail";
import ESKEPinstructorProjeDetail from "./views/ESKEPinstructor/ProjeDetail";
import ESKEPinstructorKitapTahliliDetail from "./views/ESKEPinstructor/KitapTahliliDetail";
import ESKEPinstructorAssingCoordinator from "./views/ESKEPinstructor/AssignCoordinator";
import EskepInstructorStudents from "./views/ESKEPinstructor/EskepInstructorStudents";
import EskepInstructorProfile from "./views/ESKEPinstructor/EskepInstructorProfile";
import EskepInstructorStudentStajerList from "./views/ESKEPinstructor/EskepInstructorStudentStajerList";
import ESKEPChangePassword from "./views/ESKEPinstructor/ChangePassword";
import StajerListesi from "./views/ESKEPinstructor/EskepKoordinatorStajers";
import OgrenciListesi from "./views/ESKEPinstructor/EskepKoordinatorStudents";
import StajerDetay from "./views/ESKEPinstructor/StajerDetay";
import StajerDuzenle from "./views/ESKEPinstructor/StajerDuzenle";
import EskepInstructorCourseDetail from "./views/ESKEPinstructor/EskepInstructorCourseDetail";
import EskepInstructorAssingCourses from "./views/ESKEPinstructor/EskepInstructorAssingCourses";

//Eskep Eğitmen Pages
import ESKEPEgitmenDersSaatiEkle from "./views/ESKEPEgitmen/ESKEPEgitmenAddLesson";
import ESKEPEgitmenVideoCreate from "./views/ESKEPEgitmen/ESKEPEgitmenVideoCreate";
import ESKEPEgitmenCreate from "./views/ESKEPinstructor/EskepInstructorTeacherCreate";
import ESKEPEgitmenVideoLinkCreate from "./views/ESKEPEgitmen/EducatorYouTubeVideoCreate";
import ESKEPEgitmenProfil from "./views/ESKEPinstructor/EskepInstructorProfile";
import ESKEPEgitmenVideoList from "./views/ESKEPinstructor/InstructorVideoList";
import ESKEPEgitmenYoutubeCanli from "./views/ESKEPinstructor/YouTubeLivePage";
import ESKEPEgitmenSchedule from "./views/ESKEPEgitmen/ESKEPEgitmenSchedule";
import EducatorVideoLinksPage from "./views/ESKEPEgitmen/EducatorVideoLinksPage";


//Eskep Stajer Pages
import EskepStajerOdevs from "./views/ESKEPstajer/EskepStajerOdevs";
import EskepStajerDersSonuRaporus from "./views/ESKEPstajer/EskepStajerDersSonuRaporus";
import EskepStajerKitapTahlilis from "./views/ESKEPstajer/EskepStajerKitapTahlilis";
import EskepStajerProjes from "./views/ESKEPstajer/EskepStajerProjes";
import EskepStajerDashboard from "./views/ESKEPstajer/EskepStajerDashboard";

//Eskep Ogrenci Pages
import EskepOgrenciDashboard from "./views/ESKEPstudent/Dashboard";

import EducationSchedule from "./views/ESKEPinstructor/EducationSchedule";
// Admin Pages
import OrganizationChart from "./views/admin/OrganizationChart";

// Agent Pages
import AgentHafizBilgiList from "./views/HBSTemsilci/AgentHafizBilgiList";
import PrintExample from "./views/hafizbilgi/PrintExample";

import PrivateRoute from "./layouts/PrivateRoute";
import HBSTemsilciDashboard from "./views/HBSTemsilci/HBSTemsilciDashboard";
import HBSKoordinatorDashboard from "./views/HBSKoordinator/HBSKoordinatorDashboard";
import ESKEPEgitmenAddCanliDers from "./views/ESKEPEgitmen/ESKEPEgitmenAddCanliDers";
import ESKEPEgitmenLiveDersListesi from "./views/ESKEPEgitmen/ESKEPEgitmenLiveDersListesi";
import ESKEPEgitmenAddCanliDersPopup from "./views/ESKEPEgitmen/Popup/ESKEPEgitmenAddCanliDersPopup";
import EskepInstructorProjes from "./views/ESKEPinstructor/EskepInstructorProjes";
import EducatorList from "./views/ESKEPinstructor/EducatorList";
import EducatorEditForm from "./views/ESKEPinstructor/EducatorEditForm";
import AkademiCourseCreate from "./views/Akademi/AkademiCourseCreate";

import EskepOgrenciOdevs from "./views/ESKEPstudent/EskepOgrenciOdevs";
import EskepOgrenciIncelemedeCalismalar from "./views/ESKEPstudent/EskepOgrenciIncelemedeCalismalar";
import { EskepOgrenciPasifCalismalar, EskepOgrenciReddedilmisCalismalar, EskepOgrenciTaslakCalismalar, EskepOgrenciTeslimEdilmisCalismalar } from "./views/ESKEPstudent/EskepOgrenciCalismalarPages";
import EskepOgrenciKitapTahlilis from "./views/ESKEPstudent/EskepOgrenciKitapTahlilis";
import EskepOgrenciDersSonuRaporus from "./views/ESKEPstudent/EskepOgrenciDersSonuRaporus";
import KitapTahliliEdit from "./views/ESKEP/KitapTahliliEdit";
import { EskepStajerIncelemedeCalismalar, EskepStajerPasifCalismalar, EskepStajerReddedilmisCalismalar, EskepStajerTaslakCalismalar, EskepStajerTeslimEdilmisCalismalar } from "./views/ESKEPstajer/EskepStajerCalismalarPages";
import KitapTahliliDetail from "./views/ESKEPinstructor/KitapTahliliDetail";
import EducatorVideoLinkCreate from "./views/ESKEPEgitmen/EducatorYouTubeVideoCreate";
import WebcamRecordPage from "./views/ESKEPEgitmen/WebcamRecordPage";

// Akademi Egitmen
import EducatorAddCanliDers from "./views/AkademiEgitmen/EducatorAddCanliDers";
import EducatorMediaDashboard from "./views/AkademiEgitmen/EducatorMediaDashboard";
import EducatorAddLesson from "./views/AkademiEgitmen/EducatorAddLesson";
import EducatorEgitmenLiveDersListesi from "./views/AkademiEgitmen/EducatorEgitmenLiveDersListesi";
import EducatorEgitmenSchedule from "./views/AkademiEgitmen/EducatorEgitmenSchedule";

import AkademiEducatorVideoLinkCreate from "./views/AkademiEgitmen/EducatorVideoLinkCreate";
import AkademiWebcamRecordPage from "./views/AkademiEgitmen/WebcamRecordPage";
import AkademiEducatorVideoLinksPage from "./views/AkademiEgitmen/EducatorVideoLinksPage";
import EducatorVideosPage from "./views/AkademiEgitmen/EducatorVideosPage";
import AllVideosPage from "./views/Akademi/AllVideosPage";
import MySavedVideosPage from "./views/Akademi/MySavedVideosPage";
import EducatorVideoCreate from "./views/AkademiEgitmen/EducatorVideoCreate";
import EducatorDocuments from "./views/AkademiEgitmen/EducatorDocuments";
import EducatorDocumentCreate from "./views/AkademiEgitmen/EducatorDocumentCreate";
import OgrenciList from "./views/AkademiKoordinator/OgenciList";
import EgitmenList from "./views/AkademiKoordinator/EgitmenList";
import StudentList from "./views/AkademiKoordinator/OgenciList";
import OrgChart from "./views/base/OrgChart";
import AboutEHAD from "./views/base/AboutEHAD";
import Contact from "./views/base/Contact";
import Eskephakkimizda from "./views/ESKEP/Eskephakkimizda";
import HDMHakkimizda from "./views/HDM/HDMHakkimizda";
import HBSHakkimizda from "./views/hafizbilgi/HBSHakkimizda";
import Akademihakkimizda from "./views/Akademi/Akademihakkimizda";
import EskepStajerCalendar from "./views/ESKEPstajer/EskepStajerCalendar";
import ProjeDraftCreate from "./views/ESKEPstajer/ProjeDraftCreate";
import ProjeWeeklyUpload from "./views/ESKEPstajer/ProjeWeeklyUpload";
import EskepApplication from "./views/ESKEP/EskepApplication";
import KadinlarOrgChart from "./views/base/KadinlarOrgChart";
import ErkeklerOrgChart from "./views/base/ErkeklerOrgChart";
import ShowProfile from "./components/ShowProfile";


const BASENAME = import.meta.env.VITE_BASENAME || "/test.akademi.ehad.org.tr";

function App() {
  const [profile, setProfile] = useState(null);
  const rehydrated = useAuthStore((state) => state.rehydrated);
  const allUserData = useAuthStore((state) => state.allUserData);
  const user = useUserData();
  const setRehydrated = useAuthStore((state) => state.setRehydrated);
  const user_id = useAuthStore((state) => state.allUserData?.user_id);
  const axiosJWT = useAxios();

  useEffect(() => {
    if (rehydrated && user_id) {
      axiosJWT
        .get(`user/profile/${user_id}/`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.warn("Profil alınamadı:", err));
    }
  }, [rehydrated, user_id]);

  useEffect(() => {
    const init = async () => {
      await setUser(); // Token varsa kullanıcıyı store'a yerleştir
      setRehydrated(); // Zustand store yüklendi olarak işaretle
    };
    init();
  }, []);

  if (!rehydrated) return <Loading />;

  return (
    <MainWrapper>
      {/* <CartContext.Provider value={[cartCount, setCartCount]}> */}
      <ProfileContext.Provider value={[profile, setProfile]}>
        {/* <BrowserRouter basename={BASENAME}> */}
        <BrowserRouter>
          <Routes>
            {/* 🔓 Açık Sayfalar */}
            <Route path="/register/" element={<Register />} />
            <Route path="/login/" element={<Login />} />
            <Route path="/logout/" element={<Logout />} />
            <Route path="/forgot-password/" element={<ForgotPassword />} />
            <Route path="/org/kadinlar/" element={<KadinlarOrgChart />} />
            <Route path="/org/erkekler/" element={<ErkeklerOrgChart />} />
            <Route
              path="/create-new-password/"
              element={<CreateNewPassword />}
            />
            <Route path="/" element={<Index />} />
            <Route
              path="/hafizbilgi/create-hafizbilgi/"
              element={<HafizBilgiCreate />}
            />
            <Route
              path="/admin/organization-chart/"
              element={<OrganizationChart />}
            />
            {/* <Route
                path="*"
                element={<Navigate to="/login/" />}
              /> */}
            {/* 🔐 Giriş Gerektiren Sayfalar */}
            <Route
              path="/cart/"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout/:order_oid/"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-success/:order_oid/"
              element={
                <PrivateRoute>
                  <Success />
                </PrivateRoute>
              }
            />
            <Route
              path="/search/"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/"
              element={
                <PrivateRoute>
                  <ShowProfile />
                </PrivateRoute>
              }
            />

            {/* Hafız Bilgi */}
            <Route
              path="/hafizbilgi/"
              element={
                <PrivateRoute>
                  <HafizBilgiIndex />
                </PrivateRoute>
              }
            />
            <Route
              path="/hafizbilgi/dashboard"
              element={
                <PrivateRoute>
                  <HafizBilgiDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hafizbilgi/list/"
              element={
                <PrivateRoute>
                  <HafizBilgiList />
                </PrivateRoute>
              }
            />
            <Route
              path="/hafizbilgi/HafizCountPage/"
              element={
                <PrivateRoute>
                  <HafizCountPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hafizbilgi/KayitliOgrencilerPage/"
              element={
                <PrivateRoute>
                  <KayitliOgrencilerPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hafizbilgi/UygulamaUzerindenHafizPage/"
              element={
                <PrivateRoute>
                  <UygulamaUzerindenHafizPage />
                </PrivateRoute>
              }
            />

            {/* Agent */}
            <Route
              path="/temsilci/hafizbilgi/list/"
              element={
                <PrivateRoute>
                  <AgentHafizBilgiList />
                </PrivateRoute>
              }
            />
            <Route
              path="/temsilci/dashboard/"
              element={
                <PrivateRoute>
                  <HBSTemsilciDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/koordinator/dashboard/"
              element={
                <PrivateRoute>
                  <HBSKoordinatorDashboard />
                </PrivateRoute>
              }
            />

            {/* Student */}
            <Route
              path="/student/dashboard/"
              element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/courses/"
              element={
                <PrivateRoute>
                  <StudentCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/courses/:enrollment_id/"
              element={
                <PrivateRoute>
                  <StudentCourseDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/wishlist/"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/profile/"
              element={
                <PrivateRoute>
                  <StudentProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/change-password/"
              element={
                <PrivateRoute>
                  <StudentChangePassword />
                </PrivateRoute>
              }
            />

            {/* Instructor */}
            <Route
              path="/instructor/dashboard/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/courses/"
              element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/reviews/"
              element={
                <PrivateRoute>
                  <Review />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/students/"
              element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/earning/"
              element={
                <PrivateRoute>
                  <Earning />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/orders/"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/coupon/"
              element={
                <PrivateRoute>
                  <Coupon />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/notifications/"
              element={
                <PrivateRoute>
                  <TeacherNotification />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/question-answer/"
              element={
                <PrivateRoute>
                  <QA />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/change-password/"
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/profile/"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/create-course/"
              element={
                <PrivateRoute>
                  <CourseCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/edit-course/:course_id/"
              element={
                <PrivateRoute>
                  <CourseEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/instructor/course-detay/:course_id"
              element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              }
            />

            {/* EHAD Akademi */}
            <Route path="/akademi/videos" element={<AllVideosPage />} />
            <Route path="/akademi/me/saved-videos" element={<MySavedVideosPage />} />
            <Route path="/org-chart" element={<OrgChart />} />
            <Route path="/about-ehad" element={<AboutEHAD />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about-eskep" element={<Eskephakkimizda />} />
            <Route path="/about-hdm" element={<HDMHakkimizda />} />
            <Route path="/about-hbs" element={<HBSHakkimizda />} />
            <Route path="/about-akademi" element={<Akademihakkimizda />} />

            {/* EHAD Akademi Koordinator */}
            <Route path="/koordinator/youtube-videolar" element={<AllYoutubeVideosPage />} />
            <Route path="/koordinator/egitmen-videolari" element={<AllInstructorVideosPage />} />
            <Route path="/koordinator/egitmen-dokumanlari" element={<AllInstructorDocumentsCrudPage />} />
            <Route path="/koordinator/egitmen/:instructorId/videolar" element={<MyInstructorVideosPage />} />

            {/* Dokümanlar */}            
            <Route path="/koordinator/egitmenlist" element={<EgitmenList />} />
            <Route path="/koordinator/ogrencilist" element={<StudentList />} />
            {/* Öğrenci listeleri */}
            <Route path="/koordinator/video/:videoId/satin-alanlar" element={<VideoPurchasersPage />} />
            <Route path="/koordinator/video/:videoId/kayitli-ogrenciler" element={<VideoEnrolleesPage />} />
            {/* Toplu satın alma & kayıt listeleri */}
            <Route path="/koordinator/satin-almalar" element={<AllVideoPurchasesPage />} />
            <Route path="/koordinator/video-kayitlari" element={<AllVideoEnrollmentsPage />} />
            {/* EHAD Akademi Egitmen */}
            <Route path="/educator/add-canli-ders" element={<EducatorAddCanliDers />} />
            <Route path="/educator/dashboard" element={<EducatorMediaDashboard />} />
            <Route path="/educator/add-lesson" element={<EducatorAddLesson />} />
            <Route path="/educator/live-ders-listesi" element={<EducatorEgitmenLiveDersListesi />} />
            <Route path="/educator/schedule" element={<EducatorEgitmenSchedule />} />
            <Route path="/educator/video-create" element={<EducatorVideoCreate />} />
            <Route path="/educator/video-create/:id" element={<EducatorVideoCreate />} />
            <Route path="/educator/video-link-create" element={<AkademiEducatorVideoLinkCreate />} />
            <Route path="/educator/webcam-record" element={<AkademiWebcamRecordPage />} />
            <Route path="/educator/documents" element={<EducatorDocuments />} />
            <Route path="/educator/documents/create" element={<EducatorDocumentCreate />} />
            <Route
              path="/educator/youtube-video-list/"
              element={
                <PrivateRoute>
                  <AkademiEducatorVideoLinksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/educator/video-list/"
              element={
                <PrivateRoute>
                  <EducatorVideosPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/akademi/"
              element={
                <PrivateRoute>
                  <AkademiIndex />
                </PrivateRoute>
              }
            />
            <Route
              path="akademi/course-create/"
              element={
                <PrivateRoute>
                  <AkademiCourseCreate />
                </PrivateRoute>
              }
            />
            {/* <Route
                path="/akademi/dashboard"
                element={
                  <PrivateRoute>
                    <EHADAcademiDashboard />
                  </PrivateRoute>
                }
              /> */}
            <Route
              path="/akademi/courses"
              element={
                <PrivateRoute>
                  <AkademiCourses />
                </PrivateRoute>
              }
            />
            {/* EHAD Akademi Egitmen */}
            <Route
              path="/koordinator/ogrencilist/"
              element={
                <PrivateRoute>
                  <OgrenciList />
                </PrivateRoute>
              }
            />
            <Route
              path="/koordinator/egitmenlist/"
              element={
                <PrivateRoute>
                  <EgitmenList />
                </PrivateRoute>
              }
            />
            {/* HDM */}
            <Route
              path="/hdm/"
              element={
                <PrivateRoute>
                  <HDMIndex />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/dashboard"
              element={
                <PrivateRoute>
                  <HafizlikDinlemeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/kuranoku"
              element={
                <PrivateRoute>
                  <KuranDinleme />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/hafiztakip"
              element={
                <PrivateRoute>
                  <HafizTakip />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/hafizgeneltakvim"
              element={
                <PrivateRoute>
                  <HafizGenelTakvim />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/egitmendetay"
              element={
                <PrivateRoute>
                  <EgitmenDetay />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/hafizdetay"
              element={
                <PrivateRoute>
                  <HafizDetay />
                </PrivateRoute>
              }
            />
            <Route
              path="/hdm/egitmenhafizlistesi"
              element={
                <PrivateRoute>
                  <EgitmenHafizListesi />
                </PrivateRoute>
              }
            />

            {/* ESKEP Genel */}
            <Route
              path="/eskep/"
              element={
                <PrivateRoute>
                  <ESKEPIndex />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/dashboard"
              element={
                <PrivateRoute>
                  <ESKEPDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/contact-messages/"
              element={
                <PrivateRoute>
                  <ESKEPContactMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/ogrenci/"
              element={
                <PrivateRoute>
                  <ESKEPStudent />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/ogrenci/dersanket"
              element={
                <PrivateRoute>
                  <DersSonuAnketi />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/create-odev/"
              element={
                <PrivateRoute>
                  <OdevCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/edit-odev/:id"
              element={
                <PrivateRoute>
                  <OdevEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/create-kitaptahlili/"
              element={
                <PrivateRoute>
                  <KitapTahliliCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/edit-kitaptahlili/:id"
              element={
                <PrivateRoute>
                  <KitapTahliliEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/create-derssonuraporu/"
              element={
                <PrivateRoute>
                  <DersSonuRaporuCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/edit-derssonuraporu/:id"
              element={
                <PrivateRoute>
                  <DersSonuRaporuEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/create-proje/"
              element={
                <PrivateRoute>
                  <ProjeCreate />
                </PrivateRoute>
              }
            />
            <Route path="/eskep/stajer-takvim" element={<EskepStajerCalendar />} />
            <Route
              path="/eskep/edit-proje/:id"
              element={
                <PrivateRoute>
                  <ProjeEdit />
                </PrivateRoute>
              }
            />
            {/* ESKEP Instructor */}
            <Route
              path="/eskepinstructor/dashboard/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/odev-detail/:odev_id/:koordinator_id"
              element={
                <PrivateRoute>
                  <ESKEPinstructorOdevDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/course-create/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorCourseCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/courses/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/assingcourses/"
              element={
                <PrivateRoute>
                  <EskepInstructorAssingCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/courses/:enrollment_id/"
              element={
                <PrivateRoute>
                  <EskepInstructorCourseDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/odevs/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorOdevs />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/odevs/:odev_id/:koordinator_id/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorOdevDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/dersSonuRaporus/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorDersSonuRaporus />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/dersSonuRaporus/:dersSonuRaporu_id/:koordinator_id/"
              element={
                <PrivateRoute>
                  <DersSonuRaporuDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/kitaptahlileris/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorKitapTahlils />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/kitaptahlils/:kitaptahlili_id/:koordinator_id/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorKitapTahliliDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/projes/"
              element={
                <PrivateRoute>
                  <EskepInstructorProjes />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/projes/:proje_id/:koordinator_id/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorProjeDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/koordinator-ata/"
              element={
                <PrivateRoute>
                  <ESKEPinstructorAssingCoordinator />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/ogrenciler/"
              element={
                <PrivateRoute>
                  <EskepInstructorStudents />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/notifications/"
              element={
                <PrivateRoute>
                  <TeacherNotification />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/question-answer/"
              element={
                <PrivateRoute>
                  <QA />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/change-password/"
              element={
                <PrivateRoute>
                  <ESKEPChangePassword />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/profile/"
              element={
                <PrivateRoute>
                  <EskepInstructorProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/ogrenci-stajer/"
              element={
                <PrivateRoute>
                  <EskepInstructorStudentStajerList />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/stajer-list/"
              element={
                <PrivateRoute>
                  <StajerListesi />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/ogrenci-list/"
              element={
                <PrivateRoute>
                  <OgrenciListesi />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/stajer/:id/detay"
              element={
                <PrivateRoute>
                  <StajerDetay />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/stajer/:id/duzenle"
              element={
                <PrivateRoute>
                  <StajerDuzenle />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepinstructor/egitmen-ekle/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenCreate />
                </PrivateRoute>
              }
            />
            {/* ESKEP Stajer */}
            <Route
              path="/eskepstajer/odevs/"
              element={
                <PrivateRoute>
                  <EskepStajerOdevs />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/odevs/:id"
              element={
                <PrivateRoute>
                  <OdevDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/eskepstajer/derssonuraporus/"
              element={
                <PrivateRoute>
                  <EskepStajerDersSonuRaporus />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/derssonuraporus/:id"
              element={
                <PrivateRoute>
                  <DersSonuRaporuDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/kitaptahlileris/"
              element={
                <PrivateRoute>
                  <EskepStajerKitapTahlilis />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/kitaptahlileris/:id"
              element={
                <PrivateRoute>
                  <KitapTahliliDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/projes/"
              element={
                <PrivateRoute>
                  <EskepStajerProjes />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepstajer/projes/:id"
              element={
                <PrivateRoute>
                  <ProjeDetail />
                </PrivateRoute>
              }
            />
             {/* 1. adım: ön taslak */}
  <Route path="/eskep/create-proje-draft" element={<ProjeDraftCreate />} />

  {/* 2. adım: haftalık içerik (proje id ile) */}
  <Route path="/eskep/proje-weekly/:id" element={<ProjeWeeklyUpload />} />
  <Route path="/eskep/apply" element={<EskepApplication />} />
            <Route
              path="/eskepstajer/dashboard/"
              element={
                <PrivateRoute>
                  <EskepStajerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/eskepstajer/works/incele" element={<EskepStajerIncelemedeCalismalar />} />
            <Route path="/eskepstajer/works/draft" element={<EskepStajerTaslakCalismalar />} />
            <Route path="/eskepstajer/works/passive" element={<EskepStajerPasifCalismalar />} />
            <Route path="/eskepstajer/works/rejected" element={<EskepStajerReddedilmisCalismalar />} />
            <Route path="/eskepstajer/works/submitted" element={<EskepStajerTeslimEdilmisCalismalar />} />

            {/* ESKEP Öğrenci */}
            <Route
              path="/eskepogrenci/odevs/"
              element={
                <PrivateRoute>
                  <EskepOgrenciOdevs />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepogrenci/odevs/:id"
              element={
                <PrivateRoute>
                  <OdevDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepogrenci/dashboard/"
              element={
                <PrivateRoute>
                  <EskepOgrenciDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/student/works/incele" element={<EskepOgrenciIncelemedeCalismalar />} />
            <Route path="/student/works/draft" element={<EskepOgrenciTaslakCalismalar />} />
            <Route path="/student/works/passive" element={<EskepOgrenciPasifCalismalar />} />
            <Route path="/student/works/rejected" element={<EskepOgrenciReddedilmisCalismalar />} />
            <Route path="/student/works/submitted" element={<EskepOgrenciTeslimEdilmisCalismalar />} />

            <Route
              path="/eskepogrenci/derssonuraporus/"
              element={
                <PrivateRoute>
                  <EskepOgrenciDersSonuRaporus />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepogrenci/dersonuraporus/:id"
              element={
                <PrivateRoute>
                  <OdevDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepogrenci/kitaptahlilis/"
              element={
                <PrivateRoute>
                  <EskepOgrenciKitapTahlilis />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepogrenci/kitaptahlilis/:id"
              element={
                <PrivateRoute>
                  <OdevDetail />
                </PrivateRoute>
              }
            />
            {/* ESKEP Eğitmen */}
            <Route
              path="/eskepegitmen/ders-saat-ekle/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenDersSaatiEkle />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/canli-ders-ekle/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenAddCanliDers />
                </PrivateRoute>
              }
            />

            <Route
              path="/eskepegitmen/profil/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenProfil />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/live-lessons/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenLiveDersListesi />
                </PrivateRoute>
              }
            />
            <Route
              path="/live-lessons/edit/:id"
              element={<ESKEPEgitmenAddCanliDersPopup />}
            />
            <Route
              path="/eskepegitmen/ders-olustur/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenVideoCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/video-ekle/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenVideoLinkCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/video-ekle/:id"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenVideoLinkCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/video-olustur/"
              element={
                <PrivateRoute>
                  <WebcamRecordPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/video-list/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenVideoList />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/youtube-video-ekle/"
              element={
                <PrivateRoute>
                  <EducatorVideoLinkCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/youtube-video-list/"
              element={
                <PrivateRoute>
                  <EducatorVideoLinksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/youtube-canli/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenYoutubeCanli />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskepegitmen/takvim/"
              element={
                <PrivateRoute>
                  <ESKEPEgitmenSchedule />
                </PrivateRoute>
              }
            />

            {/* <Route path="/eskepegitmen/ders-saat-ekle/:id" element={<EducatorLessonTimeCreate />} />
<Route path="/eskepegitmen/video-olustur/:id" element={<EducatorVideoCreate />} />
<Route path="/eskepegitmen/video-list/:id" element={<EducatorVideoList />} />
<Route path="/eskepegitmen/youtube-canli/:id" element={<EducatorYoutubeLive />} /> */}
            {/* Eğitim Takvimi */}
            <Route
              path="/eskep/egitim-takvimi/"
              element={
                <PrivateRoute>
                  <EducationSchedule />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/eğitmenler/"
              element={
                <PrivateRoute>
                  <EducatorList />
                </PrivateRoute>
              }
            />
            <Route
              path="/eskep/educator/:id"
              element={
                <PrivateRoute>
                  <EducatorEditForm />
                </PrivateRoute>
              }
            />

            {/* Yazdırma Testi */}
            <Route
              path="/print/"
              element={
                <PrivateRoute>
                  <PrintExample />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ProfileContext.Provider>
      {/* </CartContext.Provider> */}
    </MainWrapper>
  );
}

export default App;
