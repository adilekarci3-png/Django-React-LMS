import { Link } from "react-router-dom"; // Link bileşenini import ettik

const EgitmenMenu = () => {
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
          <i className="fa-solid fa-user-plus"></i> Eğitmen
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to={`/student/dashboard/`}>
              <i className="fa-solid fa-table-columns"></i> Panel
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/courses/`}>
              <i className="fa-solid fa-chalkboard-user"></i> Kurslarım
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskepegitmen/takvim/`}>
              <i className="fa-solid fa-book-open-reader"></i> Ders Takvimim
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/stajer/odevs/`}>
              <i className="fa-solid fa-pencil"></i> Yeni Ders Oluştur
            </Link>
          </li>
          
          <li>
            <Link className="dropdown-item" to={`/stajer/dersonuraporus/`}>
              <i className="fa-solid fa-file-lines"></i> Canlı Ders Oluştur
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/eskep/create-odev/`}>
              <i className="fa-solid fa-plus"></i> Ders Videosu Oluştur
            </Link>
          </li>
          
         
          {/* <li>
            <Link className="dropdown-item" to={`/eskep/egitim-takvimi/`}>
              <i className="fa-solid fa-calendar"></i> Takvimim
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/student/dashboard/`}>
              <i className="fa-solid fa-table-columns"></i> Panel
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={`/agent/hafizbilgi/list/`}>
              <i className="fa-solid fa-user-graduate"></i> Hafız Bilgileri
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
          </li> */}
        </ul>
      </li>
    </div>
  );
};

export default EgitmenMenu;
