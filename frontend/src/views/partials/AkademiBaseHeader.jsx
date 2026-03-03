import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import useUserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import { ProfileContext } from "../plugin/Context";

function AkademiBaseHeader() {
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

    api
      .get(`user/profile/${user.user_id}/`)
      .then((r) => setProfile(r.data))
      .catch(() => {});

    api
      .get(`user-role-detail/`)
      .then((r) => setRoleData(r.data))
      .catch(() => {});
  }, [rehydrated, isLoggedIn, user?.user_id, api, setProfile]);

  if (!rehydrated) return null;

  const submitSearch = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    navigate(`/search/?search=${encodeURIComponent(q.trim())}`);
  };

  // 👇 burası önemli: hem base_roles hem de sub_roles'u al
  const { base_roles = [], sub_roles = [] } = roleData;

  return (
    <>
      <header className="akd-header sticky-top">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid px-3 px-lg-4">

            {/* Brand */}
            <Link to="/" className="navbar-brand akd-nav-logo">
              <span className="akd-nav-logo-mark">
                <i className="bi bi-mortarboard-fill"></i>
              </span>
              Akademi
            </Link>

            {/* Mobile toggler */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn akd-icon-btn"
                data-bs-toggle="collapse"
                data-bs-target="#global-search"
                aria-label="Ara"
              >
                <i className="bi bi-search"></i>
              </button>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#main-navbar"
                aria-label="Menüyü aç"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapse */}
            <div className="collapse navbar-collapse" id="main-navbar">
              <ul className="navbar-nav me-auto align-items-lg-center">

                <li className="nav-item">
                  <Link className="nav-link akd-nav-link" to="/about-akademi">
                    <i className="bi bi-info-circle me-1"></i>Hakkımızda
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link akd-nav-link" to="/contact">
                    <i className="bi bi-telephone me-1"></i>İletişim
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link akd-nav-link" to="/org-chart">
                    <i className="bi bi-diagram-3 me-1"></i>Organizasyon
                  </Link>
                </li>

                {/* AKADEMİ */}
                <li className="nav-item dropdown">
                  <a className="nav-link akd-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                    <i className="bi bi-mortarboard me-1"></i>Akademi
                  </a>
                  <ul className="dropdown-menu akd-dropdown rounded-4 shadow p-2">
                    <li>
                      <Link className="dropdown-item akd-dropdown-item rounded-3" to="/akademi/courses">
                        <i className="bi bi-book me-2"></i>Kurslar
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item akd-dropdown-item rounded-3" to="/akademi/videos">
                        <i className="bi bi-camera-video me-2"></i>Videolar
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item akd-dropdown-item rounded-3" to="/akademi/me/saved-videos">
                        <i className="bi bi-camera-video me-2"></i>Kurslarım
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* EĞİTMEN (MEGA) */}
                {base_roles.includes("Teacher") && (
                  <li className="nav-item dropdown dropdown-mega">
                    <a className="nav-link akd-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-easel2 me-1"></i>Eğitmen
                    </a>
                    <div className="dropdown-menu mega akd-mega rounded-4 shadow p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">Genel</div>
                            <Link to="/educator/dashboard" className="akd-mega-item">
                              <i className="bi bi-grid-fill"></i><span>Panel</span>
                            </Link>
                            <Link to="/educator/schedule" className="akd-mega-item">
                              <i className="bi bi-calendar3"></i><span>Programım</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">Canlı & Saat</div>
                            <Link to="/educator/live-ders-listesi" className="akd-mega-item">
                              <i className="bi bi-broadcast"></i><span>Canlı Derslerim</span>
                            </Link>
                            <Link to="/educator/add-canli-ders" className="akd-mega-item">
                              <i className="bi bi-camera-reels"></i><span>Canlı Ders Ekle</span>
                            </Link>
                            <Link to="/educator/add-lesson" className="akd-mega-item">
                              <i className="bi bi-alarm"></i><span>Ders Saati Ekle</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">İçeriklerim</div>
                            <Link to="/educator/video-create" className="akd-mega-item">
                              <i className="bi bi-film"></i><span>Video Oluştur</span>
                            </Link>
                            <Link to="/educator/webcam-record" className="akd-mega-item">
                              <i className="bi bi-webcam"></i><span>Video Ekle (Webcam)</span>
                            </Link>
                            <Link to="/educator/video-link-create" className="akd-mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Video Ekle</span>
                            </Link>
                            <div className="akd-mega-divider"></div>
                            <Link to="/educator/video-list" className="akd-mega-item">
                              <i className="bi bi-collection-play"></i><span>Videolarım</span>
                            </Link>
                            <Link to="/educator/created-videos" className="akd-mega-item">
                              <i className="bi bi-clapperboard"></i><span>Oluşturduğum Videolar</span>
                            </Link>
                            <Link to="/educator/youtube-video-list" className="akd-mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Videolarım</span>
                            </Link>
                            <div className="akd-mega-divider"></div>
                            <Link to="/educator/documents" className="akd-mega-item">
                              <i className="bi bi-file-earmark-text"></i><span>Dökümanlarım</span>
                            </Link>
                            <Link to="/educator/documents/create" className="akd-mega-item">
                              <i className="bi bi-file-arrow-up"></i><span>Döküman Ekle</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}

                {/* KOORDİNATÖR (MEGA) */}
                {base_roles.includes("Koordinator") && (
                  <li className="nav-item dropdown dropdown-mega">
                    <a className="nav-link akd-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person-gear me-1"></i>Koordinatör
                    </a>
                    <div className="dropdown-menu mega akd-mega rounded-4 shadow p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">Genel</div>
                            <Link to="/koordinator/egitmenlist" className="akd-mega-item">
                              <i className="bi bi-people-fill"></i><span>Eğitmen Listesi</span>
                            </Link>
                            <Link to="/koordinator/ogrencilist" className="akd-mega-item">
                              <i className="bi bi-person-lines-fill"></i><span>Öğrenci Listesi</span>
                            </Link>
                            {(sub_roles.includes("ESKEPGenelKoordinator") ||
                              sub_roles.includes("AkademiKoordinator")) && (
                              <Link to="/contact-messages" className="akd-mega-item">
                                <i className="bi bi-envelope-paper"></i><span>İletişim Mesajları</span>
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">Videolar</div>
                            <Link to="/koordinator/youtube-videolar" className="akd-mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Videoları</span>
                            </Link>
                            <Link to="/koordinator/egitmen-videolari" className="akd-mega-item">
                              <i className="bi bi-collection-play"></i><span>Eğitmen Videoları</span>
                            </Link>
                            <div className="akd-mega-divider"></div>
                            <Link to="/koordinator/video-kayitlari" className="akd-mega-item">
                              <i className="bi bi-people"></i><span>Tüm Video Kayıtları</span>
                            </Link>
                            <Link to="/koordinator/satin-almalar" className="akd-mega-item">
                              <i className="bi bi-bag-check"></i><span>Tüm Video Satın Almalar</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="akd-mega-col">
                            <div className="akd-mega-title">Dökümanlar</div>
                            <Link to="/koordinator/egitmen-dokumanlari" className="akd-mega-item">
                              <i className="bi bi-file-earmark-text"></i><span>Eğitmen Dökümanları</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}

                {/* ÖĞRENCİ */}
                {base_roles.includes("Ogrenci") && (
                  <li className="nav-item dropdown">
                    <a className="nav-link akd-nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-motherboard me-1"></i>Öğrenci
                    </a>
                    <ul className="dropdown-menu akd-dropdown rounded-4 shadow p-2">
                      <li>
                        <Link className="dropdown-item akd-dropdown-item rounded-3" to="/student/dashboard/">
                          Panel
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item akd-dropdown-item rounded-3" to="/student/courses/">
                          Kurslarım
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>

              {/* Search (desktop) */}
              <form className="d-none d-lg-block me-3" onSubmit={submitSearch}>
                <div className="akd-search-pill">
                  <i className="bi bi-search"></i>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Ara"
                  />
                  <button className="btn btn-sm akd-search-btn" type="submit">Ara</button>
                </div>
              </form>

              {/* Auth / Profile */}
              {!isLoggedIn ? (
                <div className="d-flex gap-2">
                  <Link to="/login/" className="akd-btn-nav-outline">Giriş Yap</Link>
                  <Link to="/register/" className="akd-btn-nav-primary">Kayıt Ol</Link>
                </div>
              ) : (
                <div className="dropdown">
                  <button
                    className="akd-profile-btn"
                    data-bs-toggle="dropdown"
                  >
                    {profile?.image ? (
                      <img src={profile.image} alt="" className="akd-avatar" />
                    ) : (
                      <span className="akd-avatar akd-avatar--placeholder">
                        {(profile?.full_name || "U")[0]?.toUpperCase?.()}
                      </span>
                    )}
                    <span className="d-none d-sm-inline">{profile?.full_name || "Hesabım"}</span>
                    <i className="bi bi-caret-down-fill small"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end akd-dropdown rounded-4 shadow p-2">
                    <li className="px-2 py-1 small text-muted">{profile?.email || ""}</li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item akd-dropdown-item rounded-3" to="/profile/">
                        <i className="bi bi-person me-2"></i>Profilim
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item akd-dropdown-item rounded-3" to="/settings/">
                        <i className="bi bi-gear me-2"></i>Ayarlar
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item akd-dropdown-item text-danger rounded-3" to="/logout/">
                        <i className="bi bi-box-arrow-right me-2"></i>Çıkış
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile search */}
            <div className="collapse w-100 mt-2 d-lg-none" id="global-search">
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

      {/* NAV STYLES — Yeşil Tema */}
      <style>{`
        .akd-header {
          background: #fff;
          border-bottom: 1px solid #e4ede9;
          box-shadow: 0 1px 8px rgba(22,160,90,0.05);
          z-index: 100;
        }

        .akd-nav-logo{
          display:flex;
          align-items:center;
          gap:10px;
          font-weight:900;
          font-size:1.12rem;
          color:#000 !important;   /* AKADEMİ yazısı SİYAH */
          text-decoration:none;
          letter-spacing:-.01em;
        }
        .akd-nav-logo-mark {
          width: 32px; height: 32px; border-radius: 10px;
          background: #16a05a;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px;
        }

        .akd-nav-link {
          color: #52756a !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          transition: background .15s, color .15s;
        }
        .akd-nav-link:hover {
          background: #e8f5ef;
          color: #0d7a42 !important;
        }

        /* Dropdown */
        .akd-dropdown { border: 1px solid #e4ede9 !important; }
        .akd-dropdown-item { color: #111c17 !important; font-weight: 600; }
        .akd-dropdown-item:hover { background: #e8f5ef !important; color: #0d7a42 !important; }

        /* Mega menu */
        .dropdown-mega .mega.akd-mega { min-width: 720px; }
        .akd-mega-col {
          background: #f8faf9;
          border-radius: 14px;
          padding: 12px;
          border: 1px solid #e4ede9;
        }
        .akd-mega-title {
          font-size: .76rem; text-transform: uppercase;
          letter-spacing: .08em; color: #16a05a;
          font-weight: 700; margin-bottom: 6px;
        }
        .akd-mega-item {
          display: flex; align-items: center; gap: .6rem;
          padding: .42rem .5rem; color: #111c17;
          text-decoration: none; border-radius: 8px;
          font-weight: 600; font-size: 0.88rem;
        }
        .akd-mega-item i { width: 1.1rem; text-align: center; color: #16a05a; }
        .akd-mega-item:hover { background: #e8f5ef; color: #0d7a42; }
        .akd-mega-divider {
          height: 1px; background: #e4ede9; margin: .3rem 0;
        }

        /* Search */
        .akd-search-pill {
          display: flex; align-items: center; gap: .5rem;
          background: #f8faf9; border-radius: 999px;
          padding: .2rem .25rem .2rem .65rem;
          border: 1.5px solid #e4ede9;
        }
        .akd-search-pill input {
          border: 0; outline: 0; box-shadow: none !important;
          background: transparent; width: 200px;
          font-size: 0.88rem;
        }
        .akd-search-btn {
          background: #16a05a; color: #fff;
          border-radius: 999px; font-weight: 700;
          font-size: 0.82rem; padding: 3px 14px;
          border: none;
        }
        .akd-search-btn:hover { background: #0d7a42; }

        /* Nav buttons */
        .akd-btn-nav-outline {
          padding: 7px 18px; border: 1.5px solid #e4ede9;
          border-radius: 12px; background: transparent;
          font-weight: 700; font-size: 0.88rem;
          color: #52756a; cursor: pointer;
          text-decoration: none; display: inline-flex; align-items: center;
          transition: border-color .15s, color .15s;
        }
        .akd-btn-nav-outline:hover { border-color: #16a05a; color: #0d7a42; }

        .akd-btn-nav-primary {
          padding: 7px 20px; border-radius: 12px;
          background: #16a05a; color: #fff;
          font-weight: 800; font-size: 0.88rem; border: none;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: background .15s, transform .12s;
        }
        .akd-btn-nav-primary:hover { background: #0d7a42; transform: translateY(-1px); color: #fff; }

        /* Profile */
        .akd-profile-btn {
          display: flex; align-items: center; gap: 8px;
          background: transparent; border: 1.5px solid #e4ede9;
          border-radius: 12px; padding: 5px 12px;
          font-weight: 700; font-size: 0.88rem; color: #52756a;
          cursor: pointer; transition: border-color .15s, color .15s;
        }
        .akd-profile-btn:hover { border-color: #16a05a; color: #0d7a42; }

        .akd-avatar {
          width: 26px; height: 26px;
          border-radius: 50%; object-fit: cover;
        }
        .akd-avatar--placeholder {
          display: inline-flex; align-items: center; justify-content: center;
          background: #e8f5ef; color: #0d7a42; font-weight: 800;
        }

        .akd-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1.5px solid #e4ede9; color: #52756a;
        }
        .akd-icon-btn:hover { border-color: #16a05a; color: #0d7a42; }
      `}</style>
    </>
  );
}

export default AkademiBaseHeader;