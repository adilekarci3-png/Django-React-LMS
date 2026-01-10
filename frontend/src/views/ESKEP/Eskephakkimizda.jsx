// src/pages/Eskephakkimizda.jsx
import React, { useEffect, useState } from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";

export default function Eskephakkimizda() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // BACKEND'TEN ÇEK
  useEffect(() => {
    // URL: api/urls.py içine eklediğimiz
    // path("eskep/about/<slug:slug>/", EskepPageViewSet.as_view({"get": "retrieve"}), ...)
    fetch("/api/eskep/about/eskephakkimizda/")
      .then((r) => {
        if (!r.ok) throw new Error("ESKEP sayfası getirilemedi");
        return r.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setErr(e.message);
        setLoading(false);
      });
  }, []);

  // BACKEND GELMEZSE KULLANILACAK STATIK VERILER
  const fallbackPhotos = {
    hero: "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot1: "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
    shot2: "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
    logo: "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
  };

  // BACKEND CEVABINDAN FOTOĞRAFLARI ÇIKAR
  const photos = {
    hero: data?.hero_image || fallbackPhotos.hero,
    shot1: data?.shot1 || fallbackPhotos.shot1,
    shot2: data?.shot2 || fallbackPhotos.shot2,
    logo: data?.logo || fallbackPhotos.logo,
  };

  // BACKEND'TEN GELEN CSS VARSA ONU KULLAN, YOKSA ESKIYI
  const defaultCss = `
:root{
  --acc1:#0891b2; --acc2:#6d28d9;
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
.intro-top{padding:18px;background:linear-gradient(90deg,#dbeafe,#e9d5ff)}
.intro-top h1{margin:0 0 6px;font-size:24px;font-weight:900}
.intro-top p{margin:0;color:var(--sl-700)}

.grid-2{display:grid;gap:18px;margin-top:18px} @media(min-width:980px){.grid-2{grid-template-columns:1.1fr .9fr}}
.card{background:#fff;border:1px solid var(--sl-200);border-radius:18px;box-shadow:var(--shadow-md)}
.card .hd{padding:14px 18px;border-bottom:1px solid var(--sl-200);background:linear-gradient(90deg,#e0e7ff,#bae6fd)}
.card .bd{padding:18px}
.lead{color:var(--sl-700)}
.list{margin:10px 0 0;padding-left:18px}
.pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid var(--sl-300);background:var(--sl-100);color:#0b0f1a;font-size:12px;margin:8px 8px 0 0}

.strip{background:var(--bg1);padding:20px;border-top:1px dashed var(--sl-200);border-bottom:1px dashed var(--sl-200)}
.gallery{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)} @media(min-width:900px){.gallery{grid-template-columns:repeat(4,1fr)}}
.img{width:100%;height:160px;object-fit:cover;border-radius:16px;border:1px solid var(--sl-200);box-shadow:0 10px 22px rgba(8,145,178,.18)}

.stats{padding:26px 20px;background:linear-gradient(90deg,var(--acc1),var(--acc2));color:#fff}
.sgrid{display:grid;gap:12px} @media(min-width:900px){.sgrid{grid-template-columns:repeat(4,1fr)}}
.stat{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);border-radius:16px;padding:16px;text-align:center}
.kv{font-weight:900;font-size:22px}
`;

  const css = data?.css && data.css.trim() !== "" ? data.css : defaultCss;

  // Yükleniyor / hata
  if (loading) {
    return (
      <>
        <ESKEPBaseHeader />
        <div style={{ padding: 24 }}>ESKEP Hakkında yükleniyor...</div>
      </>
    );
  }

  if (err) {
    // Hata olursa statik versiyona geri dönelim
    console.warn("Statik ESKEP sayfasına düştü:", err);
  }

  // cards: backend'ten geldiyse kullan, yoksa eski 2 kartı bas
  const cards =
    data?.cards && data.cards.length > 0
      ? data.cards
      : [
          {
            id: 1,
            title: "Ne Yapar?",
            lead:
              "Standart şablonlarla yüklenen rapor/ödev/proje/kitap tahlilleri; danışman onayı ve puanlama akışı.",
            bullets: [
              "Dosya yükleme (PDF/Doc/Video) & versiyonlama",
              "Rubrik bazlı değerlendirme & geri bildirim",
              "Teslim tarihi & hatırlatmalar",
              "Gelişmiş arama & filtreleme",
            ],
            pills: ["Öğrenci", "Danışman", "Koordinatör", "Yönetici"],
          },
          {
            id: 2,
            title: "Akış & Çıktılar",
            lead: "",
            bullets: [
              "Öğrenci yükler → ESKEP sınıflandırır",
              "Danışman puanlar / iade eder / onaylar",
              "Koordinatör kalite ve istatistikleri izler",
              "Performans PDF raporları",
              "Ödev & tahlil kütüphanesi",
              "Gecikme ve uyum skorları",
            ],
            pills: [],
          },
        ];

  // gallery
  const gallery =
    data?.gallery && data.gallery.length > 0
      ? data.gallery
      : [
          { id: 1, image_url: photos.hero, alt_text: "ESKEP 1" },
          { id: 2, image_url: photos.shot1, alt_text: "ESKEP 2" },
          { id: 3, image_url: photos.shot2, alt_text: "ESKEP 3" },
          { id: 4, image_url: photos.logo, alt_text: "ESKEP 4" },
        ];

  // stats
  const stats =
    data?.stats && data.stats.length > 0
      ? data.stats
      : [
          { id: 1, value: "10.000+", label: "Aylık Yükleme" },
          { id: 2, value: "95%", label: "Zamanında Teslim" },
          { id: 3, value: "3.5 dk", label: "Değerlendirme Süresi" },
          { id: 4, value: "%99.9", label: "Erişilebilirlik" },
        ];

  return (
    <>
      <style>{css}</style>
      <ESKEPBaseHeader />
      <div className="outer">
        <main className="page">
          {/* Intro */}
          <div className="intro">
            <div className="intro-top">
              <span className="chip">{data?.intro_chip || "Modül • ESKEP"}</span>
              <h1>{data?.title || "ESKEP Hakkında"}</h1>
              <p>
                {data?.subtitle ||
                  "Öğrenci/stajyer ders sonu raporları, ödev, proje ve kitap tahlillerinin yüklendiği ve izlendiği modül."}
              </p>
            </div>
          </div>

          {/* Kartlar */}
          <section className="section">
            <div className="grid-2">
              {cards.map((card) => (
                <div key={card.id || card.title} className="card">
                  <div className="hd">
                    <strong>{card.title}</strong>
                  </div>
                  <div className="bd">
                    {card.lead ? <p className="lead">{card.lead}</p> : null}
                    {card.bullets && card.bullets.length ? (
                      <ul className="list">
                        {card.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                    {card.pills && card.pills.length ? (
                      <div>
                        {card.pills.map((p) => (
                          <span key={p} className="pill">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Galeri */}
          <section className="strip">
            <div className="gallery">
              {gallery.map((g) => (
                <img key={g.id || g.image_url} className="img" src={g.image_url} alt={g.alt_text || "ESKEP"} />
              ))}
            </div>
          </section>

          {/* İstatistikler */}
          <section className="stats">
            <div className="sgrid">
              {stats.map((s) => (
                <div key={s.id || s.label} className="stat">
                  <div className="kv">{s.value}</div>
                  <div>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
