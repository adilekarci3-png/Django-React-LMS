/**
 * OTM – Örnek Görünüm Sayfaları
 * Gösterilen tüm veriler statik/örnek amaçlıdır, backend bağlantısı yoktur.
 */

import React from "react";
import OTMBaseHeader from "../partials/OtmBaseHeader";
import OTMBaseFooter from "../partials/OtmBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/* ══════════════════════════════════════════════════════════
   ORTAK BİLEŞENLER
══════════════════════════════════════════════════════════ */

function OtmLayout({ children }) {
  return (
    <>
      <OTMBaseHeader />
      <section className="pt-4 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row g-4">
            <div className="col-12 col-lg-3 col-xl-3">
              <Sidebar />
            </div>
            <div className="col-12 col-lg-9 col-xl-9">
              {children}
            </div>
          </div>
        </div>
      </section>
      <OTMBaseFooter />
    </>
  );
}

/** Sidebar olmayan tam genişlik layout (Hakkımızda, İletişim, Org. Şeması) */
function OtmPublicLayout({ children }) {
  return (
    <>
      <OTMBaseHeader />
      <div style={{ padding: "24px 0 48px" }}>
        <div className="container-xxl">
          {children}
        </div>
      </div>
      <OTMBaseFooter />
    </>
  );
}

/** Sayfanın altında gösterilen önizleme notu (gizlendi) */
function PreviewNote() {
  return null;
}

