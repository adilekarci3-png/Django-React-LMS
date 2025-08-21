import { Link } from "react-router-dom";
import "../css/HDMMenu.css"; // özel stil dosyası

const HDMMenu = () => {
  return (
    <li className="nav-item dropdown hdm-menu">
      <a
        className="nav-link dropdown-toggle text-white"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fa-solid fa-layer-group me-1"></i> HDM Menü
      </a>
      <ul className="dropdown-menu shadow hdm-dropdown">
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/">
            <i className="fa-solid fa-house me-2 text-primary"></i> Ana Sayfa
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/dashboard">
            <i className="fa-solid fa-chart-line me-2 text-success"></i> Gösterge Paneli
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/kuranoku">
            <i className="fa-solid fa-book-quran me-2 text-info"></i> Kur'an Dinleme
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/hafiztakip">
            <i className="fa-solid fa-user-check me-2 text-warning"></i> Hafız Takip
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/hafizgeneltakvim">
            <i className="fa-solid fa-calendar-days me-2 text-danger"></i> Genel Takvim
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/egitmendetay">
            <i className="fa-solid fa-chalkboard-user me-2 text-secondary"></i> Eğitmen Detay
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/hafizdetay">
            <i className="fa-solid fa-user-graduate me-2 text-primary"></i> Hafız Detay
          </Link>
        </li>
        <li>
          <Link className="dropdown-item hdm-item" to="/hdm/egitmenhafizlistesi">
            <i className="fa-solid fa-users-viewfinder me-2 text-success"></i> Eğitmen - Hafız Listesi
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default HDMMenu;
