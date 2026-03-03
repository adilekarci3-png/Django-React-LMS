import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import { useAuthStore } from "../../store/auth";

import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

export default function ESKEPBaseHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const [isLoggedIn] = useAuthStore((s) => [s.isLoggedIn]);
  const [baseRoles, subRoles] = useAuthStore((s) => [
    s.allUserData?.base_roles || [],
    s.allUserData?.sub_roles || [],
  ]);

  const isEskepKoordinator =
    baseRoles.includes("Koordinator") &&
    (
      subRoles.includes("ESKEPOgrenciKoordinator") ||
      subRoles.includes("ESKEPStajerKoordinator") ||
      subRoles.includes("ESKEPGenelKoordinator")
    );

  const canSeeContactMessages = subRoles.includes("ESKEPGenelKoordinator");

  const isEskepStajer =
    baseRoles.includes("Stajer") && subRoles.includes("ESKEPStajer");

  const isEskepOgrenci =
    baseRoles.includes("Ogrenci") && subRoles.includes("ESKEPOgrenci");

  const isEskepEgitmen =
    baseRoles.includes("Teacher") && subRoles.includes("ESKEPEgitmen");

  const onSubmit = (e) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    navigate(`/search?search=${encodeURIComponent(s)}`);
    setOpen(false);
  };

  return (
    <>
      <header className="eskep-header sticky-top border-0">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid px-3 px-lg-4">

            {/* Brand */}
            <Link to="/" className="navbar-brand eskep-nav-logo" onClick={() => setOpen(false)}>
              <span className="eskep-nav-logo-mark">
                <i className="bi bi-layers-fill"></i>
              </span>
              ESKEP
            </Link>

            {/* Mobile toggler */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn eskep-icon-btn"
                data-bs-toggle="collapse"
                data-bs-target="#eskep-search-mobile"
                aria-label="Ara"
              >
                <FaSearch size={13} />
              </button>
              <button
                className="navbar-toggler eskep-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#eskep-main-navbar"
                aria-label="Menüyü aç"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapse */}
            <div className="collapse navbar-collapse" id="eskep-main-navbar">
              <ul className="navbar-nav me-auto align-items-lg-center">

                <li className="nav-item">
                  <NavLink className="nav-link eskep-nav-link" to="/about-eskep">
                    <i className="bi bi-info-circle me-1"></i>Hakkımızda
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link eskep-nav-link" to="/org-chart">
                    <i className="bi bi-diagram-3 me-1"></i>Organizasyon
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link eskep-nav-link" to="/eskep/egitim-takvimi/">
                    <i className="bi bi-calendar3 me-1"></i>Eğitim Takvimi
                  </NavLink>
                </li>

                {/* Koordinatör menüsü */}
                {isEskepKoordinator && <KoordinatorMenu />}

                {canSeeContactMessages && (
                  <li className="nav-item">
                    <NavLink className="nav-link eskep-nav-link" to="/contact-messages">
                      <i className="bi bi-envelope-paper me-1"></i>İletişim Mesajları
                    </NavLink>
                  </li>
                )}

                {/* Stajer menüsü */}
                {isEskepStajer && <StajerMenu />}

                {/* Öğrenci menüsü */}
                {isEskepOgrenci && <OgrenciMenu />}

                {isEskepEgitmen && <EgitmenMenu />}
              </ul>

              {/* Search (desktop) */}
              <form className="d-none d-lg-block me-3" onSubmit={onSubmit} role="search">
                <div className="eskep-search-pill">
                  <i className="bi bi-search opacity-75"></i>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Ara"
                  />
                  <button className="btn btn-sm eskep-search-btn" type="submit">Ara</button>
                </div>
              </form>

              {/* Auth */}
              {isLoggedIn && isLoggedIn() ? (
                <Link to="/logout" className="eskep-btn-nav-outline">Çıkış</Link>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="eskep-btn-nav-outline">
                    <FaSignInAlt style={{ marginRight: 5 }} />Giriş Yap
                  </Link>
                  <Link to="/register" className="eskep-btn-nav-primary">
                    <FaUserPlus style={{ marginRight: 5 }} />Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile search */}
            <div className="collapse w-100 mt-2 d-lg-none" id="eskep-search-mobile">
              <form onSubmit={onSubmit}>
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

      {/* ── NAV STİLLERİ — beyaz arka plan, mavi/aqua aksan ── */}
      <style>{`
        .eskep-header {
          background: #fff;
          border-bottom: 1px solid #daedf0;
          box-shadow: 0 1px 8px rgba(15,163,177,0.07);
          z-index: 100;
        }

        .eskep-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 900; font-size: 1.12rem;
          color: #0b1c20; text-decoration: none; letter-spacing: -.01em;
          color:#000 !important;
        }
        .eskep-nav-logo-mark {
          width: 32px; height: 32px; border-radius: 10px;
          background: #0fa3b1;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px;
        }

        .eskep-nav-link {
          color: #4a6b72 !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          transition: background .15s, color .15s;
        }
        .eskep-nav-link:hover,
        .eskep-nav-link.active {
          background: #e6f8fa !important;
          color: #0a7081 !important;
        }

        /* ── Tüm dropdown menüler (KoordinatorMenu, StajerMenu, OgrenciMenu dahil) ── */

        /* Dropdown tetikleyici link */
        .eskep-header .dropdown > a,
        .eskep-header .dropdown > button,
        .eskep-header .nav-item.dropdown > .nav-link,
        .eskep-header .nav-item.dropdown > a {
          color: #4a6b72 !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          background: transparent !important;
          transition: background .15s, color .15s;
        }
        .eskep-header .dropdown > a:hover,
        .eskep-header .dropdown > button:hover,
        .eskep-header .nav-item.dropdown > .nav-link:hover,
        .eskep-header .nav-item.dropdown > a:hover,
        .eskep-header .nav-item.dropdown.show > .nav-link,
        .eskep-header .nav-item.dropdown.show > a {
          background: #e6f8fa !important;
          color: #0a7081 !important;
        }

        /* Dropdown panel */
        .eskep-header .dropdown-menu {
          background: #fff !important;
          border: 1px solid #daedf0 !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 28px rgba(15,163,177,0.12) !important;
          padding: 8px !important;
          min-width: 200px;
        }

        /* Dropdown başlıkları (varsa) */
        .eskep-header .dropdown-header,
        .eskep-header .dropdown-menu .menu-title,
        .eskep-header .dropdown-menu h6,
        .eskep-header .dropdown-menu .section-title {
          color: #0fa3b1 !important;
          font-size: 0.72rem !important;
          font-weight: 800 !important;
          letter-spacing: .08em !important;
          text-transform: uppercase !important;
          padding: 4px 10px 4px !important;
        }

        /* Dropdown item'lar */
        .eskep-header .dropdown-item,
        .eskep-header .dropdown-menu a,
        .eskep-header .dropdown-menu button {
          color: #0b1c20 !important;
          font-weight: 600 !important;
          font-size: 0.88rem !important;
          border-radius: 9px !important;
          padding: 8px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          transition: background .12s, color .12s !important;
          background: transparent !important;
          text-decoration: none !important;
        }
        .eskep-header .dropdown-item:hover,
        .eskep-header .dropdown-menu a:hover,
        .eskep-header .dropdown-menu button:hover {
          background: #e6f8fa !important;
          color: #0a7081 !important;
        }

        /* Dropdown içindeki ikonlar */
        .eskep-header .dropdown-item i,
        .eskep-header .dropdown-item svg,
        .eskep-header .dropdown-menu a i,
        .eskep-header .dropdown-menu a svg {
          color: #0fa3b1 !important;
          width: 1rem;
          text-align: center;
          flex-shrink: 0;
        }

        /* Divider */
        .eskep-header .dropdown-divider {
          border-color: #daedf0 !important;
          margin: 4px 8px !important;
        }

        /* ── Dropdown pozisyon düzeltme ── */
        .eskep-header .nav-item.dropdown {
          position: relative;
        }
        .eskep-header .nav-item.dropdown .dropdown-menu {
          position: absolute !important;
          left: 0 !important;
          right: auto !important;
          top: 100% !important;
          transform: none !important;
        }

        /* Mega menu panel (KoordinatorMenu çok sütunlu ise) */
        .eskep-header .dropdown-menu.mega,
        .eskep-header .mega-menu {
          min-width: 680px !important;
          padding: 16px !important;
          position: absolute !important;
          left: 0 !important;
          right: auto !important;
          top: 100% !important;
        }
        .eskep-header .mega-col,
        .eskep-header .menu-col {
          background: #f7fbfc !important;
          border-radius: 12px !important;
          padding: 12px !important;
          border: 1px solid #daedf0 !important;
        }
        .eskep-header .mega-title,
        .eskep-header .menu-col-title {
          color: #0fa3b1 !important;
          font-size: .72rem !important;
          text-transform: uppercase !important;
          letter-spacing: .08em !important;
          font-weight: 800 !important;
          margin-bottom: 6px !important;
        }
        .eskep-header .mega-item,
        .eskep-header .menu-col a {
          color: #0b1c20 !important;
          border-radius: 8px !important;
          padding: 6px 8px !important;
          font-size: 0.86rem !important;
          font-weight: 600 !important;
        }
        .eskep-header .mega-item:hover,
        .eskep-header .menu-col a:hover {
          background: #e6f8fa !important;
          color: #0a7081 !important;
        }
        .eskep-header .mega-divider,
        .eskep-header .menu-divider {
          background: #daedf0 !important;
        }

        /* Search */
        .eskep-search-pill {
          display: flex; align-items: center; gap: .5rem;
          background: #f7fbfc; border-radius: 999px;
          padding: .2rem .25rem .2rem .65rem;
          border: 1.5px solid #daedf0;
        }
        .eskep-search-pill input {
          border: 0; outline: 0; box-shadow: none !important;
          background: transparent; width: 200px; font-size: 0.88rem;
        }
        .eskep-search-btn {
          background: #0fa3b1; color: #fff;
          border-radius: 999px; font-weight: 700;
          font-size: 0.82rem; padding: 3px 14px; border: none;
        }
        .eskep-search-btn:hover { background: #0a7081; color: #fff; }

        /* Butonlar */
        .eskep-btn-nav-outline {
          padding: 7px 18px; border: 1.5px solid #daedf0;
          border-radius: 12px; background: transparent;
          font-weight: 700; font-size: 0.88rem;
          color: #4a6b72; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: border-color .15s, color .15s;
        }
        .eskep-btn-nav-outline:hover {
          border-color: #0fa3b1; color: #0a7081;
        }

        .eskep-btn-nav-primary {
          padding: 7px 20px; border-radius: 12px;
          background: #0fa3b1; color: #fff;
          font-weight: 800; font-size: 0.88rem; border: none;
          text-decoration: none; display: inline-flex; align-items: center;
          transition: background .15s, transform .12s;
        }
        .eskep-btn-nav-primary:hover {
          background: #0a7081; transform: translateY(-1px); color: #fff;
        }

        .eskep-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1.5px solid #daedf0; color: #4a6b72;
          background: transparent;
        }
        .eskep-icon-btn:hover { border-color: #0fa3b1; color: #0a7081; }

        .eskep-toggler {
          border: 1.5px solid #daedf0 !important;
          border-radius: 10px !important;
        }
        .eskep-toggler:focus { box-shadow: none; }
      `}</style>
    </>
  );
}