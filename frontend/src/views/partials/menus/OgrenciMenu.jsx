// OgrenciMenu.jsx
import { Link } from "react-router-dom";
import { useRef } from "react";
import "./css/coordinatormenu.css"; // aynı dosyada toplayacağız

const OgrenciMenu = () => {
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = () => {
    // Bootstrap varsa
    try {
      const dd = window.bootstrap?.Dropdown.getInstance(toggleRef.current);
      if (dd) {
        dd.hide();
        return;
      }
    } catch (e) {}
    // Manuel
    menuRef.current?.classList.remove("show");
    if (toggleRef.current) {
      toggleRef.current.classList.remove("show");
      toggleRef.current.setAttribute("aria-expanded", "false");
    }
  };

  return (
    <li className="nav-item dropdown position-static">
      <a
        ref={toggleRef}
        className="nav-link dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-auto-close="outside"
      >
        <i className="fa-solid fa-user-plus"></i> Öğrenci
      </a>

      <div
        ref={menuRef}
        className="dropdown-menu student-mega shadow-lg border-0 mt-0"
      >
        <div className="d-flex flex-wrap gap-3">
          {/* Sütun 1: Panel + Eğitim */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">📊 Panel</h6>
            <Link className="dropdown-item px-0" to={`/eskepogrenci/dashboard/`} onClick={closeMenu}>
              <i className="fa-solid fa-table-columns me-2"></i> Panel
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">📚 Eğitim</h6>
            <Link className="dropdown-item px-0" to={`/student/courses/`} onClick={closeMenu}>
              <i className="fa-solid fa-chalkboard-user me-2"></i> Kurslarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepogrenci/odevs/`} onClick={closeMenu}>
              <i className="fa-solid fa-pencil me-2"></i> Ödevlerim
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepogrenci/kitaptahlilis/`} onClick={closeMenu}>
              <i className="fa-solid fa-book-open-reader me-2"></i> Kitap Tahlillerim
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepogrenci/derssonuraporus/`} onClick={closeMenu}>
              <i className="fa-solid fa-file-lines me-2"></i> Raporlarım
            </Link>
          </div>

          {/* Sütun 2: Oluştur */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">✏️ Oluştur</h6>
            <Link className="dropdown-item px-0" to={`/eskep/create-odev/`} onClick={closeMenu}>
              <i className="fa-solid fa-plus me-2"></i> Ödev Oluştur
            </Link>
            <Link className="dropdown-item px-0" to={`/eskep/create-kitaptahlili/`} onClick={closeMenu}>
              <i className="fa-solid fa-book me-2"></i> Kitap Tahlili Oluştur
            </Link>
            <Link className="dropdown-item px-0" to={`/eskep/create-derssonuraporu/`} onClick={closeMenu}>
              <i className="fa-solid fa-chart-line me-2"></i> Rapor Oluştur
            </Link>
          </div>

          {/* Sütun 3: Diğer */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">⚙️ Diğer</h6>
            <Link className="dropdown-item px-0" to={`/eskep/stajer-takvim`} onClick={closeMenu}>
              <i className="fa-solid fa-calendar me-2"></i> Takvimim
            </Link>
            <Link className="dropdown-item px-0" to={`/temsilci/hafizbilgi/list/`} onClick={closeMenu}>
              <i className="fa-solid fa-user-graduate me-2"></i> Hafız Bilgileri
            </Link>
            <Link className="dropdown-item px-0" to={`/student/wishlist/`} onClick={closeMenu}>
              <i className="fa-solid fa-heart me-2"></i> İstek Listesi
            </Link>
            <Link className="dropdown-item px-0" to={`/student/question-answer/`} onClick={closeMenu}>
              <i className="fa-solid fa-envelope me-2"></i> Soru / Cevap
            </Link>
            <Link className="dropdown-item px-0" to={`/student/profile/`} onClick={closeMenu}>
              <i className="fa-solid fa-user-gear me-2"></i> Profil & Ayarlar
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};

export default OgrenciMenu;
