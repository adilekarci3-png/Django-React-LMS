import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
// import "./css/hdm-theme.css";

/* --------- Yardımcılar --------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
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

function CountUp({ end = 0, duration = 1200, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([ent]) => {
        if (ent.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const to = Number(end) || 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("tr-TR")}{suffix}</span>;
}

/* --------- Bölümler --------- */
function StatsStrip() {
  const items = [
    { icon: "bi-broadcast",     label: "Aktif Dinleme",       value: 42   },
    { icon: "bi-journal-check", label: "Aylık Değerlendirme", value: 1280 },
    { icon: "bi-people",        label: "Eğitmen",             value: 86   },
    { icon: "bi-geo-alt",       label: "Şube / İl",           value: 81   },
  ];
  return (
    <section className="hdm-stats-section">
      <div className="hdm-stats__grid">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 90}>
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
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { icon: "bi-headphones",      title: "Canlı Dinleme Kuyruğu", text: "Öğrenciler sıraya girer, eğitmenler tek ekrandan dinler ve puanlar." },
    { icon: "bi-clipboard-check", title: "Değerlendirme & Notlar",  text: "Sure/ayet bazlı notlandırma, hata türleri ve otomatik raporlar."     },
    { icon: "bi-calendar-event",  title: "Takvim & Bildirim",       text: "Programlar, hatırlatmalar ve SMS/e-posta duyuruları tek yerde."      },
  ];
  return (
    <section className="hdm-features-section">
      <div className="hdm-features__inner">
        <div className="hdm-section-label">Özellikler</div>
        <h2 className="hdm-section-title">Kapsamlı araçlar</h2>
        <p className="hdm-section-sub">Hafızlık dinleme sürecini güçlendirecek her şey burada</p>
        <div className="hdm-features__grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className={`bi ${f.icon}`} /></div>
                <div className="hdm-feature-title">{f.title}</div>
                <p className="hdm-feature-desc">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalloutBand() {
  return (
    <Reveal as="section" className="hdm-callout" threshold={0.2}>
      <div className="hdm-callout__wrap">
        <div className="hdm-callout__text">
          <h4>Bugün bir okumayı destekleyin</h4>
          <p>Canlı dinlemeye katılın veya yeni bir oturum planlayın.</p>
        </div>
        <div className="hdm-callout__actions">
          <Link to="/hdm/live" className="hdm-callout__btn hdm-callout__btn--white">
            Canlı Dinlemeye Git <i className="bi bi-arrow-right"></i>
          </Link>
          <Link to="/hdm/hafizgeneltakvim/" className="hdm-callout__btn hdm-callout__btn--ghost">
            Takvimi Aç
          </Link>
        </div>
        <span className="callout-orb callout-orb--a" />
        <span className="callout-orb callout-orb--b" />
      </div>
    </Reveal>
  );
}

const MODULES = [
  { emoji: "🎧", name: "Canlı Dinleme Modülü"   },
  { emoji: "📋", name: "Değerlendirme Modülü"    },
  { emoji: "📅", name: "Takvim & Program Modülü" },
  { emoji: "📊", name: "Raporlama Modülü"         },
  { emoji: "🕌", name: "Sure & Ayet Takibi"       },
];

/* --------- Sayfa --------- */
export default function HDMIndex() {
  return (
    <div className="page-hdm">
      <HDMBaseHeader />

      {/* HERO */}
      <div className="hdm-hero-wrap">
        <div className="hdm-hero">
          <div>
            <div className="hdm-eyebrow">
              <span className="hdm-eyebrow-dot"></span>
              Sinaps • HDM Platformu
            </div>
            <h1 className="hdm-title">
              Hafızlık dinlemede<br />için <em>tek platform</em>
            </h1>
            <p className="hdm-lead">
              Canlı dinleme kuyrukları, sure bazlı değerlendirme ve takvim
              yönetimini profesyonel bir platformda birleştir.
            </p>
            <div className="hdm-hero-badges">
              <span className="hdm-hero-badge"><i className="bi bi-broadcast"></i> Canlı</span>
              <span className="hdm-hero-badge"><i className="bi bi-clipboard-check"></i> Değerlendirme</span>
              <span className="hdm-hero-badge"><i className="bi bi-calendar-event"></i> Takvim</span>
            </div>
            <div className="hdm-hero-actions">
              <Link to="/hdm/live" className="hdm-btn--cta">
                Canlı Dinlemeye Git <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/hdm/docs" className="hdm-btn--ghost">
                <i className="bi bi-book"></i> Kılavuz
              </Link>
            </div>
          </div>

          <div className="hdm-hero__media">
            <div className="hdm-hero__card">
              <div className="hdm-hero__icon"><i className="bi bi-headphones"></i></div>
              <div className="hdm-hero__card-label">Hafızlık Dinleme</div>
              <div className="hdm-hero__card-sub">Her Okuma Bir Dua, Her Dinleme Bir Destek</div>
            </div>
            <div className="hdm-pill hdm-pill--top">
              <span className="hdm-pill-dot hdm-pill-dot--v"></span> Aktif Dinleme: 42
            </div>
            <div className="hdm-pill hdm-pill--bottom">
              <span className="hdm-pill-dot hdm-pill-dot--amber"></span> +86 Eğitmen
            </div>
          </div>
        </div>
      </div>

      <StatsStrip />

      

      <FeatureGrid />
      <CalloutBand />

      <HDMBaseFooter />
    </div>
  );
}