import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";

// Menü parçaları
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

function ESKEPBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleData, setRoleData] = useState({ base_role: null, sub_roles: [] });

  const navigate = useNavigate();
  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);

  const api = useAxios();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await api.get(`user-role-detail/`);
        setRoleData(res.data); // { base_role: "Koordinator", sub_roles: ["ESKEPKoordinator"] }
      } catch (error) {
        console.error("Rol alınamadı:", error);
      }
    };

    if (isLoggedIn()) {
      fetchUserRole();
    }
  }, [isLoggedIn]);

  const handleSearchSubmit = () => {
    navigate(`/search/?search=${searchQuery}`);
  };

  const styles = {
    section: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#ffffff",
      background: "linear-gradient(135deg, #5bc0de, #ff7f50)",
      padding: "15px",
      borderBottom: "4px solid #ffb6b9",
    },
    buttonPrimary: {
      background: "linear-gradient(90deg, #ff7f50, #ffb6b9)",
      color: "#ffffff",
      fontSize: "18px",
      padding: "14px 28px",
      borderRadius: "50px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "0.3s",
      boxShadow: "0px 5px 10px rgba(0,0,0,0.2)",
    },
  };

  const { base_role, sub_roles } = roleData;

  return (
    <div style={styles.section}>
      <nav className="navbar navbar-expand-lg navbar-green bg-green">
        <div className="container">
          <Link className="navbar-brand" to="/">EHAD</Link>
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
                <Link className="nav-link" to="/pages/contact-us/">
                  <i className="fas fa-phone"></i> İletişim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pages/about-us/">
                  <i className="fas fa-address-card"></i> Hakkımızda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/OrganizationChart/">
                  <i className="fas fa-address-card"></i> Organizasyon Şemaları
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/eskep/egitim-takvimi/">
                  <i className="fas fa-calendar-alt"></i> Genel Eğitim Takvimi
                </Link>
              </li>

              {/* === Dinamik Rollere Göre Menüler === */}
              {base_role === "Koordinator" && sub_roles.includes("ESKEPKoordinator") && <KoordinatorMenu />}
              {base_role === "Stajer" && sub_roles.includes("ESKEPStajer") && <StajerMenu />}
              {base_role === "Ogrenci" && sub_roles.includes("ESKEPOgrenci") && <OgrenciMenu />}
              {base_role === "Teacher" && sub_roles.includes("ESKEPEgitmen") && <EgitmenMenu />}
            </ul>

            {/* Arama ve Giriş/Çıkış */}
            <div className="d-flex align-items-center">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Ara"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-light me-2" onClick={handleSearchSubmit}>
                <i className="fas fa-search"></i>
              </button>

              {isLoggedIn() ? (
                <Link to="/logout/" className="btn btn-danger ms-2">
                  Çıkış <i className="fas fa-sign-out-alt"></i>
                </Link>
              ) : (
                <>
                  <Link to="/login/" className="btn btn-outline-light ms-2">
                    Giriş <i className="fas fa-sign-in-alt"></i>
                  </Link>
                  <Link to="/register/" className="btn btn-light ms-2">
                    Kayıt <i className="fas fa-user-plus"></i>
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
