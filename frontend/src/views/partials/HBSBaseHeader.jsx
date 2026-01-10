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

  // 👇 burada şartı tanımladık
  // "HBSKoordinator" sub rolü + "Agent" base rolü varsa gör
  const canSeeContactMessages =
    isLoggedIn?.() &&
    subRoles.includes("HBSKoordinator") &&
    baseRoles.includes("Agent");

  return (
    <header className="hdm-min-header hbs-theme hbs-header--wide">
      <nav className="navbar navbar-expand-lg" aria-label="HBS üst menü">
        <div className="container-xl px-3 px-lg-4">
          {/* Marka */}
          <Link
            className="navbar-brand fw-bold text-white d-flex align-items-center gap-2"
            to="/"
          >
            <span className="hdm-logo-dot" />
            <span>HBS</span>
            <span className="d-none d-sm-inline text-white-50 small">
              Hafızlar Bilgi Sistemi
            </span>
          </Link>

          {/* Sağ taraftaki mobil buton grubu */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              className="btn btn-outline-light btn-sm rounded-pill"
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
              className="navbar-toggler border-0 text-white"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#hbsNav"
              aria-controls="hbsNav"
              aria-expanded="false"
              aria-label="Menüyü Aç/Kapat"
            >
              <span className="hdm-burger" />
            </button>
          </div>

          {/* Ana menü */}
          <div className="collapse navbar-collapse" id="hbsNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <NavLink className="nav-link hdm-link hbs-chip-link" to="/about-hbs">
                  <i className="bi bi-info-circle me-1" />
                  Hakkımızda
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link hdm-link hbs-chip-link" to="/contact">
                  <i className="bi bi-telephone me-1" />
                  İletişim
                </NavLink>
              </li>

              {/* 👇 YENİ: sadece HBSKoordinator + Agent olanlara */}
              {canSeeContactMessages && (
                <li className="nav-item">
                  <NavLink
                    className="nav-link hdm-link hbs-chip-link"
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
                    className="nav-link hdm-link hbs-chip-link dropdown-toggle btn btn-link p-0"
                    id="hbsDrop"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-clipboard-check me-1" />
                    Hafız İşlemleri
                  </button>
                  <ul className="dropdown-menu dropdown-menu-hbs" aria-labelledby="hbsDrop">
                    <li>
                      <NavLink className="dropdown-item" to="/hafizbilgi/create-hafizbilgi/">
                        Hafız Bilgi Ekle
                      </NavLink>
                    </li>
                    <li>
                      <NavLink className="dropdown-item" to="/hafizbilgi/list/">
                        Hafız Bilgileri
                      </NavLink>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <NavLink
                    className="nav-link hdm-link hbs-chip-link"
                    to="/hafizbilgi/create-hafizbilgi/"
                  >
                    <i className="bi bi-journal-plus me-1" />
                    Hafız Bilgi Ekle
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Masaüstü arama + auth */}
            <div className="d-none d-lg-flex align-items-center">
              <div className="hbs-search-pill me-2">
                <i className="bi bi-search opacity-75" />
                <input
                  type="search"
                  className="form-control"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ara"
                  aria-label="HBS içinde ara"
                />
                <button
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={handleSearch}
                >
                  Ara
                </button>
              </div>

              {isLoggedIn?.() ? (
                <>
                  <Link
                    to="/profile"
                    className="btn btn-outline-light btn-sm rounded-pill me-2"
                  >
                    Profil
                  </Link>
                  <button
                    className="btn btn-danger btn-sm rounded-pill"
                    onClick={logout}
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-light btn-sm rounded-pill me-2"
                  >
                    Giriş Yap
                  </Link>
                  <Link to="/register" className="btn btn-cta btn-sm rounded-pill">
                    Kayıt Ol
                  </Link>
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
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ara"
                aria-label="HBS içinde ara"
              />
              <button
                className="btn btn-light btn-sm rounded-pill"
                onClick={handleSearch}
              >
                Ara
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HBSBaseHeader;
