import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkCls = ({ isActive }) =>
    "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded " +
    (isActive ? "active" : "");

  return (
    <aside className="sidenav shadow-sm mb-4 mb-lg-0" data-sidebar="educator">
      {/* Mobile toggle */}
      <button
        className="btn btn-primary d-md-none m-3"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidenav"
        aria-controls="sidenav"
        aria-expanded="false"
        aria-label="Menüyü Aç/Kapat"
      >
        <i className="bi bi-grid"></i>
      </button>

      <div className="collapse d-md-block" id="sidenav">
        <div className="px-3 py-2">

          {/* --- Ana (Eğitmen) --- */}
          <ul className="list-unstyled mb-4">
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/dashboard">
                <i className="fa-solid fa-gauge text-primary"></i>
                <span>Panel</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/live-ders-listesi">
                <i className="fa-solid fa-video text-danger"></i>
                <span>Canlı Derslerim</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/youtube-video-list">
                <i className="fa-brands fa-youtube text-danger"></i>
                <span>YouTube Videolarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/video-list">
                <i className="fa-solid fa-photo-film text-info"></i>
                <span>Videolarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/created-videos">
                <i className="fa-solid fa-clapperboard text-warning"></i>
                <span>Oluşturduğum Videolar</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/documents">
                <i className="fa-regular fa-file-lines text-secondary"></i>
                <span>Dökümanlarım</span>
              </NavLink>
            </li>
          </ul>

          {/* --- İçerik Ekle (Eğitmen) --- */}
          <div className="navbar-header">İçerik Ekle</div>
          <ul className="list-unstyled mb-4">
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/add-canli-ders">
                <i className="fa-solid fa-video text-danger"></i>
                <span>Canlı Ders Ekle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/video-link-create">
                <i className="fa-brands fa-youtube text-danger"></i>
                <span>YouTube Video Ekle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/add-lesson">
                <i className="fa-regular fa-clock text-success"></i>
                <span>Ders Saati Ekle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/video-create">
                <i className="fa-solid fa-film text-warning"></i>
                <span>Video Oluştur</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/webcam-record">
                <i className="fa-solid fa-upload text-info"></i>
                <span>Video Ekle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/educator/documents/create">
                <i className="fa-solid fa-file-arrow-up text-secondary"></i>
                <span>Döküman Ekle</span>
              </NavLink>
            </li>
          </ul>

          {/* --- Hesap --- */}
          <div className="navbar-header">Hesap Ayarları</div>
          <ul className="list-unstyled mb-0">
            <li className="nav-item">
              <NavLink className={linkCls} to="/student/profile">
                <i className="fas fa-edit text-primary"></i>
                <span>Profil Düzenle</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkCls} to="/student/change-password">
                <i className="fas fa-lock text-warning"></i>
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

      {/* Styles */}
      <style>{`
        /* Kökte Bootstrap nav değişkenlerini override et */
        .sidenav{
          background:#fff;
          border-radius:.75rem;
          /* Bootstrap 5 değişkenleri */
          --bs-nav-link-color: #0f172a;
          --bs-nav-link-hover-color: #0b5ed7;
          --bs-link-color: #0f172a;
          --bs-link-hover-color: #0b5ed7;
          --bs-secondary-color: #0f172a;
        }
        .sidenav .navbar-header{
          font-size:.75rem;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:.08em;
          color:#64748b;
          margin:.5rem 1rem;
        }

        /* Yazıyı soluk yapan tüm kuralları bastır */
        .sidenav .nav-link,
        .sidenav .nav-link span,
        .sidenav .nav-link i{
          color:#0f172a !important;
          opacity:1 !important;
          filter:none !important;
        }

        .sidenav .nav-link{
          font-weight:600;
          display:flex;
          align-items:center;
          gap:.5rem;
        }
        .sidenav .nav-link i{ width:1.25rem; text-align:center; }
        .sidenav .nav-link:hover{ background:#f1f5f9; }
        .sidenav .nav-link.active{
          color:#0b5ed7 !important;
          background:#e7f1ff;
        }
        @media (min-width:768px){
          .sidenav{ position:sticky; top:1rem; }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
