import React from "react";
import { NavLink } from "react-router-dom";
import useUserData from "../../plugin/useUserData";
import { useAuthStore } from "../../../store/auth";

function Sidebar({ stickyTop = 90, className = "" }) {
  const authData = useAuthStore((s) => s.allUserData);
  const userData = useUserData() || {};

  const baseRoles = [
    ...(authData?.base_roles || []),
    ...(userData?.base_roles || []),
  ];
  const subRoles = [
    ...(authData?.sub_roles || []),
    ...(userData?.sub_roles || []),
  ];

  const isOTMKoordinator =
    baseRoles.includes("Koordinator") && subRoles.includes("OTMKoordinator");
  const isOTMOgretmen = baseRoles.includes("Teacher");
  const isOTMOgrenci =
    baseRoles.includes("Ogrenci") && subRoles.includes("OTMOgrenci");
  const isKoclukYetkili = isOTMKoordinator || isOTMOgretmen;
  const isDenemeYonetici = isOTMKoordinator || isOTMOgretmen;

  return (
    <nav
      className={`navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav ${className}`}
      style={{ position: "sticky", top: stickyTop }}
    >
      <a
        className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3"
        href="#"
      >
        Menü
      </a>

      <button
        className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-3"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#otm-sidenav"
        aria-controls="otm-sidenav"
        aria-expanded="false"
        aria-label="Menüyü Aç"
      >
        <span className="bi bi-grid" />
      </button>

      <div className="collapse navbar-collapse p-3" id="otm-sidenav">
        <div className="navbar-nav flex-column w-100">

          {/* ─── GENEL ─── */}
          <span className="navbar-header mb-2">Genel</span>
          <ul className="list-unstyled ms-n2 mb-4">
            <li className="nav-item">
              <NavLink
                to="/ogrenci-takip/"
                className={({ isActive }) =>
                  "nav-link d-flex align-items-center gap-2 " +
                  (isActive ? "active" : "")
                }
              >
                <i className="bi bi-house text-primary"></i>
                <span>OTM Ana Sayfa</span>
              </NavLink>
            </li>
          </ul>

          {/* ─── KOÇLUK (Öğretmen veya Koordinatör) ─── */}
          {isKoclukYetkili && (
            <>
              <span className="navbar-header mb-2">Koçluk</span>
              <ul className="list-unstyled ms-n2 mb-4">
                <li className="nav-item">
                  <NavLink
                    to="/otm/kocluk/planlar"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-person-lines-fill text-danger"></i>
                    <span>Koçluk Paneli</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}

          {/* ─── YOKLAMA (Öğretmen) ─── */}
          {isOTMOgretmen && (
            <>
              <span className="navbar-header mb-2">Yoklama</span>
              <ul className="list-unstyled ms-n2 mb-4">
                <li className="nav-item">
                  <NavLink
                    to="/otm/ogretmen/yoklama-al"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-calendar2-check-fill text-success"></i>
                    <span>Yoklama Al</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}

          {/* ─── YOKLAMA (Koordinatör) ─── */}
          {isOTMKoordinator && (
            <>
              <span className="navbar-header mb-2">Yoklama</span>
              <ul className="list-unstyled ms-n2 mb-4">
                <li className="nav-item">
                  <NavLink
                    to="/otm/koordinator/yoklama-ozet"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-grid-3x3-gap text-success"></i>
                    <span>Yoklama Özeti</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/otm/koordinator/devam-raporlari"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-bar-chart-line text-info"></i>
                    <span>Devam Raporları</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}

          {/* ─── DENEME ─── */}
          {(isDenemeYonetici || isOTMOgrenci) && (
            <>
              <span className="navbar-header mb-2">Deneme</span>
              <ul className="list-unstyled ms-n2 mb-4">
                {isDenemeYonetici && (
                  <>
                    <li className="nav-item">
                      <NavLink
                        to="/otm/deneme/yukle"
                        className={({ isActive }) =>
                          "nav-link d-flex align-items-center gap-2 " +
                          (isActive ? "active" : "")
                        }
                      >
                        <i className="bi bi-file-earmark-arrow-up-fill text-warning"></i>
                        <span>Deneme Yönetimi</span>
                      </NavLink>
                    </li>
                  </>
                )}
                {isOTMOgrenci && (
                  <>
                    <li className="nav-item">
                      <NavLink
                        to="/otm/ogrenci/denemelerim"
                        className={({ isActive }) =>
                          "nav-link d-flex align-items-center gap-2 " +
                          (isActive ? "active" : "")
                        }
                      >
                        <i className="bi bi-journal-text text-warning"></i>
                        <span>Denemelerim</span>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/otm/ogrenci/deneme-sonuclari"
                        className={({ isActive }) =>
                          "nav-link d-flex align-items-center gap-2 " +
                          (isActive ? "active" : "")
                        }
                      >
                        <i className="bi bi-graph-up text-danger"></i>
                        <span>Sonuçlarım</span>
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </>
          )}

          {/* ─── KOORDİNATÖR ─── */}
          {isOTMKoordinator && (
            <>
              <span className="navbar-header mb-2">Koordinatör</span>
              <ul className="list-unstyled ms-n2 mb-4">
                <li className="nav-item">
                  <NavLink
                    to="/otm/koordinator/ogrenci-listesi"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-people text-primary"></i>
                    <span>Öğrenci Listesi</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/otm/koordinator/raporlar"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-bar-chart-line text-info"></i>
                    <span>Raporlar</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}

          {/* ─── ÖĞRENCİ ─── */}
          {isOTMOgrenci && (
            <>
              <span className="navbar-header mb-2">Öğrenci</span>
              <ul className="list-unstyled ms-n2 mb-4">
                <li className="nav-item">
                  <NavLink
                    to="/otm/ogrenci/dashboard"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-grid text-primary"></i>
                    <span>Panelim</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/otm/ogrenci/notlarim"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-bar-chart text-success"></i>
                    <span>Notlarım</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/otm/ogrenci/devam"
                    className={({ isActive }) =>
                      "nav-link d-flex align-items-center gap-2 " +
                      (isActive ? "active" : "")
                    }
                  >
                    <i className="bi bi-calendar-check text-warning"></i>
                    <span>Devam Durumum</span>
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




