import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import { useAuthStore } from "../../store/auth";

// HDM'deki menüleri burada da kullanıyoruz
import KoordinatorMenu from "../partials/menus/CoordinatorMenu";
import StajerMenu from "../partials/menus/StajerMenu";
import OgrenciMenu from "../partials/menus/OgrenciMenu";

import "./css/eskep-aqua.css";
import EgitmenMenu from "./menus/EgitmenMenu";

export default function ESKEPBaseHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  // store'dan veriler
  const [isLoggedIn] = useAuthStore((s) => [s.isLoggedIn]);
  const [baseRoles, subRoles] = useAuthStore((s) => [
    s.allUserData?.base_roles || [],
    s.allUserData?.sub_roles || [],
  ]);

  // Koordinatör mü?
  const isEskepKoordinator =
    baseRoles.includes("Koordinator") &&
    (
      subRoles.includes("ESKEPOgrenciKoordinator") ||
      subRoles.includes("ESKEPStajerKoordinator") ||
      subRoles.includes("ESKEPGenelKoordinator")
    );

  // 🔐 sadece ESKEPGenelKoordinator olanlar iletişim mesajlarını görsün
  const canSeeContactMessages = subRoles.includes("ESKEPGenelKoordinator");

  // Stajer mi?
  const isEskepStajer =
    baseRoles.includes("Stajer") && subRoles.includes("ESKEPStajer");

  // Öğrenci mi?
  const isEskepOgrenci =
    baseRoles.includes("Ogrenci") && subRoles.includes("ESKEPOgrenci");

  const isEskepEgitmen = baseRoles.includes("Teacher") && subRoles.includes("ESKEPEgitmen");

  const onSubmit = (e) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    navigate(`/search?search=${encodeURIComponent(s)}`);
    setOpen(false);
  };

  return (
    <header className="eskep-header">
      <div className="eskep-container">
        <nav className="eskep-navbar" aria-label="ESKEP üst menü">
          {/* Sol: logo */}
          <Link className="eskep-brand" to="/" onClick={() => setOpen(false)}>
            <span className="eskep-logo" />
            <span>ESKEP</span>
          </Link>

          {/* Orta: menüler (sola yaslı) */}
          <div className="eskep-nav" role="navigation" aria-label="Birincil menü">
            <NavLink className="eskep-link" to="/about-eskep">
              Hakkımızda
            </NavLink>
            <NavLink className="eskep-link" to="/org-chart">
              Organizasyon
            </NavLink>
            <NavLink className="eskep-link" to="/eskep/egitim-takvimi/">
              Eğitim Takvimi
            </NavLink>

            {/* Koordinatör menüsü */}
            {isEskepKoordinator && <KoordinatorMenu />}

            {/* 🔐 sadece ESKEPGenelKoordinator ise göster */}
            {/* {canSeeContactMessages && (
              <NavLink className="eskep-link" to="/contact-messages">
                İletişim Mesajları
              </NavLink>
            )} */}

            {/* Stajer menüsü */}
            {isEskepStajer && <StajerMenu />}

            {/* Öğrenci menüsü */}
            {isEskepOgrenci && <OgrenciMenu />}

            {isEskepEgitmen && <EgitmenMenu />}
          </div>

          {/* Sağ: arama + giriş */}
          <div className="eskep-actions">
            <form
              className="eskep-search"
              onSubmit={onSubmit}
              role="search"
              aria-label="Site içi arama"
            >
              <input
                type="search"
                placeholder="Ara"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Arama"
              />
              <button type="submit" aria-label="Ara">
                <FaSearch size={14} />
              </button>
            </form>

            {isLoggedIn && isLoggedIn() ? (
              <Link className="eskep-btn" to="/logout">
                Çıkış
              </Link>
            ) : (
              <>
                <Link className="eskep-btn" to="/login">
                  <FaSignInAlt style={{ marginRight: 6 }} />
                  Giriş
                </Link>
                <Link className="eskep-btn eskep-btn-cta" to="/register">
                  <FaUserPlus style={{ marginRight: 6 }} />
                  Kayıt
                </Link>
              </>
            )}

            <button
              className="eskep-burger"
              aria-label="Menüyü aç/kapat"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobil menü */}
      <div className={`eskep-mobile ${open ? "open" : ""}`}>
        <div className="eskep-container wrap">
          <NavLink to="/about-eskep" onClick={() => setOpen(false)}>
            Hakkımızda
          </NavLink>
          <NavLink to="/org-chart" onClick={() => setOpen(false)}>
            Organizasyon
          </NavLink>
          <NavLink to="/eskep/egitim-takvimi/" onClick={() => setOpen(false)}>
            Eğitim Takvimi
          </NavLink>

          {isEskepKoordinator && (
            <div onClick={() => setOpen(false)}>
              {/* KoordinatorMenu masaüstü için tasarlandığı için mobilde çok sütunlu çıkabilir.
                  Eğer sorun olursa buraya ayrı bir mobil liste yaparız. */}
              <KoordinatorMenu />
            </div>
          )}

          {/* 🔐 mobilde de göster */}
          {canSeeContactMessages && (
            <NavLink to="/contact-messages" onClick={() => setOpen(false)}>
              İletişim Mesajları
            </NavLink>
          )}

          {isEskepStajer && (
            <div onClick={() => setOpen(false)}>
              <StajerMenu />
            </div>
          )}
          {isEskepOgrenci && (
            <div onClick={() => setOpen(false)}>
              <OgrenciMenu />
            </div>
          )}

          {isLoggedIn && isLoggedIn() ? (
            <NavLink to="/logout" onClick={() => setOpen(false)}>
              Çıkış
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Giriş
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>
                Kayıt
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
