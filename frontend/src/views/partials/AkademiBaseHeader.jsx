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

    api.get(`user/profile/${user.user_id}/`).then(r => setProfile(r.data)).catch(() => {});
    api.get(`user-role-detail/`).then(r => setRoleData(r.data)).catch(() => {});
  }, [rehydrated, isLoggedIn, user?.user_id, api, setProfile]);

  if (!rehydrated) return null;

  const submitSearch = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    navigate(`/search/?search=${encodeURIComponent(q.trim())}`);
  };

  const { base_roles = [] } = roleData;

  return (
    <>
      {/* Header */}
      <header className="akd-header sticky-top border-0">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container-fluid px-3 px-lg-4">

            {/* Brand */}
            <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
              <span className="brand-pill">AKADEMİ</span>
              
            </Link>

            {/* Right cluster (mobile first) */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button className="btn btn-icon btn-outline-light" data-bs-toggle="collapse" data-bs-target="#global-search" aria-label="Ara">
                <i className="bi bi-search"></i>
              </button>
              <button className="navbar-toggler shadow-0 border-0" type="button" data-bs-toggle="collapse" data-bs-target="#main-navbar" aria-label="Menüyü aç">
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapse */}
            <div className="collapse navbar-collapse" id="main-navbar">
              {/* Left nav */}
              <ul className="navbar-nav me-auto align-items-lg-center">
                <li className="nav-item">
                  <Link className="nav-link" to="/about-akademi"><i className="bi bi-info-circle me-1"></i>Hakkımızda</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact"><i className="bi bi-telephone me-1"></i>İletişim</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/org-chart"><i className="bi bi-diagram-3 me-1"></i>Organizasyon</Link>
                </li>

                {/* AKADEMİ */}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                    <i className="bi bi-mortarboard me-1"></i>Akademi
                  </a>
                  <ul className="dropdown-menu rounded-4 shadow p-2">
                    <li><Link className="dropdown-item rounded-3" to="/akademi/courses"><i className="bi bi-book me-2"></i>Kurslar</Link></li>
                    <li><Link className="dropdown-item rounded-3" to="/akademi/videos"><i className="bi bi-camera-video me-2"></i>Videolar</Link></li>
                  </ul>
                </li>

                {/* EĞİTMEN (MEGA) */}
                {base_roles.includes("Teacher") && (
                  <li className="nav-item dropdown dropdown-mega">
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-easel2 me-1"></i>Eğitmen
                    </a>
                    <div className="dropdown-menu mega rounded-4 shadow p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">Genel</div>
                            <Link to="/educator/dashboard" className="mega-item">
                              <i className="bi bi-grid-fill"></i><span>Panel</span>
                            </Link>
                            <Link to="/educator/schedule" className="mega-item">
                              <i className="bi bi-calendar3"></i><span>Programım</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">Canlı & Saat</div>
                            <Link to="/educator/live-ders-listesi" className="mega-item">
                              <i className="bi bi-broadcast"></i><span>Canlı Derslerim</span>
                            </Link>
                            <Link to="/educator/add-canli-ders" className="mega-item">
                              <i className="bi bi-camera-reels"></i><span>Canlı Ders Ekle</span>
                            </Link>
                            <Link to="/educator/add-lesson" className="mega-item">
                              <i className="bi bi-alarm"></i><span>Ders Saati Ekle</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">İçeriklerim</div>
                            <Link to="/educator/video-create" className="mega-item">
                              <i className="bi bi-film"></i><span>Video Oluştur</span>
                            </Link>
                            <Link to="/educator/webcam-record" className="mega-item">
                              <i className="bi bi-webcam"></i><span>Video Ekle (Webcam)</span>
                            </Link>
                            <Link to="/educator/video-link-create" className="mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Video Ekle</span>
                            </Link>
                            <div className="mega-divider"></div>
                            <Link to="/educator/video-list" className="mega-item">
                              <i className="bi bi-collection-play"></i><span>Videolarım</span>
                            </Link>
                            <Link to="/educator/created-videos" className="mega-item">
                              <i className="bi bi-clapperboard"></i><span>Oluşturduğum Videolar</span>
                            </Link>
                            <Link to="/educator/youtube-video-list" className="mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Videolarım</span>
                            </Link>
                            <div className="mega-divider"></div>
                            <Link to="/educator/documents" className="mega-item">
                              <i className="bi bi-file-earmark-text"></i><span>Dökümanlarım</span>
                            </Link>
                            <Link to="/educator/documents/create" className="mega-item">
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
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person-gear me-1"></i>Koordinatör
                    </a>
                    <div className="dropdown-menu mega rounded-4 shadow p-3">
                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">Genel</div>
                            <Link to="/koordinator/egitmenlist" className="mega-item">
                              <i className="bi bi-people-fill"></i><span>Eğitmen Listesi</span>
                            </Link>
                            <Link to="/koordinator/ogrencilist" className="mega-item">
                              <i className="bi bi-person-lines-fill"></i><span>Öğrenci Listesi</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">Videolar</div>
                            <Link to="/koordinator/youtube-videolar" className="mega-item">
                              <i className="bi bi-youtube"></i><span>YouTube Videoları</span>
                            </Link>
                            <Link to="/koordinator/egitmen-videolari" className="mega-item">
                              <i className="bi bi-collection-play"></i><span>Eğitmen Videoları</span>
                            </Link>
                            <div className="mega-divider"></div>
                            <Link to="/koordinator/video-kayitlari" className="mega-item">
                              <i className="bi bi-people"></i><span>Tüm Video Kayıtları</span>
                            </Link>
                            <Link to="/koordinator/satin-almalar" className="mega-item">
                              <i className="bi bi-bag-check"></i><span>Tüm Video Satın Almalar</span>
                            </Link>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="mega-col">
                            <div className="mega-title">Dökümanlar</div>
                            <Link to="/koordinator/egitmen-dokumanlari" className="mega-item">
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
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-motherboard me-1"></i>Öğrenci
                    </a>
                    <ul className="dropdown-menu rounded-4 shadow p-2">
                      <li><Link className="dropdown-item rounded-3" to="/student/dashboard/">Panel</Link></li>
                      <li><Link className="dropdown-item rounded-3" to="/student/courses/">Kurslarım</Link></li>
                    </ul>
                  </li>
                )}

                {/* TEMSİLCİ */}
                {base_roles.includes("Agent") && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/temsilci/hafizbilgi/list/"><i className="bi bi-briefcase me-1"></i>Temsilci</Link>
                  </li>
                )}
              </ul>

              {/* Search (desktop) */}
              <form className="d-none d-lg-block me-3" onSubmit={submitSearch}>
                <div className="search-pill">
                  <i className="bi bi-search opacity-75"></i>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Ara"
                  />
                  <button className="btn btn-sm btn-light rounded-pill" type="submit">Ara</button>
                </div>
              </form>

              {/* Auth / Profile */}
              {!isLoggedIn ? (
                <div className="d-flex gap-2">
                  <Link to="/login/" className="btn btn-light btn-sm rounded-pill px-3">Giriş</Link>
                  <Link to="/register/" className="btn btn-outline-light btn-sm rounded-pill px-3">Kayıt</Link>
                </div>
              ) : (
                <div className="dropdown">
                  <button className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-2 px-2" data-bs-toggle="dropdown">
                    {profile?.image ? (
                      <img src={profile.image} alt="" className="avatar" />
                    ) : (
                      <span className="avatar placeholder">{(profile?.full_name || "U")[0]?.toUpperCase?.()}</span>
                    )}
                    <span className="d-none d-sm-inline">{profile?.full_name || "Hesabım"}</span>
                    <i className="bi bi-caret-down-fill small"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end rounded-4 shadow p-2">
                    <li className="px-2 py-1 small text-muted">{profile?.email || ""}</li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item rounded-3" to="/profile/"><i className="bi bi-person me-2"></i>Profilim</Link></li>
                    <li><Link className="dropdown-item rounded-3" to="/settings/"><i className="bi bi-gear me-2"></i>Ayarlar</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item text-danger rounded-3" to="/logout/"><i className="bi bi-box-arrow-right me-2"></i>Çıkış</Link></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile search */}
            <div className="collapse w-100 mt-2 d-lg-none" id="global-search">
              <form onSubmit={submitSearch}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                  <input className="form-control border-0" placeholder="Ara" value={q} onChange={(e)=>setQ(e.target.value)} />
                  <button className="btn btn-light" type="submit">Ara</button>
                </div>
              </form>
            </div>

          </div>
        </nav>
      </header>

      {/* THEME & HEADER STYLES */}
      <style>{`
        :root{
          --akd-bg-1:#023e8a;
          --akd-bg-2:#03045e;
          --akd-bg-3:#0077b6;
          --akd-fg:#eaf1ff;
          --akd-muted: rgba(255,255,255,.80);
          --akd-pill-grad: linear-gradient(90deg,#7aa2ff,#c0d0ff);
          --akd-glass: rgba(10, 17, 40, 0.65);
          --akd-card-bg: rgba(255,255,255,.88);
          --akd-shadow: 0 10px 30px rgba(2,62,138,.25);
          --akd-radius: 16px;
        }

        .text-muted-100 { color: var(--akd-muted); }
        .brand-pill{
          background: var(--akd-pill-grad);
          color:#0b1a2b; padding:.25rem .6rem; border-radius:999px; font-weight:800; letter-spacing:.02em;
        }

        .akd-header{
          background:
            radial-gradient(1200px 400px at 80% -10%, rgba(255,255,255,.08), transparent 60%),
            radial-gradient(900px 300px at -10% 120%, rgba(255,255,255,.06), transparent 60%),
            linear-gradient(90deg, var(--akd-bg-1), var(--akd-bg-2) 40%, var(--akd-bg-3));
          color: var(--akd-fg);
          box-shadow: var(--akd-shadow);
          backdrop-filter: saturate(160%) blur(10px);
        }

        .navbar .nav-link { color: var(--akd-fg); opacity:.9; }
        .navbar .nav-link:hover, .navbar .dropdown-item:hover { opacity:1; }

        .dropdown-menu { border:0; }
        .dropdown-mega .mega { min-width: 720px; }
        .mega-col { background: var(--akd-card-bg); border-radius: var(--akd-radius); padding:12px; }
        .mega-title { font-size:.8rem; text-transform:uppercase; letter-spacing:.04em; color:#334155; margin-bottom:6px; }
        .mega-item {
          display:flex; align-items:center; gap:.6rem; padding:.45rem .55rem; color:#0b2447; text-decoration:none; border-radius:10px;
        }
        .mega-item i { width:1.1rem; text-align:center; }
        .mega-item:hover { background: rgba(0,0,0,.06); }
        .mega-divider { height:1px; background: rgba(0,0,0,.08); margin:.35rem 0; }

        .search-pill {
          display:flex; align-items:center; gap:.5rem; background:#fff; border-radius:999px; padding:.2rem .25rem .2rem .6rem; border:1px solid rgba(255,255,255,.15);
        }
        .search-pill input { border:0; outline:0; box-shadow:none; width:220px; }

        .btn-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:10px; }
        .avatar { width:26px; height:26px; border-radius:50%; object-fit:cover; }
        .avatar.placeholder { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:#fff; color:#0b2447; font-weight:800; }
      `}</style>
    </>
  );
}

export default AkademiBaseHeader;
