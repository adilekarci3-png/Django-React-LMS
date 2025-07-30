import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";

// Menü parçaları
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

function ESKEPBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const api = useAxios();

  const rehydrated = useAuthStore((state) => state.rehydrated);
  const [isLoggedIn, hasBaseRole, hasSubRole, hasAnySubRole] = useAuthStore(
    (state) => [
      state.isLoggedIn,
      state.hasBaseRole,
      state.hasSubRole,
      state.hasAnySubRole,
    ]
  );

  useEffect(() => {
    if (!rehydrated) return;

    const loggedIn = isLoggedIn?.();

    if (!loggedIn) {
      navigate("/login/");
      return;
    }

    // Roller yüklenmemişse getir
    api
      .get(`user-role-detail/`)
      .then((res) => {
        useAuthStore.getState().setRoleData(res.data);
      })
      .catch((err) => {
        console.error("Rol alınamadı:", err);
      });
  }, [rehydrated, isLoggedIn]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search/?search=${searchQuery}`);
    }
  };

  if (!rehydrated) return null;

  const styles = {
    section: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#ffffff",
      background: "linear-gradient(135deg, #5bc0de, #ff7f50)",
      borderBottom: "4px solid #ffb6b9",
    },
  };

  return (
    <div style={styles.section}>
      <nav className="navbar navbar-expand-lg py-2 px-3">
        <div className="container">
          <Link className="navbar-brand text-white fw-bold" to="/">
            EHAD
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/pages/about-us/">
                  <i className="fas fa-address-card"></i> Hakkımızda
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link text-white"
                  to="/admin/OrganizationChart/"
                >
                  <i className="fas fa-sitemap"></i> Organizasyon Şemaları
                </Link>
              </li>

              {hasBaseRole("Koordinator") &&
                hasAnySubRole([
                  "HBSKoordinator",
                  "HDMKoordinator",
                  "AkademiKoordinator",
                  "ESKEPKoordinator",
                ]) && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white"
                      to="/eskep/egitim-takvimi/"
                    >
                      <i className="fas fa-calendar-alt"></i> Genel Eğitim Takvimi
                    </Link>
                  </li>
                )}

              {hasAnySubRole([
                "ESKEPEgitmen",
                "ESKEPOgrenci",
                "ESKEPStajer",
                "ESKEPGenelKoordinator",
              ]) && (
                <>
                  {hasBaseRole("Koordinator") && <KoordinatorMenu />}
                  {hasBaseRole("Stajer") && hasSubRole("ESKEPStajer") && (
                    <StajerMenu />
                  )}
                  {hasBaseRole("Ogrenci") && hasSubRole("ESKEPOgrenci") && (
                    <OgrenciMenu />
                  )}
                  {hasBaseRole("Teacher") && hasSubRole("ESKEPEgitmen") && (
                    <EgitmenMenu />
                  )}
                </>
              )}
            </ul>

            {/* Arama ve Giriş/Çıkış butonları */}
            <div className="d-flex align-items-center">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Ara"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="btn btn-outline-light me-2"
                onClick={handleSearchSubmit}
              >
                <i className="fas fa-search"></i>
              </button>

              {isLoggedIn() ? (
                <Link to="/logout/" className="btn btn-danger ms-2">
                  <i className="fas fa-sign-out-alt"></i> Çıkış
                </Link>
              ) : (
                <>
                  <Link to="/login/" className="btn btn-outline-light ms-2">
                    <i className="fas fa-sign-in-alt"></i> Giriş
                  </Link>
                  <Link to="/register/" className="btn btn-light ms-2">
                    <i className="fas fa-user-plus"></i> Kayıt
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default ESKEPBaseHeader;
