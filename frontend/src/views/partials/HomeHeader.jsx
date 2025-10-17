import React from "react";
import { NavLink, Link } from "react-router-dom";

function HomeHeader() {
  return (
    <header className="sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg header-glass">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold text-white">
            <span className="brand-badge me-2" />
            EHAD Akademi
          </Link>

          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#ehadMainNav"
            aria-controls="ehadMainNav"
            aria-expanded="false"
            aria-label="Menüyü Aç/Kapat"
          >
            <span className="navbar-toggler-icon navbar-toggler-icon-white" />
          </button>

          <div className="collapse navbar-collapse" id="ehadMainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item">
                <NavLink end to="/" className="nav-link nav-link-ghost">
                  Anasayfa
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about-ehad" className="nav-link nav-link-ghost">
                  Hakkımızda
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/academy" className="nav-link nav-link-ghost">
                  Akademi
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className="nav-link nav-link-ghost">
                  İletişim
                </NavLink>
              </li>

              <li className="nav-item d-lg-flex ms-lg-3">
                <NavLink to="/login" className="btn btn-outline-light btn-sm me-lg-2 mb-2 mb-lg-0">
                  Giriş Yap
                </NavLink>
                <NavLink to="/register" className="btn btn-grad btn-sm">
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
