import React from "react";
import { Link } from "react-router-dom";
import hafizlikImage from "./images/4.png";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import "./css/hbs-theme.css";

export default function HafizBilgiIndex() {
  return (
    <div className="page-hbs hbs-theme hbs-solid">
      <HBSBaseHeader />

      {/* HERO — kompakt şerit */}
      <section className="hbs-hero-v2">
        <div className="container">
          <div className="row align-items-center g-3 g-lg-4">
            {/* Sol metin */}
            <div className="col-lg-7">
              <div className="hero-eyebrow">EHAD • HBS</div>
              <h1 className="hero-title">Hafızlar Bilgi Sistemi</h1>
              <p className="hero-lead">
                Hafız adaylarının eğitim ve gelişim süreçlerini izleyebileceğiniz modern dijital yönetim sistemi.
              </p>

              {/* Hızlı etiketler */}
              <div className="hero-badges">
                <span className="badge">Öğrenci</span>
                <span className="badge">Eğitmen</span>
                <span className="badge">Raporlar</span>
              </div>

              {/* CTA’lar */}
              <div className="hero-actions">
                <Link to="/hbs/login" className="btn btn-amber">Panele Giriş</Link>
                <Link to="/hbs/register" className="btn btn-glass">Kayıt Ol</Link>
              </div>
            </div>

            {/* Sağ görsel yığını (beyaz kart yok) */}
            <div className="col-lg-5">
              <div className="media-stack">
                <img src={hafizlikImage} alt="HBS" className="shot primary" />
                <div className="shot tile a" />
                <div className="shot tile b" />
                <div className="shot tile c" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hızlı aksiyon çubuğu (hero ile kaynaşık) */}
      <section className="quickbar">
        <div className="container">
          <div className="qb-wrap">
            <Link to="/hafizbilgi/create-hafizbilgi/" className="qb-item">
              <i className="bi bi-journal-plus" />
              <span>Hafız Bilgi Ekle</span>
            </Link>
            <Link to="/hafizbilgi/list/" className="qb-item">
              <i className="bi bi-people" />
              <span>Hafız Listesi</span>
            </Link>
            <Link to="/calendar" className="qb-item">
              <i className="bi bi-calendar2-week" />
              <span>Takvim</span>
            </Link>
            <Link to="/reports" className="qb-item">
              <i className="bi bi-bar-chart-line" />
              <span>Raporlar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* İstatistikler — kompakt ve hero’nun hemen altında */}
      <section className="hdm-section hdm-stats-v2">
        <div className="container">
          <div className="row g-3 g-md-4">
            {[
              { icon: "bi-person-badge", value: "+8.500", label: "Kayıtlı Hafız" },
              { icon: "bi-shield-check", value: "%98", label: "Doğruluk" },
              { icon: "bi-activity", value: "Haftalık 3.2k", label: "Okuma Kaydı" },
              { icon: "bi-shield-lock", value: "KVKK", label: "Uyumlu" },
            ].map((s, i) => (
              <div className="col-6 col-lg-3" key={i}>
                <div className="stat-v2">
                  <div className="icon"><i className={`bi ${s.icon}`} /></div>
                  <div className="val">{s.value}</div>
                  <div className="lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler — küçük kartlar */}
      <section className="hdm-section hdm-features-v2">
        <div className="container">
          <div className="row g-3 g-md-4">
            {[
              { icon: "bi-person-lines-fill", title: "Hafız Profilleri", text: "İlerleme, notlar, sınav/rapor tek ekranda." },
              { icon: "bi-calendar2-week", title: "Takvim & Randevu", text: "Ders ve dinleme planlaması pratik." },
              { icon: "bi-journal-check", title: "Hata Takip", text: "Etiketle, rapora otomatik yansısın." },
              { icon: "bi-cloud-arrow-up", title: "Kayıt Yükleme", text: "Ses/video güvenle saklanır." },
              { icon: "bi-people", title: "Ekip Çalışması", text: "Eğitmen-öğrenci-veli koordinasyonu." },
              { icon: "bi-download", title: "Rapor Dışa Aktar", text: "PDF/Excel tek tıkla." },
            ].map((f, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div className="feat-v2">
                  <div className="fi"><i className={`bi ${f.icon}`} /></div>
                  <div className="ft">
                    <h6>{f.title}</h6>
                    <p>{f.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alt footer */}
      <HBSBaseFooter />
    </div>
  );
}
