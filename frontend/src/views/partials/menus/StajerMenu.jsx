import { Link } from "react-router-dom";

const StajerMenu = () => {
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fa-solid fa-graduation-cap"></i> Stajer
      </a>
      <ul className="dropdown-menu dropdown-menu-end shadow-lg p-2" style={{ minWidth: "250px" }}>
        {/* Panel */}
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/dashboard/`}>
            <i className="fa-solid fa-table-columns me-2"></i> Panel
          </Link>
        </li>
        <li><hr className="dropdown-divider" /></li>

        {/* Eğitim */}
        <li className="dropdown-header text-muted fw-bold">📚 Eğitim</li>
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/courses/`}>
            <i className="fa-solid fa-chalkboard-user me-2"></i> Kurslarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/odevs/`}>
            <i className="fa-solid fa-pencil me-2"></i> Ödevlerim
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/kitaptahlileris/`}>
            <i className="fa-solid fa-book-open-reader me-2"></i> Kitap Tahlillerim
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/derssonuraporus/`}>
            <i className="fa-solid fa-file-lines me-2"></i> Raporlarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepstajer/projes/`}>
            <i className="fa-solid fa-folder me-2"></i> Proje Dosyalarım
          </Link>
        </li>

        <li><hr className="dropdown-divider" /></li>

        {/* Oluştur */}
        <li className="dropdown-header text-muted fw-bold">✏️ Oluştur</li>
        <li>
          <Link className="dropdown-item" to={`/eskep/create-odev/`}>
            <i className="fa-solid fa-plus me-2"></i> Ödev Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskep/create-kitaptahlili/`}>
            <i className="fas fa-book me-2"></i> Kitap Tahlili Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskep/create-derssonuraporu/`}>
            <i className="fa-solid fa-chart-line me-2"></i> Rapor Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskep/create-proje/`}>
            <i className="fa-solid fa-folder-plus me-2"></i> Proje Oluştur
          </Link>
        </li>

        <li><hr className="dropdown-divider" /></li>

        {/* Diğer */}
        <li className="dropdown-header text-muted fw-bold">⚙️ Diğer</li>
        <li>
          <Link className="dropdown-item" to={`/eskep/egitim-takvimi/`}>
            <i className="fa-solid fa-calendar me-2"></i> Takvimim
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/student/wishlist/`}>
            <i className="fa-solid fa-heart me-2"></i> İstek Listesi
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/student/question-answer/`}>
            <i className="fa-solid fa-envelope me-2"></i> Soru / Cevap
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/student/profile/`}>
            <i className="fa-solid fa-user-gear me-2"></i> Profil & Ayarlar
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default StajerMenu;
