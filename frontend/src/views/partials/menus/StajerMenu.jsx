import { Link } from "react-router-dom"; // Link bileşenini import ettik

const StajerMenu = () => {
  return (
    <div>
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
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to={`/eskepstajer/dashboard/`}>
              <i className="fa-solid fa-table-columns"></i> Panel
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/courses/`}>
              <i className="fa-solid fa-chalkboard-user"></i> Kurslarım
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskepstajer/odevs/`}>
              <i className="fa-solid fa-pencil"></i> Ödevlerim
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskepstajer/kitaptahlileris/`}>
              <i className="fa-solid fa-book-open-reader"></i> Kitap Tahlillerim
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskepstajer/dersonuraporus/`}>
              <i className="fa-solid fa-file-lines"></i> Ders Sonu Raporlarım
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskepstajer/projes/`}>
              <i className="fa-solid fa-folder"></i> Proje Dosyalarım
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskep/create-odev/`}>
              <i className="fa-solid fa-plus"></i> Ödev Oluştur
            </Link>
          </li>          
          <li>
            <Link className="dropdown-item" to={`/eskep/create-kitaptahlili/`}>
              <i className="fas fa-book"></i> Kitap Tahlili Oluştur
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item"
              to={`/eskep/create-derssonuraporu/`}
            >
              <i className="fa-solid fa-chart-line"></i> Ders Sonu Raporu
              Oluştur
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskep/create-proje/`}>
              <i className="fa-solid fa-folder-plus"></i> Proje Dosyası Oluştur
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskep/egitim-takvimi/`}>
              <i className="fa-solid fa-calendar"></i> Takvimim
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/wishlist/`}>
              <i className="fa-solid fa-heart"></i> İstek Listesi
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/question-answer/`}>
              <i className="fa-solid fa-envelope"></i> Soru/Cevap
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/profile/`}>
              <i className="fa-solid fa-user-gear"></i> Profil & Ayarlar
            </Link>
          </li>
        </ul>
      </li>
    </div>
  );
};

export default StajerMenu;
