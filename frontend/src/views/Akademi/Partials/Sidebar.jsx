import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav className="navbar navbar-expand-md shadow-sm sidenav bg-white rounded-3 p-3 w-100" style={{ minWidth: '250px' }}>
      <a className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark mb-3 d-block" href="#">
        Menü
      </a>
      <button
        className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light mb-3"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidenav"
        aria-controls="sidenav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="bi bi-grid" />
      </button>
      <div className="collapse navbar-collapse" id="sidenav">
        <div className="navbar-nav flex-column w-100">
          <ul className="list-unstyled mb-4">
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/student/dashboard">
                <i className="bi bi-grid-fill me-2"></i> Panel
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/student/courses">
                <i className="fas fa-chalkboard-user me-2"></i> Görevlerim
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/student/wishlist">
                <i className="fas fa-heart me-2"></i> İstekler
              </Link>
            </li>
          </ul>

          <span className="navbar-header mb-2 text-muted">Hesap Ayarları</span>
          <ul className="list-unstyled">
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/student/profile">
                <i className="fas fa-edit me-2"></i> Profil Düzenle
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/student/change-password">
                <i className="fas fa-lock me-2"></i> Şifre Değiştir
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/login">
                <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
