import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";

function HDMBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
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
        const res = await api.get(`/user/role/${userId}/`);
        setUserRole(res.data.role);
      } catch (error) {
        console.error("Rol alınamadı:", error);
      }
    };
    if (isLoggedIn()) {
      fetchUserRole();
    }
  }, [isLoggedIn]);

  // Saat güncellemesi
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date) => {
    return date
      .toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");
  };
  const styles = {
    section: {
     background: "linear-gradient(135deg, #1b4965,rgb(89, 117, 40))",
      padding: "10px 0",
      borderBottom: "4px solid #2f6f64",
    },
  };

  return (
    <div style={styles.section}>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold text-white" to="/">
            HDM
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/pages/contact-us/">
                  <i className="fas fa-phone"></i> İletişim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/pages/about-us/">
                  <i className="fas fa-address-card"></i> Hakkımızda
                </Link>
              </li>
              {userRole === "Koordinator" && <KoordinatorMenu />}
              {userRole === "Stajer" && <StajerMenu />}
              {userRole === "Ogrenci" && <OgrenciMenu />}
              {userRole === "Egitmen" && <EgitmenMenu />}
            </ul>

            <span className="navbar-text text-white me-3 d-none d-lg-block">
              {formatDateTime(currentTime)}
            </span>

            {isLoggedIn() ? (
              <Link to="/logout/" className="btn btn-outline-light">
                Çıkış Yap
              </Link>
            ) : (
              <>
                <Link to="/login/" className="btn btn-outline-light me-2">
                  Giriş Yap
                </Link>
                <Link to="/register/" className="btn btn-light text-success">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default HDMBaseHeader;
