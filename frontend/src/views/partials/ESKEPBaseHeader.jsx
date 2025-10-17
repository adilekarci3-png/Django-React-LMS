import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import "./css/HDMGirisPage.css";

// Menü parçaları
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

function ESKEPBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const api = useAxios();

  const rehydrated  = useAuthStore((s) => s.rehydrated);
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn);
  const hasBaseRole = useAuthStore((s) => s.hasBaseRole);
  const hasSubRole  = useAuthStore((s) => s.hasSubRole);
  const hasAnySubRole = useAuthStore((s) => s.hasAnySubRole);
  const setRoleData = useAuthStore((s) => s.setRoleData);

  // Mobilde bir linke tıklanınca menüyü kapat
  const closeMobileMenu = useCallback(() => {
    const el = document.getElementById("eskepNav");
    if (el?.classList?.contains("show")) {
      const bsCollapse = window.bootstrap?.Collapse?.getOrCreateInstance(el);
      bsCollapse?.hide();
    }
  }, []);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isLoggedIn?.()) {
      navigate("/login/");
      return;
    }
    api
      .get("user-role-detail/")
      .then((res) => setRoleData(res.data))
      .catch((err) => console.error("Rol alınamadı:", err));
  }, [rehydrated, isLoggedIn, api, navigate, setRoleData]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search/?search=${encodeURIComponent(q)}`);
  };

  if (!rehydrated) return null;

  return (
    <header className="hdm-min-header eskep-theme eskep-theme--sage">
      <nav className="navbar navbar-expand-lg" aria-label="ESKEP üst menü">
        <div className="container-fluid px-3 px-lg-4">
          <Link
            className="navbar-brand fw-semibold text-white d-flex align-items-center"
            to="/"
            onClick={closeMobileMenu}
          >
            <span className="hdm-logo-dot me-2" />
            ESKEP
          </Link>

          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#eskepNav"
            aria-controls="eskepNav"
            aria-expanded="false"
            aria-label="Menüyü Aç/Kapat"
          >
            <span className="hdm-burger" />
          </button>

          <div className="collapse navbar-collapse" id="eskepNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <NavLink className="nav-link hdm-link" to="/about-eskep" onClick={closeMobileMenu}>
                  <i className="fas fa-address-card me-1" /> Hakkımızda
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link hdm-link" to="/org-chart" onClick={closeMobileMenu}>
                  <i className="fas fa-sitemap me-1" /> Organizasyon Şemaları
                </NavLink>
              </li>

              {hasBaseRole("Koordinator") &&
                hasAnySubRole([
                  "HBSKoordinator",
                  "HDMKoordinator",
                  "AkademiKoordinator",
                  "ESKEPKoordinator",
                ]) && (
                  <li className="nav-item">
                    <NavLink className="nav-link hdm-link" to="/eskep/egitim-takvimi/" onClick={closeMobileMenu}>
                      <i className="fas fa-calendar-alt me-1" /> Genel Eğitim Takvimi
                    </NavLink>
                  </li>
                )}

              {hasAnySubRole([
                "ESKEPEgitmen",
                "ESKEPOgrenci",
                "ESKEPStajer",
                "ESKEPGenelKoordinator",
                "ESKEPStajerKoordinator",
                "ESKEPOgrenciKoordinator",
              ]) && (
                <>
                  {hasBaseRole("Koordinator") && <KoordinatorMenu />}
                  {hasBaseRole("Stajer") && hasSubRole("ESKEPStajer") && <StajerMenu />}
                  {hasBaseRole("Ogrenci") && hasSubRole("ESKEPOgrenci") && <OgrenciMenu />}
                  {hasBaseRole("Teacher") && hasSubRole("ESKEPEgitmen") && <EgitmenMenu />}
                </>
              )}
            </ul>

            {/* Arama + Auth */}
            <form className="d-flex align-items-center" onSubmit={onSubmitSearch} role="search" aria-label="Site içi arama">
              <input
                className="form-control form-control-sm bg-transparent text-white border-light me-2"
                type="search"
                placeholder="Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Arama"
                style={{ minWidth: 160 }}
              />
              <button className="btn btn-outline-light btn-sm me-2" type="submit">
                <i className="fas fa-search" />
              </button>

              {isLoggedIn?.() ? (
                <Link to="/logout/" className="btn btn-outline-light btn-sm" onClick={closeMobileMenu}>
                  <i className="fas fa-sign-out-alt me-1" />
                  Çıkış
                </Link>
              ) : (
                <>
                  <Link to="/login/" className="btn btn-outline-light btn-sm me-2" onClick={closeMobileMenu}>
                    <i className="fas fa-sign-in-alt me-1" />
                    Giriş
                  </Link>
                  <Link to="/register/" className="btn btn-cta btn-sm" onClick={closeMobileMenu}>
                    <i className="fas fa-user-plus me-1" />
                    Kayıt
                  </Link>
                </>
              )}
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default ESKEPBaseHeader;
