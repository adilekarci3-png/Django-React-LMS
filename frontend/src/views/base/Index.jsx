import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import GetCurrentAddress from "../plugin/UserCountry";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";
import apiInstance from "../../utils/axios";
import "./css/Index.css";
import { useAuthStore } from "../../store/auth";
import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";

function Index() {
  const [projelist, setProjeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const rehydrated = useAuthStore((state) => state.rehydrated);

  // (Kullanacaksan dursun, değilse kaldırabilirsin)
  const country = GetCurrentAddress().country; // eslint-disable-line
  const userId = useUserData()?.user_id;      // eslint-disable-line

  useEffect(() => {
    if (!rehydrated) return;
    const fetchProjelist = async () => {
      setIsLoading(true);
      try {
        const res = await apiInstance.get("proje/list/");
        setProjeList(res.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Toast().fire({ title: "Projeler yüklenemedi", icon: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjelist();
  }, [rehydrated]);

  // ——— Sayfalandırma ———
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((projelist?.length || 0) / itemsPerPage));
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

  // ——— Açıklamalar ———
  const getModuleDescription = (name) => {
    switch (name) {
      case "Hafızlık Bilgi Sistemi":
        return "Hafız kayıtlarını ve gelişim takibini yönetin";
      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return "Staj ve proje süreçlerini yönetin";
      case "EHAD Akademi":
        return "İslami ilimlerin dijital ortamda takibini sağlayın";
      case "Hafızlık Dinleme Merkezi":
        return "Sesli tekrar ve dinleme sistemini yönetin";
      default:
        return "Bu modül hakkında yakında bilgi eklenecek.";
    }
  };

  // ——— Linkler ———
  const getButtonLabelAndLink = (name) => {
    switch (name) {
      case "Hafızlık Bilgi Sistemi":
        return { label: "HBS'ye Git", to: "/hafizbilgi/" };
      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return { label: "ESKEP'e Git", to: "/eskep/" };
      case "EHAD Akademi":
        return { label: "AKADEMİ'ye Git", to: "/akademi/" };
      case "Hafızlık Dinleme Merkezi":
        return { label: "HDM'ye Git", to: "/hdm/" };
      default:
        return null;
    }
  };

  if (!rehydrated) return null;

  // (İsteğe bağlı) görsel yolu absolute değilse backend origin’i ekle
  const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";
  const buildImgSrc = (url) => (url?.startsWith("http") ? url : `${API_BASE}${url || ""}`);

  return (
    <>
      <HomeHeader />

      {/* Basit başlık alanı */}
      <section className="ix-hero">
        <div className="ix-container">
          <h1 className="ix-title">İZEM – Hafızların Dijital Kapısı</h1>
          <p className="ix-subtitle">Akıllı Altyapı, Entegre Sistem</p>
        </div>
      </section>

      {/* İçerik */}
      <section className="ix-section">
        <div className="ix-container">
          {isLoading ? (
            <div className="ix-grid">
              {[1, 2, 3, 4].map((i) => (
                <article key={i} className="ix-card skeleton">
                  <div className="ix-cover skeleton-box" />
                  <div className="ix-body">
                    <div className="sk-line w-60" />
                    <div className="sk-line w-90" />
                    <div className="sk-pill w-40" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <>
              <div className="ix-grid">
                {currentItems.map((s, index) => {
                  const route = getButtonLabelAndLink(s.name);
                  const description = getModuleDescription(s.name);
                  const imgSrc = buildImgSrc(s.image);

                  return (
                    <article className="ix-card" key={`${s.id || index}-${s.name}`}>
                      <div className="ix-cover">
                        <img
                          src={imgSrc}
                          alt={s.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-module.png";
                            e.currentTarget.style.objectFit = "contain";
                            e.currentTarget.style.background = "#f3f5f7";
                          }}
                        />
                      </div>
                      <div className="ix-body">
                        <h3 className="ix-name">{s.name}</h3>
                        <p className="ix-desc">{description}</p>
                        <div className="ix-actions">
                          {route ? (
                            <Link to={route.to} className="ix-btn">
                              {route.label}
                            </Link>
                          ) : (
                            <button className="ix-btn disabled" disabled>
                              Yakında
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pager */}
              {totalPages > 1 && (
                <nav className="ix-pager" aria-label="Sayfalandırma">
                  <button
                    className="ix-pager-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Önceki
                  </button>

                  <ul className="ix-pager-pages" role="list">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      const active = page === currentPage;
                      return (
                        <li key={page}>
                          <button
                            className={`ix-page${active ? " active" : ""}`}
                            aria-current={active ? "page" : undefined}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    className="ix-pager-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki ›
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <HomeFooter />
    </>
  );
}

export default Index;
