import React, { useState } from "react";
// import useAxios from "../../utils/useAxios";
import OTMBaseHeader from "../partials/OtmBaseHeader";
import OTMBaseFooter from "../partials/OtmBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/* ─────────────────────────────────────────────
   MOCK VERİ — backend bağlandığında kaldır
───────────────────────────────────────────── */
const MOCK_DERSLER  = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih"];
const MOCK_SINIFLAR = ["9-A", "9-B", "10-A", "10-B", "11-A", "11-B", "12-A"];
const MOCK_SAATLER  = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const MOCK_OGRENCILER = [
  { id: 1,  ad: "Ayşe Kaya",      no: "101" },
  { id: 2,  ad: "Mehmet Demir",   no: "102" },
  { id: 3,  ad: "Zeynep Çelik",   no: "103" },
  { id: 4,  ad: "Ali Yıldız",     no: "104" },
  { id: 5,  ad: "Elif Şahin",     no: "105" },
  { id: 6,  ad: "Burak Arslan",   no: "106" },
  { id: 7,  ad: "Selin Erdoğan",  no: "107" },
  { id: 8,  ad: "Oğuz Öztürk",    no: "108" },
];

const DURUMLAR = [
  { key: "var",    label: "Var",     renk: "#2e7d32", bg: "#e8f5e9", icon: "bi-check-circle-fill"   },
  { key: "yok",    label: "Yok",     renk: "#c62828", bg: "#ffebee", icon: "bi-x-circle-fill"       },
  { key: "gecikti",label: "Geç",     renk: "#e65100", bg: "#fff3e0", icon: "bi-clock-fill"          },
  { key: "izinli", label: "İzinli",  renk: "#1565c0", bg: "#e3f2fd", icon: "bi-clipboard2-check-fill"},
];

