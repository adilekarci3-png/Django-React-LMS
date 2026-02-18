// CoordinatorMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/auth"; // yolu projene göre düzelt
import "./css/coordinatormenu.css";

const CoordinatorMenu = () => {
  // store'dan roller
  const [baseRoles, subRoles] = useAuthStore((state) => [
    state.allUserData?.base_roles || [],
    state.allUserData?.sub_roles || [],
  ]);

  // bu menünün genel olarak görünmesi için koşul
  const canSee =
    baseRoles.includes("Koordinator") &&
    (
      subRoles.includes("ESKEPOgrenciKoordinator") ||
      subRoles.includes("ESKEPStajerKoordinator") ||
      subRoles.includes("ESKEPGenelKoordinator")
    );

  // sadece ESKEPGenelKoordinator'a özel link
  const isEskepGenel = subRoles.includes("ESKEPGenelKoordinator");

  if (!canSee) return null;

  return (
    <li className="nav-item dropdown coordinator-dropdown position-static">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={(e) => e.preventDefault()}
      >
        <i className="fas fa-chalkboard-user"></i> Koordinatör
      </a>

      {/* YANA DOĞRU MENÜ */}
      <div className="dropdown-menu coordinator-mega shadow-lg border-0 mt-0">
        <div className="d-flex flex-wrap gap-3">
          {/* 1. SÜTUN - Kurs + İçerik */}
          <div className="coordinator-col">
            <h6 className="dropdown-header px-0">📚 Yönetim</h6>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/dashboard/`}>
              <i className="bi bi-grid-fill text-primary"></i> Panel
            </Link>          

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">➕ İçerik Ekle</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/canli-ders-ekle/`}>
              <i className="fa-solid fa-video me-2 text-danger"></i> Canlı Ders Ekle
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/youtube-video-ekle/`}>
              <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Video Ekle
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/ders-saat-ekle/`}>
              <i className="fa-regular fa-clock me-2 text-success"></i> Ders Saati Ekle
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/video-olustur/`}>
              <i className="fa-solid fa-film me-2 text-warning"></i> Video Oluştur
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/video-ekle/`}>
              <i className="fa-solid fa-upload me-2 text-info"></i> Video Ekle
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/dokuman-ekle/`}>
              <i className="fa-solid fa-file-arrow-up me-2 text-secondary"></i> Döküman Ekle
            </Link>
          </div>

          {/* 2. SÜTUN - Gönderilenler + Listelerim */}
          <div className="coordinator-col">
            <h6 className="dropdown-header px-0">🗂 Gönderilen Dosyalar</h6>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/odevs/`}>
              <i className="fas fa-tasks text-danger"></i> Ödevler
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/kitaptahlileris/`}>
              <i className="fas fa-book text-primary"></i> Kitap Tahlilleri
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/dersSonuRaporus/`}>
              <i className="fas fa-file-alt text-secondary"></i> Ders Sonu Raporları
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/projes/`}>
              <i className="fas fa-folder text-success"></i> Proje Dosyaları
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">📚 Listelerim</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/live-lessons/`}>
              <i className="fa-solid fa-video me-2 text-success"></i> Canlı Derslerim
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/youtube-video-list/`}>
              <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Videolarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/video-list/`}>
              <i className="fa-solid fa-photo-film me-2 text-info"></i> Videolarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/created-videos/`}>
              <i className="fa-solid fa-clapperboard me-2 text-warning"></i> Oluşturduğum Videolarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/documents/`}>
              <i className="fa-regular fa-file-lines me-2 text-secondary"></i> Dökümanlarım
            </Link>
          </div>

          {/* 3. SÜTUN - Kullanıcı + Organizasyon + Etkileşim + Ayarlar + (Genel ise) İletişim */}
          <div className="coordinator-col">
            <h6 className="dropdown-header px-0">👥 Kullanıcı</h6>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/ogrenci-list/`}>
              <i className="fas fa-user-graduate text-info"></i> Koordinatör Öğrencileri
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepinstructor/stajer-list/`}>
              <i className="fas fa-user-clock text-warning"></i> Koordinatör Stajerleri
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">📅 Organizasyon</h6>
            <Link className="dropdown-item px-0" to={`/eskep/egitim-takvimi/`}>
              <i className="fas fa-calendar-alt text-danger"></i> Genel Takvim
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">💬 Etkileşim</h6>
            <Link className="dropdown-item px-0" to={`/instructor/reviews/`}>
              <i className="fas fa-star text-warning"></i> Yorumlar
            </Link>
            <Link className="dropdown-item px-0" to={`/instructor/question-answer/`}>
              <i className="fas fa-envelope text-primary"></i> Soru / Cevap
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">⚙️ Ayarlar</h6>
            <Link className="dropdown-item px-0" to={`/instructor/earning/`}>
              <i className="fas fa-turkish-lira-sign text-success"></i> Bağış
            </Link>
            <Link className="dropdown-item px-0" to={`/instructor/profile/`}>
              <i className="fas fa-gear text-dark"></i> Profil & Ayarlar
            </Link>

            {/* 🔐 Sadece ESKEPGenelKoordinator görecek */}
            {isEskepGenel && (
              <>
                <hr className="my-2" />
                <h6 className="dropdown-header px-0">📨 İletişim</h6>
                <Link className="dropdown-item px-0" to={`/eskep/contact-messages/`}>
                  <i className="fas fa-inbox me-2"></i> İletişim Mesajları
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default CoordinatorMenu;
