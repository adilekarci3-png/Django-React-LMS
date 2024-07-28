import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="col-lg-3 col-md-4 col-12">
      <nav className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav">
        <a
          className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3"
          href="#"
        >
          Menu
        </a>
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
          <div className="navbar-nav flex-column">
            <ul className="list-unstyled ms-n2 mb-4">
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/dashboard/`}>
                  {" "}
                  <i className="bi bi-grid-fill me-2"></i> Panel
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/courses/`}>
                  {" "}
                  <i className="fas fa-chalkboard-user me-2"></i>Kurslarım
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/create-course/`}>
                  {" "}
                  <i className="fas fa-plus me-2"></i>Kurs Oluştur
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/reviews/`}>
                  {" "}
                  <i className="fas fa-star me-2"></i>Yorum
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/students/`}>
                  {" "}
                  <i className="fas fa-graduation-cap me-2"></i>Öğrenciler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/earning/`}>
                  {" "}
                  <i className="fas fa-turkish-lira me-2"></i>Bağış
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to={`/instructor/coupon/`}>
                  {" "}
                  <i className="fas fa-tag me-2"></i>Ödüller
                </Link>
                <li className="nav-item">
                  <Link className="nav-link " to={`/instructor/notifications/`}>
                    {" "}
                    <i className="fas fa-bell me-2"></i>Bildirimler
                  </Link>
                </li>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/instructor/orders/`}>
                  {" "}
                  <i className="fas fa-commenting"></i> Kurs Talepleri{" "}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/instructor/question-answer/`}>
                  {" "}
                  <i className="fas fa-envelope me-2"></i> Soru/Cevap{" "}
                </Link>
              </li>
            </ul>

            {/* Navbar header */}
            <span className="navbar-header mb-3">Hesap Ayarları</span>
            <ul className="list-unstyled ms-n2 mb-0">
              <li className="nav-item">
                <Link className="nav-link" to={`/instructor/profile/`}>
                  {" "}
                  <i className="fas fa-edit"></i> Profili Düzenle
                </Link>
              </li>
              <li className="nav-item ">
                <Link className="nav-link" to={`/instructor/change-password/`}>
                  {" "}
                  <i className="fas fa-lock"></i> Şifre Değiştir
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/login/`}>
                  {" "}
                  <i className="fas fa-sign-out-alt"></i> Çıkış Yap
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