export default function YoklamaPage() {
  // const api = useAxios();

  const [adim, setAdim]       = useState(1);  // 1: bilgi seç, 2: yoklama al, 3: özet
  const [form, setForm]       = useState({ ders: "", sinif: "", tarih: new Date().toISOString().split("T")[0], saat: "" });
  const [ogrenciler, setOgrenciler] = useState([]);
  const [kayitlilar, setKayitlilar] = useState([]);

  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const yoklamayiBaslat = (e) => {
    e.preventDefault();
    /* API ÇAĞRISI BURAYA:
       api.get(`sinif/${form.sinif}/ogrenciler/`)
         .then(r => {
           const ogList = r.data.map(o => ({ ...o, durum: "var" }));
           setOgrenciler(ogList);
         })
         .catch(() => {});
    */
    // Mock: öğrenci listesini yükle, hepsini "var" olarak başlat
    setOgrenciler(MOCK_OGRENCILER.map((o) => ({ ...o, durum: "var" })));
    setAdim(2);
  };

  const setDurum = (id, durum) => {
    setOgrenciler((p) => p.map((o) => o.id === id ? { ...o, durum } : o));
  };

  const tumunuAyarla = (durum) => {
    setOgrenciler((p) => p.map((o) => ({ ...o, durum })));
  };

  const kaydet = () => {
    /* API ÇAĞRISI BURAYA:
       const payload = {
         ders: form.ders, sinif: form.sinif,
         tarih: form.tarih, saat: form.saat,
         kayitlar: ogrenciler.map(o => ({ ogrenci_id: o.id, durum: o.durum }))
       };
       api.post("otm/yoklama/", payload)
         .then(r => { setKayitlilar(ogrenciler); setAdim(3); })
         .catch(() => {});
    */
    setKayitlilar(ogrenciler);
    setAdim(3);
  };

  const ozet = {
    var:     ogrenciler.filter((o) => o.durum === "var").length,
    yok:     ogrenciler.filter((o) => o.durum === "yok").length,
    gecikti: ogrenciler.filter((o) => o.durum === "gecikti").length,
    izinli:  ogrenciler.filter((o) => o.durum === "izinli").length,
  };

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
    <div className="yk-wrap" style={{ margin: 0, maxWidth: "100%" }}>

      {/* Hero */}
      <div className="yk-hero">
        <div className="yk-hero__icon"><i className="bi bi-calendar2-check-fill"></i></div>
        <div>
          <h2 className="yk-hero__title">Yoklama Al</h2>
          <p className="yk-hero__sub">Ders ve günü seçerek hızlıca yoklama al, kayıt altına al</p>
        </div>
        {adim > 1 && (
          <button className="yk-reset-btn" onClick={() => { setAdim(1); setOgrenciler([]); }}>
            <i className="bi bi-arrow-left me-1"></i>Yeniden Başla
          </button>
        )}
      </div>

      {/* Adım göstergesi */}
      <div className="yk-steps">
        {["Ders Seç", "Yoklama Al", "Özet"].map((s, i) => (
          <div key={i} className={`yk-step ${adim >= i + 1 ? "active" : ""} ${adim === i + 1 ? "current" : ""}`}>
            <span className="yk-step__num">{i + 1}</span>
            <span className="yk-step__label">{s}</span>
          </div>
        ))}
      </div>

      {/* ─── ADIM 1: Ders/Sınıf/Tarih Seçimi ─── */}
      {adim === 1 && (
        <div className="yk-card">
          <form onSubmit={yoklamayiBaslat} className="yk-form">
            <div className="yk-form__row">
              <div className="yk-form__group">
                <label>Ders</label>
                {/* API: GET dersler/ → hocanın dersleri */}
                <select name="ders" value={form.ders} onChange={handleFormChange} required>
                  <option value="">— Ders Seçiniz —</option>
                  {MOCK_DERSLER.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="yk-form__group">
                <label>Sınıf</label>
                {/* API: GET siniflar/ → hocanın sınıfları */}
                <select name="sinif" value={form.sinif} onChange={handleFormChange} required>
                  <option value="">— Sınıf Seçiniz —</option>
                  {MOCK_SINIFLAR.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="yk-form__group">
                <label>Tarih</label>
                {/* API: "tarih" YYYY-MM-DD formatında */}
                <input type="date" name="tarih" value={form.tarih} onChange={handleFormChange} required />
              </div>
              <div className="yk-form__group">
                <label>Ders Saati</label>
                {/* API: "saat" string olarak gönderilecek */}
                <select name="saat" value={form.saat} onChange={handleFormChange}>
                  <option value="">— Saat Seçiniz —</option>
                  {MOCK_SAATLER.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="yk-form__actions">
              <button type="submit" className="yk-btn yk-btn--primary yk-btn--lg">
                <i className="bi bi-people-fill me-2"></i>Yoklamayı Başlat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── ADIM 2: Yoklama ─── */}
      {adim === 2 && (
        <div className="yk-card">
          {/* Bilgi şeridi */}
          <div className="yk-info-bar">
            <span><i className="bi bi-book me-1"></i>{form.ders}</span>
            <span><i className="bi bi-people me-1"></i>{form.sinif}</span>
            <span><i className="bi bi-calendar3 me-1"></i>{form.tarih}</span>
            {form.saat && <span><i className="bi bi-clock me-1"></i>{form.saat}</span>}
            <span className="yk-info-bar__count">{ogrenciler.length} öğrenci</span>
          </div>

          {/* Toplu işlem */}
          <div className="yk-bulk">
            <span className="yk-bulk__label">Tümünü:</span>
            {DURUMLAR.map((d) => (
              <button key={d.key} className="yk-bulk-btn" style={{ "--bg": d.bg, "--c": d.renk }} onClick={() => tumunuAyarla(d.key)}>
                <i className={`bi ${d.icon} me-1`}></i>{d.label}
              </button>
            ))}
          </div>

          {/* Öğrenci listesi */}
          <div className="yk-ogrenci-list">
            {ogrenciler.map((o) => {
              const durumObj = DURUMLAR.find((d) => d.key === o.durum);
              return (
                <div key={o.id} className="yk-ogrenci" style={{ "--accent": durumObj?.renk }}>
                  <div className="yk-ogrenci__no">{o.no}</div>
                  <div className="yk-ogrenci__ad">{o.ad}</div>
                  <div className="yk-ogrenci__durumlar">
                    {DURUMLAR.map((d) => (
                      <button
                        key={d.key}
                        className={`yk-durum-btn ${o.durum === d.key ? "selected" : ""}`}
                        style={{ "--bg": d.bg, "--c": d.renk }}
                        onClick={() => setDurum(o.id, d.key)}
                        title={d.label}
                      >
                        <i className={`bi ${d.icon}`}></i>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Özet bar */}
          <div className="yk-mini-ozet">
            <span style={{ color: "#2e7d32" }}><i className="bi bi-check-circle-fill me-1"></i>Var: {ozet.var}</span>
            <span style={{ color: "#c62828" }}><i className="bi bi-x-circle-fill me-1"></i>Yok: {ozet.yok}</span>
            <span style={{ color: "#e65100" }}><i className="bi bi-clock-fill me-1"></i>Geç: {ozet.gecikti}</span>
            <span style={{ color: "#1565c0" }}><i className="bi bi-clipboard2-check-fill me-1"></i>İzin: {ozet.izinli}</span>
            <button className="yk-btn yk-btn--primary ms-auto" onClick={kaydet}>
              <i className="bi bi-save2 me-1"></i>Yoklamayı Kaydet
            </button>
          </div>
        </div>
      )}

      {/* ─── ADIM 3: Özet ─── */}
      {adim === 3 && (
        <div className="yk-card">
          <div className="yk-ozet-header">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "2.5rem" }}></i>
            <div>
              <h3 className="mb-0">Yoklama Kaydedildi!</h3>
              <p className="text-muted mb-0">{form.ders} — {form.sinif} — {form.tarih}</p>
            </div>
          </div>

          <div className="yk-ozet-grid">
            {DURUMLAR.map((d) => (
              <div key={d.key} className="yk-ozet-kart" style={{ "--bg": d.bg, "--c": d.renk }}>
                <i className={`bi ${d.icon} yk-ozet-kart__icon`}></i>
                <div className="yk-ozet-kart__sayi">
                  {kayitlilar.filter((o) => o.durum === d.key).length}
                </div>
                <div className="yk-ozet-kart__label">{d.label}</div>
              </div>
            ))}
          </div>

          <table className="yk-ozet-table">
            <thead>
              <tr><th>No</th><th>Ad Soyad</th><th>Durum</th></tr>
            </thead>
            <tbody>
              {kayitlilar.map((o) => {
                const d = DURUMLAR.find((x) => x.key === o.durum);
                return (
                  <tr key={o.id}>
                    <td className="text-muted">{o.no}</td>
                    <td className="fw-bold">{o.ad}</td>
                    <td>
                      <span className="yk-durum-badge" style={{ "--bg": d?.bg, "--c": d?.renk }}>
                        <i className={`bi ${d?.icon} me-1`}></i>{d?.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="yk-form__actions">
            <button className="yk-btn yk-btn--ghost" onClick={() => setAdim(1)}>
              <i className="bi bi-plus-lg me-1"></i>Yeni Yoklama Al
            </button>
            {/* API: GET otm/yoklama/{id}/pdf/ → yoklama çıktısı */}
            <button className="yk-btn yk-btn--primary">
              <i className="bi bi-printer me-1"></i>Yazdır / PDF
            </button>
          </div>
        </div>
      )}

      <style>{`
        .yk-wrap { max-width: 960px; margin: 2rem auto; padding: 0 1rem; font-family: 'Segoe UI', sans-serif; }

        .yk-hero {
          display: flex; align-items: center; gap: 16px;
          background: linear-gradient(135deg,#fdeaea,#fff);
          border: 1.5px solid #f0dada; border-radius: 18px;
          padding: 24px 28px; margin-bottom: 24px;
        }
        .yk-hero__icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #e53935; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
        }
        .yk-hero__title { font-size: 1.4rem; font-weight: 800; color: #1a0a0a; margin: 0; }
        .yk-hero__sub { font-size: .88rem; color: #6b4444; margin: 0; }
        .yk-reset-btn {
          margin-left: auto; background: transparent; border: 1.5px solid #f0dada;
          border-radius: 12px; padding: 8px 18px; font-weight: 700; font-size: .88rem;
          color: #6b4444; cursor: pointer; transition: all .15s;
        }
        .yk-reset-btn:hover { border-color: #e53935; color: #b71c1c; }

        /* Adımlar */
        .yk-steps {
          display: flex; gap: 0; align-items: center;
          margin-bottom: 20px;
        }
        .yk-step {
          display: flex; align-items: center; gap: 8px;
          flex: 1; padding: 10px 16px;
          border-bottom: 3px solid #f0dada;
          color: #b0a0a0; font-weight: 600; font-size: .88rem;
          transition: all .2s;
        }
        .yk-step.active { border-bottom-color: #e53935; color: #6b4444; }
        .yk-step.current { color: #b71c1c; }
        .yk-step__num {
          width: 24px; height: 24px; border-radius: 50%;
          background: #f0dada; color: #b0a0a0;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: .78rem; flex-shrink: 0;
          transition: all .2s;
        }
        .yk-step.active .yk-step__num { background: #e53935; color: #fff; }

        .yk-card {
          background: #fff; border: 1.5px solid #f0dada;
          border-radius: 18px; padding: 24px;
        }

        /* Form */
        .yk-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .yk-form__group { display: flex; flex-direction: column; gap: 6px; }
        .yk-form__group label { font-weight: 700; font-size: .82rem; color: #6b4444; }
        .yk-form__group input,
        .yk-form__group select {
          border: 1.5px solid #f0dada; border-radius: 10px;
          padding: 10px 14px; font-size: .9rem; outline: none;
          color: #1a0a0a; background: #fffafa; transition: border-color .15s; font-family: inherit;
        }
        .yk-form__group input:focus,
        .yk-form__group select:focus { border-color: #e53935; }
        .yk-form__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

        /* Info bar */
        .yk-info-bar {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          background: #fdeaea; border-radius: 10px;
          padding: 10px 16px; margin-bottom: 14px;
          font-weight: 700; font-size: .85rem; color: #b71c1c;
        }
        .yk-info-bar__count {
          margin-left: auto; background: #e53935; color: #fff;
          padding: 3px 12px; border-radius: 20px; font-size: .8rem;
        }

        /* Toplu işlem */
        .yk-bulk {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .yk-bulk__label { font-weight: 700; font-size: .8rem; color: #6b4444; }
        .yk-bulk-btn {
          padding: 4px 12px; border-radius: 8px; border: none; cursor: pointer;
          font-weight: 700; font-size: .78rem;
          background: var(--bg); color: var(--c); transition: opacity .15s;
        }
        .yk-bulk-btn:hover { opacity: .8; }

        /* Öğrenci listesi */
        .yk-ogrenci-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .yk-ogrenci {
          display: flex; align-items: center; gap: 12px;
          border: 1.5px solid #f0dada; border-radius: 12px;
          padding: 10px 14px; background: #fffafa;
          border-left: 4px solid var(--accent, #f0dada);
          transition: border-color .2s;
        }
        .yk-ogrenci__no { font-size: .78rem; color: #b0a0a0; font-weight: 700; width: 36px; flex-shrink: 0; }
        .yk-ogrenci__ad { font-weight: 700; font-size: .92rem; color: #1a0a0a; flex: 1; }
        .yk-ogrenci__durumlar { display: flex; gap: 6px; flex-wrap: wrap; }

        .yk-durum-btn {
          padding: 5px 10px; border-radius: 8px; border: 1.5px solid transparent;
          cursor: pointer; font-weight: 600; font-size: .78rem;
          background: #f5f5f5; color: #9e9e9e;
          display: flex; align-items: center; gap: 4px;
          transition: all .15s;
        }
        .yk-durum-btn:hover { background: var(--bg); color: var(--c); }
        .yk-durum-btn.selected { background: var(--bg); color: var(--c); border-color: var(--c); }

        /* Mini özet */
        .yk-mini-ozet {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          background: #f9f9f9; border-radius: 10px;
          padding: 12px 16px; font-weight: 700; font-size: .85rem;
          border-top: 2px solid #f0dada; margin-top: 8px;
        }

        /* Özet Adım 3 */
        .yk-ozet-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 20px;
        }
        .yk-ozet-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
          margin-bottom: 20px;
        }
        .yk-ozet-kart {
          background: var(--bg); border-radius: 14px;
          padding: 16px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .yk-ozet-kart__icon { font-size: 1.5rem; color: var(--c); }
        .yk-ozet-kart__sayi { font-size: 2rem; font-weight: 900; color: var(--c); line-height: 1; }
        .yk-ozet-kart__label { font-size: .82rem; font-weight: 700; color: var(--c); }

        .yk-ozet-table { width: 100%; border-collapse: collapse; font-size: .88rem; margin-bottom: 16px; }
        .yk-ozet-table th {
          text-align: left; padding: 8px 12px;
          color: #b71c1c; font-weight: 700; font-size: .78rem;
          text-transform: uppercase; border-bottom: 2px solid #fdeaea;
        }
        .yk-ozet-table td { padding: 10px 12px; border-bottom: 1px solid #fdf0f0; }
        .yk-ozet-table tr:last-child td { border-bottom: none; }

        .yk-durum-badge {
          display: inline-flex; align-items: center;
          padding: 3px 12px; border-radius: 20px;
          font-weight: 700; font-size: .78rem;
          background: var(--bg); color: var(--c);
        }

        /* Butonlar */
        .yk-btn { padding: 10px 22px; border-radius: 12px; font-weight: 700; font-size: .88rem; cursor: pointer; border: none; transition: all .15s; }
        .yk-btn--lg { padding: 12px 28px; font-size: .95rem; }
        .yk-btn--primary { background: #e53935; color: #fff; }
        .yk-btn--primary:hover { background: #b71c1c; }
        .yk-btn--ghost { background: transparent; border: 1.5px solid #f0dada; color: #6b4444; }
        .yk-btn--ghost:hover { border-color: #e53935; color: #b71c1c; }

        @media (max-width: 600px) {
          .yk-form__row { grid-template-columns: 1fr; }
          .yk-ozet-grid { grid-template-columns: 1fr 1fr; }
          .yk-ogrenci { flex-wrap: wrap; }
          .yk-hero { flex-wrap: wrap; }
          .yk-steps { overflow-x: auto; }
          .yk-mini-ozet { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
            </div>
          </div>
        </div>
      </section>
      <OTMBaseFooter />
    </>
  );
}
