// src/pages/Eskephakkimizda.jsx
import React from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";

export default function Eskephakkimizda() {
  const photos = {
    hero: "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot1: "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot2: "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
    logo: "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
  };

 const css = `
:root{
  /* Daha doygun: teal/violet 600-700 tonları */
  --acc1:#0891b2; /* teal-600 */
  --acc2:#6d28d9; /* violet-700 */

  --ink:#0f172a; --sl-700:#334155; --sl-600:#475569; --sl-300:#cbd5e1; --sl-200:#e5e7eb; --sl-100:#f1f5f9; --bg1:#f6f9ff;
  --radius-xl:22px; --shadow-lg:0 16px 40px rgba(15,23,42,.12); --shadow-md:0 10px 24px rgba(15,23,42,.10);
  --container:1120px;
}
*{box-sizing:border-box} html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;color:var(--ink)}
.outer{padding:16px} @media (min-width:768px){.outer{padding:24px}}
.page{max-width:calc(var(--container)+48px);margin:0 auto;border:1px solid var(--sl-200);border-radius:var(--radius-xl);background:#fff;box-shadow:var(--shadow-lg);overflow:hidden}
.section{padding:28px 20px} @media(min-width:768px){.section{padding:36px 28px}}

.chip{display:inline-block;font-size:12px;font-weight:700;color:var(--acc2);border:1px solid var(--sl-300);padding:6px 10px;border-radius:999px;background:var(--sl-100)}
.intro{margin:20px;border-radius:18px;border:1px solid var(--sl-200);box-shadow:var(--shadow-md);overflow:hidden}
/* Bir tık koyulaştırılmış pastel şerit */
.intro-top{padding:18px;background:linear-gradient(90deg,#dbeafe,#e9d5ff)}
.intro-top h1{margin:0 0 6px;font-size:24px;font-weight:900}
.intro-top p{margin:0;color:var(--sl-700)}

.grid-2{display:grid;gap:18px;margin-top:18px} @media(min-width:980px){.grid-2{grid-template-columns:1.1fr .9fr}}
.card{background:#fff;border:1px solid var(--sl-200);border-radius:18px;box-shadow:var(--shadow-md)}
/* Kart başlık gradyanı da bir ton belirgin */
.card .hd{padding:14px 18px;border-bottom:1px solid var(--sl-200);background:linear-gradient(90deg,#e0e7ff,#bae6fd)}
.card .bd{padding:18px}
.lead{color:var(--sl-700)}
.list{margin:10px 0 0;padding-left:18px}
.pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid var(--sl-300);background:var(--sl-100);color:#0b0f1a;font-size:12px;margin:8px 8px 0 0}

.strip{background:var(--bg1);padding:20px;border-top:1px dashed var(--sl-200);border-bottom:1px dashed var(--sl-200)}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)} @media(min-width:900px){.gallery{grid-template-columns:repeat(4,1fr)}}
/* Gölgeyi çok hafif güçlendirdim */
.img{width:100%;height:160px;object-fit:cover;border-radius:16px;border:1px solid var(--sl-200);box-shadow:0 10px 22px rgba(8,145,178,.18)}

.stats{padding:26px 20px;background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#fff}
.sgrid{display:grid;gap:12px} @media(min-width:900px){.sgrid{grid-template-columns:repeat(4,1fr)}}
.stat{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);border-radius:16px;padding:16px;text-align:center}
.kv{font-weight:900;font-size:22px}
`;

  return (
    <>
      <style>{css}</style>
      <ESKEPBaseHeader />
      <div className="outer">
        <main className="page">
          {/* Header kaldırıldı; yerine ufak bir intro kartı */}
          <div className="intro">
            <div className="intro-top">
              <span className="chip">Modül • ESKEP</span>
              <h1>ESKEP Hakkında</h1>
              <p>Öğrenci/stajyer ders sonu raporları, ödev, proje ve kitap tahlillerinin yüklendiği ve izlendiği modül.</p>
            </div>
          </div>

          <section className="section">
            <div className="grid-2">
              <div className="card">
                <div className="hd"><strong>Ne Yapar?</strong></div>
                <div className="bd">
                  <p className="lead">Standart şablonlarla yüklenen rapor/ödev/proje/kitap tahlilleri; danışman onayı ve puanlama akışı.</p>
                  <ul className="list">
                    <li>Dosya yükleme (PDF/Doc/Video) & versiyonlama</li>
                    <li>Rubrik bazlı değerlendirme & geri bildirim</li>
                    <li>Teslim tarihi & hatırlatmalar</li>
                    <li>Gelişmiş arama & filtreleme</li>
                  </ul>
                  <div>
                    <span className="pill">Öğrenci</span>
                    <span className="pill">Danışman</span>
                    <span className="pill">Koordinatör</span>
                    <span className="pill">Yönetici</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="hd"><strong>Akış & Çıktılar</strong></div>
                <div className="bd">
                  <ol className="list">
                    <li>Öğrenci yükler → ESKEP sınıflandırır</li>
                    <li>Danışman puanlar / iade eder / onaylar</li>
                    <li>Koordinatör kalite ve istatistikleri izler</li>
                  </ol>
                  <ul className="list" style={{marginTop:10}}>
                    <li>Performans PDF raporları</li>
                    <li>Ödev & tahlil kütüphanesi</li>
                    <li>Gecikme ve uyum skorları</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="strip">
            <div className="gallery">
              <img className="img" src={photos.hero} alt="ESKEP 1"/>
              <img className="img" src={photos.shot1} alt="ESKEP 2"/>
              <img className="img" src={photos.shot2} alt="ESKEP 3"/>
              <img className="img" src={photos.logo} alt="ESKEP 4"/>
            </div>
          </section>

          <section className="stats">
            <div className="sgrid">
              <div className="stat"><div className="kv">10.000+</div><div>Aylık Yükleme</div></div>
              <div className="stat"><div className="kv">95%</div><div>Zamanında Teslim</div></div>
              <div className="stat"><div className="kv">3.5 dk</div><div>Değerlendirme Süresi</div></div>
              <div className="stat"><div className="kv">%99.9</div><div>Erişilebilirlik</div></div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
