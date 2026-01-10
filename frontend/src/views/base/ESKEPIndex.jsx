import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import eskepImage from "./images/1.png";
import "./css/eskep-theme.css";

/* --- küçük yardımcılar: reveal ve sayacı koruyoruz --- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([ent]) => { if (ent.isIntersecting) { setVisible(true); io.unobserve(el); } },
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
function CountUp({ end = 0, duration = 1200 }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([ent]) => {
      if (ent.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now(), to = Number(end) || 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);
  return <span ref={ref}>{val.toLocaleString("tr-TR")}</span>;
}

/* --- İstatistik Şeridi --- */
function StatsStripESKEP() {
  const items = [
    { icon: "bi-briefcase", label: "Aktif Proje", value: 24 },
    { icon: "bi-mortarboard", label: "Kayıtlı Stajyer", value: 560 },
    { icon: "bi-people", label: "Mentor / Eğitmen", value: 120 },
    { icon: "bi-building", label: "Paydaş Kurum", value: 67 },
  ];
  return (
    <section className="hdm-stats-section">
      <div className="container">
        <div className="row g-3 g-md-4">
          {items.map((it, i) => (
            <div key={it.label} className="col-6 col-md-3">
              <Reveal delay={i * 90}>
                <div className="hdm-stat-card hover-lift">
                  <div className="hdm-stat-icon"><i className={`bi ${it.icon}`} /></div>
                  <div>
                    <div className="hdm-stat-value">
                      <CountUp end={it.value} duration={1100 + i * 150} />
                    </div>
                    <div className="hdm-stat-label">{it.label}</div>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Özellik Kartları --- */
function FeatureGridESKEP() {
  const features = [
    { icon: "bi-kanban",        title: "Proje & Görev Takibi",         text: "Sprint, görev ve ilerlemeyi tek ekrandan yönetin." },
    { icon: "bi-person-video3", title: "Mentorluk Oturumları",         text: "Görüşmeler, notlar ve aksiyon maddeleri." },
    { icon: "bi-award",         title: "Sertifika & Değerlendirme",    text: "Rubrik tabanlı puanlama ve sertifika." },
  ];
  return (
    <section className="hdm-features-section">
      <div className="container">
        <div className="row g-4">
          {features.map((f, i) => (
            <div key={f.title} className="col-md-4">
              <Reveal delay={i * 120}>
                <div className="hdm-feature-card hover-lift">
                  <div className="hdm-feature-icon"><i className={`bi ${f.icon}`} /></div>
                  <h5 className="mb-2">{f.title}</h5>
                  <p className="m-0">{f.text}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- CTA bandı --- */
function CalloutBandESKEP() {
  return (
    <Reveal as="section" className="hdm-callout" threshold={0.2}>
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Kariyer yolculuğunu bugün başlat</h4>
          <p className="mb-0">Bir projeye katıl ya da yeni bir staj başvurusu oluştur.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/eskep/apply" className="btn btn-cta">Başvuru Yap</Link>
          <Link to="/eskep/egitim-takvimi/" className="btn btn-outline-light soft">Eğitim Takvimi</Link>
        </div>
      </div>
    </Reveal>
  );
}

/* --- SAYFA --- */
export default function ESKEPIndex() {
  return (
    <div className="page-eskep eskep-theme eskep-theme--aqua is-deep">
      <ESKEPBaseHeader />

      {/* Koyu, yüksek kontrastlı hero / küçük görsel */}
      <section className="eskep-hero eskep-hero--dark">
        <div className="container">
          <div className="eskep-hero__wrap">
            {/* Metin */}
            <div className="eskep-hero__content">
              <h1>EHAD Staj ve Kariyer Eğitimi Programı</h1>
              <p>Staj, proje ve kariyer gelişim süreçlerinizi profesyonel bir platformda yönetin.</p>

              <div className="eskep-hero__badges">
                <span className="eskep-badge">Staj</span>
                <span className="eskep-badge">Proje</span>
                <span className="eskep-badge">Mentorluk</span>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/eskep/projects" className="btn btn-cta--orange">Projeleri Gör</Link>
                <Link to="/eskep/apply" className="btn btn-outline--glass">Başvuru Yap</Link>
              </div>
            </div>

            {/* Küçük dekoratif görsel */}
            <div className="eskep-hero__media">
              <img src={eskepImage} alt="ESKEP" />
            </div>
          </div>
        </div>
      </section>

      <StatsStripESKEP />
      <FeatureGridESKEP />
      <CalloutBandESKEP />

      <ESKEPBaseFooter />
    </div>
  );
}
