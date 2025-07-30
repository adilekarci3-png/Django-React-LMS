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
        <i className="fa-solid fa-user-plus"></i> Eğitmen
      </a>
      <ul className="dropdown-menu">

        {/* 1. Genel */}
        <li className="dropdown-header">📋 Genel</li>
        <li>
          <Link className="dropdown-item" to={`/student/dashboard/`}>
            <i className="fa-solid fa-table-columns"></i> Panel
          </Link>
        </li>

        {/* 2. Kurslarım */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">🎓 Kurslarım</li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/courses/`}>
            <i className="fa-solid fa-chalkboard-user"></i> Eklediğim Kurslarım
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepinstructor/courses/`}>
            <i className="fa-solid fa-chalkboard-user"></i> Eğitim Aldığım Kurslarım
          </Link>
        </li>

        {/* 3. Ders Yönetimi */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">📚 Ders Yönetimi</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/takvim/`}>
            <i className="fa-solid fa-book-open-reader"></i> Ders Takvimim
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/ders-saat-ekle/`}>
            <i className="fa-solid fa-pencil"></i> Yeni Ders Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskep/create-odev/`}>
            <i className="fa-solid fa-video"></i> Ders Videosu Oluştur
          </Link>
        </li>

        {/* 4. Canlı Dersler */}
        <li><hr className="dropdown-divider" /></li>
        <li className="dropdown-header">🧑‍🏫 Canlı Dersler</li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/canli-ders-ekle/`}>
            <i className="fa-solid fa-file-lines"></i> Canlı Ders Oluştur
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" to={`/eskepegitmen/live-lessons/`}>
            <i className="fa-solid fa-chalkboard"></i> Canlı Dersler
          </Link>
        </li>

      </ul>
    </li>
  );
};

export default EgitmenMenu;
