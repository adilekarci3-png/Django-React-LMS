import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import resim1 from "./image/resim1.png";
import resim2 from "./image/resim2.png";
import resim3 from "./image/resim3.png";
import resim4 from "./image/resim4.png";
import resim5 from "./image/resim5.png";

const features = [
  {
    id: 1,
    image: resim1,
    icon: "🎓",
    title: "Akademi Modülü",
    desc: "Canlı dersler, video içerikler ve kurs yönetimiyle eğitimi dijitale taşıyın.",
    tag: "Eğitim",
    tagColor: "#4f46e5",
    tagBg: "#eef2ff",
    link: "/akademi/",
    size: "large",
  },
  {
    id: 2,
    image: resim2,
    icon: "📋",
    title: "Öğrenci Takip",
    desc: "Hafız profilleri, ders planları ve hata takibini tek ekranda yönetin.",
    tag: "Takip",
    tagColor: "#0891b2",
    tagBg: "#ecfeff",
    link: "/ogrenci-takip/",
    size: "medium",
  },
  {
    id: 3,
    image: resim3,
    icon: "🏢",
    title: "Kurumsal Yönetim",
    desc: "Şube, üye ve idari süreçleri merkezi bir platformdan kolayca yönetin.",
    tag: "Yönetim",
    tagColor: "#7c3aed",
    tagBg: "#f5f3ff",
    link: "/hafizbilgi/",
    size: "medium",
  },
  {
    id: 4,
    image: resim4,
    icon: "💼",
    title: "Staj & Kariyer",
    desc: "Staj başvuruları, proje takibi ve kariyer gelişimini tek çatı altında toplayın.",
    tag: "Kariyer",
    tagColor: "#059669",
    tagBg: "#ecfdf5",
    link: "/eskep/",
    size: "small",
  },
  {
    id: 5,
    image: resim5,
    icon: "📖",
    title: "Kuran Eğitimi",
    desc: "Dinleme ve tilavet süreçlerini dijital ortamda takip edin.",
    tag: "HDM",
    tagColor: "#d97706",
    tagBg: "#fffbeb",
    link: "/hdm/",
    size: "small",
  },
];

