import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

function ESKEPBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);

  const api = useAxios();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userId = UserData()?.user_id;
        if (!userId) return;
        debugger;
        const res = await api.get(`/user/role/${userId}/`);
        // Eğer backend şu şekilde bir JSON döndürüyorsa: { "role": "Koordinator" }
        setUserRole(res.data.role);
        console.log("Kullanıcı rolü:", res.data.role);
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

  return (
    <div style={styles.section}>
      <nav className="navbar navbar-expand-lg navbar-green bg-green">
        <div className="container">
          <Link className="navbar-brand" to="/">
            EHAD
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
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

              {userRole === "Koordinator" && <KoordinatorMenu />}
              {userRole === "Stajer" && <StajerMenu />}
              {userRole === "Ogrenci" && <OgrenciMenu />}
              {<EgitmenMenu />}
            </ul>

            {isLoggedIn() ? (
              <Link to="/logout/" className="btn btn-primary ms-2">
                Çıkış Yap <i className="fas fa-sign-out-alt"></i>
              </Link>
            ) : (
              <>
                <Link to="/login/" className="btn btn-primary ms-2">
                  Giriş Yap <i className="fas fa-sign-in-alt"></i>
                </Link>
                <Link to="/register/" className="btn btn-primary ms-2">
                  Kayıt Ol <i className="fas fa-user-plus"></i>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default ESKEPBaseHeader;
