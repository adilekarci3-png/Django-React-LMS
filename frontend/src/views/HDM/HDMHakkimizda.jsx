import React from "react";
import HDMBaseHeader from "../partials/HDMBaseHeader";

/* ─── Tema renkleri ─────────────────────────── */
const P  = "#4f46e5";   // indigo-600
const P2 = "#c026d3";   // fuchsia-600
const PL = "#e0e7ff";   // indigo-100
const PL2= "#fae8ff";   // fuchsia-100
const PT = "#312e81";   // indigo-900

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e0e7ff", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: ".8rem", color: "#475569", fontWeight: 600, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#fff", border: "1.5px solid #e0e7ff", borderRadius: 18, padding: "22px 24px", ...style }}>{children}</div>;
}

export default function HDMHakkimizda() {
  const degerler = [
    { icon: "bi-mic-fill",           baslik: "Kayıt & İnceleme",    aciklama: "Ses/video yükleme, bölüm/ayet işaretleme, zaman damgasıyla not ve çoklu format desteği." },
    { icon: "bi-tag-fill",           baslik: "Hata Etiketleme",     aciklama: "Tajvid kategorileri (mahreç, sıfat, medd vb.) ile sınıflandırma, şiddet ve sıklık ölçümü." },
    { icon: "bi-graph-up-arrow",     baslik: "Gelişim Takibi",      aciklama: "Gelişim grafikleri, ayet/bölüm ısı haritaları ve kişiselleştirilmiş ders plan önerileri." },
    { icon: "bi-person-check-fill",  baslik: "Hoca Onayı",          aciklama: "Öğrenci kayıtları hoca denetiminden geçer; ıslah önerileri ve geri bildirimler anında iletilir." },
  ];
  const ekip = [
    { initials: "İD", ad: "İbrahim Doğan",   rol: "HDM Genel Koordinatörü",        renk: P    },
    { initials: "SE", ad: "Sümeyye Erdoğan", rol: "Tajvid & İçerik Uzmanı",         renk: P2   },
    { initials: "OK", ad: "Osman Karaca",    rol: "Ses Teknolojileri Sorumlusu",    renk: PT   },
    { initials: "AY", ad: "Ayşe Yıldız",    rol: "Öğrenci Takip & Analiz",         renk: "#7c3aed" },
  ];

  return (
    <>
      <HDMBaseHeader />
      <div style={{ padding: "24px 0 48px" }}>
        <div className="container-xxl">

          {/* Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${PT} 0%, ${P} 55%, #a5b4fc 100%)`,
            borderRadius: 20, padding: "40px 36px", marginBottom: 22,
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -50, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.18)", borderRadius: 30, padding: "5px 14px", marginBottom: 16, fontSize: ".8rem", fontWeight: 700 }}>
                <i className="bi bi-headphones" /> Hafızlık Dinleme Modülü
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-.02em" }}>HDM Hakkında</h1>
              <p style={{ fontSize: "1rem", margin: 0, opacity: .9, maxWidth: 540, lineHeight: 1.65 }}>
                Okuma kayıtları, tajvid hata etiketleme ve kişisel gelişim istatistiklerinin tutulduğu
                dijital dinleme ve değerlendirme modülü.
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="bi-headphones"         label="Dinleme Kaydı"      value="250.000+"  color={P}   bg={PL}  />
            <StatCard icon="bi-tags-fill"          label="Hata Etiketi"       value="1.8M"      color={P2}  bg={PL2} />
            <StatCard icon="bi-arrow-down-circle"  label="Hata Azalımı (3ay)" value="%35"       color={PT}  bg="#ede9fe" />
            <StatCard icon="bi-shield-check"       label="Veri Uyumu"         value="KVKK"      color="#7c3aed" bg="#f3e8ff" />
          </div>

          {/* Misyon & Vizyon */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: PL, color: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <i className="bi bi-bullseye" />
                </div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Misyonumuz</h3>
              </div>
              <p style={{ margin: 0, fontSize: ".88rem", color: "#475569", lineHeight: 1.7 }}>
                Hafız öğrencilerin Kuran okuma kalitesini veriye dayalı hata analizi ve kişiselleştirilmiş
                geri bildirimle sistematik biçimde geliştirmek; hoca-öğrenci iletişimini dijital ortamda
                kesintisiz sürdürmek.
              </p>
            </Card>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: PL2, color: P2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <i className="bi bi-eye-fill" />
                </div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Vizyonumuz</h3>
              </div>
              <p style={{ margin: 0, fontSize: ".88rem", color: "#475569", lineHeight: 1.7 }}>
                Tajvid ve hafızlık eğitiminde yapay zeka destekli ses analizi ile bireysel hata
                profillerini çıkaran, öğrencinin güçlü ve zayıf yönlerini gerçek zamanlı raporlayan
                öncü bir dijital platform olmak.
              </p>
            </Card>
          </div>

          {/* Temel Değerler */}
          <Card style={{ marginBottom: 22 }}>
            <div style={{ fontWeight: 800, fontSize: ".95rem", color: P, marginBottom: 20, borderBottom: `1.5px solid ${PL}`, paddingBottom: 12 }}>
              <i className="bi bi-stars me-2" />Temel Değerlerimiz
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {degerler.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px", background: "#f5f3ff", borderRadius: 12, border: `1px solid ${PL}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: PL, color: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                    <i className={`bi ${d.icon}`} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#0f172a", marginBottom: 4 }}>{d.baslik}</div>
                    <div style={{ fontSize: ".82rem", color: "#475569", lineHeight: 1.6 }}>{d.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ekibimiz */}
          <Card>
            <div style={{ fontWeight: 800, fontSize: ".95rem", color: P, marginBottom: 20, borderBottom: `1.5px solid ${PL}`, paddingBottom: 12 }}>
              <i className="bi bi-people me-2" />Ekibimiz
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {ekip.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e0e7ff", background: "#f8f7ff" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: e.renk, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".9rem" }}>
                    {e.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#0f172a" }}>{e.ad}</div>
                    <div style={{ fontSize: ".78rem", color: "#475569", marginTop: 2 }}>{e.rol}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}
