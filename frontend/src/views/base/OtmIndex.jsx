import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OTMBaseHeader from "../partials/OTMBaseHeader";
import OTMBaseFooter from "../partials/OTMBaseFooter";
import "./css/otm-theme.css";

/* ========== Yardımcı: Reveal ========== */
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

/* ========== Yardımcı: CountUp ========== */
function CountUp({ end = 0, duration = 1200 }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([ent]) => { if (ent.isIntersecting) { setStarted(true); io.disconnect(); } },
      { threshold: 0.4 }
    );
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

/* ========== İstatistik Şeridi ========== */
function StatsStripOTM() {
  const items = [
    { icon: "bi-people",        label: "Kayıtlı Öğrenci",  value: 3200 },
    { icon: "bi-person-check",  label: "Aktif Takip",       value: 1450 },
    { icon: "bi-bar-chart-line",label: "Değerlendirme",     value: 980  },
    { icon: "bi-award",         label: "Sertifika",         value: 620  },
  ];
  return (
    <section className="otm-stats">
      <div className="otm-stats__grid">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 90}>
            <div className="otm-stat hover-lift">
              <div className="otm-stat__icon"><i className={`bi ${it.icon}`} /></div>
              <div>
                <div className="otm-stat__value">
                  <CountUp end={it.value} duration={1100 + i * 150} />
                </div>
                <div className="otm-stat__label">{it.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========== Özellik Kartları ========== */
function FeatureGridOTM() {
  const features = [
    { icon: "bi-person-lines-fill", title: "Öğrenci Profili",         desc: "Her öğrencinin gelişim sürecini tek ekrandan takip et."        },
    { icon: "bi-bar-chart-line",    title: "Performans Raporları",     desc: "Sınav, ödev ve davranış verilerini görsel raporlarla izle."     },
    { icon: "bi-bell",              title: "Bildirim & Uyarı",         desc: "Devamsızlık ve düşük performans için anlık bildirimler."        },
    { icon: "bi-chat-dots",         title: "Veli İletişimi",           desc: "Velilerle doğrudan mesajlaşma ve bilgilendirme."                },
    { icon: "bi-journal-check",     title: "Devam & Yoklama",          desc: "Günlük yoklama kayıtları ve devam istatistikleri."             },
    { icon: "bi-patch-check",       title: "Değerlendirme Sistemi",    desc: "Rubrik tabanlı not ve sertifika yönetimi."                     },
  ];
  return (
    <section className="otm-features">
      <div className="otm-features__inner">
        <div className="otm-section-label">Özellikler</div>
        <h2 className="otm-section-title">Kapsamlı araçlar</h2>
        <p className="otm-section-sub">Öğrenci takibini güçlendirecek her şey burada</p>
        <div className="otm-features__grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="otm-feature hover-lift">
                <div className="otm-feature__icon"><i className={`bi ${f.icon}`} /></div>
                <div className="otm-feature__title">{f.title}</div>
                <div className="otm-feature__desc">{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== CTA Bandı ========== */
function CalloutBandOTM() {
  return (
    <Reveal as="section" className="otm-callout" threshold={0.2}>
      <div className="otm-callout__wrap">
        <div className="otm-callout__text">
          <h3>Öğrenci takibini bugün başlat</h3>
          <p>Binlerce öğrencinin gelişimini tek platformdan yönet.</p>
        </div>
        <div className="otm-callout__actions">
          <Link to="/register" className="otm-callout__btn otm-callout__btn--white">
            Hemen Başla <i className="bi bi-arrow-right"></i>
          </Link>
          
        </div>
      </div>
    </Reveal>
  );
}

/* ========== Modüller ========== */
const MODULES = [
  { emoji: "👤", name: "Öğrenci Profil Modülü"    },
  { emoji: "📊", name: "Performans Takip Modülü"   },
  { emoji: "📅", name: "Devam & Yoklama Modülü"    },
  { emoji: "💬", name: "Veli İletişim Modülü"       },
  { emoji: "📋", name: "Değerlendirme Modülü"       },
];

/* ========== SAYFA ========== */
export default function OTMIndex() {
  return (
    <div className="page-otm otm-theme">
      <OTMBaseHeader />

      {/* HERO */}
      <div className="otm-hero-wrap">
        <div className="otm-hero">
          {/* Sol metin */}
          <div>
            <div className="otm-eyebrow">
              <span className="otm-eyebrow-dot"></span>
              Eğitim Portalı • OTM Platformu
            </div>
            <h1 className="otm-title">
              Öğrenci takibinde<br />
              için <em>tek platform</em>
            </h1>
            <p className="otm-lead">
              Öğrenci profilleri, performans raporları ve veli iletişimini
              profesyonel bir platformda yönet. Basit, işlevsel ve etkili.
            </p>
            <div className="otm-badges">
              <span className="otm-badge"><i className="bi bi-people"></i> Öğrenci Takibi</span>
              <span className="otm-badge"><i className="bi bi-bar-chart-line"></i> Raporlama</span>
              <span className="otm-badge"><i className="bi bi-patch-check"></i> Değerlendirme</span>
            </div>
            <div className="otm-actions">
              <Link to="/register" className="otm-btn--cta">
                Hemen Başla <i className="bi bi-arrow-right"></i>
              </Link>
              
            </div>
          </div>

          {/* Sağ görsel kart */}
          <div className="otm-hero__media">
            <div className="otm-hero__card">
              <div className="otm-hero__icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="otm-hero__card-label">Öğrenci Takip</div>
              <div className="otm-hero__card-sub">+3.200 öğrenci ile büyüyoruz</div>
            </div>
            <div className="otm-pill otm-pill--top">
              <span className="otm-pill-dot otm-pill-dot--red"></span> Aktif Takip: 1.450
            </div>
            <div className="otm-pill otm-pill--bottom">
              <span className="otm-pill-dot otm-pill-dot--amber"></span> +620 Sertifika
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <StatsStripOTM />


      {/* FEATURES */}
      <FeatureGridOTM />

      {/* CALLOUT */}
      <CalloutBandOTM />

      <OTMBaseFooter />
    </div>
  );
}