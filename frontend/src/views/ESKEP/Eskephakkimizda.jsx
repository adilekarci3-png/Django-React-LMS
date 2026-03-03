import React from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";

/* ─── Tema renkleri ─────────────────────────── */
const P  = "#0891b2";   // cyan-600
const P2 = "#6d28d9";   // violet-700
const PL = "#cffafe";   // cyan-100
const PL2= "#ede9fe";   // violet-100
const PT = "#164e63";   // cyan-900

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
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
  return <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "22px 24px", ...style }}>{children}</div>;
}

export default function Eskephakkimizda() {
  const degerler = [
    { icon: "bi-upload",              baslik: "Kolay Yükleme",       aciklama: "Rapor, ödev, proje ve kitap tahlillerini standart şablonlarla zahmetsizce yükle." },
    { icon: "bi-person-check-fill",   baslik: "Danışman Onayı",      aciklama: "Rubrik bazlı değerlendirme, geri bildirim ve puanlama akışıyla şeffaf süreç." },
    { icon: "bi-bar-chart-line-fill", baslik: "Performans Takibi",   aciklama: "Gecikme, uyum skoru ve kalite istatistiklerini koordinatör anlık izler." },
    { icon: "bi-shield-check",        baslik: "Güvenli Arşiv",       aciklama: "Tüm çalışmalar versiyonlanmış, aranabilir ve güvenli dijital arşivde saklanır." },
  ];
  const ekip = [
    { initials: "AS", ad: "Ahmet Sarı",       rol: "ESKEP Genel Koordinatörü",      renk: P    },
    { initials: "EK", ad: "Emine Kılıç",      rol: "Akademik Danışman Koordinatörü", renk: P2  },
    { initials: "MÇ", ad: "Murat Çelik",      rol: "Sistem & Entegrasyon Sorumlusu", renk: PT  },
    { initials: "ZA", ad: "Zehra Aydın",      rol: "Öğrenci İşleri & Kalite",       renk: "#0e7490" },
  ];

  return (
    <>
      <ESKEPBaseHeader />
      <div style={{ padding: "24px 0 48px" }}>
        <div className="container-xxl">

          {/* Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${PT} 0%, ${P} 55%, #67e8f9 100%)`,
            borderRadius: 20, padding: "40px 36px", marginBottom: 22,
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -50, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.18)", borderRadius: 30, padding: "5px 14px", marginBottom: 16, fontSize: ".8rem", fontWeight: 700 }}>
                <i className="bi bi-folder2-open" /> Ödev & Proje Yönetim Sistemi
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-.02em" }}>ESKEP Hakkında</h1>
              <p style={{ fontSize: "1rem", margin: 0, opacity: .9, maxWidth: 540, lineHeight: 1.65 }}>
                Öğrenci ve stajyerlerin ders sonu raporları, ödev, proje ve kitap tahlillerini
                yüklediği, danışman onayından geçirdiği ve koordinatörün takip ettiği dijital iş akış platformu.
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="bi-upload"              label="Aylık Yükleme"     value="10.000+"  color={P}   bg={PL}  />
            <StatCard icon="bi-clock-history"       label="Zamanında Teslim"  value="%95"      color={P2}  bg={PL2} />
            <StatCard icon="bi-lightning-charge"    label="Değerlendirme"     value="3.5 dk"   color={PT}  bg="#e0f7fa" />
            <StatCard icon="bi-hdd-network"         label="Erişilebilirlik"   value="%99.9"    color="#0e7490" bg="#cffafe" />
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
                Öğrenci ve stajyerlerin akademik çalışmalarını standart bir iş akışıyla yükleyip takip
                etmelerini sağlamak; danışman-öğrenci iletişimini şeffaflaştırarak kaliteli akademik
                çıktı üretimini desteklemek.
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
                Akademik iş akış yönetiminde sektörün referans platformu olmak; yapay zeka destekli
                değerlendirme ve kişiselleştirilmiş geri bildirim sistemiyle her öğrencinin gelişimini
                hızlandırmak.
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
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px", background: "#f0fdff", borderRadius: 12, border: `1px solid ${PL}` }}>
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
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#f8fafc" }}>
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
