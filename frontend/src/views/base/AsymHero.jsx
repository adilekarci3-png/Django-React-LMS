// Reusable asymmetric hero for EHAD apps (fixed)
// --------------------------------------------------
// Save as: src/components/AsymHero.jsx
// Usage: Replace your page <section> with the related *_V2 component below.
// Add the CSS (bottom of this file) into ./css/GirisPage.css
import "./css/GirisPage.css";

import React from "react";
import { Link } from "react-router-dom";

export default function AsymHero({
  title,
  subtitle,
  image,
  alt = "",
  badges = [],
  primary = { to: "#", label: "Başla" },
  secondary = { to: "#", label: "Daha Fazla" },
  theme = "blue", // "blue" | "emerald" | "indigo" | "rose"
  compact = false,
}) {
  const palette = (
    {
      blue: {
        grad: "linear-gradient(100deg,#0ea5ea 0%,#0066d9 45%,#023e8a 100%)",
        glow: "rgba(30, 64, 175, .55)",
        chipBg: "rgba(59,130,246,.12)",
        chipBd: "rgba(191,219,254,.25)",
      },
      emerald: {
        grad: "linear-gradient(100deg,#34d399 0%,#10b981 45%,#047857 100%)",
        glow: "rgba(4,120,87,.55)",
        chipBg: "rgba(16,185,129,.12)",
        chipBd: "rgba(167,243,208,.25)",
      },
      indigo: {
        grad: "linear-gradient(100deg,#818cf8 0%,#4f46e5 45%,#312e81 100%)",
        glow: "rgba(49,46,129,.55)",
        chipBg: "rgba(99,102,241,.12)",
        chipBd: "rgba(199,210,254,.25)",
      },
      rose: {
        grad: "linear-gradient(100deg,#fb7185 0%,#f43f5e 45%,#9f1239 100%)",
        glow: "rgba(159,18,57,.55)",
        chipBg: "rgba(244,63,94,.12)",
        chipBd: "rgba(254,205,211,.25)",
      },
    }[theme] || {}
  );

  return (
    <section
      className={`asym-hero ${compact ? "asym-hero--compact" : ""}`}
      style={{ background: palette.grad }}
    >
      {/* Decorative blurred blobs */}
      <div className="asym-hero__blob asym-hero__blob--tl" style={{ background: palette.glow }} />
      <div className="asym-hero__blob asym-hero__blob--br" style={{ background: palette.glow }} />

      {/* Top wave */}
      <div className="asym-hero__wave asym-hero__wave--top" aria-hidden>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,69.3C1120,75,1280,85,1360,90.7L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            fill="rgba(255,255,255,.06)"
          />
        </svg>
      </div>

      <div className="container position-relative">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6 order-2 order-lg-1">
            <h1 className="asym-hero__title text-white mb-3">{title}</h1>
            <p className="asym-hero__subtitle text-white-50 mb-4">{subtitle}</p>

            {badges?.length ? (
              <div className="d-flex flex-wrap gap-2 mb-4">
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="asym-hero__chip"
                    style={{ background: palette.chipBg, borderColor: palette.chipBd }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : null}

            {/* CTAs */}
            <div className="d-flex flex-wrap gap-2">
              {primary?.to && (
                <Link to={primary.to} className="btn btn-cta btn-cta--solid">
                  {primary.label || "Başla"}
                </Link>
              )}
              {secondary?.to && (
                <Link to={secondary.to} className="btn btn-cta btn-cta--ghost text-white">
                  {secondary.label || "Daha Fazla"}
                </Link>
              )}
            </div>
          </div>

          <div className="col-lg-6 order-1 order-lg-2">
            <div className="asym-hero__imgwrap">
              <img src={image} alt={alt} className="asym-hero__img" />
              <div className="asym-hero__card" role="note">
                <div className="asym-hero__card-dot" />
                <div>
                  <strong>Canlı Dinleme</strong>
                  <div className="small text-white-50">Kayıt ve değerlendirme destekli</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="asym-hero__wave asym-hero__wave--bottom" aria-hidden>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,96L80,90.7C160,85,320,75,480,64C640,53,800,43,960,48C1120,53,1280,75,1360,85.3L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            fill="rgba(255,255,255,.06)"
          />
        </svg>
      </div>
    </section>
  );
}

// --------------------------------------------------
// PAGE IMPLEMENTATIONS (replace your sections with these)
// --------------------------------------------------

// 1) HDMIndex (Hafızlık Dinleme Merkezi)
export function HDMIndex_V2({ Header, Footer, image }) {
  return (
    <>
      {Header ? <Header /> : null}
      <AsymHero
        title="Hafızlık Dinleme Merkezi"
        subtitle="Her Okuma Bir Dua, Her Dinleme Bir Destek"
        image={image}
        alt="Hafızlık Dinleme"
        theme="indigo"
        badges={["Canlı", "Değerlendirme", "Takvim"]}
        primary={{ to: "/hdm/live", label: "Canlı Dinlemeye Git" }}
        secondary={{ to: "/hdm/docs", label: "Kılavuz" }}
      />
      {Footer ? <Footer /> : null}
    </>
  );
}

// 2) HafizBilgiIndex (HBS)
export function HafizBilgiIndex_V2({ Header, Footer, image }) {
  return (
    <>
      {Header ? <Header /> : null}
      <AsymHero
        title="Hafızlar Bilgi Sistemi"
        subtitle="Hafız adaylarının eğitim ve gelişim süreçlerini izleyebileceğiniz modern dijital yönetim sistemi."
        image={image}
        alt="Hafız Bilgi"
        theme="emerald"
        badges={["Öğrenci", "Eğitmen", "Raporlar"]}
        primary={{ to: "/hbs/login", label: "Panele Giriş" }}
        secondary={{ to: "/hbs/register", label: "Kayıt Ol" }}
      />
      {Footer ? <Footer /> : null}
    </>
  );
}

// 3) ESKEP Giriş
export function EskepGiris_V2({ Header, Footer, image }) {
  return (
    <>
      {Header ? <Header /> : null}
      <AsymHero
        title="Sinaps Staj ve Kariyer Eğitimi Programı"
        subtitle="Staj, proje ve kariyer gelişim süreçlerinizi profesyonel bir platformda yönetin."
        image={image}
        alt="ESKEP"
        theme="blue"
        badges={["Staj", "Proje", "Mentorluk"]}
        primary={{ to: "/eskep/projects", label: "Projeleri Gör" }}
        secondary={{ to: "/eskep/apply", label: "Başvuru Yap" }}
      />
      {Footer ? <Footer /> : null}
    </>
  );
}

// 4) Akademi Index
export function AkademiIndex_V2({ Header, Footer, image }) {
  return (
    <>
      {Header ? <Header /> : null}
      <AsymHero
        title="Sinaps AKADEMİ"
        subtitle="Kadim ilim yolculuğunu dijital dünyanın imkânlarıyla buluşturan eğitim platformu."
        image={image}
        alt="Sinaps Akademi"
        theme="indigo"
        badges={["Dersler", "Modüller", "Canlı Yayın"]}
        primary={{ to: "/academy/courses", label: "Kurslara Göz At" }}
        secondary={{ to: "/academy/about", label: "Akademi Hakkında" }}
      />
      {Footer ? <Footer /> : null}
    </>
  );
}

