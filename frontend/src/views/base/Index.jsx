// ===============================
// Index.jsx
// ===============================
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

// ——— PROJE İÇİ IMPORTLAR ———
import GetCurrentAddress from "../plugin/UserCountry";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import apiInstance from "../../utils/axios";
import "./css/Index.css";
import { useAuthStore } from "../../store/auth";
import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";
import CardImage from "../partials/CardImage";
import VideoShowcase from "../partials/Videoshowcase";

// ——— İKON IMPORTLARI ———
import yonetimIcon from "./icons/yonetim.png";
import stajIcon from "./icons/staj.png";
import akademiIcon from "./icons/akademi.png";
import kuranIcon from "./icons/kuran.png";
import ogrenciIcon from "./icons/ogrenci.png";

/* ==========================================================================
   SVG OK TASARIMLARI
   ========================================================================== */

const ArrowCurly = () => (
  <svg viewBox="0 0 100 100" className="hand-arrow">
    <path
      d="M10,10 C40,10 60,30 60,70"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M45,60 L60,70 L75,55"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowLoop = () => (
  <svg viewBox="0 0 120 100" className="hand-arrow">
    <path
      d="M100,20 C80,0 20,20 40,60 C50,80 80,60 20,90"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M25,75 L20,90 L40,90"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowZigZag = () => (
  <svg viewBox="0 0 100 60" className="hand-arrow">
    <path
      d="M10,30 Q30,10 50,30 T90,30"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M75,20 L90,30 L75,40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowSimple = () => (
  <svg viewBox="0 0 60 100" className="hand-arrow">
    <path
      d="M30,90 Q10,50 30,10"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M15,25 L30,10 L45,25"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

function Index() {
  const [projelist, setProjeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChaos, setIsChaos] = useState(false);

  const rehydrated = useAuthStore((state) => state.rehydrated);
  // eslint-disable-next-line
  const country = GetCurrentAddress().country;
  // eslint-disable-next-line
  const userId = useUserData()?.user_id;

  // Dots parallax (scroll + hafif float)
  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      const y = window.scrollY || 0;
      const t = performance.now() / 1000;

      const dotsY = -(y * 0.22) + Math.sin(t * 0.6) * 6;
      const dotsX = -(y * 0.06) + Math.cos(t * 0.5) * 4;

      document.documentElement.style.setProperty("--dots-y", `${dotsY}px`);
      document.documentElement.style.setProperty("--dots-x", `${dotsX}px`);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!rehydrated) return;

    const fetchProjelist = async () => {
      setIsLoading(true);
      try {
        const res = await apiInstance.get("proje/list/");
        let data = res.data || [];

        const isDershaneExists = data.some((item) => item.name === "Dershane");
        if (!isDershaneExists) {
          data = [...data, { id: 999, name: "Dershane", image: "" }];
        }
        setProjeList(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Toast().fire({ title: "Projeler yüklenemedi", icon: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjelist();
  }, [rehydrated]);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil((projelist?.length || 0) / itemsPerPage)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return projelist.slice(indexOfFirstItem, indexOfLastItem);
  }, [projelist, indexOfFirstItem, indexOfLastItem]);

  const goToPage = (page) => {
    const p = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayName = (backendName) => {
    if (backendName === "Hafızlık Bilgi Sistemi") return "Kurumsal Yönetim Modülü";
    if (backendName === "EHAD Staj ve Kariyer Eğitimi Programı")
      return "Staj ve Kariyer Eğitim Modülü";
    if (backendName === "EHAD Akademi") return "Akademi Modülü";
    if (backendName === "Hafızlık Dinleme Merkezi") return "Kuran Eğitim Modülü";
    if (backendName === "Dershane") return "Öğrenci Takip Modülü";
    return backendName;
  };

  // "Modülü" alt satıra
  const formatCardTitle = (name) => {
    if (name.includes(" Modülü")) {
      const parts = name.split(" Modülü");
      return (
        <>
          {parts[0]}
          <br />
          Modülü
        </>
      );
    }
    return name;
  };

  const fallbackIcon =
    "https://cdn-icons-png.flaticon.com/512/2885/2885458.png";

  const getModuleIcon = (backendName) => {
    switch (backendName) {
      case "Hafızlık Bilgi Sistemi":
        return yonetimIcon;
      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return stajIcon;
      case "EHAD Akademi":
        return akademiIcon;
      case "Hafızlık Dinleme Merkezi":
        return kuranIcon;
      case "Dershane":
        return ogrenciIcon;
      default:
        return fallbackIcon;
    }
  };

  const getLink = (backendName) => {
    if (backendName === "Hafızlık Bilgi Sistemi") return "/hafizbilgi/";
    if (backendName === "EHAD Staj ve Kariyer Eğitimi Programı") return "/eskep/";
    if (backendName === "EHAD Akademi") return "/akademi/";
    if (backendName === "Hafızlık Dinleme Merkezi") return "/hdm/";
    if (backendName === "Dershane") return "/ogrenci-takip/";
    return null;
  };

  /* ==========================================================================
     KAOS AYARLARI
     ========================================================================== */
  const getChaosContent = (name) => {
    switch (name) {
      case "Hafızlık Bilgi Sistemi":
        return {
          text: "Karmaşık Excel?",
          pos: "pos-top-right",
          Arrow: ArrowCurly,
          rotation: "rotateY(180deg) rotate(10deg)",
        };

      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return {
          text: "WhatsApp Grupları",
          pos: "pos-top-left",
          Arrow: ArrowCurly,
          rotation: "rotateY(0deg) rotate(0deg)",
        };

      case "EHAD Akademi":
        return {
          text: "Zoom Linki Nerede?",
          pos: "pos-bottom",
          Arrow: ArrowSimple,
          rotation: "rotate(0deg)",
        };

      case "Hafızlık Dinleme Merkezi":
        return {
          text: "Kağıt Çizelgeler",
          pos: "pos-left-mid",
          Arrow: ArrowSimple,
          rotation: "rotateY(0deg) rotate(90deg)",
        };

      case "Dershane":
        return {
          text: "Not Defteri",
          pos: "pos-bottom-right",
          Arrow: ArrowCurly,
          rotation: "rotate(5deg)",
        };

      default:
        return {
          text: "Dosyalar",
          pos: "pos-top-right",
          Arrow: ArrowCurly,
          rotation: "rotate(0deg)",
        };
    }
  };

  if (!rehydrated) return null;

  return (
    <>
      <HomeHeader />

      <section className="odoo-hero">
        <div className="odoo-container">
          <h1 className="odoo-title">
            İşletmenizin tamamı için <br />
            <span className="text-highlight">tek bir platform.</span>
          </h1>
          <p className="odoo-subtitle">
            Basit, işlevsel ve aynı zamanda{" "}
            <span className="text-underline">bütçenize de uygun!</span>
          </p>
        </div>
      </section>

      <section className="odoo-section">
        <div className="odoo-container">
          <div className="odoo-toggle-wrapper">
            <span className={`toggle-label left ${isChaos ? "" : "active"}`}>
              SİNAPS ile Düzen
            </span>
            <label className="odoo-switch">
              <input
                type="checkbox"
                checked={isChaos}
                onChange={() => setIsChaos(!isChaos)}
              />
              <span className="slider round"></span>
            </label>
            <span
              className={`toggle-label right ${isChaos ? "active-chaos" : ""}`}
            >
              SİNAPS'sız Kaos
            </span>
          </div>

          {isLoading ? (
            <div className="odoo-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="odoo-card skeleton"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="odoo-grid">
                {currentItems.map((s, index) => {
                  const linkTo = getLink(s.name);
                  const displayName = getDisplayName(s.name);
                  const iconSrc = getModuleIcon(s.name);

                  const chaos = getChaosContent(s.name);
                  const ArrowComponent = chaos.Arrow;

                  const CardComponent = (
                    <div
                      className={`odoo-card ${!linkTo ? "disabled" : ""} ${
                        isChaos ? "dimmed" : ""
                      }`}
                    >
                      <div className="odoo-icon-box">
                        <img
                          src={iconSrc}
                          alt={displayName}
                          onError={(e) => {
                            e.currentTarget.src = fallbackIcon;
                          }}
                        />
                      </div>
                      <h3 className="odoo-app-name">
                        {formatCardTitle(displayName)}
                      </h3>
                      {!linkTo && <span className="badge-soon">Yakında</span>}
                    </div>
                  );

                  return (
                    <div
                      key={`${s.id || index}-${s.name}`}
                      className="odoo-card-wrapper"
                    >
                      {linkTo ? (
                        <Link to={linkTo} style={{ textDecoration: "none" }}>
                          {CardComponent}
                        </Link>
                      ) : (
                        CardComponent
                      )}

                      {isChaos && (
                        <div className={`chaos-overlay ${chaos.pos}`}>
                          <span className="chaos-text">{chaos.text}</span>
                          <div
                            className="chaos-svg-wrapper"
                            style={{ transform: chaos.rotation }}
                          >
                            <ArrowComponent />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="odoo-pagination">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <VideoShowcase />

      <CardImage />

      

      

      <HomeFooter />
    </>
  );
}

export default Index;