const css = `
  .fi-section {
    background: #f8fafc;
    padding: 80px 24px;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .fi-header {
    text-align: center;
    margin-bottom: 56px;
  }

  .fi-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 99px;
    margin-bottom: 16px;
  }

  .fi-title {
    font-size: clamp(26px, 4vw, 42px);
    font-weight: 900;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 14px;
  }

  .fi-title span {
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .fi-subtitle {
    font-size: clamp(14px, 2vw, 17px);
    color: #64748b;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* Bento Grid */
  .fi-grid {
    display: grid;
    max-width: 1160px;
    margin: 0 auto;
    gap: 18px;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
  }

  .fi-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 12px rgba(15,23,42,.06);
    overflow: hidden;
    transition: transform .25s ease, box-shadow .25s ease;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .fi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(15,23,42,.12);
  }

  .fi-card:nth-child(1) { grid-column: span 7; }
  .fi-card:nth-child(2) { grid-column: span 5; }
  .fi-card:nth-child(3) { grid-column: span 5; }
  .fi-card:nth-child(4) { grid-column: span 4; }
  .fi-card:nth-child(5) { grid-column: span 3; }

  /* Resim */
  .fi-img-wrap {
    position: relative;
    overflow: hidden;
  }

  .fi-card:nth-child(1) .fi-img-wrap { height: 240px; }
  .fi-card:nth-child(2) .fi-img-wrap { height: 180px; }
  .fi-card:nth-child(3) .fi-img-wrap { height: 180px; }
  .fi-card:nth-child(4) .fi-img-wrap { height: 140px; }
  .fi-card:nth-child(5) .fi-img-wrap { height: 140px; }

  .fi-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .4s ease;
  }

  .fi-card:hover .fi-img-wrap img {
    transform: scale(1.04);
  }

  .fi-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(15,23,42,.35) 100%);
  }

  /* İçerik */
  .fi-body {
    padding: 20px 22px 22px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .fi-icon {
    font-size: 22px;
    line-height: 1;
  }

  .fi-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    letter-spacing: .05em;
    text-transform: uppercase;
  }

  .fi-card-title {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }

  .fi-card-desc {
    font-size: 13.5px;
    color: #64748b;
    line-height: 1.65;
    margin: 0;
    flex: 1;
  }

  .fi-card-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 700;
    color: #4f46e5;
    text-decoration: none;
    margin-top: 4px;
    width: fit-content;
    transition: gap .2s;
  }

  .fi-card-link:hover { gap: 8px; }

  /* İstatistik kutuları */
  .fi-stats {
    max-width: 1160px;
    margin: 20px auto 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .fi-stat {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    box-shadow: 0 1px 6px rgba(15,23,42,.05);
  }

  .fi-stat-val {
    font-size: clamp(24px, 3vw, 36px);
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
  }

  .fi-stat-label {
    font-size: 13px;
    color: #64748b;
    margin-top: 6px;
  }

  /* Reveal animasyon */
  .fi-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .8s ease, transform .8s ease;
  }

  .fi-reveal.fi-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Tablet */
  @media (max-width: 1023px) {
    .fi-grid {
      grid-template-columns: repeat(6, 1fr);
    }
    .fi-card:nth-child(1) { grid-column: span 6; }
    .fi-card:nth-child(2) { grid-column: span 3; }
    .fi-card:nth-child(3) { grid-column: span 3; }
    .fi-card:nth-child(4) { grid-column: span 3; }
    .fi-card:nth-child(5) { grid-column: span 3; }
    .fi-stats { grid-template-columns: repeat(2, 1fr); }
  }

  /* Mobil */
  @media (max-width: 599px) {
    .fi-section { padding: 48px 14px; }
    .fi-header { margin-bottom: 32px; }
    .fi-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .fi-card:nth-child(n) { grid-column: span 1; }
    .fi-card:nth-child(1) .fi-img-wrap,
    .fi-card:nth-child(2) .fi-img-wrap,
    .fi-card:nth-child(3) .fi-img-wrap,
    .fi-card:nth-child(4) .fi-img-wrap,
    .fi-card:nth-child(5) .fi-img-wrap { height: 180px; }
    .fi-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .fi-body { padding: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fi-reveal { transition: none !important; opacity: 1 !important; transform: none !important; }
  }
`;

const stats = [
  { val: "5", label: "Entegre Modül" },
  { val: "81+", label: "İl Kapsamı" },
  { val: "120K+", label: "Kayıtlı Kullanıcı" },
  { val: "7/24", label: "Erişim" },
];

export default function FeatureIntro() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{css}</style>
      <section
        ref={sectionRef}
        className={`fi-section fi-reveal${visible ? " fi-visible" : ""}`}
      >
        {/* Başlık */}
        <div className="fi-header">
          <div className="fi-eyebrow">✦ Platform Özellikleri</div>
          <h2 className="fi-title">
            Tüm ihtiyaçlarınız <span>tek platformda</span>
          </h2>
          <p className="fi-subtitle">
            Eğitimden yönetime, kariyer takibinden kuran eğitimine — Eğitim Portalı'nın
            entegre modülleriyle kurumunuzu dijital çağa taşıyın.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="fi-grid">
          {features.map((f) => (
            <div className="fi-card" key={f.id}>
              <div className="fi-img-wrap">
                <img src={f.image} alt={f.title} loading="lazy" />
                <div className="fi-img-overlay" />
              </div>
              <div className="fi-body">
                <div className="fi-top">
                  <span className="fi-icon">{f.icon}</span>
                  <span
                    className="fi-tag"
                    style={{ color: f.tagColor, background: f.tagBg }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="fi-card-title">{f.title}</h3>
                <p className="fi-card-desc">{f.desc}</p>
                <Link to={f.link} className="fi-card-link">
                  Keşfet →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* İstatistikler */}
        <div className="fi-stats">
          {stats.map((s) => (
            <div className="fi-stat" key={s.label}>
              <div className="fi-stat-val">{s.val}</div>
              <div className="fi-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
