import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="col-lg-2 col-md-4 col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav">
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidenav"
          aria-controls="sidenav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="bi bi-grid" />
        </button>
        <div className="collapse navbar-collapse p-3" id="sidenav">
          <ul className="navbar-nav flex-column w-100">
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/dashboard/`}>
                <i className="bi bi-grid-fill me-2"></i> Panel
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/instructor/courses/`}>
                <i className="fas fa-chalkboard-user me-2"></i> Kurslarım
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/instructor/create-course/`}>
                <i className="fas fa-plus me-2"></i> Kurs Oluştur
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/instructor/reviews/`}>
                <i className="fas fa-star me-2"></i> Yorumlar
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/ogrenciler/`}>
                <i className="fas fa-graduation-cap me-2"></i> Öğrenciler
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/earning/`}>
                <i className="fas fa-turkish-lira-sign me-2"></i> Bağışlar
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/coupon/`}>
                <i className="fas fa-tag me-2"></i> Ödüller
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/notifications/`}>
                <i className="fas fa-bell me-2"></i> Bildirimler
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/orders/`}>
                <i className="fas fa-comment-dots me-2"></i> Kurs Talepleri
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/question-answer/`}>
                <i className="fas fa-envelope-open-text me-2"></i> Soru/Cevap
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to={`/eskepinstructor/koordinator-ata/`}>
                <i className="fas fa-user-shield me-2"></i> Yetki Ata
              </Link>
            </li>
            <li className="nav-item mb-3">
              <Link className="nav-link" to={`/eskepinstructor/egitmen-ekle/`}>
                <i className="fas fa-user-plus me-2"></i> Eğitmen Ekle
              </Link>
            </li>

            <li className="nav-item">
              <span className="nav-link text-muted fw-bold small">Hesap Ayarları</span>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/eskepinstructor/profile/`}>
                <i className="fas fa-user-edit me-2"></i> Profili Düzenle
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/instructor/change-password/`}>
                <i className="fas fa-lock me-2"></i> Şifre Değiştir
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-danger" to={`/login/`}>
                <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
