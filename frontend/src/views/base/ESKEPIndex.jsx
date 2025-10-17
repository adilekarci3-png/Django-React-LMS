import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import AsymHero from "./AsymHero";
import eskepImage from "./images/1.png";

/* --------- Yardımcılar (HDM ile aynı) --------- */
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
    <Tag ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
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
    const io = new IntersectionObserver(([ent]) => { if (ent.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now(), to = Number(end) || 0;
    const tick = (now) => { const p = Math.min(1, (now - t0) / duration); const e = 1 - Math.pow(1 - p, 3); setVal(Math.round(to * e)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [started, end, duration]);
  return <span ref={ref}>{val.toLocaleString("tr-TR")}</span>;
}

/* --------- ESKEP bölümleri --------- */
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
                    <div className="hdm-stat-value"><CountUp end={it.value} duration={1100 + i * 150} /></div>
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
function FeatureGridESKEP() {
  const features = [
    { icon: "bi-kanban",         title: "Proje & Görev Takibi",  text: "Sprint, görev ve ilerlemeyi tek ekrandan yönetin." },
    { icon: "bi-person-video3",  title: "Mentorluk Oturumları",  text: "Görüşmeler, notlar ve aksiyon maddeleri." },
    { icon: "bi-award",          title: "Sertifika & Değerlendirme", text: "Rubrik tabanlı puanlama ve sertifika." },
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
                  <h5 className="text-white mb-2">{f.title}</h5>
                  <p className="text-footer m-0">{f.text}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function CalloutBandESKEP() {
  return (
    <Reveal as="section" className="hdm-callout" threshold={0.2}>
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div>
            <h4 className="text-white mb-1">Kariyer yolculuğunu bugün başlat</h4>
            <p className="text-footer mb-0">Bir projeye katıl ya da yeni bir staj başvurusu oluştur.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/eskep/apply" className="btn btn-cta btn-sm">Başvuru Yap</Link>
            <Link to="/eskep/egitim-takvimi/" className="btn btn-outline-light btn-sm">Eğitim Takvimi</Link>
          </div>
        </div>
      </div>
      <span className="callout-orb callout-orb--a" />
      <span className="callout-orb callout-orb--b" />
    </Reveal>
  );
}

/* --------- Sayfa --------- */
export default function EskepGiris() {
  return (
    <div className="page-eskep eskep-theme eskep-theme--sage">
      <ESKEPBaseHeader />

      {/* HDM'den farklı hero rengi: emerald */}
      <AsymHero
  title="EHAD Staj ve Kariyer Eğitimi Programı"
  subtitle="Staj, proje ve kariyer gelişim süreçlerinizi profesyonel bir platformda yönetin."
  image={eskepImage}
  alt="ESKEP"
  theme="emerald"
  badges={["Staj", "Proje", "Mentorluk"]}
  primary={{ to: "/eskep/projects", label: "Projeleri Gör" }}
  secondary={{ to: "/eskep/apply", label: "Başvuru Yap" }}
  compact   // ← sadece bunu ekledik
/>

      <StatsStripESKEP />
      <FeatureGridESKEP />
      <CalloutBandESKEP />

      <ESKEPBaseFooter />
    </div>
  );
}
