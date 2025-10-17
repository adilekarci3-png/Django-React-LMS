import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <nav
      className="shadow-sm bg-white rounded-3 p-3 w-100"
      style={{ minWidth: 250 }}
    >
      {/* Başlık + toggler (md ve altı için) */}
      <div className="d-flex d-md-none align-items-center justify-content-between mb-2">
        <span className="fw-bold text-dark">Menü</span>
        <button
          className="navbar-toggler icon-shape icon-sm rounded bg-primary text-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#student-sidenav"
          aria-controls="student-sidenav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list" />
        </button>
      </div>

      <div className="collapse d-md-block" id="student-sidenav">
        <div className="nav flex-column w-100">

          <ul className="list-unstyled mb-4">
            <li className="mb-1">
              <NavLink
                to="/student/dashboard"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-grid-fill text-primary" />
                <span>Panel</span>
              </NavLink>
            </li>

            <li className="mb-1">
              <NavLink
                to="/student/courses"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-clipboard-check-fill text-success" />
                <span>Görevlerim</span>
              </NavLink>
            </li>

            <li className="mb-1">
              <NavLink
                to="/student/wishlist"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-heart-fill text-danger" />
                <span>İstekler</span>
              </NavLink>
            </li>
          </ul>

          <div className="text-muted small mb-2">Hesap Ayarları</div>

          <ul className="list-unstyled">
            <li className="mb-1">
              <NavLink
                to="/student/profile"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-pencil-square text-info" />
                <span>Profil Düzenle</span>
              </NavLink>
            </li>

            <li className="mb-1">
              <NavLink
                to="/student/change-password"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-shield-lock-fill text-warning" />
                <span>Şifre Değiştir</span>
              </NavLink>
            </li>

            <li className="mb-1">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 px-0 " +
                  (isActive ? "active fw-semibold text-primary" : "text-body")
                }
              >
                <i className="bi bi-box-arrow-right text-danger" />
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
