// src/components/StajerMenu.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import "./css/coordinatormenu.css";

const StajerMenu = () => {
  // tamamen React kontrol etsin
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
        <i className="fa-solid fa-graduation-cap"></i> Stajer
      </a>

      {/* MENÜ */}
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
            <Link className="dropdown-item px-0" to={`/eskepstajer/dashboard/`} onClick={closeMenu}>
              <i className="fa-solid fa-table-columns me-2"></i> Panel
            </Link>

            <hr className="my-2" />

            <h6 className="dropdown-header px-0">📚 Eğitim</h6>
            <Link className="dropdown-item px-0" to={`/eskepstajer/courses/`} onClick={closeMenu}>
              <i className="fa-solid fa-chalkboard-user me-2"></i> Kurslarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepstajer/odevs/`} onClick={closeMenu}>
              <i className="fa-solid fa-pencil me-2"></i> Ödevlerim
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepstajer/kitaptahlileris/`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-book-open-reader me-2"></i> Kitap Tahlillerim
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskepstajer/derssonuraporus/`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-file-lines me-2"></i> Raporlarım
            </Link>
            <Link className="dropdown-item px-0" to={`/eskepstajer/projes/`} onClick={closeMenu}>
              <i className="fa-solid fa-folder me-2"></i> Proje Dosyalarım
            </Link>
          </div>

          {/* Sütun 2: Oluştur */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">✏️ Oluştur</h6>
            <Link className="dropdown-item px-0" to={`/eskep/create-odev/`} onClick={closeMenu}>
              <i className="fa-solid fa-plus me-2"></i> Ödev Oluştur
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskep/create-kitaptahlili/`}
              onClick={closeMenu}
            >
              <i className="fas fa-book me-2"></i> Kitap Tahlili Oluştur
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/eskep/create-derssonuraporu/`}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-chart-line me-2"></i> Rapor Oluştur
            </Link>
            <Link className="dropdown-item px-0" to={`/eskep/create-proje/`} onClick={closeMenu}>
              <i className="fa-solid fa-folder-plus me-2"></i> Proje Oluştur
            </Link>
             <Link className="dropdown-item px-0" to={`/eskep/create-proje-draft`} onClick={closeMenu}>
              <i className="fa-solid fa-folder-plus me-2"></i> Proje Ön Taslak Oluştur
            </Link>
             {/* <Link className="dropdown-item px-0" to={`/eskep/create-proje/`} onClick={closeMenu}>
              <i className="fa-solid fa-folder-plus me-2"></i> Proje Dosyalarını gönder
            </Link> */}
          </div>

          {/* Sütun 3: Diğer */}
          <div className="student-col">
            <h6 className="dropdown-header px-0">⚙️ Diğer</h6>
            <Link className="dropdown-item px-0" to={`/eskep/stajer-takvim`} onClick={closeMenu}>
              <i className="fa-solid fa-calendar me-2"></i> Takvimim
            </Link>
            <Link className="dropdown-item px-0" to={`/student/wishlist/`} onClick={closeMenu}>
              <i className="fa-solid fa-heart me-2"></i> İstek Listesi
            </Link>
            <Link
              className="dropdown-item px-0"
              to={`/student/question-answer/`}
              onClick={closeMenu}
            >
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

export default StajerMenu;
