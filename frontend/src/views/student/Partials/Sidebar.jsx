import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  // aktif link için yardımcı
  const itemClass = ({ isActive }) =>
    "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 " +
    (isActive ? "bg-primary text-white fw-semibold" : "text-dark");

  return (
    <nav
      className="shadow-sm bg-white rounded-3 w-100"
      style={{ position: "sticky", top: 90, minWidth: 250 }}
    >
      {/* Başlık + Toggler (mobil) */}
      <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
        <span className="fw-bold text-dark m-0">Menü</span>
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidenav"
          aria-controls="sidenav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="bi bi-grid" />
        </button>
      </div>

      <div className="collapse d-md-block" id="sidenav">
        <div className="py-3">
          {/* Genel */}
          <div className="px-3 pb-2 small text-uppercase text-muted">Genel</div>
          <ul className="list-unstyled mb-4">
            <li className="mb-1">
              <NavLink to="/student/dashboard" className={itemClass} end>
                <i className="bi bi-grid-fill text-primary"></i>
                <span>Panel</span>
              </NavLink>
            </li>
            <li className="mb-1">
              <NavLink to="/student/courses" className={itemClass}>
                <i className="bi bi-mortarboard-fill text-success"></i>
                <span>Görevlerim</span>
              </NavLink>
            </li>
            <li className="mb-1">
              <NavLink to="/student/wishlist" className={itemClass}>
                <i className="bi bi-heart-fill text-danger"></i>
                <span>İstekler</span>
              </NavLink>
            </li>
          </ul>

          {/* Hesap */}
          <div className="px-3 pb-2 small text-uppercase text-muted">
            Hesap Ayarları
          </div>
          <ul className="list-unstyled mb-0">
            <li className="mb-1">
              <NavLink to="/student/profile" className={itemClass}>
                <i className="bi bi-pencil-square text-info"></i>
                <span>Profil Düzenle</span>
              </NavLink>
            </li>
            <li className="mb-1">
              <NavLink to="/student/change-password" className={itemClass}>
                <i className="bi bi-shield-lock-fill text-warning"></i>
                <span>Şifre Değiştir</span>
              </NavLink>
            </li>
            <li className="mb-1">
              <NavLink to="/login" className={itemClass}>
                <i className="bi bi-box-arrow-right text-danger"></i>
                <span>Çıkış Yap</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
