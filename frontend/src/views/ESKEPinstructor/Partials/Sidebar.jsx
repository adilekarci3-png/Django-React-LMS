// src/views/ESKEPinstructor/Partials/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

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

function SectionTitle({ open, onToggle, children }) {
  return (
    <div
      className="navbar-header d-flex align-items-center justify-content-between"
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={onToggle}
    >
      <span>{children}</span>
      <i
        className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} small text-muted`}
        style={{ fontSize: "0.7rem" }}
      />
    </div>
  );
}

function Sidebar() {
  const linkCls = ({ isActive }) =>
    "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded " +
    (isActive ? "active" : "");

  const [openGenel, setOpenGenel]       = usePersistedSection("sec_genel", true);
  const [openKurs, setOpenKurs]         = usePersistedSection("sec_kurs", true);
  const [openFiles, setOpenFiles]       = usePersistedSection("sec_files", true);
  const [openUser, setOpenUser]         = usePersistedSection("sec_user", true);
  const [openOrg, setOpenOrg]           = usePersistedSection("sec_org", true);
  const [openInteract, setOpenInteract] = usePersistedSection("sec_interact", true);
  const [openAyarlar, setOpenAyarlar]   = usePersistedSection("sec_account", true);

  return (
    <div className="col-lg-12 col-md-12 col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav bg-white rounded">
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-white m-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidenav"
          aria-controls="sidenav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="bi bi-grid" />
        </button>

        <div className="collapse d-md-block" id="sidenav">
          <div className="px-3 py-2">

            {/* --- Genel --- */}
            <SectionTitle open={openGenel} onToggle={() => setOpenGenel(o => !o)}>
              Genel
            </SectionTitle>
            {openGenel && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/dashboard/">
                    <i className="bi bi-grid-fill text-primary"></i>
                    <span>Panel</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Kurs Yönetimi --- */}
            <SectionTitle open={openKurs} onToggle={() => setOpenKurs(o => !o)}>
              Kurs Yönetimi
            </SectionTitle>
            {openKurs && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/course-create/">
                    <i className="fas fa-plus-circle text-success"></i>
                    <span>Kurs Oluştur</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/assingcourses/">
                    <i className="fas fa-list-alt text-info"></i>
                    <span>Oluşturduğum Kurslarım</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/courses/">
                    <i className="fas fa-graduation-cap text-warning"></i>
                    <span>Eğitim Aldığım Kurslarım</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Gönderilen Dosyalar --- */}
            <SectionTitle open={openFiles} onToggle={() => setOpenFiles(o => !o)}>
              Gönderilen Dosyalar
            </SectionTitle>
            {openFiles && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/odevs/">
                    <i className="fas fa-tasks text-danger"></i>
                    <span>Ödevler</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/kitaptahlileris/">
                    <i className="fas fa-book text-primary"></i>
                    <span>Kitap Tahlilleri</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/dersSonuRaporus/">
                    <i className="fas fa-file-alt text-secondary"></i>
                    <span>Ders Sonu Raporları</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/projes/">
                    <i className="fas fa-folder text-success"></i>
                    <span>Proje Dosyaları</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Kullanıcı Yönetimi --- */}
            <SectionTitle open={openUser} onToggle={() => setOpenUser(o => !o)}>
              Kullanıcı Yönetimi
            </SectionTitle>
            {openUser && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/egitmen-ekle/">
                    <i className="fas fa-user-plus text-success"></i>
                    <span>Eğitmen Ekle</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/ogrenci-stajer/">
                    <i className="fas fa-users text-primary"></i>
                    <span>Öğrenci / Stajyer Listesi</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/ogrenci-list/">
                    <i className="fas fa-user-graduate text-info"></i>
                    <span>Koordinatör Öğrencileri</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/stajer-list/">
                    <i className="fas fa-user-clock text-warning"></i>
                    <span>Koordinatör Stajerleri</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskep/eğitmenler/">
                    <i className="fas fa-chalkboard-teacher text-dark"></i>
                    <span>Eğitmen Listesi</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/ogrenciler/">
                    <i className="fas fa-user-graduate text-secondary"></i>
                    <span>Öğrenciler</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Organizasyon --- */}
            <SectionTitle open={openOrg} onToggle={() => setOpenOrg(o => !o)}>
              Organizasyon
            </SectionTitle>
            {openOrg && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskep/egitim-takvimi/">
                    <i className="fas fa-calendar-alt text-danger"></i>
                    <span>Genel Takvim</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Etkileşim --- */}
            <SectionTitle open={openInteract} onToggle={() => setOpenInteract(o => !o)}>
              Etkileşim
            </SectionTitle>
            {openInteract && (
              <ul className="list-unstyled mb-4">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/reviews/">
                    <i className="fas fa-star text-warning"></i>
                    <span>Yorumlar</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/question-answer/">
                    <i className="fas fa-envelope text-primary"></i>
                    <span>Soru / Cevap</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* --- Ayarlar --- */}
            <SectionTitle open={openAyarlar} onToggle={() => setOpenAyarlar(o => !o)}>
              Ayarlar
            </SectionTitle>
            {openAyarlar && (
              <ul className="list-unstyled mb-0">
                <li className="nav-item">
                  <NavLink className={linkCls} to="/instructor/earning/">
                    <i className="fas fa-turkish-lira-sign text-success"></i>
                    <span>Bağış</span>
                  </NavLink>
                </li>
                
                <li className="nav-item">
                              <NavLink className={linkCls} to="/eskepinstructor/change-password">
                                <i className="fas fa-lock text-secondary"></i>
                                <span>Şifre Değiştir</span>
                              </NavLink>
                            </li>
                            <li className="nav-item">
                  <NavLink className={linkCls} to="/eskepinstructor/profile-edit/">
                    <i className="fas fa-gear text-dark"></i>
                    <span>Profil &amp; Ayarlar</span>
                  </NavLink>
                </li>
                            <li className="nav-item">
                              <NavLink className={linkCls} to="/login">
                                <i className="fas fa-sign-out-alt text-danger"></i>
                                <span>Çıkış Yap</span>
                              </NavLink>
                            </li>
              </ul>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;