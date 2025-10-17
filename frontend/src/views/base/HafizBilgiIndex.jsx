import React from "react";
import { Link } from "react-router-dom";
import hafizlikImage from "./images/4.png";
import { HafizBilgiIndex_V2 } from "./AsymHero";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import "./css/GirisPage.css";

export default function HafizBilgiIndex(){
  return (
    <div className="page-hbs hbs-theme hbs-solid">
      <HBSBaseHeader />

      {/* HERO (AsymHero: HBS için “blue” paleti kullanıyoruz) */}
      <HafizBilgiIndex_V2
        Header={null}
        Footer={null}
        image={hafizlikImage}
      />

      {/* İSTATİSTİK ŞERİDİ */}
      <section className="hdm-stats-section">
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-person-badge" /></div>
                <div>
                  <div className="hdm-stat-value">+8.500</div>
                  <div className="hdm-stat-label">Kayıtlı Hafız</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-clipboard-check" /></div>
                <div>
                  <div className="hdm-stat-value">%98</div>
                  <div className="hdm-stat-label">Doğruluk</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-graph-up" /></div>
                <div>
                  <div className="hdm-stat-value">Haftalık 3.2k</div>
                  <div className="hdm-stat-label">Okuma Kaydı</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-shield-lock" /></div>
                <div>
                  <div className="hdm-stat-value">KVKK</div>
                  <div className="hdm-stat-label">Uyumlu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="hdm-features-section">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-person-lines-fill" /></div>
                <h6 className="mb-1 text-white">Hafız Profilleri</h6>
                <p className="text-white-50 m-0">İlerleme, notlar, sınav/rapor tek ekranda.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-calendar2-week" /></div>
                <h6 className="mb-1 text-white">Takvim & Randevu</h6>
                <p className="text-white-50 m-0">Ders ve dinleme planlaması pratikleştirildi.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-journal-check" /></div>
                <h6 className="mb-1 text-white">Hata Takip</h6>
                <p className="text-white-50 m-0">Basit etiketleme, gelişim raporuna otomatik yansır.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-cloud-arrow-up" /></div>
                <h6 className="mb-1 text-white">Kayıt Yükleme</h6>
                <p className="text-white-50 m-0">Ses/video kayıtlarını güvenle saklayın.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-people" /></div>
                <h6 className="mb-1 text-white">Ekip Çalışması</h6>
                <p className="text-white-50 m-0">Eğitmen-öğrenci-veli üçgeninde koordinasyon.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-download" /></div>
                <h6 className="mb-1 text-white">Rapor Dışa Aktar</h6>
                <p className="text-white-50 m-0">PDF/Excel raporlarını tek tıkla alın.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÇAĞRI BANDI (mavi-cyan “bar” geçişli) */}
      <section className="hdm-callout hdm-callout--animated text-white my-4">
        <div className="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <h5 className="m-0">Hafızlar Bilgi Sistemi ile tüm süreci dijital yönetin.</h5>
          <div className="d-flex gap-2">
            <Link className="btn btn-light btn-sm" to="/hbs/register">Hemen Başla</Link>
            <Link className="btn btn-outline-light btn-sm" to="/hbs/login">Panele Giriş</Link>
          </div>
        </div>
      </section>

      <HBSBaseFooter />
    </div>
  );
}
