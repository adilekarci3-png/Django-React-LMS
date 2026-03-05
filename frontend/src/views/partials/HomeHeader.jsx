import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./css/HomeHeader.css";


function HomeHeader() {
  const navClass = ({ isActive }) =>
    `ehad-nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="ehad-header sticky-top">
      <nav className="navbar navbar-expand-lg ehad-navbar">
        <div className="ehad-container">
          <Link to="/" className="ehad-brand">
            <span className="ehad-brand-dot" aria-hidden="true" />
            Sinaps
          </Link>

          <button
            className="navbar-toggler ehad-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#ehadMainNav"
            aria-controls="ehadMainNav"
            aria-expanded="false"
            aria-label="Menüyü Aç/Kapat"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="ehadMainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <NavLink end to="/" className={navClass}>
                  Anasayfa
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/about-ehad" className={navClass}>
                  Hakkımızda
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/academy" className={navClass}>
                  Akademi
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/contact" className={navClass}>
                  İletişim
                </NavLink>
              </li>

              <li className="nav-item d-lg-flex align-items-center ms-lg-3 gap-2 mt-2 mt-lg-0">
                <NavLink to="/login" className="btn ehad-btn-ghost btn-sm">
                  Giriş Yap
                </NavLink>
                <NavLink to="/register" className="btn ehad-btn-primary btn-sm">
                  Kayıt Ol
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HomeHeader;
