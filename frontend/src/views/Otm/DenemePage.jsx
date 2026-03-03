import React, { useState, useRef } from "react";
// import useAxios from "../../utils/useAxios";
import OTMBaseHeader from "../partials/OtmBaseHeader";
import OTMBaseFooter from "../partials/OtmBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

/* ─────────────────────────────────────────────
   MOCK VERİ — backend bağlandığında kaldır
───────────────────────────────────────────── */
const MOCK_DERSLER = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih", "Coğrafya", "İngilizce"];
const MOCK_SINIFLAR = ["9-A", "9-B", "10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];
const MOCK_DENEMELER = [
  { id: 1, ad: "Mart Denemesi #1", ders: "Matematik", sinif: "10-A", tarih: "2025-03-05", durum: "Analiz Hazır" },
  { id: 2, ad: "Haftalık Fizik",   ders: "Fizik",     sinif: "11-B", tarih: "2025-03-01", durum: "Bekliyor"     },
];

function FileDropZone({ label, accept, icon, file, onFile }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`dz-zone ${drag ? "dz-zone--drag" : ""} ${file ? "dz-zone--filled" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <>
          <i className="bi bi-file-earmark-check-fill dz-zone__icon dz-zone__icon--ok"></i>
          <span className="dz-zone__name">{file.name}</span>
          <span className="dz-zone__size">{(file.size / 1024).toFixed(1)} KB</span>
        </>
      ) : (
        <>
          <i className={`bi ${icon} dz-zone__icon`}></i>
          <span className="dz-zone__label">{label}</span>
          <span className="dz-zone__hint">Sürükle bırak veya tıkla</span>
        </>
      )}
    </div>
  );
}

export default function DenemePage() {
  // const api = useAxios();

  const [aktifTab, setAktifTab]         = useState("liste");
  const [denemeler, setDenemeler]       = useState(MOCK_DENEMELER);
  const [denemeFile, setDenemeFile]     = useState(null);
  const [cevapFile, setCevapFile]       = useState(null);
  const [basari, setBasari]             = useState(false);
  const [form, setForm]                 = useState({
    ad: "", ders: "", sinif: "", tarih: "", aciklama: "",
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!denemeFile) return alert("Lütfen deneme dosyasını yükleyin.");

    /* API ÇAĞRISI BURAYA:
       const formData = new FormData();
       Object.entries(form).forEach(([k, v]) => formData.append(k, v));
       formData.append("deneme_dosya", denemeFile);
       if (cevapFile) formData.append("cevap_anahtari", cevapFile);
       api.post("otm/denemeler/", formData, { headers: { "Content-Type": "multipart/form-data" } })
         .then(r => { setDenemeler(p => [r.data, ...p]); setBasari(true); })
         .catch(() => {});
    */

    // Mock kayıt
    setDenemeler((p) => [{
      id: Date.now(), ad: form.ad, ders: form.ders,
      sinif: form.sinif, tarih: form.tarih, durum: "Bekliyor"
    }, ...p]);
    setBasari(true);
    setForm({ ad: "", ders: "", sinif: "", tarih: "", aciklama: "" });
    setDenemeFile(null); setCevapFile(null);
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
    <div className="dn-wrap" style={{ margin: 0, maxWidth: "100%" }}>

      {/* Hero */}
      <div className="dn-hero">
        <div className="dn-hero__icon"><i className="bi bi-file-earmark-arrow-up-fill"></i></div>
        <div>
          <h2 className="dn-hero__title">Deneme Yönetimi</h2>
          <p className="dn-hero__sub">Deneme sınavlarını yükle, cevap anahtarını ekle ve sonuçları analiz et</p>
        </div>
        <button className="dn-new-btn" onClick={() => setAktifTab("yukle")}>
          <i className="bi bi-plus-lg me-1"></i>Deneme Yükle
        </button>
      </div>

      {/* Tabs */}
      <div className="dn-tabs">
        <button className={`dn-tab ${aktifTab === "liste" ? "active" : ""}`} onClick={() => setAktifTab("liste")}>
          <i className="bi bi-list-check me-1"></i>Yüklenen Denemeler
        </button>
        <button className={`dn-tab ${aktifTab === "yukle" ? "active" : ""}`} onClick={() => setAktifTab("yukle")}>
          <i className="bi bi-cloud-arrow-up me-1"></i>Yeni Deneme Yükle
        </button>
      </div>

      {/* ─── LİSTE ─── */}
      {aktifTab === "liste" && (
        <div className="dn-card">
          {denemeler.length === 0 ? (
            <div className="dn-empty">
              <i className="bi bi-inbox"></i>
              <span>Henüz deneme yüklenmemiş.</span>
            </div>
          ) : (
            <table className="dn-table">
              <thead>
                <tr><th>Deneme Adı</th><th>Ders</th><th>Sınıf</th><th>Tarih</th><th>Durum</th><th></th></tr>
              </thead>
              <tbody>
                {denemeler.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-bold">{d.ad || "—"}</td>
                    <td><span className="dn-tag">{d.ders}</span></td>
                    <td>{d.sinif}</td>
                    <td>{d.tarih || "—"}</td>
                    <td>
                      <span className={`dn-durum dn-durum--${d.durum === "Analiz Hazır" ? "hazir" : "bekliyor"}`}>
                        {d.durum}
                      </span>
                    </td>
                    <td>
                      {/* API: GET otm/denemeler/{id}/analiz/ */}
                      <button className="dn-icon-btn" title="Analiz">
                        <i className="bi bi-bar-chart-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── YÜKLEME FORMU ─── */}
      {aktifTab === "yukle" && (
        <div className="dn-card">
          {basari && (
            <div className="dn-alert dn-alert--success">
              <i className="bi bi-check-circle-fill me-2"></i>Deneme başarıyla yüklendi!
            </div>
          )}
          <form onSubmit={handleSubmit} className="dn-form">

            {/* Dosya yükleme alanları */}
            <div className="dn-dropzones">
              <div>
                <p className="dn-drop-label">
                  <i className="bi bi-file-earmark-pdf text-danger me-1"></i>
                  Deneme Soruları <span className="text-danger">*</span>
                </p>
                {/* API: multipart/form-data → "deneme_dosya" key ile gönderilecek */}
                <FileDropZone
                  label="Deneme PDF / Görsel Yükle"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon="bi-file-earmark-pdf"
                  file={denemeFile}
                  onFile={setDenemeFile}
                />
              </div>
              <div>
                <p className="dn-drop-label">
                  <i className="bi bi-key text-danger me-1"></i>
                  Cevap Anahtarı <span className="text-muted">(opsiyonel)</span>
                </p>
                {/* API: multipart/form-data → "cevap_anahtari" key ile gönderilecek */}
                <FileDropZone
                  label="Cevap Anahtarı Yükle"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
                  icon="bi-file-earmark-check"
                  file={cevapFile}
                  onFile={setCevapFile}
                />
              </div>
            </div>

            <div className="dn-form__row">
              <div className="dn-form__group dn-form__group--full">
                <label>Deneme Adı</label>
                <input name="ad" value={form.ad} onChange={handleChange} placeholder="Örn: Mart Denemesi #1" required />
              </div>

              <div className="dn-form__group">
                <label>Ders</label>
                {/* API: GET dersler/ */}
                <select name="ders" value={form.ders} onChange={handleChange} required>
                  <option value="">— Seçiniz —</option>
                  {MOCK_DERSLER.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="dn-form__group">
                <label>Sınıf</label>
                {/* API: GET siniflar/ */}
                <select name="sinif" value={form.sinif} onChange={handleChange} required>
                  <option value="">— Seçiniz —</option>
                  {MOCK_SINIFLAR.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="dn-form__group">
                <label>Deneme Tarihi</label>
                {/* API: tarih "YYYY-MM-DD" formatında gönderilecek */}
                <input type="date" name="tarih" value={form.tarih} onChange={handleChange} />
              </div>

              <div className="dn-form__group dn-form__group--full">
                <label>Açıklama (opsiyonel)</label>
                {/* API: "aciklama" alanı */}
                <textarea name="aciklama" rows={3} value={form.aciklama} onChange={handleChange} placeholder="Denemeyle ilgili notlar..." />
              </div>
            </div>

            <div className="dn-form__actions">
              <button type="button" className="dn-btn dn-btn--ghost" onClick={() => setAktifTab("liste")}>İptal</button>
              <button type="submit" className="dn-btn dn-btn--primary">
                <i className="bi bi-cloud-arrow-up me-1"></i>Yükle & Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .dn-wrap { max-width: 960px; margin: 2rem auto; padding: 0 1rem; font-family: 'Segoe UI', sans-serif; }

        .dn-hero {
          display: flex; align-items: center; gap: 16px;
          background: linear-gradient(135deg,#fdeaea,#fff);
          border: 1.5px solid #f0dada; border-radius: 18px;
          padding: 24px 28px; margin-bottom: 24px;
        }
        .dn-hero__icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #e53935; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
        }
        .dn-hero__title { font-size: 1.4rem; font-weight: 800; color: #1a0a0a; margin: 0; }
        .dn-hero__sub { font-size: .88rem; color: #6b4444; margin: 0; }
        .dn-new-btn {
          margin-left: auto; background: #e53935; color: #fff;
          border: none; border-radius: 12px; padding: 10px 22px;
          font-weight: 700; font-size: .88rem; cursor: pointer; transition: background .15s;
        }
        .dn-new-btn:hover { background: #b71c1c; }

        .dn-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .dn-tab {
          padding: 8px 20px; border-radius: 10px; font-weight: 700;
          font-size: .88rem; border: 1.5px solid #f0dada;
          background: transparent; color: #6b4444; cursor: pointer; transition: all .15s;
        }
        .dn-tab.active { background: #e53935; color: #fff; border-color: #e53935; }

        .dn-card {
          background: #fff; border: 1.5px solid #f0dada;
          border-radius: 18px; padding: 24px;
        }

        /* Dropzone */
        .dn-dropzones { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .dn-drop-label { font-weight: 700; font-size: .82rem; color: #6b4444; margin-bottom: 6px; }

        .dz-zone {
          border: 2px dashed #f0dada; border-radius: 14px;
          background: #fffafa; padding: 28px 16px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          cursor: pointer; transition: all .2s; text-align: center;
        }
        .dz-zone:hover, .dz-zone--drag { border-color: #e53935; background: #fdeaea; }
        .dz-zone--filled { border-color: #e53935; border-style: solid; background: #fdeaea; }

        .dz-zone__icon { font-size: 2rem; color: #f0c0c0; }
        .dz-zone__icon--ok { color: #e53935; }
        .dz-zone__label { font-weight: 700; font-size: .88rem; color: #6b4444; }
        .dz-zone__hint  { font-size: .78rem; color: #b0a0a0; }
        .dz-zone__name  { font-weight: 700; font-size: .88rem; color: #1a0a0a; word-break: break-all; }
        .dz-zone__size  { font-size: .78rem; color: #6b4444; }

        /* Table */
        .dn-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
        .dn-table th {
          text-align: left; padding: 8px 12px;
          color: #b71c1c; font-weight: 700; font-size: .78rem;
          text-transform: uppercase; letter-spacing: .04em;
          border-bottom: 2px solid #fdeaea;
        }
        .dn-table td { padding: 12px 12px; border-bottom: 1px solid #fdf0f0; vertical-align: middle; }
        .dn-table tr:last-child td { border-bottom: none; }
        .dn-table tr:hover td { background: #fffafa; }

        .dn-tag { background: #fdeaea; color: #b71c1c; padding: 2px 10px; border-radius: 20px; font-weight: 700; font-size: .8rem; }
        .dn-durum { padding: 3px 12px; border-radius: 20px; font-weight: 700; font-size: .78rem; }
        .dn-durum--hazir    { background: #e8f5e9; color: #2e7d32; }
        .dn-durum--bekliyor { background: #fff3e0; color: #e65100; }

        .dn-icon-btn {
          background: #fdeaea; border: none; border-radius: 8px;
          padding: 5px 10px; color: #e53935; cursor: pointer; font-size: 1rem; transition: background .15s;
        }
        .dn-icon-btn:hover { background: #e53935; color: #fff; }

        /* Form */
        .dn-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dn-form__group { display: flex; flex-direction: column; gap: 6px; }
        .dn-form__group--full { grid-column: 1 / -1; }
        .dn-form__group label { font-weight: 700; font-size: .82rem; color: #6b4444; }
        .dn-form__group input,
        .dn-form__group select,
        .dn-form__group textarea {
          border: 1.5px solid #f0dada; border-radius: 10px;
          padding: 9px 14px; font-size: .9rem; outline: none;
          color: #1a0a0a; background: #fffafa; transition: border-color .15s; font-family: inherit;
        }
        .dn-form__group input:focus,
        .dn-form__group select:focus,
        .dn-form__group textarea:focus { border-color: #e53935; }
        .dn-form__group textarea { resize: vertical; }

        .dn-form__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .dn-btn { padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: .88rem; cursor: pointer; border: none; transition: all .15s; }
        .dn-btn--primary { background: #e53935; color: #fff; }
        .dn-btn--primary:hover { background: #b71c1c; }
        .dn-btn--ghost { background: transparent; border: 1.5px solid #f0dada; color: #6b4444; }
        .dn-btn--ghost:hover { border-color: #e53935; color: #b71c1c; }

        .dn-alert { border-radius: 10px; padding: 12px 16px; font-weight: 600; font-size: .9rem; margin-bottom: 16px; }
        .dn-alert--success { background: #e8f5e9; color: #2e7d32; }

        .dn-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px; color: #b0a0a0; font-size: 1rem; }
        .dn-empty i { font-size: 2.5rem; color: #f0dada; }

        @media (max-width: 600px) {
          .dn-dropzones { grid-template-columns: 1fr; }
          .dn-form__row { grid-template-columns: 1fr; }
          .dn-form__group--full { grid-column: auto; }
          .dn-hero { flex-wrap: wrap; }
          .dn-new-btn { margin-left: 0; }
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
