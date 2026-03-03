import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import "./css/eskep-theme.css";

/* ========== Yardımcı: Reveal (scroll animasyonu) ========== */
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
function StatsStripESKEP() {
  const items = [
    { icon: "bi-briefcase",   label: "Aktif Proje",      value: 24  },
    { icon: "bi-mortarboard", label: "Kayıtlı Stajyer",  value: 560 },
    { icon: "bi-people",      label: "Mentor / Eğitmen", value: 120 },
    { icon: "bi-building",    label: "Paydaş Kurum",     value: 67  },
  ];
  return (
    <section className="eskep-stats">
      <div className="eskep-stats__grid">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 90}>
            <div className="eskep-stat">
              <div className="eskep-stat__icon"><i className={`bi ${it.icon}`} /></div>
              <div>
                <div className="eskep-stat__value">
                  <CountUp end={it.value} duration={1100 + i * 150} />
                </div>
                <div className="eskep-stat__label">{it.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========== Özellik Kartları ========== */
function FeatureGridESKEP() {
  const features = [
    { icon: "bi-kanban",        title: "Proje & Görev Takibi",      desc: "Sprint, görev ve ilerlemeyi tek ekrandan yönetin."             },
    { icon: "bi-person-video3", title: "Mentorluk Oturumları",      desc: "Görüşmeler, notlar ve aksiyon maddeleri tek yerde."            },
    { icon: "bi-award",         title: "Sertifika & Değerlendirme", desc: "Rubrik tabanlı puanlama ve dijital sertifika."                 },
    { icon: "bi-graph-up",      title: "İlerleme & Raporlar",       desc: "Staj süreci ve kazanımlarını tek ekranda takip et."            },
    { icon: "bi-calendar3",     title: "Eğitim Takvimi",            desc: "Canlı etkinlik ve eğitim programlarını kaçırma."              },
    { icon: "bi-patch-check",   title: "Başvuru Sistemi",           desc: "Staj ve kariyer başvurularını kolayca oluştur ve takip et."    },
  ];
  return (
    <section className="eskep-features">
      <div className="eskep-features__inner">
        <div className="eskep-section-label">Özellikler</div>
        <h2 className="eskep-section-title">Kapsamlı araçlar</h2>
        <p className="eskep-section-sub">Kariyer gelişimini güçlendirecek her şey burada</p>
        <div className="eskep-features__grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="eskep-feature">
                <div className="eskep-feature__icon"><i className={`bi ${f.icon}`} /></div>
                <div className="eskep-feature__title">{f.title}</div>
                <div className="eskep-feature__desc">{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== CTA Bandı ========== */
function CalloutBandESKEP() {
  return (
    <Reveal as="section" className="eskep-callout" threshold={0.2}>
      <div className="eskep-callout__wrap">
        <div className="eskep-callout__text">
          <h3>Kariyer yolculuğunu bugün başlat</h3>
          <p>Binlerce stajyer ve mentorla birlikte gelişmeye şimdi başla.</p>
        </div>
        <div className="eskep-callout__actions">
          <Link to="/eskep/apply" className="eskep-callout__btn eskep-callout__btn--white">
            Başvuru Yap <i className="bi bi-arrow-right"></i>
          </Link>
          <Link to="/eskep/egitim-takvimi/" className="eskep-callout__btn eskep-callout__btn--ghost">
            Eğitim Takvimi
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

const MODULES = [
  { emoji: "💼", name: "Staj Modülü"            },
  { emoji: "🚀", name: "Kariyer Gelişim Modülü"  },
  { emoji: "🎓", name: "Eğitim Modülü"           },
  { emoji: "🤝", name: "Mentorluk Modülü"         },
  { emoji: "📋", name: "Proje Takip Modülü"       },
];

export default function ESKEPIndex() {
  return (
    <div className="page-eskep eskep-theme eskep-theme--aqua is-deep">
      <ESKEPBaseHeader />

      {/* HERO */}
      <div className="eskep-hero-wrap">
        <div className="eskep-hero">
          {/* Sol metin */}
          <div>
            <div className="eskep-eyebrow">
              <span className="eskep-eyebrow-dot"></span>
              EHAD • ESKEP Platformu
            </div>
            <h1 className="eskep-title">
              Kariyer yolculuğun<br />
              için <em>tek platform</em>
            </h1>
            <p className="eskep-lead">
              Staj, proje ve kariyer gelişim süreçlerini profesyonel bir platformda yönet.
              Basit, işlevsel ve etkili.
            </p>
            <div className="eskep-badges">
              <span className="eskep-badge"><i className="bi bi-briefcase"></i> Staj</span>
              <span className="eskep-badge"><i className="bi bi-person-video3"></i> Mentorluk</span>
              <span className="eskep-badge"><i className="bi bi-patch-check"></i> Sertifika</span>
            </div>
            <div className="eskep-actions">
              <Link to="/eskep/apply" className="eskep-btn--cta">
                Başvuru Yap <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/eskep/projects" className="eskep-btn--ghost">
                <i className="bi bi-play-circle"></i> Projelere Göz At
              </Link>
            </div>
          </div>

          {/* Sağ görsel kart */}
          <div className="eskep-hero__media">
            <div className="eskep-hero__card">
              <div className="eskep-hero__icon">
                <i className="bi bi-layers-fill"></i>
              </div>
              <div className="eskep-hero__card-label">ESKEP</div>
              <div className="eskep-hero__card-sub">+560 kayıtlı stajyer ile büyüyoruz</div>
            </div>
            <div className="eskep-pill eskep-pill--top">
              <span className="eskep-pill-dot eskep-pill-dot--blue"></span> Aktif Proje: 24
            </div>
            <div className="eskep-pill eskep-pill--bottom">
              <span className="eskep-pill-dot eskep-pill-dot--amber"></span> +120 Mentor
            </div>
          </div>
        </div>
      </div>

      {/* STATS — CountUp animasyonlu */}
      <StatsStripESKEP />

      

      {/* FEATURES — Reveal animasyonlu */}
      <FeatureGridESKEP />

      {/* CALLOUT — Reveal animasyonlu */}
      <CalloutBandESKEP />

      <ESKEPBaseFooter />
    </div>
  );
}
