import React, { useEffect, useState } from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import useAxios from "../../utils/useAxios"; // kendi axios hook’un
import "./css/akademi-about.css"; // CSS ayrı dosyaya taşıdıysan

export default function Akademihakkimizda() {
  const api = useAxios();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback (API dönmezse gösterilecek)
  const fallback = {
    title: "Akademi Hakkında",
    subtitle:
      "EHAD eğitim videoları ve dökümanlarının yer aldığı, seviye/konu bazlı öğrenme kütüphanesi.",
    cards: [
      {
        title: "Video & Döküman",
        text: "Kurs, seminer, atölye videoları; slayt, not ve kaynaklar.",
        pills: ["Kategori", "Etiket", "Arama"],
      },
      {
        title: "Öğrenme Yolculukları",
        text: "“Tajvid Temelleri”, “Kıraat İleri” gibi yol haritaları; ilerleme yüzdeleri ve rozetler.",
      },
      {
        title: "Değerlendirme & Sertifika",
        text: "Ünite sonu quiz’ler ve otomatik sertifika üretimi.",
      },
    ],
    gallery: [
      "https://www.ehad.org.tr/wp-content/uploads/2015/07/SLIDER-DISARI-EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
      "https://www.ehad.org.tr/wp-content/uploads/2015/07/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-1600-810001-370x250.jpg",
      "https://www.ehad.org.tr/wp-content/uploads/2018/02/EHAD-GENEL-MERKEZ-2018-YONETIM-KURULU-DIB-ALI-ERBAS-ZIYARETI-001-370x250.jpg",
      "https://www.ehad.org.tr/wp-content/uploads/2025/08/istanbul-medeniyet-universitesi-protokolu-2025-150x150.jpeg",
    ],
    stats: [
      { value: "1.200+", label: "Video" },
      { value: "350+", label: "Döküman" },
      { value: "40+", label: "Öğrenme Yolu" },
      { value: "%92", label: "Tamamlama" },
    ],
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 👇 senin backend endpoint’in
        const res = await api.get("pages/about/akademi/");
        if (mounted) setData(res?.data);
      } catch (err) {
        console.error("API Hatası:", err);
        if (mounted) setData(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const d = data || fallback;

  return (
    <>
      <AkademiBaseHeader />
      <div className="outer">
        <main className="page">
          <div className="title">
            <div className="chip">Akademi</div>
            <h1>{loading ? "Yükleniyor..." : d.title}</h1>
            <p>{loading ? "Lütfen bekleyin..." : d.subtitle}</p>
          </div>

          <section className="section">
            <div className="grid-3">
              {(d.cards || []).map((c, i) => (
                <div className="card" key={i}>
                  <div className="hd">
                    <strong>{c.title}</strong>
                  </div>
                  <div className="bd">
                    <p className="lead">{c.text}</p>
                    {!!c.pills?.length && (
                      <div>
                        {c.pills.map((p, j) => (
                          <span className="pill" key={j}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="strip">
            <div className="gallery">
              {(d.gallery || []).slice(0, 4).map((src, i) => (
                <img className="img" src={src} alt={`Akademi ${i + 1}`} key={i} />
              ))}
            </div>
          </section>

          <section className="stats">
            <div className="sgrid">
              {(d.stats || []).map((s, i) => (
                <div className="stat" key={i}>
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
