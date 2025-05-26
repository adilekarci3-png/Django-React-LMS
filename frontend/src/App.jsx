import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartContext, ProfileContext } from "./views/plugin/Context";
import apiInstance from "./utils/axios";
import useAxios from "./utils/useAxios";
import CartId from "./views/plugin/CartId";
import UserData from "./views/plugin/UserData";

import MainWrapper from "./layouts/MainWrapper";
import PrivateRoute from "./layouts/PrivateRoute";

// Auth Pages
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreateNewPassword from "./views/auth/CreateNewPassword";

// Base Pages
import Index from "./views/base/Index";
import CourseDetail from "./views/base/CourseDetail";
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

//EHAD Akademi Pages
import AkademiIndex from "./views/base/AkademiIndex";
import EHADAcademiDashboard from "./views/Akademi/EHADAcademiDashboard";

//HDM Pages
import HDMIndex from "./views/base/HDMIndex";
import HafizlikDinlemeDashboard from "./views/HDM/HafizlikDinlemeDashboard";

// ESKEP Pages
import ESKEPDashboard from "./views/ESKEPinstructor/ESKEPDashboard";
import ESKEPIndex from "./views/base/ESKEPIndex";
import ESKEPStudent from "./views/ESKEPstudent/Dashboard";
import DersSonuAnketi from "./views/ESKEPstudent/DersSonuAnketi";
import OdevCreate from "./views/ESKEPstajer/OdevCreate";
import KitapTahliliCreate from "./views/ESKEPstajer/KitapTahliliCreate";
import DersSonuRaporuCreate from "./views/ESKEPstajer/DersSonuRaporuCreate";
import ProjeCreate from "./views/ESKEPstajer/ProjeCreate";

import ESKEPinstructorDashboard from "./views/ESKEPinstructor/EskepInstructorDashboard";
import ESKEPinstructorOdevs from "./views/ESKEPinstructor/Odevs";
import ESKEPinstructorKitapTahlils from "./views/ESKEPinstructor/KitapTahlils";
import ESKEPinstructorDersSonuRaporus from "./views/ESKEPinstructor/DersSonuRaporus";
import ESKEPinstructorOdevDetail from "./views/ESKEPinstructor/OdevDetail";
import ESKEPinstructorKitapTahliliDetail from "./views/ESKEPinstructor/KitapTahliliDetail";
import ESKEPinstructorAssingCoordinator from "./views/ESKEPinstructor/AssignCoordinator";
import EskepInstructorStudents from "./views/ESKEPinstructor/EskepInstructorStudents";
import EskepInstructorProfile from "./views/ESKEPinstructor/EskepInstructorProfile";
import ESKEPEgitmenDersSaatiEkle from "./views/ESKEPinstructor/ESKEPAddLesson";
import ESKEPEgitmenCreate from "./views/ESKEPinstructor/InstructorCreate";
import ESKEPEgitmenVideoCreate from "./views/ESKEPinstructor/InstructorVideoCreate";
import ESKEPEgitmenVideoRecoder from "./views/ESKEPinstructor/WebCamVideoRecorder";
import ESKEPEgitmenVideoLinkCreate from "./views/ESKEPinstructor/InstructorVideoLinkCreate";
import ESKEPEgitmenProfil from "./views/ESKEPinstructor/EskepInstructorProfile";
import ESKEPEgitmenVideoList from "./views/ESKEPinstructor/InstructorVideoList";
import ESKEPEgitmenYoutubeCanli from "./views/ESKEPinstructor/YouTubeLivePage";

//Eskep Stajer Pages
import EskepStajerOdevs from "./views/ESKEPstajer/EskepStajerOdevs";
import EskepStajerDersSonuRaporus from "./views/ESKEPstajer/EskepStajerDersSonuRaporus";
import EskepStajerKitapTahlilis from "./views/ESKEPstajer/EskepStajerKitapTahlilis";
import EskepStajerProjes from "./views/ESKEPstajer/EskepStajerProjes";
import EskepStajerDashboard from "./views/ESKEPstajer/EskepStajerDashboard";

import EducationSchedule from "./views/ESKEPinstructor/EducationSchedule";
import InstructorList from "./views/ESKEPinstructor/InstructorList";

// Admin Pages
import OrganizationChart from "./views/admin/OrganizationChart";

// Agent Pages
import AgentHafizBilgiList from "./views/agent/HafizBilgiList";

// Misc
import CrudTableDeneme from "./views/CrudTable/CrudTableDeneme";

