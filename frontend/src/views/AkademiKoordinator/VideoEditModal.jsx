// src/components/VideoEditModal.jsx
import React, { useEffect, useState } from "react";

export default function VideoEditModal({ open, onClose, initial, onSave, saving }) {
  if (!open) return null;

  const [form, setForm] = useState({
    title: "",
    url: "",
    source: "youtube", // youtube | local
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        url: initial.url || "",
        source: initial.source || "youtube",
        description: initial.description || "",
        is_active: initial.is_active ?? true,
      });
    } else {
      setForm({
        title: "",
        url: "",
        source: "youtube",
        description: "",
        is_active: true,
      });
    }
  }, [initial]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ display: "block" }} />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
        <div className="bg-white rounded-3 shadow" style={{ width: "95%", maxWidth: 720 }}>
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <h5 className="m-0">{initial ? "Videoyu Düzenle" : "Yeni Video"}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Kapat</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Başlık</label>
                <input className="form-control" value={form.title} onChange={(e) => change("title", e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Kaynak</label>
                <select className="form-select" value={form.source} onChange={(e) => change("source", e.target.value)}>
                  <option value="youtube">YouTube</option>
                  <option value="local">Sistem (yerel dosya)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">URL (YouTube veya dosya linki)</label>
                <input className="form-control" value={form.url} onChange={(e) => change("url", e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Açıklama</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={(e) => change("description", e.target.value)} />
              </div>

              <div className="form-check mb-3">
                <input id="is_active" className="form-check-input" type="checkbox" checked={form.is_active} onChange={(e) => change("is_active", e.target.checked)} />
                <label htmlFor="is_active" className="form-check-label">Aktif</label>
              </div>
            </div>
            <div className="p-3 border-top d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
