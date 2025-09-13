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
  --acc1:#059669; /* emerald-600 */
  --acc2:#d97706; /* amber-600 */

  --ink:#0f172a; --sl-700:#334155; --sl-300:#cbd5e1; --sl-200:#e5e7eb; --sl-100:#f1f5f9; --bg1:#fffef6;
  --radius-xl:22px; --shadow-lg:0 16px 40px rgba(15,23,42,.12); --shadow-md:0 10px 24px rgba(15,23,42,.10);
  --container:1120px;
}
*{box-sizing:border-box} html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;color:var(--ink)}
.outer{padding:16px} @media (min-width:768px){.outer{padding:24px}}
.page{max-width:calc(var(--container)+48px);margin:0 auto;border:1px solid var(--sl-200);border-radius:var(--radius-xl);background:#fff;box-shadow:var(--shadow-lg);overflow:hidden}
.section{padding:28px 20px} @media(min-width:768px){.section{padding:36px 28px}}

.chip{display:inline-block;font-size:12px;font-weight:800;color:#0b2319;border:1px solid rgba(0,0,0,.2);padding:6px 10px;border-radius:999px;background:rgba(255,185,0,.22)}
.intro{margin:20px;border-radius:18px;border:1px solid var(--sl-200);box-shadow:var(--shadow-md)}
/* Yeşil/Sarı 200-300 bandında, biraz daha canlı */
.intro-top{padding:18px;background:linear-gradient(90deg,#bbf7d0,#fde68a)}
.intro-top h1{margin:0 0 6px;font-size:24px;font-weight:900}
.intro-top p{margin:0}

.grid-2{display:grid;gap:16px;margin-top:18px} @media(min-width:980px){.grid-2{grid-template-columns:1fr 1fr}}
.card{background:#fff;border:1px solid var(--sl-200);border-radius:18px;box-shadow:var(--shadow-md)}
.hd{padding:14px 18px;border-bottom:1px solid var(--sl-200);background:linear-gradient(90deg,#d9f99d,#fef3c7)}
.bd{padding:18px}
.lead{color:var(--sl-700)}
.list{margin:10px 0 0;padding-left:18px}

.strip{background:var(--bg1);padding:20px;border-top:1px dashed var(--sl-200);border-bottom:1px dashed var(--sl-200)}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)} @media(min-width:900px){.gallery{grid-template-columns:repeat(4,1fr)}}
.img{width:100%;height:160px;object-fit:cover;border-radius:16px;border:1px solid var(--sl-200);box-shadow:0 10px 22px rgba(5,150,105,.18)}

.stats{padding:26px 20px;background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#0b2319}
.sgrid{display:grid;gap:12px} @media(min-width:900px){.sgrid{grid-template-columns:repeat(4,1fr)}}
.stat{background:rgba(255,255,255,.5);border:1px solid rgba(0,0,0,.1);border-radius:16px;padding:16px;text-align:center}
.kv{font-weight:900;font-size:22px}
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
            <p>Tüm hafız kayıtlarının tutulduğu; bölge/kurum bazında istatistiklerin üretildiği merkezi bilgi sistemi.</p>
          </div>

          <section className="section">
            <div className="grid-2">
              <div className="card">
                <div className="hd"><strong>Kapsam</strong></div>
                <div className="bd">
                  <p className="lead">Kişi bilgileri, eğitim geçmişi, icazet durumu, kurum/şube ilişkileri ve denetim logları.</p>
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
                  <p className="lead">Zaman serileri, dağılım haritaları ve yaş kohort analiziyle karar destek.</p>
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
