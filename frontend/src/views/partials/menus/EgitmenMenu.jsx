import { Link } from "react-router-dom";

const EgitmenMenu = () => {
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fa-solid fa-user-tie me-1"></i> Eğitmen
      </a>

      <ul className="dropdown-menu dropdown-menu-end">
        {/* 1. Genel */}
        <li className="dropdown-header">📋 Genel</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/dashboard/`}>
            <i className="fa-solid fa-gauge me-2 text-primary"></i> Panel
          </Link>
        </li>

        {/* 2. İçerik Ekle */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">➕ İçerik Ekle</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/canli-ders-ekle/`}>
            <i className="fa-solid fa-video me-2 text-danger"></i> Canlı Ders Ekle
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/youtube-video-ekle/`}>
            <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Video Ekle
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/ders-saat-ekle/`}>
            <i className="fa-regular fa-clock me-2 text-success"></i> Ders Saati Ekle
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/video-olustur/`}>
            <i className="fa-solid fa-film me-2 text-warning"></i> Video Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/video-ekle/`}>
            <i className="fa-solid fa-upload me-2 text-info"></i> Video Ekle
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/dokuman-ekle/`}>
            <i className="fa-solid fa-file-arrow-up me-2 text-secondary"></i> Döküman Ekle
          </Link>
        </li>

        {/* 3. Listelerim */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">📚 Listelerim</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/live-lessons/`}>
            <i className="fa-solid fa-video me-2 text-success"></i> Canlı Derslerim
          </Link>
        </li>
        
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/youtube-video-list/`}>
            <i className="fa-brands fa-youtube me-2 text-danger"></i> YouTube Videolarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/video-list/`}>
            <i className="fa-solid fa-photo-film me-2 text-info"></i> Videolarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/created-videos/`}>
            <i className="fa-solid fa-clapperboard me-2 text-warning"></i> Oluşturduğum Videolarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/documents/`}>
            <i className="fa-regular fa-file-lines me-2 text-secondary"></i> Dökümanlarım
          </Link>
        </li>

        {/* 4. Ders Yönetimi */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">🗓️ Ders Yönetimi</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/takvim/`}>
            <i className="fa-regular fa-calendar-days me-2 text-primary"></i> Ders Takvimim
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default EgitmenMenu;
