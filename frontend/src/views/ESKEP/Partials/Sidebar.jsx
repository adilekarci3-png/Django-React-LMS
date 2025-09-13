// Sidebar.jsx (TEMİZLENMİŞ)
import React from "react";
import { NavLink } from "react-router-dom";
import useUserData from "../../plugin/useUserData";
import { useAuthStore } from "../../../store/auth";

function Sidebar({ stickyTop = 90, className = "" }) {
  const authData = useAuthStore((s) => s.allUserData);
  const userData = useUserData() || {};

  const collectedRoles = [
    ...(authData?.roles?.map?.((r) => r?.name) || []),
    ...(userData?.roles?.map?.((r) => r?.name) || []),
    ...(authData?.base_roles || []),
    ...(userData?.base_roles || []),
    ...(authData?.sub_roles || []),
    ...(userData?.sub_roles || []),
    authData?.role,
    userData?.role,
  ].filter(Boolean).map((x) => String(x).toLowerCase());

  const isStajer =
    Boolean(userData?.is_stajer || authData?.is_stajer) ||
    collectedRoles.some((r) => r.includes("stajer") || r.includes("eskepstajer"));

  const worksBase = isStajer ? "/eskepstajer/works" : "/student/works";

  return (
    <nav
      className={`navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav ${className}`}
      style={{ position: "sticky", top: stickyTop }}
    >
      <a className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3" href="#">
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
        <div className="navbar-nav flex-column w-100">
          <ul className="list-unstyled ms-n2 mb-4">
            <li className="nav-item">
              <NavLink
                to={isStajer ? "/eskepstajer/dashboard/" : "/student/dashboard/"}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="bi bi-grid-fill text-primary"></i>
                <span>Panel</span>
              </NavLink>
            </li>

            {/* Öğrenciye özel menüler: Stajer ise GÖSTERME */}
            {!isStajer && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/student/courses/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-chalkboard-user text-info"></i>
                    <span>Kurslarım</span>
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/student/wishlist/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-heart text-danger"></i>
                    <span>İstekler</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Stajer özel menüler */}
            {isStajer && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/eskepstajer/odevs/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-tasks text-success"></i>
                    <span>Ödevlerim</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/eskepstajer/derssonuraporus/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-file-alt text-info"></i>
                    <span>Ders Sonu Raporlarım</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/eskepstajer/kitaptahlileris/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-book-reader text-warning"></i>
                    <span>Kitap Tahlillerim</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/eskepstajer/projes/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-lightbulb text-danger"></i>
                    <span>Projelerim</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <span className="navbar-header mb-3">Çalışmalarım</span>
          <ul className="list-unstyled ms-n2 mb-4">
            <li className="nav-item">
              <NavLink
                to={`${worksBase}/incele`}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="fas fa-search text-warning"></i>
                <span>İncelemede Olan Çalışmalarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to={`${worksBase}/draft`}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="fas fa-file-alt text-secondary"></i>
                <span>Taslakta Olan Çalışmalarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to={`${worksBase}/passive`}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="fas fa-pause-circle text-muted"></i>
                <span>Pasifte Olan Çalışmalarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to={`${worksBase}/rejected`}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="fas fa-times-circle text-danger"></i>
                <span>Reddedilmiş Çalışmalarım</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to={`${worksBase}/submitted`}
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="fas fa-check-circle text-success"></i>
                <span>Teslim Edilmiş Çalışmalarım</span>
              </NavLink>
            </li>
          </ul>

          {/* Hesap Ayarları: Stajer ise STUDENT yollarını GÖSTERME */}
          {!isStajer && (
            <>
              <span className="navbar-header mb-3">Hesap Ayarları</span>
              <ul className="list-unstyled ms-n2 mb-0">
                <li className="nav-item">
                  <NavLink
                    to="/student/profile/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-edit text-warning"></i>
                    <span>Profil Düzenle</span>
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/student/change-password/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-lock text-secondary"></i>
                    <span>Şifre Değiştir</span>
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/login/"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="fas fa-sign-out-alt text-danger"></i>
                    <span>Çıkış Yap</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;