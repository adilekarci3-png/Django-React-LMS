import React from "react";
import { Link } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import hafizlikImage from "./images/2.png";
import { AkademiIndex_V2 } from "./AsymHero";
import "./css/GirisPage.css"; // hero genişliği & tema override'ları

export default function AkademiIndex(){
  return (
    <div className="page-akd akd-theme akd-theme--orchid">
      <AkademiBaseHeader />

      {/* HERO (AsymHero, mevcut V2 bileşenini kullanıyoruz) */}
      <AkademiIndex_V2 Header={null} Footer={null} image={hafizlikImage} />

      {/* İSTATİSTİK ŞERİDİ */}
      <section className="hdm-stats-section">
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-collection-play" /></div>
                <div>
                  <div className="hdm-stat-value">+1.200</div>
                  <div className="hdm-stat-label">Video Dersi</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-broadcast" /></div>
                <div>
                  <div className="hdm-stat-value">Haftalık 80+</div>
                  <div className="hdm-stat-label">Canlı Yayın</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-people" /></div>
                <div>
                  <div className="hdm-stat-value">+15.000</div>
                  <div className="hdm-stat-label">Aktif Öğrenci</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="hdm-stat-card hover-lift">
                <div className="hdm-stat-icon"><i className="bi bi-award" /></div>
                <div>
                  <div className="hdm-stat-value">Akredite</div>
                  <div className="hdm-stat-label">Sertifika</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER GRID */}
      <section className="hdm-features-section">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-mortarboard" /></div>
                <h6 className="mb-1 text-white">Kapsamlı Kurs Kütüphanesi</h6>
                <p className="text-white-50 m-0">Temel/ileri modüller, seviyeye göre planlar.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-camera-video" /></div>
                <h6 className="mb-1 text-white">Canlı Ders & Kayıt</h6>
                <p className="text-white-50 m-0">Dersleri kaçırma, kayıtları istediğin zaman izle.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-graph-up" /></div>
                <h6 className="mb-1 text-white">İlerleme & Raporlar</h6>
                <p className="text-white-50 m-0">Ödev, quiz ve kazanımları tek ekrandan takip et.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-person-check" /></div>
                <h6 className="mb-1 text-white">Eğitmen Geri Bildirimi</h6>
                <p className="text-white-50 m-0">Kişiye özel notlar ve geri bildirim akışı.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-people" /></div>
                <h6 className="mb-1 text-white">Topluluk & Gruplar</h6>
                <p className="text-white-50 m-0">Çalışma takımları, tartışma odaları, duyurular.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="hdm-feature-card hover-lift">
                <div className="hdm-feature-icon"><i className="bi bi-patch-check" /></div>
                <h6 className="mb-1 text-white">Sertifika Sistemi</h6>
                <p className="text-white-50 m-0">Tamamlanan modüller için dijital sertifika.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÇAĞRI BANDI */}
      <section className="hdm-callout hdm-callout--animated text-white my-4">
        <div className="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <h5 className="m-0">Akademi’ye katıl, canlı dersleri kaçırma.</h5>
          <div className="d-flex gap-2">
            <Link className="btn btn-light btn-sm" to="/register">Hemen Başla</Link>
            <Link className="btn btn-outline-light btn-sm" to="/akademi/courses">Kurslara Göz At</Link>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </div>
  );
}
