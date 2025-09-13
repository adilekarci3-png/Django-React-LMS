// src/pages/HDMHakkimizda.jsx
import React from "react";
import HDMBaseHeader from "../partials/HDMBaseHeader";

export default function HDMHakkimizda() {
  const photos = {
    hero: "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot1: "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot2: "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
    logo: "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
  };

  const css = `
:root{
  --acc1:#4f46e5; /* indigo-600 */
  --acc2:#c026d3; /* fuchsia-600 */

  --ink:#0f172a; --sl-700:#334155; --sl-300:#cbd5e1; --sl-200:#e5e7eb; --sl-100:#f1f5f9; --bg1:#f7f5ff;
  --radius-xl:22px; --shadow-lg:0 16px 40px rgba(15,23,42,.12); --shadow-md:0 10px 24px rgba(15,23,42,.10);
  --container:1120px;
}
*{box-sizing:border-box} html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;color:var(--ink)}
.outer{padding:16px} @media (min-width:768px){.outer{padding:24px}}
.page{max-width:calc(var(--container)+48px);margin:0 auto;border:1px solid var(--sl-200);border-radius:var(--radius-xl);background:#fff;box-shadow:var(--shadow-lg);overflow:hidden}
.section{padding:28px 20px} @media(min-width:768px){.section{padding:36px 28px}}

.chip{display:inline-block;font-size:12px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,.65);padding:6px 10px;border-radius:999px;background:linear-gradient(90deg,var(--acc1),var(--acc2))}
.intro{margin:20px;border-radius:18px;border:1px solid var(--sl-200);box-shadow:var(--shadow-md)}
/* Indigo/Fuchsia 200 – hafif ama daha belirgin */
.intro-top{padding:18px;background:linear-gradient(90deg,#e0e7ff,#fae8ff)}
.intro-top h1{margin:0 0 6px;font-size:24px;font-weight:900}
.intro-top p{margin:0;color:var(--sl-700)}

.grid-3{display:grid;gap:16px;margin-top:18px} @media(min-width:980px){.grid-3{grid-template-columns:repeat(3,1fr)}}
.card{background:#fff;border:1px solid var(--sl-200);border-radius:18px;box-shadow:var(--shadow-md)}
.hd{padding:14px 18px;border-bottom:1px solid var(--sl-200);background:linear-gradient(90deg,#e0e7ff,#fae8ff)}
.bd{padding:18px}
.lead{color:var(--sl-700)}
.list{margin:10px 0 0;padding-left:18px}

.strip{background:var(--bg1);padding:20px;border-top:1px dashed var(--sl-200);border-bottom:1px dashed var(--sl-200)}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)} @media(min-width:900px){.gallery{grid-template-columns:repeat(4,1fr)}}
.img{width:100%;height:160px;object-fit:cover;border-radius:16px;border:1px solid var(--sl-200);box-shadow:0 10px 22px rgba(79,70,229,.18)}

.stats{padding:26px 20px;background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#fff}
.sgrid{display:grid;gap:12px} @media(min-width:900px){.sgrid{grid-template-columns:repeat(4,1fr)}}
.stat{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);border-radius:16px;padding:16px;text-align:center}
.kv{font-weight:900;font-size:22px}
`;

  return (
    <>
      <style>{css}</style>
      <HDMBaseHeader />
      <div className="outer">
        <main className="page">
          <div className="title">
            <div className="chip">HDM</div>
            <h1>HDM Hakkında</h1>
            <p>Okuma kayıtları, hata etiketleme ve kişisel istatistiklerin tutulduğu dinleme/değerlendirme modülü.</p>
          </div>

          <section className="section">
            <div className="grid-3">
              <div className="card">
                <div className="hd"><strong>Kayıt & İnceleme</strong></div>
                <div className="bd">
                  <p className="lead">Ses/video yükleme, bölüm/ayet işaretleme, tekrar dinleme listeleri.</p>
                  <ul className="list"><li>Zaman damgasıyla not</li><li>Çoklu format</li><li>Hoca onayı</li></ul>
                </div>
              </div>
              <div className="card">
                <div className="hd"><strong>Hata Etiketleme</strong></div>
                <div className="bd">
                  <p className="lead">Tajvid kategorileri (mahreç, sıfat, medd vb.) ile sınıflandırma.</p>
                  <ul className="list"><li>Şiddet & sıklık</li><li>Isabet/tekrar oranı</li><li>Islah önerileri</li></ul>
                </div>
              </div>
              <div className="card">
                <div className="hd"><strong>Raporlama</strong></div>
                <div className="bd"><p className="lead">Gelişim grafikleri, ayet/bölüm ısı haritaları ve ders plan önerileri.</p></div>
              </div>
            </div>
          </section>

          <section className="strip">
            <div className="gallery">
              <img className="img" src={photos.hero} alt="HDM 1"/>
              <img className="img" src={photos.shot1} alt="HDM 2"/>
              <img className="img" src={photos.shot2} alt="HDM 3"/>
              <img className="img" src={photos.logo} alt="HDM 4"/>
            </div>
          </section>

          <section className="stats">
            <div className="sgrid">
              <div className="stat"><div className="kv">250.000+</div><div>Dinleme</div></div>
              <div className="stat"><div className="kv">1.8M</div><div>Hata Etiketi</div></div>
              <div className="stat"><div className="kv">%35</div><div>Hata Azalımı (3 ay)</div></div>
              <div className="stat"><div className="kv">KVKK</div><div>Uyum</div></div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
