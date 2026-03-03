import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkCls = ({ isActive }) =>
    "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded " +
    (isActive ? "active" : "");

  return (
    <div className="col-lg-12 col-md-12 col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav bg-white rounded">
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-white m-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidenav"
          aria-controls="sidenav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="bi bi-grid" />
        </button>

      <div className="collapse d-md-block" id="sidenav">
        <div className="px-3 py-2">

          {/* --- Ana (Eğitmen) --- */}
          <div className="navbar-header">Genel İşlemler</div>
          <ul className="list-unstyled mb-4">
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/dashboard/">
                <i className="fa-solid fa-gauge text-primary"></i>
                <span>Panel</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/live-lessons/">
                <i className="fa-solid fa-video text-danger"></i>
                <span>Canlı Derslerim</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/youtube-video-list">
                <i className="fa-brands fa-youtube text-danger"></i>
                <span>YouTube Videolarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/video-list">
                <i className="fa-solid fa-photo-film text-info"></i>
                <span>Videolarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/created-videos">
                <i className="fa-solid fa-clapperboard text-warning"></i>
                <span>Oluşturduğum Videolar</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/documents">
                <i className="fa-regular fa-file-lines text-secondary"></i>
                <span>Dökümanlarım</span>
              </NavLink>
            </li>
          </ul>

          {/* --- İçerik Ekle (Eğitmen) --- */}
          <div className="navbar-header">İçerik Ekle</div>
          <ul className="list-unstyled mb-4">
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/canli-ders-ekle">
                <i className="fa-solid fa-video text-danger"></i>
                <span>Canlı Ders Oluştur</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/youtube-video-ekle">
                <i className="fa-brands fa-youtube text-danger"></i>
                <span>YouTube Video Ekle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/ders-saat-ekle">
                <i className="fa-regular fa-clock text-success"></i>
                <span>Ders Oluştur</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/video-ekle">
                <i className="fa-solid fa-upload text-info"></i>
                <span>Video Yükle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/video-olustur">
                <i className="fa-solid fa-film text-warning"></i>
                <span>Video Oluştur</span>
              </NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/dokuman-ekle">
                <i className="fa-solid fa-file-arrow-up text-secondary"></i>
                <span>Döküman Oluştur</span>
              </NavLink>
            </li>
          </ul>

          {/* --- Hesap --- */}
          <div className="navbar-header">Hesap Ayarları</div>
          <ul className="list-unstyled mb-0">
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/profil-edit/">
                <i className="fas fa-edit text-secondary"></i>
                <span>Profil Düzenle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/eskepegitmen/change-password">
                <i className="fas fa-lock text-dark"></i>
                <span>Şifre Değiştir</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/login">
                <i className="fas fa-sign-out-alt text-danger"></i>
                <span>Çıkış Yap</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      
          </nav>
    </div>
  );
}

export default Sidebar;
