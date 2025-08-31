import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav">
      <a
        className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3"
        href="#"
      >
        Menu
      </a>
      <button
        className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-3"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidenav"
        aria-controls="sidenav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="bi bi-grid" />
      </button>

      <div className="collapse navbar-collapse p-3" id="sidenav">
        <div className="navbar-nav flex-column">

          {/* --- Ana (Eğitmen) --- */}
          <ul className="list-unstyled ms-n2 mb-4">
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/dashboard/`}>
                <i className="fa-solid fa-gauge text-primary me-2"></i> Panel
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/live-lessons/`}>
                <i className="fa-solid fa-video text-danger me-2"></i> Canlı Derslerim
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/youtube-video-list/`}>
                <i className="fa-brands fa-youtube text-danger me-2"></i> YouTube Videolarım
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/video-list/`}>
                <i className="fa-solid fa-photo-film text-info me-2"></i> Videolarım
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/created-videos/`}>
                <i className="fa-solid fa-clapperboard text-warning me-2"></i> Oluşturduğum Videolar
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/documents/`}>
                <i className="fa-regular fa-file-lines text-secondary me-2"></i> Dökümanlarım
              </Link>
            </li>
          </ul>

          {/* --- İçerik Ekle (Eğitmen) --- */}
          <span className="navbar-header mb-2">İçerik Ekle</span>
          <ul className="list-unstyled ms-n2 mb-4">
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/canli-ders-ekle/`}>
                <i className="fa-solid fa-video text-danger me-2"></i> Canlı Ders Ekle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/youtube-video-ekle/`}>
                <i className="fa-brands fa-youtube text-danger me-2"></i> YouTube Video Ekle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/ders-olustur/`}>
                <i className="fa-regular fa-clock text-success me-2"></i> Ders Saati Ekle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/video-olustur/`}>
                <i className="fa-solid fa-film text-warning me-2"></i> Video Oluştur
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/video-ekle/`}>
                <i className="fa-solid fa-upload text-info me-2"></i> Video Ekle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepegitmen/dokuman-ekle/`}>
                <i className="fa-solid fa-file-arrow-up text-secondary me-2"></i> Döküman Ekle
              </Link>
            </li>
          </ul>

          {/* --- Hesap (genel yolların sende nasıl olduğuna göre güncelle) --- */}
          <span className="navbar-header mb-3">Hesap Ayarları</span>
          <ul className="list-unstyled ms-n2 mb-0">
            <li className="nav-item">
              <Link className="nav-link" to={`/student/profile/`}>
                <i className="fas fa-edit text-primary me-2"></i> Profil Düzenle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/student/change-password/`}>
                <i className="fas fa-lock text-warning me-2"></i> Şifre Değiştir
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/login/`}>
                <i className="fas fa-sign-out-alt text-danger me-2"></i> Çıkış Yap
              </Link>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
