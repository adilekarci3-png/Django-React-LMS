import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserData from "../plugin/UserData";
import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";


function BaseHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isAgent, setIsAgent] = useState(false);
  const [isTeacher, setIsTeacher] = useState(true);
  const [isStudent, setIsStudent] = useState(true);

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
  const menuItemStyle = { color: "#000000" };
  const navLinkStyle = { color: "#ffffff" };
 return (
    <nav className="navbar navbar-expand-lg" style={{ background: "linear-gradient(to right, #023e8a, #03045e, #0077b6)" }}>
      <div className="container">
        <Link className="navbar-brand text-white" to="/">
          EHAD
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-navbar">
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

            {/* Eğitmen Menüsü */}
            {isTeacher && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-chalkboard-user"></i> Eğitmen
                </a>
                <ul className="dropdown-menu">
                  <Link className="dropdown-item" to="/instructor/dashboard/" style={menuItemStyle}>
                    <i className="bi bi-grid-fill"></i> Panel
                  </Link>
                  <Link className="dropdown-item" to="/instructor/courses/" style={menuItemStyle}>
                    <i className="fas fa-book"></i> Kurslarım
                  </Link>
                  <Link className="dropdown-item" to="/instructor/create-course/" style={menuItemStyle}>
                    <i className="fas fa-plus-circle"></i> Kurs Oluştur
                  </Link>
                  <Link className="dropdown-item" to="/instructor/students/" style={menuItemStyle}>
                    <i className="fas fa-users"></i> Öğrenciler
                  </Link>
                  <Link className="dropdown-item" to="/instructor/earning/" style={menuItemStyle}>
                    <i className="fas fa-coins"></i> Bağışlar
                  </Link>
                  <Link className="dropdown-item" to="/instructor/profile/" style={menuItemStyle}>
                    <i className="fas fa-cog"></i> Profil
                  </Link>
                </ul>
              </li>
            )}
<li className="nav-item dropdown">
    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
      <i className="fas fa-book-quran"></i> Hafızlık
    </a>
    <ul className="dropdown-menu">
      <Link className="dropdown-item" to="/hafizlik/entry/" style={menuItemStyle}>
        <i className="fas fa-pen-nib"></i> Hafız Girişi
      </Link>
      <Link className="dropdown-item" to="/hafizlik/list/" style={menuItemStyle}>
        <i className="fas fa-list-ul"></i> Hafız Listesi
      </Link>
      <Link className="dropdown-item" to="/hafizbilgi/HafizCountPage/" style={menuItemStyle}>
        <i className="fas fa-chart-line"></i> Hafız Sayısı (10 Yıl)
      </Link>
      <Link className="dropdown-item" to="/hafizbilgi/KayitliOgrencilerPage/" style={menuItemStyle}>
        <i className="fas fa-globe"></i> Uygulama Üzerinden Hafızlar
      </Link>
      <Link className="dropdown-item" to="/hafizbilgi/UygulamaUzerindenHafizPage/" style={menuItemStyle}>
        <i className="fas fa-user-graduate"></i> Kayıtlı Öğrenci & Hafız
      </Link>
    </ul>
  </li>
            {/* Öğrenci Menüsü */}
            {isStudent && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-graduation-cap"></i> Öğrenci
                </a>
                <ul className="dropdown-menu">
                  <Link className="dropdown-item" to="/student/dashboard/" style={menuItemStyle}>
                    <i className="bi bi-grid-fill"></i> Panel
                  </Link>
                  <Link className="dropdown-item" to="/student/courses/" style={menuItemStyle}>
                    <i className="fas fa-book-reader"></i> Kurslarım
                  </Link>
                  <Link className="dropdown-item" to="/student/wishlist/" style={menuItemStyle}>
                    <i className="fas fa-heart"></i> İstek Listesi
                  </Link>
                  <Link className="dropdown-item" to="/student/profile/" style={menuItemStyle}>
                    <i className="fas fa-user-cog"></i> Profil
                  </Link>
                </ul>
              </li>
            )}

            {/* Temsilci Menüsü */}
            {isAgent && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" style={navLinkStyle}>
                  <i className="fas fa-user-tie"></i> Temsilci
                </a>
                <ul className="dropdown-menu">
                  <Link className="dropdown-item" to="/agent/hafizbilgi/list/" style={menuItemStyle}>
                    <i className="fas fa-list"></i> Hafız Bilgileri
                  </Link>
                </ul>
              </li>
            )}
          </ul>

          {/* Arama & Giriş/Kayıt */}
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

export default BaseHeader;
