import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 sidenav bg-white rounded border px-3 position-sticky top-0">
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light my-3"
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
          <div className="navbar-nav flex-column">
            <ul className="list-unstyled mb-4">
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/dashboard/") ? "active fw-bold text-primary" : ""}`} to="/instructor/dashboard/">
                  <i className="bi bi-grid-fill me-2"></i> Panel
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/courses/") ? "active fw-bold text-primary" : ""}`} to="/instructor/courses/">
                  <i className="fas fa-chalkboard-user me-2"></i> Kurslarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/create-course/") ? "active fw-bold text-primary" : ""}`} to="/instructor/create-course/">
                  <i className="fas fa-plus me-2"></i> Kurs Oluştur
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/reviews/") ? "active fw-bold text-primary" : ""}`} to="/instructor/reviews/">
                  <i className="fas fa-star me-2"></i> Yorumlar
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/students/") ? "active fw-bold text-primary" : ""}`} to="/instructor/students/">
                  <i className="fas fa-graduation-cap me-2"></i> Öğrenciler
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/earning/") ? "active fw-bold text-primary" : ""}`} to="/instructor/earning/">
                  <i className="fas fa-turkish-lira me-2"></i> Bağışlar
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/coupon/") ? "active fw-bold text-primary" : ""}`} to="/instructor/coupon/">
                  <i className="fas fa-tag me-2"></i> Ödüller
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/notifications/") ? "active fw-bold text-primary" : ""}`} to="/instructor/notifications/">
                  <i className="fas fa-bell me-2"></i> Bildirimler
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/orders/") ? "active fw-bold text-primary" : ""}`} to="/instructor/orders/">
                  <i className="fas fa-commenting me-2"></i> Kurs Talepleri
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/question-answer/") ? "active fw-bold text-primary" : ""}`} to="/instructor/question-answer/">
                  <i className="fas fa-envelope me-2"></i> Soru / Cevap
                </Link>
              </li>
            </ul>
            <hr />
            <span className="navbar-header text-muted mb-2">Hesap Ayarları</span>
            <ul className="list-unstyled">
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/profile/") ? "active fw-bold text-primary" : ""}`} to="/instructor/profile/">
                  <i className="fas fa-edit me-2"></i> Profili Düzenle
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/instructor/change-password/") ? "active fw-bold text-primary" : ""}`} to="/instructor/change-password/">
                  <i className="fas fa-lock me-2"></i> Şifre Değiştir
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-danger" to="/login/">
                  <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
