import { Link } from 'react-router-dom';  // Link bileşenini import ettik

const CoordinatorMenu = () => {
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
    <i className="fas fa-chalkboard-user"></i> Koordinator
  </a>
  <ul className="dropdown-menu">
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/dashboard/`}>
        <i className="bi bi-grid-fill"></i> Panel
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/instructor/courses/`}>
        <i className="fas fa-chalkboard-user"></i> Kurslarım
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/odevs/`}>
        <i className="fas fa-tasks"></i> Gönderilen Ödevler
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/kitaptahlileris/`}>
        <i className="fas fa-book"></i> Gönderilen Kitap Tahlilleri
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/dersSonuRaporus/`}>
        <i className="fas fa-file-alt"></i> Gönderilen Ders Sonu Raporları
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/projes/`}>
        <i className="fas fa-folder"></i> Gönderilen Proje Dosyaları
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/instructor/create-course/`}>
        <i className="fas fa-user-plus"></i> Eğitmen Ekle
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskep/egitim-takvimi/`}>
        <i className="fas fa-calendar-alt"></i> Genel Takvim
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/eskepinstructor/ogrenci-stajer/`}>
        <i className="fas fa-users"></i> Öğrenci/Stajer Listesi
      </Link>
    </li>
    {/* <li>
      <Link className="dropdown-item" to={`/instructor/odevs/`}>
        <i className="fas fa-user-graduate"></i> Stajer Listesi
      </Link>
    </li> */}
    <li>
      <Link className="dropdown-item" to={`/eskep/eğitmenler/`}>
        <i className="fas fa-chalkboard-teacher"></i> Eğitmen Listesi
      </Link>
    </li>

    <li>
      <Link className="dropdown-item" to={`/instructor/reviews/`}>
        <i className="fas fa-star"></i> Yorumlar{" "}
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/instructor/question-answer/`}>
        <i className="fas fa-envelope"></i> Soru/Cevap{" "}
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/instructor/students/`}>
        <i className="fas fa-users"></i> Öğrenciler{" "}
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to={`/instructor/earning/`}>
        <i className="fas fa-turkish-lira"></i> Bağış{" "}
      </Link>
    </li>

    <li>
      <Link className="dropdown-item" to={`/instructor/profile/`}>
        <i className="fas fa-gear"></i> Ayarlar & Profil{" "}
      </Link>
    </li>
  </ul>
</li>
      </div>
    );
  };
  
  export default CoordinatorMenu; 