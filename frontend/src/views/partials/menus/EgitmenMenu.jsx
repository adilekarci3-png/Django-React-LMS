import { Link } from "react-router-dom";
import { useState } from "react";
import "./css/coordinatormenu.css";

const EgitmenMenu = () => {

  const [open, setOpen] = useState(false);

  const toggleMenu = (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setOpen(false);
  };
  return (
     <li className="nav-item dropdown position-static">
      <a
        className={`nav-link dropdown-toggle ${open ? "show" : ""}`}
        href="#"
        role="button"
        aria-expanded={open ? "true" : "false"}
        onClick={toggleMenu}
      >
        <i className="fa-solid fa-graduation-cap"></i> Eğitmen
      </a>

      <div
        className={`dropdown-menu student-mega shadow-lg border-0 mt-0 ${
          open ? "show" : ""
        }`}
        // inline style ile kesin aç
        style={{
          display: open ? "block" : "none",
        }}
      >

      <div className="d-flex flex-wrap gap-3">
          {/* Sütun 1: Panel + Eğitim */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">📊 Panel</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/dashboard/`} onClick={closeMenu}>
              <i className="fa-solid fa-gauge text-primary me-2"></i> Panel
            </Link>

            <hr className="my-2" />
         <h6 className="dropdown-header px-0">➕ İçerik Ekle</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/canli-ders-ekle/`} onClick={closeMenu}>
              <i className="fa-solid fa-video me-2 text-danger"></i> Canlı Ders Oluştur
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/youtube-video-ekle/`} onClick={closeMenu}>
              <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Video Ekle
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepegitmen/video-ekle`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-upload me-2 text-info"></i> Video Yükle
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepegitmen/video-olustur/`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-film me-2 text-warning"></i> Video Oluştur
            </Link>
            
            <Link className="dropdown-item px-0" to={`/eskepegitmen/dokuman-ekle/`} onClick={closeMenu}>
              <i className="fa-solid fa-file-arrow-up me-2 text-secondary"></i> Döküman Oluştur
            </Link>
          </div>

        <div className="student-col">
            <h6 className="dropdown-header px-0">📚 Listelerim</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/live-lessons/`} onClick={closeMenu}>
              <i className="fa-solid fa-video me-2 text-danger"></i> Canlı Derslerim
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepegitmen/youtube-video-list/`}
              onClick={closeMenu}
            >
              <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Videolarım
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepegitmen/video-list/`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-photo-film me-2 text-info"></i> Videolarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/created-videos/`} onClick={closeMenu}>
              <i className="fa-solid fa-clapperboard me-2 text-warning"></i> Oluşturduğum Videolarım
            </Link>
             <Link className="dropdown-item px-0" to={`/eskepegitmen/documents/`} onClick={closeMenu}>
              <i className="fa-regular fa-file-lines me-2 text-secondary"></i> Dökümanlarım
            </Link>
             {/* <Link className="dropdown-item px-0" to={`/eskep/create-proje/`} onClick={closeMenu}>
              <i className="fa-solid fa-folder-plus me-2"></i> Proje Dosyalarını gönder
            </Link> */}
          </div>

<div className="student-col">
            <h6 className="dropdown-header px-0">⚙️ Diğer</h6>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/takvim`} onClick={closeMenu}>
             <i className="fa-regular fa-calendar-days me-2 text-primary"></i> Ders Takvimim
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepegitmen/profil-edit/`} onClick={closeMenu}>
              <i className="fa-solid fa-user-gear me-2"></i> Profil & Ayarlar
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};

export default EgitmenMenu;
