import React from "react";
import { Link } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import "./css/akademi-theme.css";

const STATS = [
  { icon: "bi-collection-play", value: "+1.200",     label: "Video Dersi"   },
  { icon: "bi-broadcast",       value: "Haftalık 80+", label: "Canlı Yayın" },
  { icon: "bi-people",          value: "+15.000",    label: "Aktif Öğrenci" },
  { icon: "bi-award",           value: "Akredite",   label: "Sertifika"     },
];

const MODULES = [
  { emoji: "📖", name: "Kuran Eğitim Modülü"          },
  { emoji: "🚀", name: "Staj ve Kariyer Eğitim Modülü" },
  { emoji: "🎓", name: "Akademi Modülü"                },
  { emoji: "🏢", name: "Kurumsal Yönetim Modülü"       },
  { emoji: "📋", name: "Öğrenci Takip Modülü"          },
];

const FEATURES = [
  { icon: "bi-mortarboard",  title: "Kapsamlı Kurs Kütüphanesi", desc: "Temel ve ileri modüller; seviyeye göre kişiselleştirilmiş öğrenme planları."  },
  { icon: "bi-camera-video", title: "Canlı Ders & Kayıt",         desc: "Kaçırdığın dersleri kayıtlardan istediğin zaman, istediğin yerden izle."      },
  { icon: "bi-graph-up",     title: "İlerleme & Raporlar",        desc: "Ödev, quiz ve kazanımlarını tek ekranda kolayca takip et."                    },
  { icon: "bi-person-check", title: "Eğitmen Geri Bildirimi",     desc: "Kişiye özel notlar ve önerilerle gelişimini hızlandır."                       },
  { icon: "bi-people",       title: "Topluluk & Gruplar",         desc: "Takımlar, tartışma odaları ve duyurularla birlikte öğren."                    },
  { icon: "bi-patch-check",  title: "Sertifika Sistemi",          desc: "Tamamlanan her modül için akredite dijital sertifika kazan."                  },
];

export default function AkademiIndex() {
  return (
    <div>
      <AkademiBaseHeader />

      {/* HERO */}
      <div className="akd-hero-wrap">
        <div className="akd-hero">
          {/* Sol metin */}
          <div>
            <div className="akd-eyebrow">
              <span className="akd-eyebrow-dot"></span>
              Eğitim Portalı • AKD Platformu
            </div>
            <h1 className="akd-title">
              Öğrenme yolculuğun<br />
              için <em>tek platform</em>
            </h1>
            <p className="akd-lead">
              Canlı dersler, ders kayıtları ve seviyeye uygun modüllerle bilgini hızla geliştir.
              Basit, işlevsel ve bütçene uygun.
            </p>
            <div className="akd-badges">
              <span className="akd-badge"><i className="bi bi-broadcast"></i> Canlı Yayın</span>
              <span className="akd-badge"><i className="bi bi-collection-play"></i> Kayıt Arşivi</span>
              <span className="akd-badge"><i className="bi bi-patch-check"></i> Sertifika</span>
            </div>
            <div className="akd-actions">
              <Link to="/register" className="akd-btn--cta">
                Hemen Başla <i className="bi bi-arrow-right"></i>
              </Link>
              <Link to="/akademi/courses" className="akd-btn--ghost">
                <i className="bi bi-play-circle"></i> Kurslara Göz At
              </Link>
            </div>
          </div>

          {/* Sağ görsel */}
          <div className="akd-hero__media">
            <div className="akd-hero__card">
              <div className="akd-hero__icon">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <div className="akd-hero__card-label">Akademi</div>
              <div className="akd-hero__card-sub">+15.000 aktif öğrenci ile büyüyoruz</div>
            </div>
            <div className="akd-pill akd-pill--top">
              <span className="akd-pill-dot akd-pill-dot--green"></span> Canlı Ders Başladı
            </div>
            <div className="akd-pill akd-pill--bottom">
              <span className="akd-pill-dot akd-pill-dot--amber"></span> +1.200 Video Dersi
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="akd-stats">
        <div className="akd-stats__grid">
          {STATS.map((s, i) => (
            <div key={i} className="akd-stat">
              <div className="akd-stat__icon"><i className={`bi ${s.icon}`}></i></div>
              <div>
                <div className="akd-stat__value">{s.value}</div>
                <div className="akd-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      {/* FEATURES */}
      <section className="akd-features">
        <div className="akd-features__inner">
          <div className="akd-section-label">Özellikler</div>
          <h2 className="akd-section-title">Kapsamlı araçlar</h2>
          <p className="akd-section-sub">Öğrenmeni güçlendirecek her şey burada</p>
          <div className="akd-features__grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="akd-feature">
                <div className="akd-feature__icon"><i className={`bi ${f.icon}`}></i></div>
                <div className="akd-feature__title">{f.title}</div>
                <div className="akd-feature__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALLOUT */}
      <section className="akd-callout">
        <div className="akd-callout__wrap">
          <div className="akd-callout__text">
            <h3>Akademi'ye katıl, canlı dersleri kaçırma.</h3>
            <p>Binlerce öğrenciyle birlikte öğrenmeye şimdi başla.</p>
          </div>
          <div className="akd-callout__actions">
            <Link to="/register" className="akd-callout__btn akd-callout__btn--white">
              Hemen Başla <i className="bi bi-arrow-right"></i>
            </Link>
            <Link to="/akademi/courses" className="akd-callout__btn akd-callout__btn--ghost">
              Kurslara Göz At
            </Link>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </div>
  );
}