/** İstatistik kartı */
function StatCard({ icon, label, value, color = "#e53935", bg = "#fdeaea" }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #f0dada", borderRadius: "16px",
      padding: "20px 22px", display: "flex", alignItems: "center", gap: "14px",
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: bg, color, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1a0a0a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: ".8rem", color: "#6b4444", fontWeight: 600, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

/** Durum etiketi */
function Badge({ label, type = "devam" }) {
  const map = {
    devam:       { bg: "#e3f2fd", c: "#1565c0" },
    tamamlandi:  { bg: "#e8f5e9", c: "#2e7d32" },
    bekliyor:    { bg: "#fff3e0", c: "#e65100" },
    basarili:    { bg: "#e8f5e9", c: "#2e7d32" },
    dusuk:       { bg: "#ffebee", c: "#c62828" },
    var:         { bg: "#e8f5e9", c: "#2e7d32" },
    yok:         { bg: "#ffebee", c: "#c62828" },
    gec:         { bg: "#fff3e0", c: "#e65100" },
    izinli:      { bg: "#e3f2fd", c: "#1565c0" },
  };
  const s = map[type] || map.bekliyor;
  return (
    <span style={{
      background: s.bg, color: s.c,
      padding: "3px 12px", borderRadius: 20,
      fontWeight: 700, fontSize: ".78rem", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

/** Tablo sarmalayıcı */
function MockTable({ headers, rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              textAlign: "left", padding: "8px 12px",
              color: "#b71c1c", fontWeight: 700, fontSize: ".76rem",
              textTransform: "uppercase", letterSpacing: ".04em",
              borderBottom: "2px solid #fdeaea",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: "11px 12px", borderBottom: "1px solid #fdf0f0",
                verticalAlign: "middle",
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** İlerleme çubuğu */
function ProgressBar({ value, color = "#e53935" }) {
  return (
    <div style={{ background: "#f0dada", borderRadius: 999, height: 8, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width .3s" }} />
    </div>
  );
}

/** Kart sarmalayıcı */
function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #f0dada",
      borderRadius: 18, padding: "22px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Sayfa başlık bloğu */
function PageHero({ icon, title, sub }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      background: "linear-gradient(135deg,#fdeaea 0%,#fff 100%)",
      border: "1.5px solid #f0dada", borderRadius: 18,
      padding: "22px 26px", marginBottom: 22,
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 13,
        background: "#e53935", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem", flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a0a0a", margin: 0 }}>{title}</h2>
        <p style={{ fontSize: ".85rem", color: "#6b4444", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   KOÇLUK
══════════════════════════════════════════════════════════ */

export function KoclukTakipPage() {
  const rows = [
    ["Ayşe Kaya",    "Matematik", <ProgressBar value={72} />, "72%", <Badge label="Devam" type="devam" />],
    ["Mehmet Demir", "Fizik",     <ProgressBar value={100} color="#2e7d32" />, "100%", <Badge label="Tamamlandı" type="tamamlandi" />],
    ["Zeynep Çelik", "Kimya",     <ProgressBar value={45} color="#e65100" />, "45%", <Badge label="Devam" type="devam" />],
    ["Ali Yıldız",   "Tarih",     <ProgressBar value={88} />, "88%", <Badge label="Devam" type="devam" />],
    ["Elif Şahin",   "Biyoloji",  <ProgressBar value={20} color="#c62828" />, "20%", <Badge label="Bekliyor" type="bekliyor" />],
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-graph-up-arrow" title="İlerleme Takibi" sub="Öğrencilerin koçluk planlarındaki ilerleme durumları" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people-fill"       label="Toplam Plan"     value="18"  color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-arrow-repeat"      label="Devam Eden"      value="11"  color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-check-circle-fill" label="Tamamlanan"      value="7"   color="#2e7d32" bg="#e8f5e9" />
      </div>
      <Card>
        <MockTable
          headers={["Öğrenci", "Ders", "İlerleme", "%", "Durum"]}
          rows={rows}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function KoclukRaporlarPage() {
  const bars = [
    { label: "Matematik", val: 78, color: "#e53935" },
    { label: "Fizik",     val: 65, color: "#1565c0" },
    { label: "Kimya",     val: 82, color: "#2e7d32" },
    { label: "Tarih",     val: 55, color: "#e65100" },
    { label: "Biyoloji",  val: 91, color: "#6a1b9a" },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart-line" title="Koçluk Raporları" sub="Koordinatöre özel koçluk istatistikleri ve analizleri" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people"            label="Toplam Öğrenci"  value="42" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-clipboard2-check"  label="Aktif Plan"      value="28" color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-check2-all"        label="Tamamlanan"      value="14" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-award"             label="Başarı Oranı"    value="%74" color="#6a1b9a" bg="#f3e5f5" />
      </div>
      <Card>
        <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#b71c1c", marginBottom: 16 }}>
          <i className="bi bi-bar-chart me-2" />Derse Göre Ortalama İlerleme
        </div>
        {bars.map(b => (
          <div key={b.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: ".84rem", fontWeight: 700, color: "#1a0a0a" }}>
              <span>{b.label}</span><span style={{ color: b.color }}>%{b.val}</span>
            </div>
            <ProgressBar value={b.val} color={b.color} />
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   DENEME
══════════════════════════════════════════════════════════ */

export function DenemeListesiPage() {
  const rows = [
    ["Mart Denemesi #1", "Matematik", "10-A", "2025-03-05", <Badge label="Analiz Hazır" type="tamamlandi" />],
    ["Haftalık Fizik",   "Fizik",     "11-B", "2025-03-01", <Badge label="Bekliyor" type="bekliyor" />],
    ["Kimya Mini Test",  "Kimya",     "10-C", "2025-02-28", <Badge label="Analiz Hazır" type="tamamlandi" />],
    ["Şubat Denemesi",   "Matematik", "12-A", "2025-02-20", <Badge label="Analiz Hazır" type="tamamlandi" />],
    ["Biyoloji #3",      "Biyoloji",  "9-B",  "2025-02-15", <Badge label="Bekliyor" type="bekliyor" />],
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-collection" title="Deneme Listesi" sub="Yüklenen tüm deneme sınavlarını görüntüle ve yönet" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-file-earmark-text" label="Toplam Deneme"   value="24" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-check-circle"      label="Analiz Hazır"    value="18" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-hourglass-split"   label="Bekliyor"        value="6"  color="#e65100" bg="#fff3e0" />
      </div>
      <Card>
        <MockTable
          headers={["Deneme Adı", "Ders", "Sınıf", "Tarih", "Durum"]}
          rows={rows}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function DenemeAnalizPage() {
  const sorular = [
    { no: "S1", dogru: 38, yanlis: 4,  bos: 3 },
    { no: "S2", dogru: 25, yanlis: 12, bos: 8 },
    { no: "S3", dogru: 42, yanlis: 2,  bos: 1 },
    { no: "S4", dogru: 18, yanlis: 22, bos: 5 },
    { no: "S5", dogru: 30, yanlis: 9,  bos: 6 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart" title="Sonuç Analizi" sub="Deneme sınavı soru bazlı performans analizi" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-trophy"            label="Ort. Puan"       value="87.4" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-arrow-up-circle"   label="En Yüksek"       value="148"  color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-arrow-down-circle" label="En Düşük"        value="32"   color="#c62828" bg="#ffebee" />
        <StatCard icon="bi-people"            label="Katılım"         value="45"   color="#1565c0" bg="#e3f2fd" />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#b71c1c", marginBottom: 16 }}>
          <i className="bi bi-list-check me-2" />Soru Bazlı Doğru Oranı
        </div>
        {sorular.map(s => {
          const total = s.dogru + s.yanlis + s.bos;
          const pct = Math.round((s.dogru / total) * 100);
          return (
            <div key={s.no} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: ".84rem", fontWeight: 700 }}>
                <span style={{ color: "#1a0a0a" }}>{s.no}</span>
                <span style={{ color: "#6b4444" }}>D:{s.dogru} · Y:{s.yanlis} · B:{s.bos}</span>
                <span style={{ color: pct >= 60 ? "#2e7d32" : "#c62828" }}>%{pct}</span>
              </div>
              <ProgressBar value={pct} color={pct >= 60 ? "#2e7d32" : "#c62828"} />
            </div>
          );
        })}
      </Card>
      <Card>
        <MockTable
          headers={["Öğrenci", "Doğru", "Yanlış", "Boş", "Net", "Puan"]}
          rows={[
            ["Ayşe Kaya",    "38", "4",  "3",  "36.7", "148"],
            ["Mehmet Demir", "30", "10", "5",  "26.7", "107"],
            ["Zeynep Çelik", "22", "15", "8",  "17.0", "68"],
            ["Ali Yıldız",   "8",  "22", "15", "0.7",  "32"],
          ]}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function OgrenciDenemelerimPage() {
  const denemeler = [
    { ad: "Mart Denemesi #1", ders: "Matematik", tarih: "2025-03-05", durum: "tamamlandi", puan: 148 },
    { ad: "Haftalık Fizik",   ders: "Fizik",     tarih: "2025-03-01", durum: "tamamlandi", puan: 92  },
    { ad: "Nisan Denemesi",   ders: "Kimya",     tarih: "2025-04-10", durum: "bekliyor",   puan: null },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-journal-text" title="Denemelerim" sub="Sana atanmış deneme sınavları" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {denemeler.map((d, i) => (
          <div key={i} style={{
            background: "#fff", border: "1.5px solid #f0dada", borderRadius: 14,
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
            borderLeft: `4px solid ${d.durum === "tamamlandi" ? "#2e7d32" : "#f0dada"}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: "#fdeaea", color: "#e53935",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0,
            }}>
              <i className="bi bi-file-earmark-text" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#1a0a0a" }}>{d.ad}</div>
              <div style={{ fontSize: ".82rem", color: "#6b4444", marginTop: 2 }}>
                <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "1px 8px", borderRadius: 20, fontWeight: 700, marginRight: 8 }}>{d.ders}</span>
                {d.tarih}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {d.puan !== null
                ? <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#e53935" }}>{d.puan} <span style={{ fontSize: ".75rem", color: "#6b4444" }}>puan</span></div>
                : <div style={{ fontSize: ".82rem", color: "#6b4444" }}>—</div>
              }
              <Badge label={d.durum === "tamamlandi" ? "Tamamlandı" : "Bekliyor"} type={d.durum} />
            </div>
          </div>
        ))}
      </div>
      <PreviewNote />
    </OtmLayout>
  );
}

export function OgrenciDenemeSonuclariPage() {
  const sonuclar = [
    { ad: "Mart Denemesi #1", ders: "Matematik", net: 36.7, puan: 148, ort: 120 },
    { ad: "Haftalık Fizik",   ders: "Fizik",     net: 22.0, puan: 92,  ort: 88  },
    { ad: "Şubat Denemesi",   ders: "Kimya",     net: 28.5, puan: 117, ort: 105 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-graph-up" title="Deneme Sonuçlarım" sub="Katıldığın sınavların sonuçları ve karşılaştırma" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-journal-check"     label="Katıldığım Sınav" value="3"   color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-bar-chart-line"    label="Ortalama Puanım"  value="119" color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-trophy"            label="En Yüksek"        value="148" color="#2e7d32" bg="#e8f5e9" />
      </div>
      <Card>
        {sonuclar.map((s, i) => (
          <div key={i} style={{ marginBottom: i < sonuclar.length - 1 ? 20 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 700, fontSize: ".9rem" }}>
              <div>
                <span style={{ color: "#1a0a0a" }}>{s.ad}</span>
                <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "1px 8px", borderRadius: 20, fontSize: ".76rem", fontWeight: 700, marginLeft: 8 }}>{s.ders}</span>
              </div>
              <div style={{ color: "#e53935", fontWeight: 900 }}>{s.puan} puan</div>
            </div>
            <div style={{ position: "relative", height: 10, background: "#f0dada", borderRadius: 999 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(s.ort / 200) * 100}%`, background: "#f0dada", borderRadius: 999 }} />
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(s.puan / 200) * 100}%`, background: "#e53935", borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: ".76rem", color: "#6b4444" }}>
              <span>Sınıf ort: {s.ort}</span><span>Benim: {s.puan}</span>
            </div>
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   YOKLAMA
══════════════════════════════════════════════════════════ */

export function YoklamaGecmisPage() {
  const rows = [
    ["Matematik",  "10-A", "2025-03-10", "08:00", "30", "27", "2", "1"],
    ["Fizik",      "11-B", "2025-03-09", "10:00", "28", "25", "2", "1"],
    ["Kimya",      "10-C", "2025-03-08", "09:00", "32", "30", "1", "1"],
    ["Biyoloji",   "9-A",  "2025-03-07", "11:00", "25", "24", "1", "0"],
    ["Matematik",  "12-A", "2025-03-06", "08:00", "30", "28", "2", "0"],
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-clock-history" title="Geçmiş Yoklamalar" sub="Daha önce alınan yoklama kayıtları" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-calendar3"          label="Toplam Yoklama"  value="42"   color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-check-circle-fill"  label="Ort. Devam"      value="%91"  color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-x-circle-fill"      label="Ort. Devamsız"   value="%6"   color="#c62828" bg="#ffebee" />
        <StatCard icon="bi-clock-fill"         label="Ort. Geç"        value="%3"   color="#e65100" bg="#fff3e0" />
      </div>
      <Card>
        <MockTable
          headers={["Ders", "Sınıf", "Tarih", "Saat", "Toplam", "Var", "Yok", "Geç"]}
          rows={rows}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function DevamRaporuPage() {
  const ogrenciler = [
    { ad: "Ayşe Kaya",    var: 28, yok: 2, gec: 1, pct: 90 },
    { ad: "Mehmet Demir", var: 30, yok: 0, gec: 1, pct: 97 },
    { ad: "Zeynep Çelik", var: 24, yok: 6, gec: 1, pct: 77 },
    { ad: "Ali Yıldız",   var: 26, yok: 3, gec: 2, pct: 84 },
    { ad: "Elif Şahin",   var: 29, yok: 1, gec: 1, pct: 94 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-pie-chart" title="Devam Raporu" sub="Sınıf bazlı devamsızlık oranları ve detaylar" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-check-circle-fill"  label="Ort. Devam"     value="%89" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-x-circle-fill"      label="Ort. Devamsız"  value="%8"  color="#c62828" bg="#ffebee" />
        <StatCard icon="bi-clock-fill"         label="Ort. Geç"       value="%3"  color="#e65100" bg="#fff3e0" />
        <StatCard icon="bi-exclamation-circle" label="Kritik Öğrenci" value="3"   color="#6a1b9a" bg="#f3e5f5" />
      </div>
      <Card>
        {ogrenciler.map((o, i) => (
          <div key={i} style={{ marginBottom: i < ogrenciler.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: ".88rem" }}>
              <span style={{ fontWeight: 700, color: "#1a0a0a" }}>{o.ad}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge label={`Var: ${o.var}`} type="var" />
                <Badge label={`Yok: ${o.yok}`} type="yok" />
                <Badge label={`Geç: ${o.gec}`} type="gec" />
              </div>
            </div>
            <ProgressBar value={o.pct} color={o.pct >= 85 ? "#2e7d32" : o.pct >= 70 ? "#e65100" : "#c62828"} />
            <div style={{ textAlign: "right", fontSize: ".76rem", color: "#6b4444", marginTop: 3 }}>%{o.pct} devam</div>
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function KoordinatorYoklamaOzetPage() {
  const siniflar = [
    { ad: "9-A",  ogrenci: 28, devam: 96, yok: 1 },
    { ad: "9-B",  ogrenci: 30, devam: 88, yok: 4 },
    { ad: "10-A", ogrenci: 32, devam: 91, yok: 3 },
    { ad: "10-B", ogrenci: 27, devam: 78, yok: 6 },
    { ad: "11-A", ogrenci: 25, devam: 94, yok: 2 },
    { ad: "11-B", ogrenci: 29, devam: 86, yok: 3 },
    { ad: "12-A", ogrenci: 24, devam: 97, yok: 1 },
    { ad: "12-B", ogrenci: 26, devam: 83, yok: 5 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-grid-3x3-gap" title="Yoklama Özeti" sub="Tüm sınıfların günlük yoklama durumu" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {siniflar.map((s, i) => (
          <div key={i} style={{
            background: "#fff", border: "1.5px solid #f0dada", borderRadius: 14, padding: "18px 16px",
            borderTop: `4px solid ${s.devam >= 90 ? "#2e7d32" : s.devam >= 80 ? "#e65100" : "#c62828"}`,
          }}>
            <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#1a0a0a", marginBottom: 6 }}>{s.ad}</div>
            <div style={{ fontSize: ".8rem", color: "#6b4444", marginBottom: 10 }}>{s.ogrenci} öğrenci</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.devam >= 90 ? "#2e7d32" : s.devam >= 80 ? "#e65100" : "#c62828" }}>%{s.devam}</div>
            <div style={{ fontSize: ".76rem", color: "#6b4444", marginBottom: 8 }}>devam oranı</div>
            <ProgressBar value={s.devam} color={s.devam >= 90 ? "#2e7d32" : s.devam >= 80 ? "#e65100" : "#c62828"} />
            <div style={{ fontSize: ".76rem", color: "#c62828", marginTop: 6 }}>{s.yok} devamsız</div>
          </div>
        ))}
      </div>
      <PreviewNote />
    </OtmLayout>
  );
}

export function KoordinatorDevamRaporlariPage() {
  const rows = [
    ["Ayşe Kaya",    "10-A", "30", "28", "2", "0", <ProgressBar value={93} color="#2e7d32" />],
    ["Mehmet Demir", "11-B", "30", "30", "0", "0", <ProgressBar value={100} color="#2e7d32" />],
    ["Zeynep Çelik", "10-C", "30", "21", "7", "2", <ProgressBar value={70} color="#e65100" />],
    ["Ali Yıldız",   "12-A", "30", "15", "13","2", <ProgressBar value={50} color="#c62828" />],
    ["Elif Şahin",   "9-B",  "30", "28", "2", "0", <ProgressBar value={93} color="#2e7d32" />],
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart-line" title="Devam Raporları" sub="Öğrenci bazlı devam istatistikleri" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people"            label="Toplam Öğrenci"  value="145" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-exclamation-circle" label="Kritik (%<75)" value="12"  color="#c62828" bg="#ffebee" />
        <StatCard icon="bi-check-circle"      label="Düzenli (%>90)" value="98"  color="#2e7d32" bg="#e8f5e9" />
      </div>
      <Card>
        <MockTable
          headers={["Öğrenci", "Sınıf", "Toplam", "Var", "Yok", "İzin", "Oran"]}
          rows={rows}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   ÖĞRETMEN
══════════════════════════════════════════════════════════ */

export function SiniflarimPage() {
  const siniflar = [
    { ad: "10-A", ders: "Matematik",  ogrenci: 32, haftalik: 5 },
    { ad: "11-B", ders: "Matematik",  ogrenci: 28, haftalik: 5 },
    { ad: "9-C",  ders: "Geometri",   ogrenci: 30, haftalik: 3 },
    { ad: "12-A", ders: "Matematik",  ogrenci: 24, haftalik: 4 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-journal-text" title="Sınıflarım" sub="Sorumlu olduğun sınıflar ve ders detayları" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {siniflar.map((s, i) => (
          <div key={i} style={{
            background: "#fff", border: "1.5px solid #f0dada", borderRadius: 16,
            padding: "22px", borderLeft: "4px solid #e53935",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: "#fdeaea", color: "#e53935",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
              }}>
                <i className="bi bi-mortarboard" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#1a0a0a" }}>{s.ad}</div>
                <div style={{ fontSize: ".82rem", color: "#6b4444" }}>{s.ders}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, background: "#fdeaea", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#e53935" }}>{s.ogrenci}</div>
                <div style={{ fontSize: ".76rem", color: "#6b4444", fontWeight: 700 }}>Öğrenci</div>
              </div>
              <div style={{ flex: 1, background: "#e3f2fd", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#1565c0" }}>{s.haftalik}</div>
                <div style={{ fontSize: ".76rem", color: "#1565c0", fontWeight: 700 }}>Haftalık Ders</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PreviewNote />
    </OtmLayout>
  );
}

export function OgretmenNotlarPage() {
  const ogrenciler = [
    { ad: "Ayşe Kaya",    sinav1: 85, sinav2: 90, odev: 95, ort: 90.0 },
    { ad: "Mehmet Demir", sinav1: 72, sinav2: 68, odev: 80, ort: 73.3 },
    { ad: "Zeynep Çelik", sinav1: 91, sinav2: 88, odev: 92, ort: 90.3 },
    { ad: "Ali Yıldız",   sinav1: 55, sinav2: 60, odev: 70, ort: 61.7 },
    { ad: "Elif Şahin",   sinav1: 78, sinav2: 82, odev: 88, ort: 82.7 },
  ];
  const inputStyle = {
    width: 58, textAlign: "center", border: "1.5px solid #f0dada",
    borderRadius: 8, padding: "5px 6px", fontSize: ".88rem",
    background: "#fffafa", color: "#1a0a0a", fontWeight: 700,
    pointerEvents: "none",
  };
  return (
    <OtmLayout>
      <PageHero icon="bi-pencil-square" title="Not Girişi" sub="Sınav ve ödev notlarını görüntüle / düzenle" />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr>
              {["Öğrenci", "Sınav 1", "Sınav 2", "Ödev", "Ortalama"].map((h, i) => (
                <th key={i} style={{
                  textAlign: i === 0 ? "left" : "center",
                  padding: "8px 12px", color: "#b71c1c", fontWeight: 700,
                  fontSize: ".76rem", textTransform: "uppercase",
                  borderBottom: "2px solid #fdeaea",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ogrenciler.map((o, i) => (
              <tr key={i}>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", fontWeight: 700, color: "#1a0a0a" }}>{o.ad}</td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center" }}>
                  <input readOnly value={o.sinav1} style={inputStyle} />
                </td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center" }}>
                  <input readOnly value={o.sinav2} style={inputStyle} />
                </td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center" }}>
                  <input readOnly value={o.odev} style={inputStyle} />
                </td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center" }}>
                  <span style={{
                    fontWeight: 900, fontSize: ".95rem",
                    color: o.ort >= 85 ? "#2e7d32" : o.ort >= 70 ? "#e65100" : "#c62828",
                  }}>{o.ort}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <PreviewNote text="Bu sayfa henüz geliştirme aşamasındadır. Gösterilen not alanları örnek veridir; kayıt işlemi yapılmamaktadır. API entegrasyonu tamamlandığında not girişi aktif olacaktır." />
    </OtmLayout>
  );
}

export function OgretmenRaporlarPage() {
  const rows = [
    ["Ayşe Kaya",    "90.0", "28/30", <Badge label="İyi"    type="tamamlandi" />],
    ["Mehmet Demir", "73.3", "30/30", <Badge label="Orta"   type="devam" />],
    ["Zeynep Çelik", "90.3", "27/30", <Badge label="İyi"    type="tamamlandi" />],
    ["Ali Yıldız",   "61.7", "15/30", <Badge label="Düşük"  type="dusuk" />],
    ["Elif Şahin",   "82.7", "29/30", <Badge label="İyi"    type="tamamlandi" />],
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart-line" title="Öğretmen Raporları" sub="Sınıf ve öğrenci performans özeti" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people"            label="Öğrenci"         value="114" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-bar-chart"         label="Sınıf Ort."      value="79.6" color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-check2-circle"     label="Başarılı"        value="82"  color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-exclamation"       label="Düşük Not"       value="12"  color="#c62828" bg="#ffebee" />
      </div>
      <Card>
        <MockTable
          headers={["Öğrenci", "Ort. Not", "Devam", "Durum"]}
          rows={rows}
        />
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   KOORDİNATÖR
══════════════════════════════════════════════════════════ */

export function KoordinatorOgrenciListesiPage() {
  const ogrenciler = [
    { avatar: "AK", ad: "Ayşe Kaya",    sinif: "10-A", no: "101", durum: "Aktif"   },
    { avatar: "MD", ad: "Mehmet Demir", sinif: "11-B", no: "102", durum: "Aktif"   },
    { avatar: "ZÇ", ad: "Zeynep Çelik", sinif: "10-C", no: "103", durum: "Aktif"   },
    { avatar: "AY", ad: "Ali Yıldız",   sinif: "12-A", no: "104", durum: "Pasif"   },
    { avatar: "EŞ", ad: "Elif Şahin",   sinif: "9-B",  no: "105", durum: "Aktif"   },
    { avatar: "BA", ad: "Burak Arslan",  sinif: "11-A", no: "106", durum: "Aktif"   },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-people" title="Öğrenci Listesi" sub="Sisteme kayıtlı tüm öğrenciler" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people-fill"  label="Toplam Öğrenci" value="145" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-person-check" label="Aktif"          value="138" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-person-x"     label="Pasif"          value="7"   color="#9e9e9e" bg="#f5f5f5" />
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr>
              {["Öğrenci", "Sınıf", "Numara", "Durum"].map((h, i) => (
                <th key={i} style={{
                  textAlign: "left", padding: "8px 12px",
                  color: "#b71c1c", fontWeight: 700, fontSize: ".76rem",
                  textTransform: "uppercase", borderBottom: "2px solid #fdeaea",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ogrenciler.map((o, i) => (
              <tr key={i}>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: "50%",
                      background: "#fdeaea", color: "#b71c1c",
                      fontWeight: 800, fontSize: ".76rem",
                    }}>{o.avatar}</span>
                    <span style={{ fontWeight: 700, color: "#1a0a0a" }}>{o.ad}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0" }}>
                  <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: ".8rem" }}>{o.sinif}</span>
                </td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", color: "#6b4444" }}>{o.no}</td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0" }}>
                  <Badge label={o.durum} type={o.durum === "Aktif" ? "tamamlandi" : "bekliyor"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function KoordinatorRaporlarPage() {
  const bars = [
    { label: "9. Sınıflar",  val: 87, c: "#1565c0" },
    { label: "10. Sınıflar", val: 91, c: "#2e7d32" },
    { label: "11. Sınıflar", val: 79, c: "#e65100" },
    { label: "12. Sınıflar", val: 83, c: "#6a1b9a" },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart-line" title="Koordinatör Raporları" sub="Platform geneli istatistik ve analizler" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-people"             label="Öğrenci"      value="145"  color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-person-badge"        label="Öğretmen"     value="18"   color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-journal-check"       label="Aktif Plan"   value="62"   color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-clipboard2-data"     label="Deneme"       value="24"   color="#6a1b9a" bg="#f3e5f5" />
      </div>
      <Card>
        <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#b71c1c", marginBottom: 18 }}>
          <i className="bi bi-bar-chart me-2" />Sınıf Bazlı Ortalama Başarı
        </div>
        {bars.map(b => (
          <div key={b.label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: ".86rem", fontWeight: 700 }}>
              <span style={{ color: "#1a0a0a" }}>{b.label}</span>
              <span style={{ color: b.c }}>%{b.val}</span>
            </div>
            <ProgressBar value={b.val} color={b.c} />
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function KoordinatorAyarlarPage() {
  const inputSt = {
    width: "100%", border: "1.5px solid #f0dada", borderRadius: 10,
    padding: "9px 14px", fontSize: ".9rem", background: "#f9f9f9",
    color: "#9e9e9e", pointerEvents: "none",
  };
  return (
    <OtmLayout>
      <PageHero icon="bi-gear" title="Platform Ayarları" sub="OTM genel yapılandırma ve yönetim seçenekleri" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#b71c1c", marginBottom: 16, borderBottom: "1.5px solid #fdeaea", paddingBottom: 10 }}>
          <i className="bi bi-sliders me-2" />Genel Ayarlar
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            ["Platform Adı", "OTM – Öğrenci Takip Modülü"],
            ["Kurum Kodu", "Sinaps-OTM-2025"],
            ["Yönetici E-posta", "admin@sinaps.org.tr"],
            ["Saat Dilimi", "Europe/Istanbul"],
          ].map(([lbl, val], i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontWeight: 700, fontSize: ".82rem", color: "#6b4444" }}>{lbl}</label>
              <input readOnly value={val} style={inputSt} />
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#b71c1c", marginBottom: 16, borderBottom: "1.5px solid #fdeaea", paddingBottom: 10 }}>
          <i className="bi bi-bell me-2" />Bildirim Ayarları
        </div>
        {[
          ["Devamsızlık uyarısı eşiği", "%20 devamsızlık"],
          ["E-posta bildirimleri", "Açık"],
          ["Haftalık rapor gönderimi", "Her Pazartesi"],
        ].map(([lbl, val], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #fdf0f0" : "none" }}>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#1a0a0a" }}>{lbl}</span>
            <span style={{ fontWeight: 600, fontSize: ".86rem", color: "#6b4444", background: "#fdeaea", padding: "4px 14px", borderRadius: 20 }}>{val}</span>
          </div>
        ))}
      </Card>
      <PreviewNote text="Bu sayfa henüz geliştirme aşamasındadır. Gösterilen ayar değerleri örnek verilerdir; kayıt işlemi yapılmamaktadır. API entegrasyonu tamamlandığında tüm ayarlar düzenlenebilir hale gelecektir." />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   ÖĞRENCİ
══════════════════════════════════════════════════════════ */

export function OgrenciDashboardPage() {
  const gorevler = [
    { icon: "bi-file-earmark-text", label: "Matematik Denemesi",  tarih: "10 Mart", tip: "Deneme",  durum: "bekliyor" },
    { icon: "bi-person-lines-fill", label: "Fizik Koçluk Planı",  tarih: "12 Mart", tip: "Koçluk",  durum: "devam"    },
    { icon: "bi-calendar2-check",   label: "Biyoloji Yoklaması",   tarih: "8 Mart",  tip: "Yoklama", durum: "tamamlandi" },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-grid" title="Öğrenci Panelim" sub="Genel durum özeti ve yaklaşan görevler" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-journal-check"     label="Aktif Plan"    value="3"   color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-bar-chart"         label="Genel Ort."    value="82.4" color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-calendar-check"    label="Devam"         value="%91" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-file-earmark-text" label="Deneme"        value="3"   color="#6a1b9a" bg="#f3e5f5" />
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#b71c1c", marginBottom: 14 }}>
          <i className="bi bi-list-task me-2" />Yaklaşan Görevler
        </div>
        {gorevler.map((g, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
            borderBottom: i < gorevler.length - 1 ? "1px solid #fdf0f0" : "none",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "#fdeaea", color: "#e53935",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0,
            }}>
              <i className={`bi ${g.icon}`} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1a0a0a" }}>{g.label}</div>
              <div style={{ fontSize: ".78rem", color: "#6b4444" }}>{g.tarih} · {g.tip}</div>
            </div>
            <Badge label={g.durum === "bekliyor" ? "Bekliyor" : g.durum === "devam" ? "Devam" : "Tamamlandı"} type={g.durum} />
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function OgrenciNotlarimPage() {
  const notlar = [
    { ders: "Matematik",  sinav1: 85, sinav2: 90, odev: 95, ort: 90.0, harf: "AA" },
    { ders: "Fizik",      sinav1: 72, sinav2: 68, odev: 80, ort: 73.3, harf: "BB" },
    { ders: "Kimya",      sinav1: 91, sinav2: 88, odev: 92, ort: 90.3, harf: "AA" },
    { ders: "Biyoloji",   sinav1: 55, sinav2: 60, odev: 70, ort: 61.7, harf: "CC" },
    { ders: "Türkçe",     sinav1: 78, sinav2: 82, odev: 88, ort: 82.7, harf: "BA" },
    { ders: "Tarih",      sinav1: 80, sinav2: 75, odev: 85, ort: 80.0, harf: "BA" },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-bar-chart" title="Notlarım" sub="Ders bazlı not geçmişi ve harf notları" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-calculator"        label="GNO"            value="3.24" color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-arrow-up-circle"   label="En Yüksek"      value="90.3" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-arrow-down-circle" label="En Düşük"       value="61.7" color="#c62828" bg="#ffebee" />
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr>
              {["Ders", "Sınav 1", "Sınav 2", "Ödev", "Ortalama", "Harf"].map((h, i) => (
                <th key={i} style={{
                  textAlign: i === 0 ? "left" : "center", padding: "8px 12px",
                  color: "#b71c1c", fontWeight: 700, fontSize: ".76rem",
                  textTransform: "uppercase", borderBottom: "2px solid #fdeaea",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notlar.map((n, i) => (
              <tr key={i}>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", fontWeight: 700, color: "#1a0a0a" }}>
                  <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: ".8rem" }}>{n.ders}</span>
                </td>
                {[n.sinav1, n.sinav2, n.odev].map((v, j) => (
                  <td key={j} style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center", color: "#1a0a0a" }}>{v}</td>
                ))}
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center", fontWeight: 900, fontSize: ".95rem", color: n.ort >= 85 ? "#2e7d32" : n.ort >= 70 ? "#e65100" : "#c62828" }}>{n.ort}</td>
                <td style={{ padding: "11px 12px", borderBottom: "1px solid #fdf0f0", textAlign: "center" }}>
                  <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "3px 12px", borderRadius: 20, fontWeight: 800, fontSize: ".8rem" }}>{n.harf}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

export function OgrenciDevamPage() {
  const dersler = [
    { ders: "Matematik", var: 28, yok: 2,  gec: 1, pct: 90 },
    { ders: "Fizik",     var: 30, yok: 0,  gec: 1, pct: 97 },
    { ders: "Kimya",     var: 24, yok: 5,  gec: 2, pct: 77 },
    { ders: "Biyoloji",  var: 26, yok: 3,  gec: 2, pct: 84 },
    { ders: "Türkçe",    var: 29, yok: 1,  gec: 1, pct: 94 },
  ];
  return (
    <OtmLayout>
      <PageHero icon="bi-calendar-check" title="Devam Durumum" sub="Ders bazlı devamsızlık ve devam istatistikleri" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-check-circle-fill"  label="Ort. Devam"    value="%88" color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-x-circle-fill"      label="Toplam Devamsız" value="11" color="#c62828" bg="#ffebee" />
        <StatCard icon="bi-clock-fill"         label="Toplam Geç"    value="7"   color="#e65100" bg="#fff3e0" />
        <StatCard icon="bi-clipboard2-check"   label="İzinli"        value="2"   color="#1565c0" bg="#e3f2fd" />
      </div>
      <Card>
        {dersler.map((d, i) => (
          <div key={i} style={{ marginBottom: i < dersler.length - 1 ? 18 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: ".92rem", color: "#1a0a0a" }}>
                <span style={{ background: "#fdeaea", color: "#b71c1c", padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: ".8rem", marginRight: 8 }}>{d.ders}</span>
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={`Var: ${d.var}`} type="var" />
                <Badge label={`Yok: ${d.yok}`} type="yok" />
                <Badge label={`Geç: ${d.gec}`} type="gec" />
                <span style={{ fontWeight: 900, color: d.pct >= 85 ? "#2e7d32" : d.pct >= 70 ? "#e65100" : "#c62828", fontSize: ".95rem", minWidth: 38, textAlign: "right" }}>%{d.pct}</span>
              </div>
            </div>
            <ProgressBar value={d.pct} color={d.pct >= 85 ? "#2e7d32" : d.pct >= 70 ? "#e65100" : "#c62828"} />
          </div>
        ))}
      </Card>
      <PreviewNote />
    </OtmLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   KURUMSAL
══════════════════════════════════════════════════════════ */

export function OtmAboutPage() {
  const ekip = [
    { initials: "AY", ad: "Dr. Ahmet Yılmaz",  rol: "OTM Kurucu & Genel Koordinatör",  renk: "#e53935" },
    { initials: "FÇ", ad: "Fatma Çelik",        rol: "Akademik Koordinatör",             renk: "#1565c0" },
    { initials: "MK", ad: "Mehmet Karaca",       rol: "Teknoloji & Sistem Koordinatörü",  renk: "#2e7d32" },
    { initials: "ZD", ad: "Zeynep Doğan",        rol: "Öğrenci Koçluk Koordinatörü",      renk: "#6a1b9a" },
  ];
  const degerler = [
    { icon: "bi-award",           baslik: "Kaliteli Eğitim",  aciklama: "Her öğrencinin en iyi eğitimi alması için özveriyle çalışıyoruz." },
    { icon: "bi-people-fill",     baslik: "Birlikte Başarı",  aciklama: "Öğrenci, öğretmen ve veli üçgeninde güçlü bir iletişim köprüsü kuruyoruz." },
    { icon: "bi-graph-up-arrow",  baslik: "Sürekli Gelişim",  aciklama: "Veriye dayalı takip sistemimizle her öğrencinin potansiyelini açığa çıkarıyoruz." },
    { icon: "bi-shield-check",    baslik: "Güvenilirlik",     aciklama: "Şeffaf raporlama ve etik değerlerle güven ortamı oluşturuyoruz." },
  ];

  return (
    <OtmPublicLayout>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #b71c1c 0%, #e53935 60%, #ef9a9a 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 22,
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -50, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.18)", borderRadius: 30,
            padding: "5px 14px", marginBottom: 16, fontSize: ".8rem", fontWeight: 700,
          }}>
            <i className="bi bi-mortarboard-fill" /> Öğrenci Takip Modülü
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-.02em" }}>
            OTM Hakkında
          </h1>
          <p style={{ fontSize: "1rem", margin: 0, opacity: .9, maxWidth: 540, lineHeight: 1.65 }}>
            OTM (Öğrenci Takip Modülü), öğrencilerin akademik gelişimini koçluk, yoklama ve
            deneme sınavları üzerinden bütüncül bir bakış açısıyla takip eden dijital bir
            eğitim platformudur.
          </p>
        </div>
      </div>

      {/* Rakamlarla OTM */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="bi-calendar-fill"  label="Kuruluş Yılı"    value="2021"  color="#e53935" bg="#fdeaea" />
        <StatCard icon="bi-people-fill"    label="Toplam Öğrenci"  value="1.200" color="#1565c0" bg="#e3f2fd" />
        <StatCard icon="bi-person-badge"   label="Uzman Öğretmen"  value="65"    color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon="bi-building"       label="Şehir"           value="12"    color="#6a1b9a" bg="#f3e5f5" />
      </div>

      {/* Misyon & Vizyon */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "#fdeaea", color: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="bi bi-bullseye" />
            </div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1a0a0a" }}>Misyonumuz</h3>
          </div>
          <p style={{ margin: 0, fontSize: ".88rem", color: "#6b4444", lineHeight: 1.7 }}>
            Her öğrencinin bireysel öğrenme hızına ve potansiyeline uygun, kişiselleştirilmiş
            koçluk desteği sunarak akademik başarıyı en üst düzeye taşımak ve öğrencilerin
            hedeflerine emin adımlarla ulaşmalarını sağlamak.
          </p>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "#e3f2fd", color: "#1565c0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="bi bi-eye-fill" />
            </div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1a0a0a" }}>Vizyonumuz</h3>
          </div>
          <p style={{ margin: 0, fontSize: ".88rem", color: "#6b4444", lineHeight: 1.7 }}>
            Türkiye genelinde öğrenci takip ve koçluk sistemleri alanında öncü platform olmak;
            veriye dayalı eğitim anlayışıyla her öğrencinin potansiyelini keşfetmesine rehberlik
            eden, güvenilir ve yenilikçi bir eğitim ekosistemi oluşturmak.
          </p>
        </Card>
      </div>

      {/* Temel Değerler */}
      <Card style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#b71c1c", marginBottom: 20, borderBottom: "1.5px solid #fdeaea", paddingBottom: 12 }}>
          <i className="bi bi-stars me-2" />Temel Değerlerimiz
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {degerler.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px", background: "#fffafa", borderRadius: 12, border: "1px solid #fdeaea" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "#fdeaea", color: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                <i className={`bi ${d.icon}`} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#1a0a0a", marginBottom: 4 }}>{d.baslik}</div>
                <div style={{ fontSize: ".82rem", color: "#6b4444", lineHeight: 1.6 }}>{d.aciklama}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ekibimiz */}
      <Card>
        <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#b71c1c", marginBottom: 20, borderBottom: "1.5px solid #fdeaea", paddingBottom: 12 }}>
          <i className="bi bi-people me-2" />Ekibimiz
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {ekip.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #f0dada", background: "#fffafa" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: e.renk, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".9rem" }}>
                {e.initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: ".9rem", color: "#1a0a0a" }}>{e.ad}</div>
                <div style={{ fontSize: ".78rem", color: "#6b4444", marginTop: 2 }}>{e.rol}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </OtmPublicLayout>
  );
}

export function OtmContactPage() {
  const iletisim = [
    { icon: "bi-geo-alt-fill",   baslik: "Adres",   deger: "Atatürk Mah. Eğitim Cad. No:42, 34000 İstanbul", renk: "#e53935", bg: "#fdeaea" },
    { icon: "bi-telephone-fill", baslik: "Telefon", deger: "+90 (212) 555 00 42",                              renk: "#1565c0", bg: "#e3f2fd" },
    { icon: "bi-envelope-fill",  baslik: "E-posta", deger: "iletisim@otm.edu.tr",                              renk: "#2e7d32", bg: "#e8f5e9" },
    { icon: "bi-clock-fill",     baslik: "Çalışma", deger: "Pazartesi – Cuma: 08:30 – 17:30",                 renk: "#6a1b9a", bg: "#f3e5f5" },
  ];
  return (
    <OtmPublicLayout>
      <PageHero icon="bi-envelope" title="İletişim" sub="Bizimle iletişime geçmek için aşağıdaki kanalları kullanabilirsiniz" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 22 }}>
        {iletisim.map((k, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #f0dada", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: k.bg, color: k.renk, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className={`bi ${k.icon}`} />
            </div>
            <div>
              <div style={{ fontSize: ".76rem", fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: ".06em" }}>{k.baslik}</div>
              <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1a0a0a", marginTop: 3 }}>{k.deger}</div>
            </div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#b71c1c", marginBottom: 18, borderBottom: "1.5px solid #fdeaea", paddingBottom: 12 }}>
          <i className="bi bi-send me-2" />Mesaj Gönder
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[["Ad Soyad", "Adınızı girin"], ["E-posta", "E-posta adresiniz"]].map(([lbl, ph], i) => (
            <div key={i}>
              <label style={{ fontWeight: 700, fontSize: ".82rem", color: "#6b4444", display: "block", marginBottom: 6 }}>{lbl}</label>
              <input readOnly placeholder={ph} style={{ width: "100%", border: "1.5px solid #f0dada", borderRadius: 10, padding: "10px 14px", fontSize: ".9rem", background: "#f9f9f9", color: "#9e9e9e", boxSizing: "border-box", pointerEvents: "none" }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 700, fontSize: ".82rem", color: "#6b4444", display: "block", marginBottom: 6 }}>Konu</label>
          <input readOnly placeholder="Mesajınızın konusu" style={{ width: "100%", border: "1.5px solid #f0dada", borderRadius: 10, padding: "10px 14px", fontSize: ".9rem", background: "#f9f9f9", color: "#9e9e9e", boxSizing: "border-box", pointerEvents: "none" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 700, fontSize: ".82rem", color: "#6b4444", display: "block", marginBottom: 6 }}>Mesajınız</label>
          <textarea readOnly placeholder="Mesajınızı buraya yazın..." rows={4} style={{ width: "100%", border: "1.5px solid #f0dada", borderRadius: 10, padding: "10px 14px", fontSize: ".9rem", background: "#f9f9f9", color: "#9e9e9e", boxSizing: "border-box", resize: "none", pointerEvents: "none" }} />
        </div>
        <button disabled style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", fontWeight: 800, fontSize: ".9rem", cursor: "not-allowed", opacity: .55 }}>
          <i className="bi bi-send me-2" />Gönder
        </button>
        <div style={{ marginTop: 14, background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, fontSize: ".82rem", color: "#b36c00", fontWeight: 600 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f59e0b", flexShrink: 0 }} />
          <span><strong>Not:</strong> İletişim formu henüz aktif değildir. Şimdilik doğrudan e-posta veya telefon ile ulaşabilirsiniz.</span>
        </div>
      </Card>
    </OtmPublicLayout>
  );
}

export function OtmOrgChartPage() {
  const birimler = [
    { baslik: "Akademik Birim",        renk: "#1565c0", bg: "#e3f2fd", icon: "bi-book",              uyeler: ["Fatma Çelik – Koordinatör", "8 Öğretmen Üye"]       },
    { baslik: "Koçluk Birimi",         renk: "#2e7d32", bg: "#e8f5e9", icon: "bi-person-lines-fill",  uyeler: ["Zeynep Doğan – Koordinatör", "12 Koç Öğretmen"]    },
    { baslik: "Sınav & Analiz Birimi", renk: "#6a1b9a", bg: "#f3e5f5", icon: "bi-clipboard2-data",    uyeler: ["Murat Şen – Koordinatör", "5 Analiz Uzmanı"]        },
    { baslik: "Teknoloji Birimi",      renk: "#e65100", bg: "#fff3e0", icon: "bi-cpu",                uyeler: ["Mehmet Karaca – Koordinatör", "3 Geliştirici"]      },
    { baslik: "Öğrenci İşleri",        renk: "#00838f", bg: "#e0f7fa", icon: "bi-people",             uyeler: ["Ayşe Toprak – Koordinatör", "4 Danışman"]           },
  ];
  return (
    <OtmPublicLayout>
      <PageHero icon="bi-diagram-3" title="Organizasyon Şeması" sub="OTM birim yapısı ve yönetim hiyerarşisi" />

      {/* Tepe kutu */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <div style={{ background: "#e53935", color: "#fff", borderRadius: 16, padding: "18px 40px", textAlign: "center", minWidth: 280, boxShadow: "0 4px 20px rgba(229,57,53,.25)" }}>
          <i className="bi bi-diagram-3-fill" style={{ fontSize: "1.5rem", marginBottom: 8, display: "block" }} />
          <div style={{ fontWeight: 900, fontSize: "1rem" }}>Genel Koordinatörlük</div>
          <div style={{ fontSize: ".82rem", opacity: .85, marginTop: 4 }}>Dr. Ahmet Yılmaz</div>
        </div>
      </div>

      {/* Dikey çizgi */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <div style={{ width: 2, height: 28, background: "#f0dada" }} />
      </div>

      {/* Alt birimler */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {birimler.map((b, i) => (
          <div key={i} style={{ background: "#fff", border: `1.5px solid ${b.bg}`, borderRadius: 14, padding: "18px", borderTop: `4px solid ${b.renk}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: b.bg, color: b.renk, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                <i className={`bi ${b.icon}`} />
              </div>
              <div style={{ fontWeight: 800, fontSize: ".88rem", color: "#1a0a0a" }}>{b.baslik}</div>
            </div>
            {b.uyeler.map((u, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: j < b.uyeler.length - 1 ? "1px solid #fdf0f0" : "none", fontSize: ".82rem", color: "#6b4444" }}>
                <i className="bi bi-person-fill" style={{ color: b.renk, flexShrink: 0 }} />{u}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "11px 16px", display: "flex", gap: 10, fontSize: ".83rem", color: "#b36c00", fontWeight: 600 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
        <span><strong>Not:</strong> Bu organizasyon şeması örnek amaçlıdır. Gerçek yapı sistem yöneticisi tarafından güncellenecektir.</span>
      </div>
    </OtmPublicLayout>
  );
}
