import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="col-lg-12 col-md-12 col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav bg-white rounded">
        <button
          className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-white m-3"
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
          <div className="navbar-nav flex-column w-100">
            {/* GENEL İŞLEMLER */}
            <h6 className="navbar-header">Genel İşlemler</h6>
            <ul className="list-unstyled ms-n2 mb-4">
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/dashboard/`}>
                  <i className="bi bi-grid-fill text-primary me-2"></i> Panel
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/odevs/`}>
                  <i className="fas fa-tasks text-success me-2"></i> Ödevlerim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/derssonuraporus/`}>
                  <i className="fas fa-file-alt text-info me-2"></i> Ders Sonu Raporlarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/kitaptahlileris/`}>
                  <i className="fas fa-book-reader text-warning me-2"></i> Kitap Tahlillerim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/projes/`}>
                  <i className="fas fa-lightbulb text-danger me-2"></i> Projelerim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/wishlist/`}>
                  <i className="fas fa-heart text-danger me-2"></i> İstekler
                </Link>
              </li>
            </ul>

            {/* ÇALIŞMA DURUMLARI */}
            <h6 className="navbar-header">Çalışma Durumları</h6>
            <ul className="list-unstyled ms-n2 mb-4">
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/works/incele`}>
                  <i className="fas fa-clock text-info me-2"></i>
                  İncelemede Olan Çalışmalarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/works/draft`}>
                  <i className="fas fa-archive text-secondary me-2"></i>
                  Taslakta Olan Çalışmalarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/works/passive`}>
                  <i className="fas fa-pause-circle text-dark me-2"></i>
                  Pasifte Olan Çalışmalarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/works/rejected`}>
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Reddedilmiş Çalışmalarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskepstajer/works/submitted`}>
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Teslim Edilmiş Çalışmalarım
                </Link>
              </li>
            </ul>

            {/* HESAP AYARLARI */}
            <h6 className="navbar-header">Hesap Ayarları</h6>
            <ul className="list-unstyled ms-n2">
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskep/profile-edit/`}>
                  <i className="fas fa-edit text-secondary me-2"></i> Profil Düzenle
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/eskep/change-password/`}>
                  <i className="fas fa-lock text-dark me-2"></i> Şifre Değiştir
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to={`/login/`}>
                  <i className="fas fa-sign-out-alt text-danger me-2"></i> Çıkış Yap
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
