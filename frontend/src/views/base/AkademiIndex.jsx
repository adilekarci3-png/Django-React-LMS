import React from "react";
import { Link } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import hafizlikImage from "./images/2.png";
import "./css/akademi-theme.css"; // yeni tema & layout

export default function AkademiIndex(){
  return (
    <div className="page-akd akd-theme akd-theme--orchid">
      <AkademiBaseHeader />

      {/* HERO — sade & modern */}
      <section className="akd-hero">
        <div className="container">
          <div className="akd-hero__wrap">
            {/* Sol Metin */}
            <div className="akd-hero__content">
              <div className="akd-eyebrow">EHAD • AKD</div>
              <h1 className="akd-title">EHAD Akademi</h1>
              <p className="akd-lead">
                Canlı dersler, ders kayıtları ve seviyeye uygun modüllerle öğrenme yolculuğunu hızlandır.
              </p>

              <div className="akd-badges">
                <span className="akd-badge">Canlı Yayın</span>
                <span className="akd-badge">Kayıt Arşivi</span>
                <span className="akd-badge">Sertifika</span>
              </div>

              <div className="akd-actions">
                <Link to="/register" className="akd-btn akd-btn--cta">Hemen Başla</Link>
                <Link to="/akademi/courses" className="akd-btn akd-btn--ghost">Kurslara Göz At</Link>
              </div>
            </div>

            {/* Sağ Görsel */}
            <div className="akd-hero__media">
              <div className="akd-hero__card">
                <img src={hafizlikImage} alt="EHAD Akademi" />
                <div className="akd-spark a" />
                <div className="akd-spark b" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* İSTATİSTİK ŞERİDİ */}
      <section className="akd-stats">
        <div className="container">
          <div className="akd-grid akd-grid--4">
            {[
              { icon: "bi-collection-play", value: "+1.200", label: "Video Dersi" },
              { icon: "bi-broadcast", value: "Haftalık 80+", label: "Canlı Yayın" },
              { icon: "bi-people", value: "+15.000", label: "Aktif Öğrenci" },
              { icon: "bi-award", value: "Akredite", label: "Sertifika" },
            ].map((s, i) => (
              <div key={i} className="akd-stat hover-lift">
                <div className="akd-stat__icon"><i className={`bi ${s.icon}`} /></div>
                <div className="akd-stat__body">
                  <div className="akd-stat__value">{s.value}</div>
                  <div className="akd-stat__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER GRID */}
      <section className="akd-features">
        <div className="container">
          <div className="akd-grid akd-grid--3">
            {[
              { icon:"bi-mortarboard", title:"Kapsamlı Kurs Kütüphanesi", text:"Temel/ileri modüller; seviyeye göre planlar." },
              { icon:"bi-camera-video", title:"Canlı Ders & Kayıt", text:"Kaçırdığın dersleri kayıtlardan izle." },
              { icon:"bi-graph-up", title:"İlerleme & Raporlar", text:"Ödev, quiz ve kazanımlar tek ekranda." },
              { icon:"bi-person-check", title:"Eğitmen Geri Bildirimi", text:"Kişiye özel notlar ve öneriler." },
              { icon:"bi-people", title:"Topluluk & Gruplar", text:"Takımlar, tartışma odaları, duyurular." },
              { icon:"bi-patch-check", title:"Sertifika Sistemi", text:"Tamamlanan modüllere dijital sertifika." },
            ].map((f, i) => (
              <article key={i} className="akd-feature hover-lift">
                <div className="akd-feature__icon"><i className={`bi ${f.icon}`} /></div>
                <div className="akd-feature__body">
                  <h6>{f.title}</h6>
                  <p>{f.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ÇAĞRI BANDI */}
      <section className="akd-callout">
        <div className="container akd-callout__wrap">
          <h5 className="m-0">Akademi’ye katıl, canlı dersleri kaçırma.</h5>
          <div className="d-flex gap-2">
            <Link className="akd-callout__btn" to="/register">Hemen Başla</Link>
            <Link className="akd-callout__btn akd-callout__btn--ghost" to="/akademi/courses">Kurslara Göz At</Link>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </div>
  );
}
