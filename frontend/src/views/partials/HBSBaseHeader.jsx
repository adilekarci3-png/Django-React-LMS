import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";
import "./css/hbs-theme.css";

function HBSBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const api = useAxios();

  // store'dan parça parça alıyoruz
  const rehydrated  = useAuthStore((s) => s.rehydrated);
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn);
  const logout      = useAuthStore((s) => s.logout);
  const setRoleData = useAuthStore((s) => s.setRoleData);
  const hasSubRole  = useAuthStore((s) => s.hasSubRole);

  // base/sub roller (user-role-detail çağrısından sonra dolacak)
  const baseRoles = useAuthStore((s) => s.allUserData?.base_roles || []);
  const subRoles  = useAuthStore((s) => s.allUserData?.sub_roles || []);

  useEffect(() => {
    if (!rehydrated) return;

    if (!isLoggedIn?.()) {
      navigate("/login/");
      return;
    }

    // rollerimizi yenileyelim
    api
      .get("user-role-detail/")
      .then((res) => setRoleData(res.data))
      .catch((err) => console.error("Rol bilgisi alınamadı:", err));
  }, [rehydrated, isLoggedIn, api, navigate, setRoleData]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) navigate(`/search/?search=${encodeURIComponent(q)}`);
  };

  // "HBSKoordinator" sub rolü + "Agent" base rolü varsa gör
  const canSeeContactMessages =
    isLoggedIn?.() &&
    subRoles.includes("HBSKoordinator") &&
    baseRoles.includes("Agent");

  return (
    <>
      <header className="hbs-header sticky-top border-0">
        <nav className="navbar navbar-expand-lg" aria-label="HBS üst menü">
          <div className="container-fluid px-3 px-lg-4">

            {/* Marka */}
            <Link className="navbar-brand hbs-nav-logo" to="/">
              <span className="hbs-nav-logo-mark">
                <i className="bi bi-person-badge-fill"></i>
              </span>
              HBS
            </Link>

            {/* Sağ taraftaki mobil buton grubu */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn hbs-icon-btn"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#hbsSearchMobile"
                aria-controls="hbsSearchMobile"
                aria-expanded="false"
                aria-label="Arama"
              >
                <i className="bi bi-search" />
              </button>
              <button
                className="navbar-toggler hbs-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#hbsNav"
                aria-controls="hbsNav"
                aria-expanded="false"
                aria-label="Menüyü Aç/Kapat"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Ana menü */}
            <div className="collapse navbar-collapse" id="hbsNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">

                <li className="nav-item">
                  <NavLink className="nav-link hbs-nav-link" to="/about-hbs">
                    <i className="bi bi-info-circle me-1" />
                    Hakkımızda
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link hbs-nav-link" to="/contact">
                    <i className="bi bi-telephone me-1" />
                    İletişim
                  </NavLink>
                </li>

                {/* YENİ: sadece HBSKoordinator + Agent olanlara */}
                {canSeeContactMessages && (
                  <li className="nav-item">
                    <NavLink
                      className="nav-link hbs-nav-link"
                      to="/contact/messages/?subject_slug=hbs"
                    >
                      <i className="bi bi-inbox me-1" />
                      İletişim Mesajları
                    </NavLink>
                  </li>
                )}

                {/* Temsilci ise dropdown, değilse direkt link */}
                {isLoggedIn?.() && hasSubRole("HBSTemsilci") ? (
                  <li className="nav-item dropdown">
                    <button
                      className="nav-link hbs-nav-link dropdown-toggle btn btn-link p-0"
                      id="hbsDrop"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-clipboard-check me-1" />
                      Hafız İşlemleri
                    </button>
                    <ul className="dropdown-menu hbs-dropdown" aria-labelledby="hbsDrop">
                      <li>
                        <NavLink className="dropdown-item hbs-dropdown-item" to="/hafizbilgi/create-hafizbilgi/">
                          <i className="bi bi-journal-plus"></i>Hafız Bilgi Ekle
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item hbs-dropdown-item" to="/hafizbilgi/list/">
                          <i className="bi bi-people"></i>Hafız Bilgileri
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <NavLink
                      className="nav-link hbs-nav-link"
                      to="/hafizbilgi/create-hafizbilgi/"
                    >
                      <i className="bi bi-journal-plus me-1" />
                      Hafız Bilgi Ekle
                    </NavLink>
                  </li>
                )}
              </ul>

              {/* Masaüstü arama + auth */}
              <div className="d-none d-lg-flex align-items-center gap-2">
                <div className="hbs-search-pill">
                  <i className="bi bi-search opacity-75" />
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ara"
                    aria-label="HBS içinde ara"
                  />
                  <button className="btn btn-sm hbs-search-btn" onClick={handleSearch}>
                    Ara
                  </button>
                </div>

                {isLoggedIn?.() ? (
                  <>
                    <Link to="/profile" className="hbs-btn-nav-outline">Profil</Link>
                    <button className="hbs-btn-nav-danger" onClick={logout}>Çıkış</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="hbs-btn-nav-outline">Giriş Yap</Link>
                    <Link to="/register" className="hbs-btn-nav-primary">Kayıt Ol</Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobil arama */}
            <div className="collapse w-100 mt-2 d-lg-none" id="hbsSearchMobile">
              <div className="hbs-search-pill w-100">
                <i className="bi bi-search opacity-75" />
                <input
                  type="search"
                  className="form-control form-control-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ara"
                  aria-label="HBS içinde ara"
                />
                <button className="btn btn-sm hbs-search-btn" onClick={handleSearch}>
                  Ara
                </button>
              </div>
            </div>

          </div>{/* /container-fluid */}
        </nav>
      </header>

      {/* ── NAV STİLLERİ — beyaz arka plan, sarı/amber aksan ── */}
      <style>{`
        .hbs-header {
          background: #fff;
          border-bottom: 1px solid #fde68a;
          box-shadow: 0 1px 8px rgba(217,119,6,0.07);
          z-index: 100;
        }

        /* Logo */
        .hbs-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 900; font-size: 1.12rem;
          color: #1c1000; text-decoration: none; letter-spacing: -.01em;
        }
        .hbs-nav-logo-mark {
          width: 32px; height: 32px; border-radius: 10px;
          background: #d97706;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px;
        }

        /* Nav linkleri */
        .hbs-nav-link {
          color: #78570a !important;
          font-weight: 600; font-size: 0.91rem;
          padding: 6px 14px !important; border-radius: 10px;
          transition: background .15s, color .15s;
        }
        .hbs-nav-link:hover, .hbs-nav-link.active {
          background: #fffbeb !important; color: #92400e !important;
        }

        /* Dropdown tetikleyiciler */
        .hbs-header .dropdown > a,
        .hbs-header .dropdown > button,
        .hbs-header .nav-item.dropdown > .nav-link,
        .hbs-header .nav-item.dropdown > a {
          color: #78570a !important;
          font-weight: 600; font-size: 0.91rem;
          padding: 6px 14px !important; border-radius: 10px;
          background: transparent !important;
          transition: background .15s, color .15s;
        }
        .hbs-header .dropdown > a:hover,
        .hbs-header .dropdown > button:hover,
        .hbs-header .nav-item.dropdown > .nav-link:hover,
        .hbs-header .nav-item.dropdown.show > .nav-link {
          background: #fffbeb !important; color: #92400e !important;
        }

        /* Dropdown paneli */
        .hbs-dropdown {
          background: #fff !important;
          border: 1px solid #fde68a !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 28px rgba(217,119,6,0.12) !important;
          padding: 8px !important;
          min-width: 200px;
        }

        /* Dropdown pozisyon */
        .hbs-header .nav-item.dropdown { position: relative; }
        .hbs-header .nav-item.dropdown .dropdown-menu {
          position: absolute !important;
          left: 0 !important; right: auto !important;
          top: 100% !important; transform: none !important;
        }

        /* Dropdown item */
        .hbs-dropdown-item,
        .hbs-header .dropdown-item {
          color: #1c1000 !important;
          font-weight: 600 !important; font-size: 0.88rem !important;
          border-radius: 9px !important; padding: 8px 12px !important;
          display: flex !important; align-items: center !important; gap: 8px !important;
          transition: background .12s, color .12s !important;
          background: transparent !important; text-decoration: none !important;
        }
        .hbs-dropdown-item:hover,
        .hbs-header .dropdown-item:hover {
          background: #fffbeb !important; color: #92400e !important;
        }
        .hbs-dropdown-item i { color: #d97706 !important; }
        .hbs-header .dropdown-divider { border-color: #fde68a !important; margin: 4px 8px !important; }

        /* Search */
        .hbs-search-pill {
          display: flex; align-items: center; gap: .5rem;
          background: #fffbeb; border-radius: 999px;
          padding: .2rem .25rem .2rem .65rem;
          border: 1.5px solid #fde68a;
        }
        .hbs-search-pill .form-control {
          border: 0; outline: 0; box-shadow: none !important;
          background: transparent; width: 180px; font-size: 0.88rem; color: #1c1000;
        }
        .hbs-search-pill .form-control::placeholder { color: #78570a; }
        .hbs-search-btn {
          background: #d97706; color: #fff; border-radius: 999px;
          font-weight: 700; font-size: 0.82rem; padding: 3px 14px; border: none;
        }
        .hbs-search-btn:hover { background: #92400e; color: #fff; }

        /* Auth butonlar */
        .hbs-btn-nav-outline {
          padding: 7px 18px; border: 1.5px solid #fde68a; border-radius: 12px;
          background: transparent; font-weight: 700; font-size: 0.88rem;
          color: #78570a; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: border-color .15s, color .15s;
        }
        .hbs-btn-nav-outline:hover { border-color: #d97706; color: #92400e; }

        .hbs-btn-nav-primary {
          padding: 7px 20px; border-radius: 12px; background: #d97706; color: #fff;
          font-weight: 800; font-size: 0.88rem; border: none; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: background .15s, transform .12s;
        }
        .hbs-btn-nav-primary:hover { background: #92400e; transform: translateY(-1px); color: #fff; }

        .hbs-btn-nav-danger {
          padding: 7px 18px; border-radius: 12px;
          background: #fee2e2; color: #991b1b; font-weight: 700;
          font-size: 0.88rem; border: 1.5px solid #fecaca;
          display: inline-flex; align-items: center; cursor: pointer;
          transition: background .15s, color .15s;
        }
        .hbs-btn-nav-danger:hover { background: #fecaca; color: #7f1d1d; }

        /* Icon btn mobil */
        .hbs-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1.5px solid #fde68a; color: #78570a;
          background: transparent;
        }
        .hbs-icon-btn:hover { border-color: #d97706; color: #92400e; }

        .hbs-toggler { border: 1.5px solid #fde68a !important; border-radius: 10px !important; }
        .hbs-toggler:focus { box-shadow: none; }
      `}</style>
    </>
  );
}

export default HBSBaseHeader;