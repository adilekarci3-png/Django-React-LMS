import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/UserData";
import { ProfileContext } from "../plugin/Context";

export default function OTMBaseHeader() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState({ base_roles: [], sub_roles: [] });
  const [profile, setProfile] = useContext(ProfileContext);

  const api = useAxios();
  const [isLoggedIn, rehydrated] = useAuthStore((s) => [s.isLoggedIn(), s.rehydrated]);
  const user = useUserData();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!rehydrated || !isLoggedIn || !user?.user_id || fetchedRef.current) return;
    fetchedRef.current = true;

    api.get(`user/profile/${user.user_id}/`)
      .then((r) => setProfile(r.data))
      .catch(() => {});

    api.get(`user-role-detail/`)
      .then((r) => setRoleData(r.data))
      .catch(() => {});
  }, [rehydrated, isLoggedIn, user?.user_id, api, setProfile]);

  if (!rehydrated) return null;

  const submitSearch = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    navigate(`/search/?search=${encodeURIComponent(q.trim())}`);
  };

  const { base_roles = [], sub_roles = [] } = roleData;

  const isOTMKoordinator =
    base_roles.includes("Koordinator") &&
    sub_roles.includes("OTMKoordinator");

  const isOTMOgretmen = base_roles.includes("Teacher");

  const isOTMOgrenci =
    base_roles.includes("Ogrenci") && sub_roles.includes("OTMOgrenci");

  // Koçluk: Koordinatör veya Öğretmen görebilir
  const isKoclukYetkili = isOTMKoordinator || isOTMOgretmen;

  // Deneme: Koordinatör veya Öğretmen yönetir; Öğrenci sadece kendi sonuçlarını görür
  const isDenemeYonetici = isOTMKoordinator || isOTMOgretmen;

  return (
    <>
      <header className="otm-header sticky-top border-0">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid px-3 px-lg-4">

            {/* Brand */}
            <Link to="/" className="navbar-brand otm-nav-logo">
              <span className="otm-nav-logo-mark">
                <i className="bi bi-people-fill"></i>
              </span>
              OTM
            </Link>

            {/* Mobile toggler */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn otm-icon-btn"
                data-bs-toggle="collapse"
                data-bs-target="#otm-search-mobile"
                aria-label="Ara"
              >
                <i className="bi bi-search"></i>
              </button>
              <button
                className="navbar-toggler otm-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#otm-main-navbar"
                aria-label="Menüyü aç"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapse */}
            <div className="collapse navbar-collapse" id="otm-main-navbar">
              <ul className="navbar-nav me-auto align-items-lg-center">

                <li className="nav-item">
                  <NavLink className="nav-link otm-nav-link" to="/about-otm">
                    <i className="bi bi-info-circle me-1"></i>Hakkımızda
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link otm-nav-link" to="/otm/contact">
                    <i className="bi bi-telephone me-1"></i>İletişim
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link otm-nav-link" to="/otm/org-chart">
                    <i className="bi bi-diagram-3 me-1"></i>Organizasyon
                  </NavLink>
                </li>

                {/* ── KOÇ menüsü (Öğretmen veya Koordinatör) ── */}
                {isKoclukYetkili && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person-lines-fill me-1"></i>Koçluk
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        {/* Route: /otm/kocluk/planlar → KoclukPage.jsx */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/kocluk/planlar">
                          <i className="bi bi-clipboard2-plus me-2"></i>Plan Oluştur
                        </Link>
                      </li>
                      <li>
                        {/* Route: /otm/kocluk/takip → API: GET otm/kocluk/planlar/ */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/kocluk/takip">
                          <i className="bi bi-graph-up-arrow me-2"></i>İlerleme Takibi
                        </Link>
                      </li>
                      {isOTMKoordinator && (
                        <li>
                          {/* Route: /otm/kocluk/raporlar → Koordinatöre özel koçluk raporları */}
                          <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/kocluk/raporlar">
                            <i className="bi bi-bar-chart-line me-2"></i>Koçluk Raporları
                          </Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}

                {/* ── DENEME menüsü ── */}
                {(isDenemeYonetici || isOTMOgrenci) && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-file-earmark-text me-1"></i>Deneme
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      {isDenemeYonetici && (
                        <>
                          <li>
                            {/* Route: /otm/deneme/yukle → DenemePage.jsx */}
                            <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/deneme/yukle">
                              <i className="bi bi-cloud-arrow-up me-2"></i>Deneme Yükle
                            </Link>
                          </li>
                          <li>
                            {/* Route: /otm/deneme/listesi → API: GET otm/denemeler/ */}
                            <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/deneme/listesi">
                              <i className="bi bi-collection me-2"></i>Deneme Listesi
                            </Link>
                          </li>
                          <li>
                            {/* Route: /otm/deneme/analiz → API: GET otm/denemeler/{id}/analiz/ */}
                            <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/deneme/analiz">
                              <i className="bi bi-bar-chart me-2"></i>Sonuç Analizi
                            </Link>
                          </li>
                        </>
                      )}
                      {isOTMOgrenci && (
                        <>
                          <li>
                            {/* Route: /otm/ogrenci/denemelerim → API: GET otm/ogrenci/denemeler/ */}
                            <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogrenci/denemelerim">
                              <i className="bi bi-journal-text me-2"></i>Denemelerim
                            </Link>
                          </li>
                          <li>
                            {/* Route: /otm/ogrenci/deneme-sonuclari → API: GET otm/ogrenci/deneme-analiz/ */}
                            <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogrenci/deneme-sonuclari">
                              <i className="bi bi-graph-up me-2"></i>Sonuçlarım
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </li>
                )}

                {/* ── YOKLAMA menüsü (Öğretmen veya Koordinatör) ── */}
                {isOTMOgretmen && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-calendar2-check me-1"></i>Yoklama
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        {/* Route: /otm/ogretmen/yoklama-al → YoklamaPage.jsx */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/yoklama-al">
                          <i className="bi bi-person-check me-2"></i>Yoklama Al
                        </Link>
                      </li>
                      <li>
                        {/* Route: /otm/ogretmen/yoklama-gecmis → API: GET otm/yoklama/?ogretmen=me */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/yoklama-gecmis">
                          <i className="bi bi-clock-history me-2"></i>Geçmiş Yoklamalar
                        </Link>
                      </li>
                      <li>
                        {/* Route: /otm/ogretmen/devam-raporu → API: GET otm/devam-raporu/?sinif=X */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/devam-raporu">
                          <i className="bi bi-pie-chart me-2"></i>Devam Raporu
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* ── KOORDİNATÖR YOKLAMA görünümü ── */}
                {isOTMKoordinator && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-calendar2-check me-1"></i>Yoklama
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        {/* API: GET otm/yoklama/?sinif=all → tüm sınıfların yoklama özeti */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/koordinator/yoklama-ozet">
                          <i className="bi bi-grid-3x3-gap me-2"></i>Yoklama Özeti
                        </Link>
                      </li>
                      <li>
                        {/* API: GET otm/devam-raporu/ogrenci/{id}/ */}
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/koordinator/devam-raporlari">
                          <i className="bi bi-bar-chart-line me-2"></i>Devam Raporları
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* ── Koordinatör menüsü (mevcut) ── */}
                {isOTMKoordinator && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person-gear me-1"></i>Koordinatör
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/koordinator/ogrenci-listesi">
                          <i className="bi bi-people me-2"></i>Öğrenci Listesi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/koordinator/raporlar">
                          <i className="bi bi-bar-chart-line me-2"></i>Raporlar
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/koordinator/ayarlar">
                          <i className="bi bi-gear me-2"></i>Ayarlar
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* ── Öğretmen menüsü (mevcut) ── */}
                {isOTMOgretmen && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-easel2 me-1"></i>Öğretmen
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/siniflarim">
                          <i className="bi bi-journal-text me-2"></i>Sınıflarım
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/yoklama">
                          <i className="bi bi-journal-check me-2"></i>Yoklama
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/notlar">
                          <i className="bi bi-pencil-square me-2"></i>Not Girişi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogretmen/raporlar">
                          <i className="bi bi-bar-chart-line me-2"></i>Raporlar
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* ── Öğrenci menüsü (mevcut) ── */}
                {isOTMOgrenci && (
                  <li className="nav-item dropdown">
                    <a className="nav-link otm-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person me-1"></i>Öğrenci
                    </a>
                    <ul className="dropdown-menu otm-dropdown rounded-4 shadow p-2">
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogrenci/dashboard">
                          <i className="bi bi-grid me-2"></i>Panelim
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogrenci/notlarim">
                          <i className="bi bi-bar-chart me-2"></i>Notlarım
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item otm-dropdown-item rounded-3" to="/otm/ogrenci/devam">
                          <i className="bi bi-calendar-check me-2"></i>Devam Durumum
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>

              {/* Search (desktop) */}
              <form className="d-none d-lg-block me-3" onSubmit={submitSearch}>
                <div className="otm-search-pill">
                  <i className="bi bi-search opacity-75"></i>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Ara"
                  />
                  <button className="btn btn-sm otm-search-btn" type="submit">Ara</button>
                </div>
              </form>

              {/* Auth / Profile */}
              {!isLoggedIn ? (
                <div className="d-flex gap-2">
                  <Link to="/login/" className="otm-btn-nav-outline">Giriş Yap</Link>
                  <Link to="/register/" className="otm-btn-nav-primary">Kayıt Ol</Link>
                </div>
              ) : (
                <div className="dropdown">
                  <button className="otm-profile-btn" data-bs-toggle="dropdown">
                    {profile?.image ? (
                      <img src={profile.image} alt="" className="otm-avatar" />
                    ) : (
                      <span className="otm-avatar otm-avatar--placeholder">
                        {(profile?.full_name || "U")[0]?.toUpperCase?.()}
                      </span>
                    )}
                    <span className="d-none d-sm-inline">{profile?.full_name || "Hesabım"}</span>
                    <i className="bi bi-caret-down-fill small"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end otm-dropdown rounded-4 shadow p-2">
                    <li className="px-2 py-1 small text-muted">{profile?.email || ""}</li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item otm-dropdown-item rounded-3" to="/profile/">
                        <i className="bi bi-person me-2"></i>Profilim
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item otm-dropdown-item rounded-3" to="/settings/">
                        <i className="bi bi-gear me-2"></i>Ayarlar
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item otm-dropdown-item text-danger rounded-3" to="/logout/">
                        <i className="bi bi-box-arrow-right me-2"></i>Çıkış
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile search */}
            <div className="collapse w-100 mt-2 d-lg-none" id="otm-search-mobile">
              <form onSubmit={submitSearch}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    className="form-control border-0"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <button className="btn btn-light" type="submit">Ara</button>
                </div>
              </form>
            </div>
          </div>
        </nav>
      </header>

      {/* ── NAV STİLLERİ — beyaz arka plan, kırmızı aksan ── */}
      <style>{`
        .otm-header {
          background: #fff;
          border-bottom: 1px solid #f0dada;
          box-shadow: 0 1px 8px rgba(229,57,53,0.07);
          z-index: 100;
        }

        .otm-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 900; font-size: 1.12rem;
          color: #1a0a0a; text-decoration: none; letter-spacing: -.01em;
          color:#000 !important;
        }
        .otm-nav-logo-mark {
          width: 32px; height: 32px; border-radius: 10px;
          background: #e53935;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px;
        }

        .otm-nav-link {
          color: #6b4444 !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          transition: background .15s, color .15s;
        }
        .otm-nav-link:hover,
        .otm-nav-link.active {
          background: #fdeaea !important;
          color: #b71c1c !important;
        }

        /* Dropdown panel */
        .otm-header .dropdown-menu,
        .otm-dropdown {
          background: #fff !important;
          border: 1px solid #f0dada !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 28px rgba(229,57,53,0.10) !important;
          padding: 8px !important;
        }

        /* Dropdown pozisyon */
        .otm-header .nav-item.dropdown {
          position: relative;
        }
        .otm-header .nav-item.dropdown .dropdown-menu {
          position: absolute !important;
          left: 0 !important;
          right: auto !important;
          top: 100% !important;
          transform: none !important;
        }

        /* Dropdown item */
        .otm-dropdown-item,
        .otm-header .dropdown-item {
          color: #1a0a0a !important;
          font-weight: 600 !important;
          font-size: 0.88rem !important;
          border-radius: 9px !important;
          padding: 8px 12px !important;
          transition: background .12s, color .12s !important;
        }
        .otm-dropdown-item:hover,
        .otm-header .dropdown-item:hover {
          background: #fdeaea !important;
          color: #b71c1c !important;
        }
        .otm-dropdown-item i,
        .otm-header .dropdown-item i {
          color: #e53935 !important;
        }
        .otm-header .dropdown-divider {
          border-color: #f0dada !important;
        }

        /* Search */
        .otm-search-pill {
          display: flex; align-items: center; gap: .5rem;
          background: #fdf6f6; border-radius: 999px;
          padding: .2rem .25rem .2rem .65rem;
          border: 1.5px solid #f0dada;
        }
        .otm-search-pill input {
          border: 0; outline: 0; box-shadow: none !important;
          background: transparent; width: 200px; font-size: 0.88rem;
        }
        .otm-search-btn {
          background: #e53935; color: #fff;
          border-radius: 999px; font-weight: 700;
          font-size: 0.82rem; padding: 3px 14px; border: none;
        }
        .otm-search-btn:hover { background: #b71c1c; color: #fff; }

        /* Butonlar */
        .otm-btn-nav-outline {
          padding: 7px 18px; border: 1.5px solid #f0dada;
          border-radius: 12px; background: transparent;
          font-weight: 700; font-size: 0.88rem;
          color: #6b4444; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: border-color .15s, color .15s;
        }
        .otm-btn-nav-outline:hover {
          border-color: #e53935; color: #b71c1c;
        }

        .otm-btn-nav-primary {
          padding: 7px 20px; border-radius: 12px;
          background: #e53935; color: #fff;
          font-weight: 800; font-size: 0.88rem; border: none;
          text-decoration: none; display: inline-flex; align-items: center;
          transition: background .15s, transform .12s;
        }
        .otm-btn-nav-primary:hover {
          background: #b71c1c; transform: translateY(-1px); color: #fff;
        }

        /* Profile */
        .otm-profile-btn {
          display: flex; align-items: center; gap: 8px;
          background: transparent; border: 1.5px solid #f0dada;
          border-radius: 12px; padding: 5px 12px;
          font-weight: 700; font-size: 0.88rem; color: #6b4444;
          cursor: pointer; transition: border-color .15s, color .15s;
        }
        .otm-profile-btn:hover { border-color: #e53935; color: #b71c1c; }

        .otm-avatar {
          width: 26px; height: 26px;
          border-radius: 50%; object-fit: cover;
        }
        .otm-avatar--placeholder {
          display: inline-flex; align-items: center; justify-content: center;
          background: #fdeaea; color: #b71c1c; font-weight: 800;
        }

        .otm-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1.5px solid #f0dada; color: #6b4444;
          background: transparent;
        }
        .otm-icon-btn:hover { border-color: #e53935; color: #b71c1c; }

        .otm-toggler {
          border: 1.5px solid #f0dada !important;
          border-radius: 10px !important;
        }
        .otm-toggler:focus { box-shadow: none; }
      `}</style>
    </>
  );
}