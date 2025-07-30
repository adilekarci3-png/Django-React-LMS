import { Link } from 'react-router-dom';

const CoordinatorMenu = () => {
  return (
    <li className="nav-item dropdown">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="fas fa-chalkboard-user"></i> Koordinatör
      </a>
      <ul className="dropdown-menu">

        {/* 1. Kurs Yönetimi */}
        <li className="dropdown-header">📚 Kurs Yönetimi</li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/dashboard/`}>
            <i className="bi bi-grid-fill"></i> Panel
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/course-create/`}>
            <i className="fas fa-plus-circle"></i> Kurs Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/assingcourses/`}>
            <i className="fas fa-list-alt"></i> Oluşturduğum Kurslarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/courses/`}>
            <i className="fas fa-graduation-cap"></i> Eğitim Aldığım Kurslarım
          </Link>
        </li>

        {/* 2. Gönderilen Dosyalar */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">🗂 Gönderilen Dosyalar</li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/odevs/`}>
            <i className="fas fa-tasks"></i> Ödevler
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/kitaptahlileris/`}>
            <i className="fas fa-book"></i> Kitap Tahlilleri
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/dersSonuRaporus/`}>
            <i className="fas fa-file-alt"></i> Ders Sonu Raporları
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/projes/`}>
            <i className="fas fa-folder"></i> Proje Dosyaları
          </Link>
        </li>

        {/* 3. Kullanıcı Yönetimi */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">👥 Kullanıcı Yönetimi</li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/egitmen-ekle/`}>
            <i className="fas fa-user-plus"></i> Eğitmen Ekle
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/ogrenci-stajer/`}>
            <i className="fas fa-users"></i> Öğrenci/Stajyer Listesi
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskep/eğitmenler/`}>
            <i className="fas fa-chalkboard-teacher"></i> Eğitmen Listesi
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/instructor/students/`}>
            <i className="fas fa-user-graduate"></i> Öğrenciler
          </Link>
        </li>

        {/* 4. Zamanlama & Organizasyon */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">📅 Organizasyon</li>
        <li>
          <Link className="dropdown-item" to={`/eskep/egitim-takvimi/`}>
            <i className="fas fa-calendar-alt"></i> Genel Takvim
          </Link>
        </li>

        {/* 5. İletişim ve Etkileşim */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">💬 Etkileşim</li>
        <li>
          <Link className="dropdown-item" to={`/instructor/reviews/`}>
            <i className="fas fa-star"></i> Yorumlar
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/instructor/question-answer/`}>
            <i className="fas fa-envelope"></i> Soru / Cevap
          </Link>
        </li>

        {/* 6. Ayarlar */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">⚙️ Ayarlar</li>
        <li>
          <Link className="dropdown-item" to={`/instructor/earning/`}>
            <i className="fas fa-turkish-lira-sign"></i> Bağış
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/instructor/profile/`}>
            <i className="fas fa-gear"></i> Profil & Ayarlar
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default CoordinatorMenu;
