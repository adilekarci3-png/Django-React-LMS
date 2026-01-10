// src/pages/HBSHakkimizda.jsx
import React from "react";
import HBSBaseHeader from "../partials/HBSBaseHeader";

export default function HBSHakkimizda() {
  const photos = {
    hero: "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot1: "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot2: "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
    logo: "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
  };

  const css = `
:root{
  --acc1:#3c5fa8;  /* hbs-600 */
  --acc2:#1c2b4d;  /* hbs-900 */
  --accent-light:#6a86d6; /* hbs-400 */

  --ink:#0f172a; --sl-700:#334155; --sl-300:#cbd5e1; --sl-200:#e5e7eb;
  --sl-100:#f1f5f9; --bg1:#f8fafc;
  --radius-xl:22px; --shadow-lg:0 16px 40px rgba(15,23,42,.12);
  --shadow-md:0 10px 24px rgba(15,23,42,.10);
  --container:1120px;
}
*{box-sizing:border-box} html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;color:var(--ink)}
.outer{padding:16px} @media (min-width:768px){.outer{padding:24px}}
.page{max-width:calc(var(--container)+48px);margin:0 auto;border:1px solid var(--sl-200);
border-radius:var(--radius-xl);background:#fff;box-shadow:var(--shadow-lg);overflow:hidden}

/* Başlık alanı */
.title{padding:24px 28px;border-bottom:2px solid var(--accent-light);
background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#fff}
.title .chip{display:inline-block;font-size:12px;font-weight:800;color:#fff;
background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);
padding:6px 10px;border-radius:999px;margin-bottom:6px}
.title h1{margin:0 0 6px;font-size:26px;font-weight:900}
.title p{margin:0;color:#e5e9ff}

/* Bölüm stilleri */
.section{padding:32px 24px;background:var(--bg1)}
.grid-2{display:grid;gap:18px;margin-top:18px}
@media(min-width:980px){.grid-2{grid-template-columns:1fr 1fr}}

.card{background:#fff;border:1px solid var(--sl-200);border-radius:18px;
box-shadow:var(--shadow-md);overflow:hidden;transition:transform .2s ease, box-shadow .2s ease;}
.card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(28,43,77,.15)}
.hd{padding:14px 18px;border-bottom:1px solid var(--sl-200);
background:linear-gradient(90deg,var(--accent-light),var(--acc1));color:#fff;font-weight:700}
.bd{padding:18px}
.lead{color:var(--sl-700)}
.list{margin:10px 0 0;padding-left:18px}

/* Galeri */
.strip{background:linear-gradient(180deg,#f9fbff,#edf2ff);
padding:20px;border-top:1px solid var(--sl-200);border-bottom:1px solid var(--sl-200)}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
@media(min-width:900px){.gallery{grid-template-columns:repeat(4,1fr)}}
.img{width:100%;height:160px;object-fit:cover;border-radius:16px;
border:2px solid var(--accent-light);
box-shadow:0 10px 22px rgba(58,95,168,.25);transition:transform .3s ease;}
.img:hover{transform:scale(1.05)}

/* İstatistik bandı */
.stats{padding:28px 20px;background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#fff}
.sgrid{display:grid;gap:12px}
@media(min-width:900px){.sgrid{grid-template-columns:repeat(4,1fr)}}
.stat{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);
border-radius:16px;padding:16px;text-align:center;backdrop-filter:blur(6px)}
.kv{font-weight:900;font-size:22px;color:#fff}
.stat div:last-child{color:#e2e8f0;font-weight:500;font-size:.95rem}
`;

  return (
    <>
      <style>{css}</style>
      <HBSBaseHeader />
      <div className="outer">
        <main className="page">
          <div className="title">
            <div className="chip">HBS</div>
            <h1>HBS Hakkında</h1>
            <p>
              Tüm hafız kayıtlarının tutulduğu; bölge/kurum bazında istatistiklerin üretildiği
              merkezi bilgi sistemi.
            </p>
          </div>

          <section className="section">
            <div className="grid-2">
              <div className="card">
                <div className="hd"><strong>Kapsam</strong></div>
                <div className="bd">
                  <p className="lead">
                    Kişi bilgileri, eğitim geçmişi, icazet durumu, kurum/şube ilişkileri ve denetim logları.
                  </p>
                  <ul className="list">
                    <li>Standart kayıt formları & doğrulamalar</li>
                    <li>İcazet/tezhip doküman arşivi</li>
                    <li>İl/İlçe/Yaş kırılımları</li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="hd"><strong>Analitik</strong></div>
                <div className="bd">
                  <p className="lead">
                    Zaman serileri, dağılım haritaları ve yaş kohort analiziyle karar destek.
                  </p>
                  <ul className="list">
                    <li>Yıllık/aylık kayıt trendleri</li>
                    <li>Şube performans karşılaştırmaları</li>
                    <li>Veri kalitesi uyarıları</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="strip">
            <div className="gallery">
              <img className="img" src={photos.hero} alt="HBS 1"/>
              <img className="img" src={photos.shot1} alt="HBS 2"/>
              <img className="img" src={photos.shot2} alt="HBS 3"/>
              <img className="img" src={photos.logo} alt="HBS 4"/>
            </div>
          </section>

          <section className="stats">
            <div className="sgrid">
              <div className="stat"><div className="kv">120.000+</div><div>Kayıt</div></div>
              <div className="stat"><div className="kv">81</div><div>İl</div></div>
              <div className="stat"><div className="kv">%98</div><div>Veri Tutarlılığı</div></div>
              <div className="stat"><div className="kv">24/7</div><div>Erişim</div></div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
