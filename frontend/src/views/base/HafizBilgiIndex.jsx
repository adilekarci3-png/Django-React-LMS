import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import hafizlikImage from "./images/4.png";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import "./css/hbs-theme.css";

/* ── Reveal (orijinal korundu) ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ as: Tag = "div", delay = 0, className = "", children, threshold = 0.15 }) {
  const [ref, visible] = useReveal(threshold);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default function HafizBilgiIndex() {
  return (
    <div className="page-hbs hbs-solid">
      <HBSBaseHeader />

      {/* HERO */}
      <div className="hbs-hero-wrap">
        <div className="hbs-hero-layout">

          {/* Sol metin */}
          <div>
            <div className="hbs-eyebrow">
              <span className="hbs-eyebrow-dot"></span>
              EHAD • HBS
            </div>
            <h1 className="hbs-hero-title">
              Hafızlar <em>Bilgi Sistemi</em>
            </h1>
            <p className="hbs-hero-lead">
              Hafız adaylarının eğitim ve gelişim süreçlerini izleyebileceğiniz modern dijital yönetim sistemi.
            </p>

            {/* Hızlı etiketler */}
            <div className="hbs-hero-badges">
              <span className="hbs-badge"><i className="bi bi-person"></i> Öğrenci</span>
              <span className="hbs-badge"><i className="bi bi-easel2"></i> Eğitmen</span>
              <span className="hbs-badge"><i className="bi bi-bar-chart-line"></i> Raporlar</span>
            </div>

            {/* CTA'lar */}
            <div className="hbs-hero-actions">
              <Link to="/hbs/login" className="hbs-btn-amber">Panele Giriş <i className="bi bi-arrow-right"></i></Link>
              <Link to="/hbs/register" className="hbs-btn-glass"><i className="bi bi-person-plus"></i> Kayıt Ol</Link>
            </div>
          </div>

          {/* Sağ görsel kart */}
          <div className="hbs-hero__media">
            <div className="hbs-hero__card">
              <div className="hbs-hero__icon">
                <i className="bi bi-person-badge-fill"></i>
              </div>
              <div className="hbs-hero__card-label">Hafızlar Bilgi Sistemi</div>
              <div className="hbs-hero__card-sub">+8.500 hafız adayı ile büyüyoruz</div>
            </div>
            <div className="hbs-pill hbs-pill--top">
              <span className="hbs-pill-dot hbs-pill-dot--amber"></span> Kayıtlı Hafız: 8.500+
            </div>
            <div className="hbs-pill hbs-pill--bottom">
              <span className="hbs-pill-dot hbs-pill-dot--green"></span> %98 Doğruluk
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <section className="hbs-stats-section">
        <div className="hbs-stats__grid">
          {[
            { icon: "bi-person-badge", value: "+8.500",      label: "Kayıtlı Hafız"  },
            { icon: "bi-shield-check", value: "%98",          label: "Doğruluk"       },
            { icon: "bi-activity",     value: "Haftalık 3.2k",label: "Okuma Kaydı"   },
            { icon: "bi-shield-lock",  value: "KVKK",         label: "Uyumlu"         },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="hbs-stat-card hover-lift">
                <div className="hbs-stat-icon"><i className={`bi ${s.icon}`} /></div>
                <div>
                  <div className="hbs-stat-value">{s.value}</div>
                  <div className="hbs-stat-label">{s.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Hızlı aksiyon çubuğu */}
      <section className="hbs-quickbar">
        <div className="hbs-qb-wrap">
          <Reveal delay={0}>
            <Link to="/hafizbilgi/create-hafizbilgi/" className="hbs-qb-item hover-lift">
              <i className="bi bi-journal-plus" />
              <span>Hafız Bilgi Ekle</span>
            </Link>
          </Reveal>
          <Reveal delay={70}>
            <Link to="/hafizbilgi/list/" className="hbs-qb-item hover-lift">
              <i className="bi bi-people" />
              <span>Hafız Listesi</span>
            </Link>
          </Reveal>
          <Reveal delay={140}>
            <Link to="/calendar" className="hbs-qb-item hover-lift">
              <i className="bi bi-calendar2-week" />
              <span>Takvim</span>
            </Link>
          </Reveal>
          <Reveal delay={210}>
            <Link to="/reports" className="hbs-qb-item hover-lift">
              <i className="bi bi-bar-chart-line" />
              <span>Raporlar</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Özellikler */}
      <section className="hbs-features-section">
        <div className="hbs-features__inner">
          <div className="hbs-section-label">Özellikler</div>
          <h2 className="hbs-section-title">Kapsamlı araçlar</h2>
          <p className="hbs-section-sub">Hafız yönetimini güçlendirecek her şey burada</p>
          <div className="hbs-features__grid">
            {[
              { icon: "bi-person-lines-fill", title: "Hafız Profilleri",  text: "İlerleme, notlar, sınav/rapor tek ekranda." },
              { icon: "bi-calendar2-week",    title: "Takvim & Randevu",  text: "Ders ve dinleme planlaması pratik."          },
              { icon: "bi-journal-check",     title: "Hata Takip",        text: "Etiketle, rapora otomatik yansısın."         },
              { icon: "bi-cloud-arrow-up",    title: "Kayıt Yükleme",     text: "Ses/video güvenle saklanır."                 },
              { icon: "bi-people",            title: "Ekip Çalışması",    text: "Eğitmen-öğrenci-veli koordinasyonu."        },
              { icon: "bi-download",          title: "Rapor Dışa Aktar",  text: "PDF/Excel tek tıkla."                        },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="hbs-feature-card hover-lift">
                  <div className="hbs-feature-icon"><i className={`bi ${f.icon}`} /></div>
                  <div className="hbs-feature-title">{f.title}</div>
                  <p className="hbs-feature-desc">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Callout */}
      <Reveal as="section" className="hbs-callout" threshold={0.2}>
        <div className="hbs-callout__wrap">
          <div className="hbs-callout__text">
            <h4>Hafız kaydını bugün başlat</h4>
            <p>Binlerce hafız adayını tek platformdan kolayca yönet.</p>
          </div>
          <div className="hbs-callout__actions">
            <Link to="/hafizbilgi/create-hafizbilgi/" className="hbs-callout__btn hbs-callout__btn--white">
              Hafız Bilgi Ekle <i className="bi bi-arrow-right"></i>
            </Link>
            <Link to="/hafizbilgi/list/" className="hbs-callout__btn hbs-callout__btn--ghost">
              Hafız Listesi
            </Link>
          </div>
        </div>
      </Reveal>

      <HBSBaseFooter />
    </div>
  );
}