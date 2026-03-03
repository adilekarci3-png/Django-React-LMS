import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";
import HafizMenu from "../partials/menus/HafizMenu";
import HDMMenu from "./menus/HDMMenu";
import "./css/HDMGirisPage.css";

function HDMBaseHeader() {
  const [now, setNow] = useState(new Date());
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  // auth store'dan roller
  const [isLoggedIn] = useAuthStore((s) => [s.isLoggedIn]);
  const [baseRoles, subRoles] = useAuthStore((s) => [
    s.allUserData?.base_roles || [],
    s.allUserData?.sub_roles || [],
  ]);

  // sadece HDMKoordinator olan (ve base'de de Koordinator olan) kişiler görsün
  const isHDMKoordinator =
    baseRoles.includes("Koordinator") && subRoles.includes("HDMKoordinator");

  // diğer HDM rollerin de istersen ileride kullanırsın
  const isHDMStajer =
    baseRoles.includes("Stajer") && subRoles.includes("HDMStajer");
  const isHDMOgrenci =
    baseRoles.includes("Ogrenci") && subRoles.includes("HDMOgrenci");
  const isHDMEgitmen =
    baseRoles.includes("Teacher") && subRoles.includes("HDMEgitmen");
  const isHDMHafiz =
    baseRoles.includes("Hafiz") && subRoles.includes("HDMHafiz");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeTR = (d) =>
    d
      .toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");

  const onSubmit = (e) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    navigate(`/search?search=${encodeURIComponent(s)}`);
  };

  return (
    <>
      <header className="hdm-header sticky-top border-0">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid px-3 px-lg-4">

            {/* Brand */}
            <Link to="/" className="navbar-brand hdm-nav-logo">
              <span className="hdm-nav-logo-mark">
                <i className="bi bi-headphones"></i>
              </span>
              HDM
            </Link>

            {/* Mobile toggler */}
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <button
                className="btn hdm-icon-btn"
                data-bs-toggle="collapse"
                data-bs-target="#hdm-search-mobile"
                aria-label="Ara"
              >
                <i className="bi bi-search" style={{ fontSize: 13 }}></i>
              </button>
              <button
                className="navbar-toggler hdm-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#hdm-main-navbar"
                aria-label="Menüyü aç"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapse */}
            <div className="collapse navbar-collapse" id="hdm-main-navbar">
              <ul className="navbar-nav me-auto align-items-lg-center">

                <li className="nav-item">
                  <NavLink className="nav-link hdm-nav-link" to="/contact">
                    <i className="fas fa-phone me-1"></i>İletişim
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link hdm-nav-link" to="/hdm/hafizgeneltakvim/">
                    <i className="fas fa-calendar me-1"></i>Genel Takvim
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link hdm-nav-link" to="/about-hdm">
                    <i className="fas fa-address-card me-1"></i>Hakkımızda
                  </NavLink>
                </li>

                {/* HDM ana menü */}
                <HDMMenu />

                {/* SADECE HDM KOORDİNATÖR */}
                {isHDMKoordinator && <KoordinatorMenu />}

                {/* Dilersen ileride açarsın
                {isHDMStajer && <StajerMenu />}
                {isHDMOgrenci && <OgrenciMenu />}
                {isHDMEgitmen && <EgitmenMenu />}
                {isHDMHafiz && <HafizMenu />} */}
              </ul>

              {/* Search (desktop) */}
              <form className="d-none d-lg-block me-3" onSubmit={onSubmit} role="search">
                <div className="hdm-search-pill">
                  <i className="bi bi-search opacity-75"></i>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Ara"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Ara"
                  />
                  <button className="btn btn-sm hdm-search-btn" type="submit">Ara</button>
                </div>
              </form>

              {/* Saat */}
              <span className="d-none d-lg-inline hdm-clock me-2">{timeTR(now)}</span>

              {/* Auth */}
              {isLoggedIn && isLoggedIn() ? (
                <Link to="/logout" className="hdm-btn-nav-outline">Çıkış</Link>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="hdm-btn-nav-outline">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Giriş Yap
                  </Link>
                  <Link to="/register" className="hdm-btn-nav-primary">
                    <i className="bi bi-person-plus me-1"></i>Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile search */}
            <div className="collapse w-100 mt-2 d-lg-none" id="hdm-search-mobile">
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

      {/* ── NAV STİLLERİ — beyaz arka plan, mor/violet aksan ── */}
      <style>{`
        .hdm-header {
          background: #fff;
          border-bottom: 1px solid #ede9fe;
          box-shadow: 0 1px 8px rgba(124,58,237,0.07);
          z-index: 100;
        }

        .hdm-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 900; font-size: 1.12rem;
          color: #1a0a2e; text-decoration: none; letter-spacing: -.01em;
          color:#000 !important;
        }
        .hdm-nav-logo-mark {
          width: 32px; height: 32px; border-radius: 10px;
          background: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px;
        }

        .hdm-nav-link {
          color: #6b5b9a !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          transition: background .15s, color .15s;
        }
        .hdm-nav-link:hover,
        .hdm-nav-link.active {
          background: #f5f3ff !important;
          color: #5b21b6 !important;
        }

        /* ── Tüm dropdown tetikleyiciler (HDMMenu, KoordinatorMenu vb.) ── */
        .hdm-header .dropdown > a,
        .hdm-header .dropdown > button,
        .hdm-header .nav-item.dropdown > .nav-link,
        .hdm-header .nav-item.dropdown > a {
          color: #6b5b9a !important;
          font-weight: 600;
          font-size: 0.91rem;
          padding: 6px 14px !important;
          border-radius: 10px;
          background: transparent !important;
          transition: background .15s, color .15s;
        }
        .hdm-header .dropdown > a:hover,
        .hdm-header .dropdown > button:hover,
        .hdm-header .nav-item.dropdown > .nav-link:hover,
        .hdm-header .nav-item.dropdown > a:hover,
        .hdm-header .nav-item.dropdown.show > .nav-link,
        .hdm-header .nav-item.dropdown.show > a {
          background: #f5f3ff !important;
          color: #5b21b6 !important;
        }

        /* Dropdown paneli */
        .hdm-header .dropdown-menu {
          background: #fff !important;
          border: 1px solid #ede9fe !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 28px rgba(124,58,237,0.12) !important;
          padding: 8px !important;
          min-width: 200px;
        }

        /* Dropdown başlıkları */
        .hdm-header .dropdown-header,
        .hdm-header .dropdown-menu .menu-title,
        .hdm-header .dropdown-menu h6,
        .hdm-header .dropdown-menu .section-title {
          color: #7c3aed !important;
          font-size: 0.72rem !important;
          font-weight: 800 !important;
          letter-spacing: .08em !important;
          text-transform: uppercase !important;
          padding: 4px 10px 4px !important;
        }

        /* Dropdown item'lar */
        .hdm-header .dropdown-item,
        .hdm-header .dropdown-menu a,
        .hdm-header .dropdown-menu button {
          color: #1a0a2e !important;
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
        .hdm-header .dropdown-item:hover,
        .hdm-header .dropdown-menu a:hover,
        .hdm-header .dropdown-menu button:hover {
          background: #f5f3ff !important;
          color: #5b21b6 !important;
        }

        /* Dropdown ikonlar */
        .hdm-header .dropdown-item i,
        .hdm-header .dropdown-item svg,
        .hdm-header .dropdown-menu a i,
        .hdm-header .dropdown-menu a svg {
          color: #7c3aed !important;
          width: 1rem;
          text-align: center;
          flex-shrink: 0;
        }

        /* Divider */
        .hdm-header .dropdown-divider {
          border-color: #ede9fe !important;
          margin: 4px 8px !important;
        }

        /* Dropdown pozisyon */
        .hdm-header .nav-item.dropdown {
          position: relative;
        }
        .hdm-header .nav-item.dropdown .dropdown-menu {
          position: absolute !important;
          left: 0 !important;
          right: auto !important;
          top: 100% !important;
          transform: none !important;
        }

        /* Mega menu */
        .hdm-header .dropdown-menu.mega,
        .hdm-header .mega-menu {
          min-width: 680px !important;
          padding: 16px !important;
          position: absolute !important;
          left: 0 !important;
          right: auto !important;
          top: 100% !important;
        }
        .hdm-header .mega-col,
        .hdm-header .menu-col {
          background: #f5f3ff !important;
          border-radius: 12px !important;
          padding: 12px !important;
          border: 1px solid #ede9fe !important;
        }
        .hdm-header .mega-title,
        .hdm-header .menu-col-title {
          color: #7c3aed !important;
          font-size: .72rem !important;
          text-transform: uppercase !important;
          letter-spacing: .08em !important;
          font-weight: 800 !important;
          margin-bottom: 6px !important;
        }
        .hdm-header .mega-item,
        .hdm-header .menu-col a {
          color: #1a0a2e !important;
          border-radius: 8px !important;
          padding: 6px 8px !important;
          font-size: 0.86rem !important;
          font-weight: 600 !important;
        }
        .hdm-header .mega-item:hover,
        .hdm-header .menu-col a:hover {
          background: #ede9fe !important;
          color: #5b21b6 !important;
        }
        .hdm-header .mega-divider,
        .hdm-header .menu-divider {
          background: #ede9fe !important;
        }

        /* Saat */
        .hdm-clock {
          background: #f5f3ff;
          color: #5b21b6;
          border: 1px solid #ede9fe;
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        /* Search pill */
        .hdm-search-pill {
          display: flex; align-items: center; gap: .5rem;
          background: #f5f3ff; border-radius: 999px;
          padding: .2rem .25rem .2rem .65rem;
          border: 1.5px solid #ede9fe;
        }
        .hdm-search-pill input {
          border: 0; outline: 0; box-shadow: none !important;
          background: transparent; width: 200px; font-size: 0.88rem;
        }
        .hdm-search-btn {
          background: #7c3aed; color: #fff;
          border-radius: 999px; font-weight: 700;
          font-size: 0.82rem; padding: 3px 14px; border: none;
        }
        .hdm-search-btn:hover { background: #5b21b6; color: #fff; }

        /* Auth butonlar */
        .hdm-btn-nav-outline {
          padding: 7px 18px; border: 1.5px solid #ede9fe;
          border-radius: 12px; background: transparent;
          font-weight: 700; font-size: 0.88rem;
          color: #6b5b9a; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: border-color .15s, color .15s;
        }
        .hdm-btn-nav-outline:hover {
          border-color: #7c3aed; color: #5b21b6;
        }

        .hdm-btn-nav-primary {
          padding: 7px 20px; border-radius: 12px;
          background: #7c3aed; color: #fff;
          font-weight: 800; font-size: 0.88rem; border: none;
          text-decoration: none; display: inline-flex; align-items: center;
          transition: background .15s, transform .12s;
        }
        .hdm-btn-nav-primary:hover {
          background: #5b21b6; transform: translateY(-1px); color: #fff;
        }

        .hdm-icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1.5px solid #ede9fe; color: #6b5b9a;
          background: transparent;
        }
        .hdm-icon-btn:hover { border-color: #7c3aed; color: #5b21b6; }

        .hdm-toggler {
          border: 1.5px solid #ede9fe !important;
          border-radius: 10px !important;
        }
        .hdm-toggler:focus { box-shadow: none; }
      `}</style>
    </>
  );
}

export default HDMBaseHeader;