import React, { useState } from "react";
// import useAxios from "../../utils/useAxios";
import OTMBaseHeader from "../partials/OtmBaseHeader";
import OTMBaseFooter from "../partials/OtmBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/* ─────────────────────────────────────────────
   MOCK VERİ — backend bağlandığında kaldır
───────────────────────────────────────────── */
const MOCK_OGRENCILER = [
  { id: 1, name: "Ayşe Kaya",    avatar: "AK", sinif: "10-A" },
  { id: 2, name: "Mehmet Demir", avatar: "MD", sinif: "11-B" },
  { id: 3, name: "Zeynep Çelik", avatar: "ZÇ", sinif: "10-C" },
  { id: 4, name: "Ali Yıldız",   avatar: "AY", sinif: "12-A" },
];

const MOCK_DERSLER = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih", "Coğrafya"];

const MOCK_PLANLAR = [
  { id: 1, ogrenci: "Ayşe Kaya",    ders: "Matematik", soruSayisi: 40, tarih: "2025-03-10", durum: "Devam" },
  { id: 2, name: "Mehmet Demir",    ders: "Fizik",      soruSayisi: 25, tarih: "2025-03-08", durum: "Tamamlandı" },
];

export default function KoclukPage() {
  // const api = useAxios(); // API bağlantısı için

  const [aktifTab, setAktifTab]     = useState("liste");  // "liste" | "yeni"
  const [secilenOgrenci, setSecilenOgrenci] = useState(null);
  const [form, setForm]             = useState({
    ogrenci_id: "",
    ders: "",
    soru_sayisi: "",
    sure_dk: "",
    hedef_tarih: "",
    notlar: "",
  });
  const [kayitliPlanlar, setKayitliPlanlar] = useState(MOCK_PLANLAR);
  const [basari, setBasari]         = useState(false);

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === "ogrenci_id") {
      const og = MOCK_OGRENCILER.find((o) => String(o.id) === e.target.value);
      setSecilenOgrenci(og || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* API ÇAĞRISI BURAYA:
       api.post("otm/kocluk/plan/", form)
         .then(r => { setKayitliPlanlar(p => [r.data, ...p]); setBasari(true); })
         .catch(() => {});
    */
    // Geçici: mock kayıt
    const yeni = {
      id: Date.now(),
      ogrenci: MOCK_OGRENCILER.find((o) => String(o.id) === form.ogrenci_id)?.name || "-",
      ders: form.ders,
      soruSayisi: form.soru_sayisi,
      tarih: form.hedef_tarih,
      durum: "Bekliyor",
    };
    setKayitliPlanlar((p) => [yeni, ...p]);
    setBasari(true);
    setForm({ ogrenci_id: "", ders: "", soru_sayisi: "", sure_dk: "", hedef_tarih: "", notlar: "" });
    setSecilenOgrenci(null);
    setTimeout(() => { setBasari(false); setAktifTab("liste"); }, 1800);
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
    <div className="koc-wrap" style={{ margin: 0, maxWidth: "100%" }}>

      {/* Başlık */}
      <div className="koc-hero">
        <div className="koc-hero__icon"><i className="bi bi-person-lines-fill"></i></div>
        <div>
          <h2 className="koc-hero__title">Koçluk Paneli</h2>
          <p className="koc-hero__sub">Öğrencilerine ders & soru planı oluştur, ilerlemeyi takip et</p>
        </div>
        <button className="koc-new-btn" onClick={() => setAktifTab("yeni")}>
          <i className="bi bi-plus-lg me-1"></i>Yeni Plan
        </button>
      </div>

      {/* Tab Seçici */}
      <div className="koc-tabs">
        <button className={`koc-tab ${aktifTab === "liste" ? "active" : ""}`} onClick={() => setAktifTab("liste")}>
          <i className="bi bi-list-ul me-1"></i>Planlar
        </button>
        <button className={`koc-tab ${aktifTab === "yeni" ? "active" : ""}`} onClick={() => setAktifTab("yeni")}>
          <i className="bi bi-pencil-square me-1"></i>Yeni Plan Oluştur
        </button>
      </div>

      {/* ─── PLAN LİSTESİ ─── */}
      {aktifTab === "liste" && (
        <div className="koc-card">
          {kayitliPlanlar.length === 0 ? (
            <div className="koc-empty">
              <i className="bi bi-clipboard-x"></i>
              <span>Henüz plan yok. Yeni plan oluştur!</span>
            </div>
          ) : (
            <table className="koc-table">
              <thead>
                <tr>
                  <th>Öğrenci</th><th>Ders</th><th>Soru Sayısı</th><th>Hedef Tarih</th><th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {kayitliPlanlar.map((p) => (
                  <tr key={p.id}>
                    <td><span className="koc-avatar">{(p.ogrenci || p.name || "?")[0]}</span> {p.ogrenci || p.name}</td>
                    <td><span className="koc-ders-tag">{p.ders}</span></td>
                    <td className="text-center fw-bold">{p.soruSayisi}</td>
                    <td>{p.tarih || "-"}</td>
                    <td>
                      <span className={`koc-durum koc-durum--${(p.durum || "").toLowerCase().replace(/ı/g, "i").replace(/ş/g, "s").replace(/ /g, "")}`}>
                        {p.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── YENİ PLAN FORMU ─── */}
      {aktifTab === "yeni" && (
        <div className="koc-card">
          {basari && (
            <div className="koc-alert koc-alert--success">
              <i className="bi bi-check-circle-fill me-2"></i>Plan başarıyla oluşturuldu!
            </div>
          )}
          <form onSubmit={handleSubmit} className="koc-form">
            <div className="koc-form__row">

              {/* Öğrenci Seçimi */}
              <div className="koc-form__group koc-form__group--full">
                <label>Öğrenci Seç</label>
                {/* API: GET user/ogrenci-listesi/ → options doldurulacak */}
                <select name="ogrenci_id" value={form.ogrenci_id} onChange={handleFormChange} required>
                  <option value="">— Öğrenci Seçiniz —</option>
                  {MOCK_OGRENCILER.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.sinif})</option>
                  ))}
                </select>
                {secilenOgrenci && (
                  <div className="koc-selected-badge">
                    <span className="koc-avatar">{secilenOgrenci.avatar}</span>
                    {secilenOgrenci.name} — {secilenOgrenci.sinif}
                  </div>
                )}
              </div>

              {/* Ders */}
              <div className="koc-form__group">
                <label>Ders</label>
                {/* API: GET dersler/ → ders listesi */}
                <select name="ders" value={form.ders} onChange={handleFormChange} required>
                  <option value="">— Ders Seçiniz —</option>
                  {MOCK_DERSLER.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Soru Sayısı */}
              <div className="koc-form__group">
                <label>Günlük Soru Sayısı</label>
                <input
                  type="number" name="soru_sayisi" min="1" max="500"
                  value={form.soru_sayisi} onChange={handleFormChange}
                  placeholder="Örn: 40" required
                />
              </div>

              {/* Süre */}
              <div className="koc-form__group">
                <label>Çözüm Süresi (dk)</label>
                <input
                  type="number" name="sure_dk" min="1" max="300"
                  value={form.sure_dk} onChange={handleFormChange}
                  placeholder="Örn: 60"
                />
              </div>

              {/* Hedef Tarih */}
              <div className="koc-form__group">
                <label>Hedef Tarih</label>
                {/* API: Gönderilirken tarih formatına dikkat et */}
                <input type="date" name="hedef_tarih" value={form.hedef_tarih} onChange={handleFormChange} />
              </div>

              {/* Notlar */}
              <div className="koc-form__group koc-form__group--full">
                <label>Koç Notu (opsiyonel)</label>
                {/* API: POST ile "notlar" alanı olarak gönderilecek */}
                <textarea name="notlar" rows={3} value={form.notlar} onChange={handleFormChange} placeholder="Öğrenciye özel not veya yönlendirme yazabilirsin..." />
              </div>
            </div>

            <div className="koc-form__actions">
              <button type="button" className="koc-btn koc-btn--ghost" onClick={() => setAktifTab("liste")}>İptal</button>
              <button type="submit" className="koc-btn koc-btn--primary">
                <i className="bi bi-check-lg me-1"></i>Planı Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .koc-wrap { max-width: 960px; margin: 2rem auto; padding: 0 1rem; font-family: 'Segoe UI', sans-serif; }

        .koc-hero {
          display: flex; align-items: center; gap: 16px;
          background: linear-gradient(135deg,#fdeaea 0%,#fff 100%);
          border: 1.5px solid #f0dada; border-radius: 18px;
          padding: 24px 28px; margin-bottom: 24px;
        }
        .koc-hero__icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #e53935; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; flex-shrink: 0;
        }
        .koc-hero__title { font-size: 1.4rem; font-weight: 800; color: #1a0a0a; margin: 0; }
        .koc-hero__sub   { font-size: .88rem; color: #6b4444; margin: 0; }
        .koc-new-btn {
          margin-left: auto; background: #e53935; color: #fff;
          border: none; border-radius: 12px; padding: 10px 22px;
          font-weight: 700; font-size: .88rem; cursor: pointer;
          transition: background .15s;
        }
        .koc-new-btn:hover { background: #b71c1c; }

        .koc-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .koc-tab {
          padding: 8px 20px; border-radius: 10px; font-weight: 700;
          font-size: .88rem; border: 1.5px solid #f0dada;
          background: transparent; color: #6b4444; cursor: pointer;
          transition: all .15s;
        }
        .koc-tab.active { background: #e53935; color: #fff; border-color: #e53935; }

        .koc-card {
          background: #fff; border: 1.5px solid #f0dada;
          border-radius: 18px; padding: 24px; overflow: hidden;
        }

        .koc-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px; color: #b0a0a0; font-size: 1rem;
        }
        .koc-empty i { font-size: 2.5rem; color: #f0dada; }

        .koc-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
        .koc-table th {
          text-align: left; padding: 8px 12px;
          color: #b71c1c; font-weight: 700; font-size: .78rem;
          text-transform: uppercase; letter-spacing: .04em;
          border-bottom: 2px solid #fdeaea;
        }
        .koc-table td { padding: 12px 12px; border-bottom: 1px solid #fdf0f0; vertical-align: middle; }
        .koc-table tr:last-child td { border-bottom: none; }
        .koc-table tr:hover td { background: #fffafa; }

        .koc-avatar {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: #fdeaea; color: #b71c1c; font-weight: 800;
          font-size: .78rem; margin-right: 6px;
        }
        .koc-ders-tag {
          background: #fdeaea; color: #b71c1c;
          padding: 2px 10px; border-radius: 20px; font-weight: 700; font-size: .8rem;
        }
        .koc-durum {
          padding: 3px 12px; border-radius: 20px; font-weight: 700; font-size: .78rem;
        }
        .koc-durum--devam       { background: #e3f2fd; color: #1565c0; }
        .koc-durum--tamamlandi  { background: #e8f5e9; color: #2e7d32; }
        .koc-durum--bekliyor    { background: #fff3e0; color: #e65100; }

        /* Form */
        .koc-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .koc-form__group { display: flex; flex-direction: column; gap: 6px; }
        .koc-form__group--full { grid-column: 1 / -1; }
        .koc-form__group label { font-weight: 700; font-size: .82rem; color: #6b4444; }
        .koc-form__group input,
        .koc-form__group select,
        .koc-form__group textarea {
          border: 1.5px solid #f0dada; border-radius: 10px;
          padding: 9px 14px; font-size: .9rem; outline: none;
          color: #1a0a0a; background: #fffafa; transition: border-color .15s;
          font-family: inherit;
        }
        .koc-form__group input:focus,
        .koc-form__group select:focus,
        .koc-form__group textarea:focus { border-color: #e53935; }
        .koc-form__group textarea { resize: vertical; }

        .koc-selected-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fdeaea; border-radius: 8px;
          padding: 6px 12px; font-size: .84rem; font-weight: 600; color: #b71c1c;
          margin-top: 4px; width: fit-content;
        }

        .koc-form__actions {
          display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
        }
        .koc-btn { padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: .88rem; cursor: pointer; border: none; transition: all .15s; }
        .koc-btn--primary { background: #e53935; color: #fff; }
        .koc-btn--primary:hover { background: #b71c1c; }
        .koc-btn--ghost { background: transparent; border: 1.5px solid #f0dada; color: #6b4444; }
        .koc-btn--ghost:hover { border-color: #e53935; color: #b71c1c; }

        .koc-alert {
          border-radius: 10px; padding: 12px 16px;
          font-weight: 600; font-size: .9rem; margin-bottom: 16px;
        }
        .koc-alert--success { background: #e8f5e9; color: #2e7d32; }

        @media (max-width: 600px) {
          .koc-form__row { grid-template-columns: 1fr; }
          .koc-form__group--full { grid-column: auto; }
          .koc-hero { flex-wrap: wrap; }
          .koc-new-btn { margin-left: 0; }
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
