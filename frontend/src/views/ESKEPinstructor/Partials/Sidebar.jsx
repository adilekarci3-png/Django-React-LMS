import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/Sidebar.css"; // 👈 yeni CSS

/** prefix bazlı aktif kontrol ("/eskepinstructor/orders/" altında her şey aktif) */
const isActivePrefix = (pathname, target) =>
  pathname === target || pathname.startsWith(target);

const SEC_KEYS = {
  GENEL: "sec_genel",
  KURS: "sec_kurs",
  USER: "sec_user",
  ADMIN: "sec_admin",
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

export default function Sidebar() {
  const { pathname } = useLocation();

  // bölümleri persist et
  const [openGenel, setOpenGenel] = usePersistedSection(SEC_KEYS.GENEL, true);
  const [openKurs, setOpenKurs] = usePersistedSection(SEC_KEYS.KURS, true);
  const [openUser, setOpenUser] = usePersistedSection(SEC_KEYS.USER, true);
  const [openAdmin, setOpenAdmin] = usePersistedSection(SEC_KEYS.ADMIN, true);
  const [openAccount, setOpenAccount] = usePersistedSection(SEC_KEYS.ACCOUNT, true);

  // örnek sayaçlar (istersen prop/context’ten doldur)
  const counters = useMemo(
    () => ({
      courses: null,
      reviews: null,
      orders: null,
      qna: null,
      notifications: null,
    }),
    []
  );

  /** Link bileşeni (NavLink + prefix active) */
  const Item = ({ to, icon, children, exact = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "nav-link d-flex align-items-center justify-content-between sidebar-link px-3 py-2",
          (isActive || (!exact && isActivePrefix(pathname, to)))
            ? "active fw-semibold text-primary"
            : ""
        ].join(" ")
      }
      aria-current={
        (pathname === to || (!exact && isActivePrefix(pathname, to))) ? "page" : undefined
      }
    >
      <span className="d-inline-flex align-items-center">
        <i className={`${icon} me-2`} />
        <span className="sidebar-link-text">{children}</span>
      </span>
    </NavLink>
  );

  /** Bölüm başlığı (accordion benzeri) */
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
      aria-label="Eğitmen yan menü"
    >
      {/* Mobile toggler */}
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

              {/* 1. Genel Panel */}
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
                  <Item to="/eskepinstructor/dashboard/" icon="bi bi-grid-fill text-primary">
                    Panel
                  </Item>
                </li>
              )}

              {/* 2. Kurs Yönetimi */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openKurs}
                  onToggle={() => setOpenKurs((o) => !o)}
                  emoji="🎓"
                >
                  Kurs Yönetimi
                </SectionTitle>
              </li>
              {openKurs && (
                <>
                  <li className="nav-item mb-1">
                    <Item to="/instructor/courses/" icon="fas fa-chalkboard-user text-success">
                      Kurslarım
                      {counters.courses != null && (
                        <span className="badge bg-light text-muted ms-2">{counters.courses}</span>
                      )}
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/instructor/create-course/" icon="fas fa-plus text-info">
                      Kurs Oluştur
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/instructor/reviews/" icon="fas fa-star text-warning">
                      Yorumlar
                      {counters.reviews != null && (
                        <span className="badge bg-warning-subtle text-dark ms-2">{counters.reviews}</span>
                      )}
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/orders/" icon="fas fa-comment-dots text-danger">
                      Kurs Talepleri
                      {counters.orders != null && (
                        <span className="badge bg-primary-subtle text-primary ms-2">{counters.orders}</span>
                      )}
                    </Item>
                  </li>
                </>
              )}

              {/* 3. Kullanıcı ve Etkileşim */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openUser}
                  onToggle={() => setOpenUser((o) => !o)}
                  emoji="👥"
                >
                  Kullanıcı ve Etkileşim
                </SectionTitle>
              </li>
              {openUser && (
                <>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/ogrenciler/" icon="fas fa-graduation-cap text-success">
                      Öğrenciler
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/question-answer/" icon="fas fa-envelope-open-text text-purple">
                      Soru/Cevap
                      {counters.qna != null && (
                        <span className="badge bg-danger-subtle text-danger ms-2">{counters.qna}</span>
                      )}
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/notifications/" icon="fas fa-bell text-orange">
                      Bildirimler
                      {counters.notifications != null && (
                        <span className="badge bg-success-subtle text-success ms-2">
                          {counters.notifications}
                        </span>
                      )}
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/coupon/" icon="fas fa-tag text-teal">
                      Ödüller
                    </Item>
                  </li>
                </>
              )}

              {/* 4. Yönetim ve Yetkiler */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openAdmin}
                  onToggle={() => setOpenAdmin((o) => !o)}
                  emoji="🔐"
                >
                  Yönetim &amp; Yetkiler
                </SectionTitle>
              </li>
              {openAdmin && (
                <>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/koordinator-ata/" icon="fas fa-user-shield text-danger">
                      Yetki Ata
                    </Item>
                  </li>
                  <li className="nav-item mb-2">
                    <Item to="/eskepinstructor/egitmen-ekle/" icon="fas fa-user-plus text-success">
                      Eğitmen Ekle
                    </Item>
                  </li>
                </>
              )}

              {/* 5. Hesap Ayarları */}
              <li className="nav-item mt-3 mb-1">
                <SectionTitle
                  open={openAccount}
                  onToggle={() => setOpenAccount((o) => !o)}
                  emoji="⚙️"
                >
                  Hesap Ayarları
                </SectionTitle>
              </li>
              {openAccount && (
                <>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/profile/" icon="fas fa-user-edit text-primary">
                      Profili Düzenle
                    </Item>
                  </li>
                  <li className="nav-item mb-1">
                    <Item to="/eskepinstructor/change-password/" icon="fas fa-lock text-dark">
                      Şifre Değiştir
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
