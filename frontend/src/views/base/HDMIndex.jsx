import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import AsymHero from "./AsymHero";           // yolu senin yapına göre
import hafizlikImage from "./images/3.png";

/* --------- Yardımcılar --------- */
/* Scroll görünürlüğü: görünce 'reveal-visible' ekler */
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

/* Wrapper: reveal + gecikme (stagger) */
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

/* Yumuşak sayım */
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
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("tr-TR")}
      {suffix}
    </span>
  );
}

/* --------- Bölümler --------- */
function StatsStrip() {
  const items = [
    { icon: "bi-broadcast", label: "Aktif Dinleme", value: 42 },
    { icon: "bi-journal-check", label: "Aylık Değerlendirme", value: 1280 },
    { icon: "bi-people", label: "Eğitmen", value: 86 },
    { icon: "bi-geo-alt", label: "Şube / İl", value: 81 },
  ];
  return (
    <section className="hdm-stats-section">
      <div className="container">
        <div className="row g-3 g-md-4">
          {items.map((it, i) => (
            <div key={it.label} className="col-6 col-md-3">
              <Reveal delay={i * 90}>
                <div className="hdm-stat-card hover-lift">
                  <div className="hdm-stat-icon">
                    <i className={`bi ${it.icon}`} />
                  </div>
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

function FeatureGrid() {
  const features = [
    {
      icon: "bi-headphones",
      title: "Canlı Dinleme Kuyruğu",
      text: "Öğrenciler sıraya girer, eğitmenler tek ekrandan dinler ve puanlar.",
    },
    {
      icon: "bi-clipboard-check",
      title: "Değerlendirme & Notlar",
      text: "Sure/ayet bazlı notlandırma, hata türleri ve otomatik raporlar.",
    },
    {
      icon: "bi-calendar-event",
      title: "Takvim & Bildirim",
      text: "Programlar, hatırlatmalar ve SMS/e-posta duyuruları tek yerde.",
    },
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

function CalloutBand() {
  return (
    <Reveal as="section" className="hdm-callout" threshold={0.2}>
      <div className="container">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div>
            <h4 className="text-white mb-1">Bugün bir okumayı destekleyin</h4>
            <p className="text-footer mb-0">Canlı dinlemeye katılın veya yeni bir oturum planlayın.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/hdm/live" className="btn btn-cta btn-sm">Canlı Dinlemeye Git</Link>
            <Link to="/hdm/hafizgeneltakvim/" className="btn btn-outline-light btn-sm">Takvimi Aç</Link>
          </div>
        </div>
      </div>
      <span className="callout-orb callout-orb--a" />
      <span className="callout-orb callout-orb--b" />
    </Reveal>
  );
}

/* --------- Sayfa --------- */
export default function HDMIndex() {
  return (
    <div className="page-hdm">
      <HDMBaseHeader />

      <AsymHero
        title="Hafızlık Dinleme Merkezi"
        subtitle="Her Okuma Bir Dua, Her Dinleme Bir Destek"
        image={hafizlikImage}
        alt="Hafızlık Dinleme"
        theme="indigo"
        badges={["Canlı", "Değerlendirme", "Takvim"]}
        primary={{ to: "/hdm/live", label: "Canlı Dinlemeye Git" }}
        secondary={{ to: "/hdm/docs", label: "Kılavuz" }}
      />

      <StatsStrip />
      <FeatureGrid />
      <CalloutBand />

      <HDMBaseFooter />
    </div>
  );
}
