// src/views/ESKEPinstructor/Partials/Sidebar.jsx
import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

// aynı anahtarlar
const SEC_KEYS = {
  GENEL: "sec_genel",
  KURS: "sec_kurs",
  FILES: "sec_files",
  USER: "sec_user",
  ORG: "sec_org",
  INTERACT: "sec_interact",
  ACCOUNT: "sec_account",
};

function usePersistedSection(key, defaultOpen = true) {
  const [open, setOpen] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw == null ? defaultOpen : raw === "1";
  });
  useEffect(() => {
    localStorage.setItem(key, open ? "1" : "0");
  }, [key, open]);
  return [open, setOpen];
}

// pathname prefix eşleştirme
const isActivePrefix = (pathname, target) =>
  pathname === target || pathname.startsWith(target);

export default function Sidebar() {
  const { pathname } = useLocation();

  // CoordinatorMenu ile aynı gruplar
  const [openGenel, setOpenGenel] = usePersistedSection(SEC_KEYS.GENEL, true);
  const [openKurs, setOpenKurs] = usePersistedSection(SEC_KEYS.KURS, true);
  const [openFiles, setOpenFiles] = usePersistedSection(SEC_KEYS.FILES, true);
  const [openUser, setOpenUser] = usePersistedSection(SEC_KEYS.USER, true);
  const [openOrg, setOpenOrg] = usePersistedSection(SEC_KEYS.ORG, true);
  const [openInteract, setOpenInteract] = usePersistedSection(
    SEC_KEYS.INTERACT,
    true
  );
  const [openAccount, setOpenAccount] = usePersistedSection(
    SEC_KEYS.ACCOUNT,
    true
  );

  // sayaçları istersen API’den doldurursun
  const counters = useMemo(
    () => ({
      reviews: null,
      qna: null,
    }),
    []
  );

  const Item = ({ to, icon, children, exact = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "nav-link d-flex align-items-center justify-content-between sidebar-link px-3 py-2",
          (isActive || (!exact && isActivePrefix(pathname, to)))
            ? "active fw-semibold text-primary"
            : "",
        ].join(" ")
      }
      aria-current={
        (pathname === to || (!exact && isActivePrefix(pathname, to)))
          ? "page"
          : undefined
      }
    >
      <span className="d-inline-flex align-items-center">
        <i className={`${icon} me-2`} />
        <span className="sidebar-link-text">{children}</span>
      </span>
    </NavLink>
  );

  const SectionTitle = ({ open, onToggle, emoji, children }) => (
    <button
      type="button"
      className="nav-link text-muted fw-bold small d-flex align-items-center w-100 justify-content-between section-title px-3 py-2"
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="d-inline-flex align-items-center">
        <span className="me-2">{emoji}</span> {children}
      </span>
      <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} small`} />
    </button>
  );

  return (
    <nav
      className="navbar navbar-expand-md mb-4 mb-lg-0 sidenav w-100"
      aria-label="Koordinatör yan menü"
    >
      {/* mobil toggle */}
      <button
        className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidenav"
        aria-controls="sidenav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="bi bi-grid" />
      </button>

      <div className="collapse navbar-collapse w-100" id="sidenav">
        <div className="card border-0 w-100">
          <div className="card-body p-2">
            <ul className="navbar-nav flex-column w-100">

              {/* 1. 📊 GENEL */}
              <li className="nav-item mb-1">
                <SectionTitle
                  open={openGenel}
                  onToggle={() => setOpenGenel((o) => !o)}
                  emoji="📊"
                >
                  Genel
                </SectionTitle>
              </li>
              {openGenel && (
                <li className="nav-item mb-1">
                  <Item
                    to="/eskepinstructor/dashboard/"
                    icon="bi bi-grid-fill text-primary"
                  >
                    Panel
                  </Item>
                </li>
              )}

              {/* 2. 📚 KURS YÖNETİMİ */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openKurs}
                  onToggle={() => setOpenKurs((o) => !o)}
                  emoji="📚"
                >
                  Kurs Yönetimi
                </SectionTitle>
              </li>
              {openKurs && (
                <>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/course-create/"
                      icon="fas fa-plus-circle text-success"
                    >
                      Kurs Oluştur
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/assingcourses/"
                      icon="fas fa-list-alt text-info"
                    >
                      Oluşturduğum Kurslarım
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/courses/"
                      icon="fas fa-graduation-cap text-warning"
                    >
                      Eğitim Aldığım Kurslarım
                    </Item>
                  </li>
                </>
              )}

              {/* 3. 🗂 GÖNDERİLEN DOSYALAR */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openFiles}
                  onToggle={() => setOpenFiles((o) => !o)}
                  emoji="🗂"
                >
                  Gönderilen Dosyalar
                </SectionTitle>
              </li>
              {openFiles && (
                <>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/odevs/"
                      icon="fas fa-tasks text-danger"
                    >
                      Ödevler
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/kitaptahlileris/"
                      icon="fas fa-book text-primary"
                    >
                      Kitap Tahlilleri
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/dersSonuRaporus/"
                      icon="fas fa-file-alt text-secondary"
                    >
                      Ders Sonu Raporları
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/projes/"
                      icon="fas fa-folder text-success"
                    >
                      Proje Dosyaları
                    </Item>
                  </li>
                </>
              )}

              {/* 4. 👥 KULLANICI YÖNETİMİ */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openUser}
                  onToggle={() => setOpenUser((o) => !o)}
                  emoji="👥"
                >
                  Kullanıcı Yönetimi
                </SectionTitle>
              </li>
              {openUser && (
                <>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/egitmen-ekle/"
                      icon="fas fa-user-plus text-success"
                    >
                      Eğitmen Ekle
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskepinstructor/ogrenci-stajer/"
                      icon="fas fa-users text-primary"
                    >
                      Öğrenci / Stajyer Listesi
                    </Item>
                  </li>
                  {/* CoordinatorMenu ile aynı rotalar */}
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskep/koordinator/students"
                      icon="fas fa-user-graduate text-info"
                    >
                      Koordinatör Öğrencileri
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskep/koordinator/stajers"
                      icon="fas fa-user-clock text-warning"
                    >
                      Koordinatör Stajerleri
                    </Item>
                  </li>
                  {/* dikkat: senin menüde /eskep/eğitmenler/ vardı, router’da nasılsa öyle kullan */}
                  <li className="nav-item mb-1">
                    <Item
                      to="/eskep/eğitmenler/"
                      icon="fas fa-chalkboard-teacher text-dark"
                    >
                      Eğitmen Listesi
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/instructor/students/"
                      icon="fas fa-user-graduate text-secondary"
                    >
                      Öğrenciler
                    </Item>
                  </li>
                </>
              )}

              {/* 5. 📅 ORGANİZASYON */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openOrg}
                  onToggle={() => setOpenOrg((o) => !o)}
                  emoji="📅"
                >
                  Organizasyon
                </SectionTitle>
              </li>
              {openOrg && (
                <li className="nav-item mb-1">
                  <Item
                    to="/eskep/egitim-takvimi/"
                    icon="fas fa-calendar-alt text-danger"
                  >
                    Genel Takvim
                  </Item>
                </li>
              )}

              {/* 6. 💬 ETKİLEŞİM */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openInteract}
                  onToggle={() => setOpenInteract((o) => !o)}
                  emoji="💬"
                >
                  Etkileşim
                </SectionTitle>
              </li>
              {openInteract && (
                <>
                  <li className="nav-item mb-1">
                    <Item
                      to="/instructor/reviews/"
                      icon="fas fa-star text-warning"
                    >
                      Yorumlar
                      {counters.reviews != null && (
                        <span className="badge bg-warning-subtle text-dark ms-2">
                          {counters.reviews}
                        </span>
                      )}
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/instructor/question-answer/"
                      icon="fas fa-envelope text-primary"
                    >
                      Soru / Cevap
                      {counters.qna != null && (
                        <span className="badge bg-danger-subtle text-danger ms-2">
                          {counters.qna}
                        </span>
                      )}
                    </Item>
                  </li>
                </>
              )}

              {/* 7. ⚙️ AYARLAR */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openAccount}
                  onToggle={() => setOpenAccount((o) => !o)}
                  emoji="⚙️"
                >
                  Ayarlar
                </SectionTitle>
              </li>
              {openAccount && (
                <>
                  <li className="nav-item mb-1">
                    <Item
                      to="/instructor/earning/"
                      icon="fas fa-turkish-lira-sign text-success"
                    >
                      Bağış
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item
                      to="/instructor/profile/"
                      icon="fas fa-gear text-dark"
                    >
                      Profil &amp; Ayarlar
                    </Item>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
