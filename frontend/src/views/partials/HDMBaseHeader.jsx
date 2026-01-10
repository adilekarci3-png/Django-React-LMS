import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";
import EgitmenMenu from "../partials/menus/EgitmenMenu";
import HafizMenu from "../partials/menus/HafizMenu";
import HDMMenu from "./menus/HDMMenu";
import "./css/HDMGirisPage.css";

function HDMBaseHeader() {
  const [now, setNow] = useState(new Date());

  // auth store'dan roller
  const [isLoggedIn] = useAuthStore((s) => [s.isLoggedIn]);
  const [baseRoles, subRoles] = useAuthStore((s) => [
    s.allUserData?.base_roles || [],
    s.allUserData?.sub_roles || [],
  ]);

  // sadece HDMKoordinator olan (ve base'de de Koordinator olan) kişiler görsün
  const isHDMKoordinator =
    baseRoles.includes("Koordinator") && subRoles.includes("HDMKoordinator");

  // diğer HDM rollerin de istersen ileride kullanırsın
  const isHDMStajer =
    baseRoles.includes("Stajer") && subRoles.includes("HDMStajer");
  const isHDMOgrenci =
    baseRoles.includes("Ogrenci") && subRoles.includes("HDMOgrenci");
  const isHDMEgitmen =
    baseRoles.includes("Teacher") && subRoles.includes("HDMEgitmen");
  const isHDMHafiz =
    baseRoles.includes("Hafiz") && subRoles.includes("HDMHafiz");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeTR = (d) =>
    d
      .toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", "");

  return (
    <header className="hdm-min-header">
      <nav className="navbar navbar-expand-lg">
        <div className="container px-3 px-lg-4">
          <Link to="/" className="navbar-brand text-white fw-semibold">
            <span className="hdm-logo-dot me-2" /> HDM
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#hdmNav"
          >
            <span className="hdm-burger" />
          </button>

          <div className="collapse navbar-collapse" id="hdmNav">
            <ul className="navbar-nav me-auto align-items-lg-center gap-lg-1">
              <li className="nav-item">
                <NavLink to="/contact" className="nav-link hdm-link">
                  <i className="fas fa-phone me-1" /> İletişim
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/hdm/hafizgeneltakvim/" className="nav-link hdm-link">
                  <i className="fas fa-calendar me-1" /> Genel Takvim
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about-hdm" className="nav-link hdm-link">
                  <i className="fas fa-address-card me-1" /> Hakkımızda
                </NavLink>
              </li>

              {/* HDM ana menü */}
              <HDMMenu />

              {/* SADECE HDM KOORDİNATÖR */}
              {isHDMKoordinator && <KoordinatorMenu />}

              {/* Dilersen ileride açarsın
              {isHDMStajer && <StajerMenu />}
              {isHDMOgrenci && <OgrenciMenu />}
              {isHDMEgitmen && <EgitmenMenu />}
              {isHDMHafiz && <HafizMenu />} */}
            </ul>

            <div className="d-none d-lg-flex align-items-center gap-3">
              <span className="text-white-50 small">{timeTR(now)}</span>
              {isLoggedIn() ? (
                <Link to="/logout/" className="btn btn-outline-light btn-sm">
                  Çıkış Yap
                </Link>
              ) : (
                <>
                  <Link to="/login/" className="btn btn-outline-light btn-sm">
                    Giriş Yap
                  </Link>
                  <Link to="/register/" className="btn btn-cta btn-sm">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HDMBaseHeader;
