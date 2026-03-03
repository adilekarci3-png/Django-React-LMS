import React from "react";
import HBSBaseHeader from "../partials/HBSBaseHeader";

/* ─── Tema renkleri ─────────────────────────── */
const P  = "#3c5fa8";   // hbs-600
const P2 = "#1c2b4d";   // hbs-900
const PL = "#dbeafe";   // blue-100
const PL2= "#eff6ff";   // blue-50
const PT = "#1e3a8a";   // blue-900

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #dbeafe", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14 }}>
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
  return <div style={{ background: "#fff", border: "1.5px solid #dbeafe", borderRadius: 18, padding: "22px 24px", ...style }}>{children}</div>;
}

export default function HBSHakkimizda() {
  const degerler = [
    { icon: "bi-person-vcard-fill",  baslik: "Merkezi Kayıt",      aciklama: "Kişi bilgileri, eğitim geçmişi, icazet durumu ve kurum ilişkileri tek çatı altında." },
    { icon: "bi-graph-up",           baslik: "Analitik Raporlar",  aciklama: "Zaman serileri, dağılım haritaları ve yaş kohort analiziyle karar destek sistemi." },
    { icon: "bi-building-check",     baslik: "Şube Yönetimi",      aciklama: "İl/ilçe/şube bazında performans karşılaştırmaları ve veri kalitesi uyarıları." },
    { icon: "bi-shield-lock-fill",   baslik: "Veri Güvenliği",     aciklama: "KVKK uyumlu altyapı ile tüm hafız verilerinin güvenli ve denetlenebilir tutulması." },
  ];
  const ekip = [
    { initials: "HY", ad: "Hüseyin Yıldırım",  rol: "HBS Genel Koordinatörü",       renk: P    },
    { initials: "NK", ad: "Nurgül Kaya",        rol: "Kayıt & Veri Yöneticisi",       renk: P2   },
    { initials: "SA", ad: "Selim Arslan",       rol: "Analiz & Raporlama Uzmanı",    renk: "#1d4ed8" },
    { initials: "FT", ad: "Fatma Toprak",       rol: "Bölge Koordinatörleri Sorumlusu", renk: "#2563eb" },
  ];

  return (
    <>
      <HBSBaseHeader />
      <div style={{ padding: "24px 0 48px" }}>
        <div className="container-xxl">

          {/* Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${P2} 0%, ${P} 55%, #93c5fd 100%)`,
            borderRadius: 20, padding: "40px 36px", marginBottom: 22,
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -50, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.18)", borderRadius: 30, padding: "5px 14px", marginBottom: 16, fontSize: ".8rem", fontWeight: 700 }}>
                <i className="bi bi-database-fill" /> Hafız Bilgi Sistemi
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-.02em" }}>HBS Hakkında</h1>
              <p style={{ fontSize: "1rem", margin: 0, opacity: .9, maxWidth: 540, lineHeight: 1.65 }}>
                Tüm hafız kayıtlarının tutulduğu; bölge ve kurum bazında istatistiklerin üretildiği,
                icazet arşivinin yönetildiği merkezi bilgi sistemi.
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            <StatCard icon="bi-people-fill"        label="Kayıtlı Hafız"     value="120.000+" color={P}   bg={PL}  />
            <StatCard icon="bi-geo-alt-fill"       label="İl"                value="81"       color={P2}  bg="#e0e7ff" />
            <StatCard icon="bi-check-circle-fill"  label="Veri Tutarlılığı"  value="%98"      color={PT}  bg="#dbeafe" />
            <StatCard icon="bi-clock-fill"         label="Erişim"            value="24/7"     color="#1d4ed8" bg={PL2} />
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
                Türkiye genelindeki tüm hafızlık verilerini doğru, güncel ve erişilebilir bir formatta
                tutarak kurum ve yetkililerin stratejik kararlarını desteklemek; hafızlık faaliyetlerini
                kayıt altına almak.
              </p>
            </Card>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#e0e7ff", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <i className="bi bi-eye-fill" />
                </div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Vizyonumuz</h3>
              </div>
              <p style={{ margin: 0, fontSize: ".88rem", color: "#475569", lineHeight: 1.7 }}>
                Hafızlık alanında Türkiye'nin en kapsamlı ve güvenilir dijital arşivi olmak; veriye
                dayalı politika geliştirmeye katkı sağlayan, bölgesel analitik yetenekleri gelişmiş
                bir bilgi platformu inşa etmek.
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
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px", background: PL2, borderRadius: 12, border: `1px solid ${PL}` }}>
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
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #dbeafe", background: "#f8fafc" }}>
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
