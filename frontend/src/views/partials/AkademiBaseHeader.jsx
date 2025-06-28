import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import { ProfileContext } from "../plugin/Context";

function AkademiBaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState({ base_role: null, sub_roles: [] });
  const [profile, setProfile] = useContext(ProfileContext);

  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);

  const api = useAxios();

  const fetchProfile = () => {
    api
      .get(`user/profile/${UserData()?.user_id}/`)
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Profil alınamadı:", err);
      });
  };

  const fetchUserRole = async () => {
    try {
      const res = await api.get(`user-role-detail/`);
      setRoleData(res.data);
      console.log("Rol bilgisi:", res.data);
    } catch (error) {
      console.error("Rol alınamadı:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      fetchUserRole();
      fetchProfile();
    }
  }, [isLoggedIn]);

  const handleSearchSubmit = () => {
    navigate(`/search/?search=${searchQuery}`);
  };

  const menuItemStyle = { color: "#000000" };
  const navLinkStyle = { color: "#ffffff" };

  const { base_role, sub_roles } = roleData;

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "linear-gradient(to right, #023e8a, #03045e, #0077b6)",
      }}
    >
      <div className="container">
        <Link className="navbar-brand text-white" to="/">EHAD</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-navbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="main-navbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <Link className="nav-link" to="/pages/contact-us/" style={navLinkStyle}>
                <i className="fas fa-phone"></i> İletişim
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/pages/about-us/" style={navLinkStyle}>
                <i className="fas fa-address-card"></i> Hakkımızda
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/admin/OrganizationChart/" style={navLinkStyle}>
                <i className="fas fa-sitemap"></i> Organizasyon Şemaları
              </Link>
            </li>

            {/* === TEACHER === */}
            {base_role === "Teacher" && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-chalkboard-user"></i> Eğitmen
                </a>
                <ul className="dropdown-menu">
                  {sub_roles.includes("HDMEgitmen") && (
                    <Link className="dropdown-item" to="/hdm/teacher/hafizlar" style={menuItemStyle}>
                      HDM Hafızlar
                    </Link>
                  )}
                  {sub_roles.includes("HBSEgitmen") && (
                    <Link className="dropdown-item" to="/hbs/teacher/hafizlar" style={menuItemStyle}>
                      HBS Hafızlar
                    </Link>
                  )}
                  <Link className="dropdown-item" to="/instructor/dashboard/" style={menuItemStyle}>
                    <i className="bi bi-grid-fill"></i> Panel
                  </Link>
                  <Link className="dropdown-item" to="/instructor/courses/" style={menuItemStyle}>
                    <i className="fas fa-book"></i> Kurslarım
                  </Link>
                </ul>
              </li>
            )}

            {/* === KOORDINATOR === */}
            {base_role === "Koordinator" && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-user-cog"></i> Koordinatör
                </a>
                <ul className="dropdown-menu">
                  {sub_roles.includes("HDMKoordinator") && (
                    <Link className="dropdown-item" to="/hdm/koordinator/egitmenler" style={menuItemStyle}>
                      HDM Eğitmenler
                    </Link>
                  )}
                  {sub_roles.includes("HBSKoordinator") && (
                    <Link className="dropdown-item" to="/hbs/koordinator/egitmenler" style={menuItemStyle}>
                      HBS Eğitmenler
                    </Link>
                  )}
                </ul>
              </li>
            )}

            {/* === STUDENT === */}
            {base_role === "Ogrenci" && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-user-graduate"></i> Öğrenci
                </a>
                <ul className="dropdown-menu">
                  <Link className="dropdown-item" to="/student/dashboard/" style={menuItemStyle}>
                    Panel
                  </Link>
                  <Link className="dropdown-item" to="/student/courses/" style={menuItemStyle}>
                    Kurslarım
                  </Link>
                </ul>
              </li>
            )}

            {/* === HAFIZ === */}
            {base_role === "Hafiz" && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-book-reader"></i> Hafız
                </a>
                <ul className="dropdown-menu">
                  {sub_roles.includes("HDMHafiz") && (
                    <Link className="dropdown-item" to="/hdm/hafiz/dersler" style={menuItemStyle}>
                      HDM Dersler
                    </Link>
                  )}
                  {sub_roles.includes("HBSHafiz") && (
                    <Link className="dropdown-item" to="/hbs/hafiz/dersler" style={menuItemStyle}>
                      HBS Dersler
                    </Link>
                  )}
                </ul>
              </li>
            )}

            {/* === STAJER === */}
            {base_role === "Stajer" && (
              <li className="nav-item">
                <Link className="nav-link" to="/eskep/stajer/gorevler" style={navLinkStyle}>
                  <i className="fas fa-briefcase"></i> Stajyer Görevler
                </Link>
              </li>
            )}

            {/* === AGENT === */}
            {base_role === "Agent" && (
              <li className="nav-item">
                <Link className="nav-link" to="/agent/hafizbilgi/list/" style={navLinkStyle}>
                  <i className="fas fa-user-tie"></i> Temsilci
                </Link>
              </li>
            )}
          </ul>

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
  );
}

export default AkademiBaseHeader;
