// src/pages/AboutEHAD.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import useAxios from "../../utils/useAxios"; // varsa kullanıyoruz
import "./css/AboutEHAD.css";

const FALLBACKS = {
  hero: "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
  meeting: "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
  group: "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
  protocol: "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
};

export default function AboutEHAD() {
  const { slug: slugFromRoute } = useParams();
  const slug = slugFromRoute || "genel";

  const api = useAxios?.() || null;
  const [data, setData] = useState(null); // API’den gelen AboutPageSerializer verisi
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true); setErr("");
      try {
        const url = `about/${slug}/`; // useAxios.baseURL /api/v1/ ile bitiyorsa başına / koyma
        let json;
        if (api) {
          const res = await api.get(url);
          json = res.data;
        } else {
          const res = await fetch(`/api/v1/${url}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          json = await res.json();
        }
        if (isMounted) setData(json);
      } catch (e) {
        if (isMounted) setErr(e?.message || "Beklenmeyen hata");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [slug]); // eslint-disable-line

  // Hero arkaplanı
  const heroBg = useMemo(() => data?.hero_image_url || FALLBACKS.group, [data]);

  // Galeri (order’a göre sırala) + fallback
  const gallery = useMemo(() => {
    const g = Array.isArray(data?.gallery)
      ? [...data.gallery].sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
    if (g.length >= 4) return g.slice(0, 4);
    const needed = 4 - g.length;
    const fb = [
      { src: FALLBACKS.hero, caption: "Eğitim Portalı" },
      { src: FALLBACKS.meeting, caption: "Toplantı" },
      { src: FALLBACKS.group, caption: "Heyet" },
      { src: FALLBACKS.protocol, caption: "Protokol" },
    ].slice(0, needed);
    return [...g, ...fb];
  }, [data]);

  // Kartlar (order’a göre)
  const cards = useMemo(() => {
    if (Array.isArray(data?.cards) && data.cards.length) {
      return [...data.cards].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [
      { title: "Eğitim", text: "Hafızlık, tilavet, tashih-i huruf ve ezber destek programları.", pills: ["Mentorluk","Ölçme-Değerlendirme"] },
      { title: "Araştırma & Yayın", text: "Kur’an ilimleri, pedagojik yaklaşımlar ve toplumsal etki çalışmaları.", pills: ["Raporlar","Yayınlar"] },
      { title: "Toplumsal Hizmet", text: "Gönüllülük, saha programları ve paydaşlarla iş birlikleri.", pills: ["Gönüllülük","Sosyal Destek"] },
    ];
  }, [data]);

  // İstatistikler (order’a göre)
  const stats = useMemo(() => {
    if (Array.isArray(data?.stats) && data.stats.length) {
      return [...data.stats].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [
      { value: "81+", label: "İl" },
      { value: "600+", label: "İlçe Temsilciliği" },
      { value: "120.000+", label: "Hafız & Aday" },
      { value: "10.000+", label: "Gönüllü" },
    ];
  }, [data]);

  // Dönüm noktaları (MILestones) — artık backend’den
  const milestones = useMemo(() => {
    if (Array.isArray(data?.milestones) && data.milestones.length) {
      return [...data.milestones].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    }
    // fallback (henüz admin’den girilmediyse)
    return [
      { year:"2010", title:"Kuruluş", text:"Hafızlık ekosistemini güçlendirmek için kuruldu." },
      { year:"2016", title:"Akademi Programları", text:"Eğitmen eğitimleri ve çevrimiçi kurslarla kapasite artışı." },
      { year:"2022", title:"Saha & Yayın", text:"Ulusal ölçekte gönüllülük ve yayın faaliyetlerinin genişlemesi." },
    ];
  }, [data]);

  return (
    <>
      <AkademiBaseHeader />
      <div className="outer">
        <main className="page">
          {/* HERO */}
          <section className="hero">
            <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }} aria-hidden="true" />
            <div className="hero-overlay" aria-hidden="true" />
            <div className="hero-inner">
              <div className="container">
                <div className="badge"><span className="dot" /> Kurumsal • Eğitim Portalı</div>
                <h1>{data?.title || "Kur'an ilmiyle topluma değer katan bir ekosistem"}</h1>
                <p>{data?.subtitle || "Eğitim Portalı, hafızlık ve Kur'an eğitimi alanında sahih bilgi, nitelikli eğitim ve toplumsal hizmet üretir."}</p>
                <div className="actions">
                  <a href="/bagis" className="btn btn-primary">Bağış Yap</a>
                  <a href="/akademi/courses" className="btn btn-outline">Eğitim Portalı Akademi</a>
                </div>
              </div>
            </div>
          </section>

          {/* Hata/Loading */}
          {loading && (
            <section className="section">
              <div className="container"><div className="lead">Yükleniyor…</div></div>
            </section>
          )}
          {(!loading && err) && (
            <section className="section">
              <div className="container"><div className="lead" style={{color:"#b91c1c"}}>Hata: {err}</div></div>
            </section>
          )}

          {/* 3 Kart */}
          <section className="section">
            <div className="container">
              <div className="grid-3">
                {cards.map((c, idx) => (
                  <div key={`${c.title}-${idx}`} className="card">
                    <span className={`pill ${["green","sky","rose"][idx % 3]}`}>{c.title}</span>
                    <p className="lead" style={{marginTop:12}}>{c.text}</p>
                    {!!(c.pills?.length) && (
                      <div style={{marginTop:12, display:"flex", gap:8, flexWrap:"wrap"}}>
                        {c.pills.map((p, i) => (
                          <span key={i} className="badge" style={{color:"#0f172a", background:"rgba(16,185,129,.12)", borderColor:"rgba(16,185,129,.25)"}}>{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Vizyon / Misyon */}
          <section className="section">
            <div className="container">
              <div className="grid-2">
                <div className="vision">
                  <h2 className="h2" style={{color: "var(--emerald-900)"}}>Vizyon</h2>
                  <p className="lead">
                    Kur’an ve Sünnet merkezli eğitimi çağın ihtiyaçlarıyla birleştirerek;
                    bilgi, ahlak ve değer kazandıran öncü bir kurum olmak.
                  </p>
                </div>
                <div className="mission">
                  <h2 className="h2">Misyon</h2>
                  <p className="lead">
                    Hafızlık ve Kur’an eğitimine akademik, manevi ve sosyal katkılar sunmak;
                    yayın ve araştırmalarla kültürel gelişime destek olmak.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Görsel şerit */}
          <section className="strip">
            <div className="container">
              <div className="grid-4">
                {gallery.map((g, i) => (
                  <img
                    key={`${g.src || "fb"}-${i}`}
                    src={g.src}
                    alt={g.caption || `Görsel ${i+1}`}
                    className={`img ${g?.src?.includes("protokolu") ? "padded" : ""}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Zaman Çizelgesi – ARTIK BACKEND'DEN */}
          <section className="section">
            <div className="container">
              <h2 className="h2">Öne Çıkan Dönüm Noktaları</h2>
              <div className="timeline" style={{marginTop:24}}>
                <div className="timeline-line" />
                {milestones.map((m, i) => (
                  <div key={`${m.year}-${i}`} className={`milestone ${i % 2 ? "even" : ""}`}>
                    <div className="ms-col">
                      <div className="ms-card">
                        <div className="ms-year">{m.year}</div>
                        <div style={{fontWeight:700, fontSize:18, color:"var(--slate-900)"}}>{m.title}</div>
                        <p className="lead" style={{marginTop:8}}>{m.text}</p>
                      </div>
                    </div>
                    <div className="ms-col" />
                    <span className="ms-dot" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* İstatistikler */}
          <section className="stats">
            <div className="container stats-grid">
              {stats.map((s, idx) => (
                <div key={`${s.value}-${idx}`} className="stat">
                  <div className="stat-k">{s.value}</div>
                  <div className="stat-v">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="cta">
            <div className="container">
              <div className="cta-box">
                <div className="cta-ball" aria-hidden="true" />
                <h3 className="h2" style={{color:"#fff", marginBottom:8}}>Bir iyiliğe ortak olun</h3>
                <p style={{color:"#cbd5e1"}}>
                  Hafızlık ve Kur’an eğitimini daha çok kişiye ulaştırmak için destek verebilirsiniz.
                </p>
                <div className="actions" style={{marginTop:20}}>
                  <a href="/bagis" className="btn btn-primary">Online Bağış</a>
                  <a href="/subelerimiz" className="btn btn-outline" style={{borderColor:"rgba(255,255,255,.5)"}}>
                    Şubelerimiz
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-inner">
              <div>
                <div className="brand">Eğitim Portalı – Evrensel Hafızlar Derneği</div>
                <div style={{fontSize:14, color:"#6b7280"}}>© {new Date().getFullYear()} Eğitim Portalı. Tüm hakları saklıdır.</div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