//HDM
import KuranDinleme from "./views/HDM/KuranDinleme";

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
      setCartCount(res.data?.length || 0);
    });

    useAxios()
      .get(`user/profile/${UserData()?.user_id}/`)
      .then((res) => setProfile(res.data));
  }, []);

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ProfileContext.Provider value={[profile, setProfile]}>
        <BrowserRouter>
          <MainWrapper>
            <Routes>
              {/* Auth */}
              <Route path="/register/" element={<Register />} />
              <Route path="/login/" element={<Login />} />
              <Route path="/logout/" element={<Logout />} />
              <Route path="/forgot-password/" element={<ForgotPassword />} />
              <Route
                path="/create-new-password/"
                element={<CreateNewPassword />}
              />

              {/* Base */}
              <Route path="/" element={<Index />} />
              <Route path="/course-detail/:slug/" element={<CourseDetail />} />
              <Route path="/cart/" element={<Cart />} />
              <Route path="/checkout/:order_oid/" element={<Checkout />} />
              <Route
                path="/payment-success/:order_oid/"
                element={<Success />}
              />
              <Route path="/search/" element={<Search />} />

              {/* Hafız Bilgi */}
              <Route path="/hafizbilgi/" element={<HafizBilgiIndex />} />
              <Route path="/hafizbilgi/dashboard" element={<HafizBilgiDashboard />} />
              <Route path="/hafizbilgi/list/" element={<HafizBilgiList />} />
              <Route
                path="/hafizbilgi/create-hafizbilgi/"
                element={<HafizBilgiCreate />}
              />
              <Route
                path="/hafizbilgi/crudtable/"
                element={<CrudTableDeneme />}
              />
              <Route
                path="/hafizbilgi/HafizCountPage/"
                element={<HafizCountPage />}
              />
              <Route
                path="/hafizbilgi/KayitliOgrencilerPage/"
                element={<KayitliOgrencilerPage />}
              />
              <Route
                path="/hafizbilgi/UygulamaUzerindenHafizPage/"
                element={<UygulamaUzerindenHafizPage />}
              />

              {/* Agent */}
              <Route
                path="/agent/hafizbilgi/list/"
                element={<AgentHafizBilgiList />}
              />

              {/* Admin */}
              <Route
                path="/admin/organization-chart/"
                element={<OrganizationChart />}
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
              <Route path="/student/courses/" element={<StudentCourses />} />
              <Route
                path="/student/courses/:enrollment_id/"
                element={<StudentCourseDetail />}
              />
              <Route path="/student/wishlist/" element={<Wishlist />} />
              <Route path="/student/profile/" element={<StudentProfile />} />
              <Route
                path="/student/change-password/"
                element={<StudentChangePassword />}
              />

              {/* Instructor */}
              <Route path="/instructor/dashboard/" element={<Dashboard />} />
              <Route path="/instructor/courses/" element={<Courses />} />
              <Route path="/instructor/reviews/" element={<Review />} />
              <Route path="/instructor/students/" element={<Students />} />
              <Route path="/instructor/earning/" element={<Earning />} />
              <Route path="/instructor/orders/" element={<Orders />} />
              <Route path="/instructor/coupon/" element={<Coupon />} />
              <Route
                path="/instructor/notifications/"
                element={<TeacherNotification />}
              />
              <Route path="/instructor/question-answer/" element={<QA />} />
              <Route
                path="/instructor/change-password/"
                element={<ChangePassword />}
              />
              <Route path="/instructor/profile/" element={<Profile />} />
              <Route
                path="/instructor/create-course/"
                element={<CourseCreate />}
              />
              <Route
                path="/instructor/edit-course/:course_id/"
                element={<CourseEdit />}
              />

              {/* EHAD AKADEMİ */}
              <Route path="/akademi/" element={<AkademiIndex />} />
              <Route path="/akademi/dashboard" element={<EHADAcademiDashboard />} />

              {/* HDM */}
              <Route path="/hdm/" element={<HDMIndex />} />
              <Route path="/hdm/dashboard" element={<HafizlikDinlemeDashboard />} />              
              <Route path="/hdm/kuranoku" element={<KuranDinleme />} />              

              {/* ESKEP */}
              <Route path="/eskep/dashboard" element={<ESKEPDashboard />} />
              <Route path="/eskep/" element={<ESKEPIndex />} />
              <Route path="/eskep/ogrenci/" element={<ESKEPStudent />} />
              <Route
                path="/eskep/ogrenci/dersanket"
                element={<DersSonuAnketi />}
              />
              <Route path="/eskep/create-odev/" element={<OdevCreate />} />
              <Route
                path="/eskep/create-kitaptahlili/"
                element={<KitapTahliliCreate />}
              />
              <Route
                path="/eskep/create-derssonuraporu/"
                element={<DersSonuRaporuCreate />}
              />
              <Route path="/eskep/create-proje/" element={<ProjeCreate />} />

              {/* ESKEP Instructor */}
              <Route
                path="/eskepinstructor/dashboard/"
                element={<ESKEPinstructorDashboard />}
              />
              <Route
                path="/eskepinstructor/odevs/"
                element={<ESKEPinstructorOdevs />}
              />
              <Route
                path="/eskepinstructor/odevs/:odev_id/:koordinator_id/"
                element={<ESKEPinstructorOdevDetail />}
              />
              <Route
                path="/eskepinstructor/dersSonuRaporus/"
                element={<ESKEPinstructorDersSonuRaporus />}
              />
              <Route
                path="/eskepinstructor/dersSonuRaporus/:derssonuraporu_id/:koordinator_id/"
                element={<ESKEPinstructorOdevDetail />}
              />
              <Route
                path="/eskepinstructor/kitaptahlileris/"
                element={<ESKEPinstructorKitapTahlils />}
              />
              <Route
                path="/eskepinstructor/kitaptahlileris/:kitaptahlili_id/:koordinator_id/"
                element={<ESKEPinstructorKitapTahliliDetail />}
              />
              <Route
                path="/eskepinstructor/projes/"
                element={<ESKEPinstructorDersSonuRaporus />}
              />
              <Route
                path="/eskepinstructor/projes/:proje_id/:koordinator_id/"
                element={<ESKEPinstructorOdevDetail />}
              />
              <Route
                path="/eskepinstructor/koordinator-ata/"
                element={<ESKEPinstructorAssingCoordinator />}
              />
              <Route
                path="/eskep/egitim-takvimi/"
                element={<EducationSchedule />}
              />
              <Route path="/eskep/eğitmenler/" element={<InstructorList />} />
              <Route
                path="/eskepinstructor/ogrenciler/"
                element={<EskepInstructorStudents />}
              />
              <Route
                path="/eskepinstructor/notifications/"
                element={<TeacherNotification />}
              />
              <Route
                path="/eskepinstructor/question-answer/"
                element={<QA />}
              />
              <Route
                path="/eskepinstructor/change-password/"
                element={<ChangePassword />}
              />
              <Route
                path="/eskepinstructor/egitmen-ekle/"
                element={<ESKEPEgitmenCreate />}
              />
              <Route
                path="/eskepinstructor/profile/"
                element={<EskepInstructorProfile />}
              />

              {/* ESKEP Stajer */}
              <Route
                path="/eskepstajer/odevs/"
                element={<EskepStajerOdevs />}
              />
              <Route
                path="/eskepstajer/dersonuraporus/"
                element={<EskepStajerDersSonuRaporus />}
              />
              <Route
                path="/eskepstajer/kitaptahlileris/"
                element={<EskepStajerKitapTahlilis />}
              />
              <Route
                path="/eskepstajer/projes/"
                element={<EskepStajerProjes />}
              />
              <Route
                path="/eskepstajer/dashboard/"
                element={<EskepStajerDashboard />}
              />

              {/* ESKEP Öğrenci */}
              <Route
                path="/eskepogrenci/odevs/"
                element={<ESKEPinstructorOdevs />}
              />
              <Route
                path="/eskepogrenci/derssonuraporus/"
                element={<ESKEPinstructorOdevs />}
              />
              <Route
                path="/eskepogrenci/kitaptahlileris/"
                element={<ESKEPinstructorOdevs />}
              />

              {/* ESKEP Eğitmen */}
              <Route
                path="/eskepegitmen/ders-saat-ekle/"
                element={<ESKEPEgitmenDersSaatiEkle />}
              />
              <Route
                path="/eskepegitmen/egitmen-ekle/"
                element={<ESKEPEgitmenCreate />}
              />
              <Route
                path="/eskepegitmen/profil/"
                element={<ESKEPEgitmenProfil />}
              />
              <Route
                path="/eskepegitmen/ders-olustur/"
                element={<ESKEPEgitmenVideoCreate />}
              />
              <Route
                path="/eskepegitmen/video-ekle/"
                element={<ESKEPEgitmenVideoLinkCreate />}
              />
              <Route
                path="/eskepegitmen/video-olustur/"
                element={<ESKEPEgitmenVideoRecoder />}
              />
              <Route
                path="/eskepegitmen/video-list/"
                element={<ESKEPEgitmenVideoList />}
              />
              <Route
                path="/eskepegitmen/youtube-canli/"
                element={<ESKEPEgitmenYoutubeCanli />}
              />
            </Routes>
          </MainWrapper>
        </BrowserRouter>
      </ProfileContext.Provider>
    </CartContext.Provider>
  );
}

export default App;
